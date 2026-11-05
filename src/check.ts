export type Status = 'up' | 'slow' | 'dns' | 'down';

export interface CheckResult {
  status: Status;
  latency: number | null;
  code: number | null;
  error: string | null;
  location?: string | null;
}

export const SLOW_MS = 4000;
export const TIMEOUT_MS = 10000;

const UA = 'Mozilla/5.0 (compatible; WebRadarBot/1.0; +https://radar.neuralcodelab.com/acerca)';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Resuelve el dominio por DNS-over-HTTPS. true = resuelve, false = no resuelve, null = no se pudo saber. */
export async function dnsLookup(host: string): Promise<{ ok: boolean | null; ips: string[] }> {
  try {
    for (const type of ['A', 'AAAA']) {
      const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=${type}`, {
        headers: { accept: 'application/dns-json' },
        signal: AbortSignal.timeout(4000),
      });
      if (!r.ok) return { ok: null, ips: [] };
      const j = (await r.json()) as { Status: number; Answer?: { type: number; data: string }[] };
      // 2 = SERVFAIL, 3 = NXDOMAIN, 5 = REFUSED
      if (j.Status === 2 || j.Status === 3 || j.Status === 5) return { ok: false, ips: [] };
      const ips = (j.Answer ?? []).filter((a) => a.type === 1 || a.type === 28).map((a) => a.data);
      if (ips.length) return { ok: true, ips };
    }
    return { ok: false, ips: [] };
  } catch {
    return { ok: null, ips: [] };
  }
}

async function probe(url: string): Promise<CheckResult> {
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      headers: {
        'user-agent': UA,
        accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
        'accept-language': 'es-GT,es;q=0.9',
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const latency = Date.now() - t0;
    try {
      await res.body?.cancel();
    } catch {
      /* sin cuerpo */
    }
    const location = res.headers.get('location');
    // Cualquier respuesta < 500 significa que el servidor está vivo (403 de un firewall también cuenta).
    if (res.status >= 500) {
      return { status: 'down', latency, code: res.status, error: `El servidor respondió con error ${res.status}`, location };
    }
    if (latency > SLOW_MS) {
      return { status: 'slow', latency, code: res.status, error: `Respondió muy lento (${(latency / 1000).toFixed(1)} s)`, location };
    }
    return { status: 'up', latency, code: res.status, error: null, location };
  } catch (e) {
    const name = (e as Error)?.name;
    const timeout = name === 'TimeoutError' || name === 'AbortError';
    return {
      status: 'down',
      latency: null,
      code: null,
      error: timeout ? `No respondió en ${TIMEOUT_MS / 1000} segundos` : 'No se pudo conectar con el servidor',
    };
  }
}

/** Revisa una URL. Si falla, reintenta una vez y averigua si el problema es de DNS. */
export async function check(url: string, retry = true): Promise<CheckResult> {
  let r = await probe(url);
  if (r.status === 'down' && retry) {
    await sleep(1500);
    r = await probe(url);
  }
  if (r.status === 'down' && r.code === null) {
    const d = await dnsLookup(new URL(url).hostname);
    if (d.ok === false) {
      return { status: 'dns', latency: null, code: null, error: 'El dominio no resuelve (falla de DNS)' };
    }
  }
  return r;
}

/** Valida lo que la gente escribe en el revisador público. Solo sitios públicos con dominio. */
export function normalizeTarget(raw: string, selfHost: string): { url?: string; error?: string } {
  let s = raw.trim();
  if (!s) return { error: 'Escribí una dirección, por ejemplo banrural.com.gt' };
  if (s.length > 300) return { error: 'Esa dirección es demasiado larga.' };
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return { error: 'Esa dirección no es válida.' };
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return { error: 'Solo revisamos páginas web (http o https).' };
  if (u.username || u.password) return { error: 'Esa dirección no es válida.' };
  if (u.port && u.port !== '80' && u.port !== '443') return { error: 'Solo revisamos sitios web normales (puertos 80 y 443).' };
  const h = u.hostname.toLowerCase().replace(/\.$/, '');
  const privado =
    !h.includes('.') ||
    h.includes(':') ||
    /^[\d.]+$/.test(h) ||
    h === 'localhost' ||
    /\.(local|localhost|internal|lan|home|test|invalid|example)$/.test(h) ||
    h === selfHost;
  if (privado) return { error: 'Solo revisamos sitios públicos con dominio, por ejemplo ejemplo.com' };
  const path = u.pathname === '/' ? '' : u.pathname;
  return { url: `${u.protocol}//${h}${path}` };
}
