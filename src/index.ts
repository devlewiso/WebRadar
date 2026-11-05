import { check, dnsLookup, normalizeTarget } from './check';
import * as db from './db';
import { SERVICES, bySlug, shardOf, SHARDS } from './services';
import { renderHome } from './pages/home';
import { renderService } from './pages/service';
import { renderAbout, renderChecker, renderNotFound } from './pages/other';
import { FAVICON_SVG } from './pages/layout';

export interface Env {
  DB: D1Database;
  SITE_URL: string;
  ADSENSE_CLIENT?: string;
  ENVIRONMENT?: string;
  IP_SALT?: string;
}

const BASE_HEADERS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-frame-options': 'SAMEORIGIN',
};

const html = (body: string, status = 200, maxAge = 60) =>
  new Response(body, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': maxAge ? `public, max-age=${maxAge}` : 'no-store', ...BASE_HEADERS },
  });

const json = (data: unknown, status = 200, maxAge = 0) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': maxAge ? `public, max-age=${maxAge}` : 'no-store', ...BASE_HEADERS },
  });

const text = (body: string, type = 'text/plain', maxAge = 3600) =>
  new Response(body, { headers: { 'content-type': `${type}; charset=utf-8`, 'cache-control': `public, max-age=${maxAge}` } });

/** Cache de borde de Cloudflare para las páginas públicas (no aplica en *.workers.dev ni en local). */
async function cached(req: Request, ctx: ExecutionContext, make: () => Promise<Response>): Promise<Response> {
  const key = new Request(new URL(req.url).toString(), { method: 'GET' });
  const cache = caches.default;
  const hit = await cache.match(key);
  if (hit) return hit;
  const res = await make();
  if (res.status === 200 && res.headers.get('cache-control')?.startsWith('public')) ctx.waitUntil(cache.put(key, res.clone()));
  return res;
}

async function sha256(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

/** Revisa un grupo de servicios y guarda el resultado. */
async function runShard(env: Env, minute: number) {
  const list = shardOf(minute);
  const results = await Promise.all(list.map(async (s) => ({ slug: s.slug, r: await check(s.url) })));
  const now = Date.now();
  await db.saveResults(env.DB, now, results);
  if (minute % 60 === 0) await db.prune(env.DB, now);
  return results;
}

async function report(req: Request, env: Env, slug: string) {
  if (!bySlug(slug)) return json({ error: 'Servicio desconocido' }, 404);
  const origin = req.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(req.url).host) return json({ error: 'Origen no permitido' }, 403);
  const ip = req.headers.get('cf-connecting-ip') ?? 'local';
  const day = new Date().toISOString().slice(0, 10);
  const who = await sha256(`${env.IP_SALT ?? 'webradar'}|${day}|${ip}`);
  const r = await db.addReport(env.DB, slug, who, Date.now());
  return json({ ok: true, ...r });
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : '/';
    if (path !== url.pathname) return Response.redirect(new URL(path + url.search, url).toString(), 301);

    if (req.method === 'POST') {
      const m = path.match(/^\/api\/reportar\/([a-z0-9-]+)$/);
      if (m) return report(req, env, m[1]);
      return json({ error: 'No encontrado' }, 404);
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return new Response('Método no permitido', { status: 405 });

    const now = Date.now();

    if (path === '/') {
      return cached(req, ctx, async () => {
        const [latest, reports] = await Promise.all([db.allLatest(env.DB), db.reportsLastHour(env.DB, now)]);
        return html(renderHome(env, latest, reports));
      });
    }

    const sm = path.match(/^\/estado\/([a-z0-9-]+)$/);
    if (sm) {
      const s = bySlug(sm[1]);
      if (!s) return html(renderNotFound(env), 404, 0);
      return cached(req, ctx, async () => {
        const [latest, points, up24, up7, reports] = await Promise.all([
          db.getLatest(env.DB, s.slug),
          db.history(env.DB, s.slug, now - db.DAY),
          db.uptime(env.DB, s.slug, now - db.DAY),
          db.uptime(env.DB, s.slug, now - 7 * db.DAY),
          db.reportTimes(env.DB, s.slug, now - db.DAY),
        ]);
        return html(renderService(env, s, { latest, points, up24, up7, reports, now }));
      });
    }

    if (path === '/revisar') {
      const input = (url.searchParams.get('url') ?? '').slice(0, 300);
      if (!input) return cached(req, ctx, async () => html(renderChecker(env, { input: '' }), 200, 3600));
      const t = normalizeTarget(input, url.hostname);
      if (!t.url) return html(renderChecker(env, { input, error: t.error }), 200, 0);
      const [result, dns] = await Promise.all([check(t.url, false), dnsLookup(new URL(t.url).hostname)]);
      return html(renderChecker(env, { input, url: t.url, result, ips: dns.ips }), 200, 0);
    }

    if (path === '/acerca') return cached(req, ctx, async () => html(renderAbout(env), 200, 3600));

    if (path === '/api/estado') {
      const latest = await db.allLatest(env.DB);
      const services = SERVICES.map((s) => latest.get(s.slug)).filter(Boolean).map((l) => ({
        slug: l!.slug,
        status: l!.status,
        latency: l!.latency,
        since: l!.since,
        ts: l!.ts,
      }));
      const updated = services.reduce((m, s) => Math.max(m, s.ts), 0);
      return json({ updated, services }, 200, 30);
    }

    if (path === '/favicon.svg' || path === '/favicon.ico') return text(FAVICON_SVG, 'image/svg+xml', 86400);

    if (path === '/robots.txt') {
      return text(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /revisar?\n\nSitemap: ${env.SITE_URL.replace(/\/$/, '')}/sitemap.xml\n`);
    }

    if (path === '/ads.txt') {
      if (!env.ADSENSE_CLIENT) return new Response('', { status: 404 });
      return text(`google.com, ${env.ADSENSE_CLIENT.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`);
    }

    if (path === '/sitemap.xml') {
      const base = env.SITE_URL.replace(/\/$/, '');
      const urls = ['/', '/revisar', '/acerca', ...SERVICES.map((s) => `/estado/${s.slug}`)];
      const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
        .map((u) => `<url><loc>${base}${u}</loc><changefreq>${u.startsWith('/estado') || u === '/' ? 'hourly' : 'monthly'}</changefreq></url>`)
        .join('\n')}\n</urlset>\n`;
      return text(body, 'application/xml');
    }

    // Solo en desarrollo: revisar todos los servicios de una vez para tener datos.
    if (path === '/__revisar-todo' && env.ENVIRONMENT === 'dev') {
      const all = [];
      for (let i = 0; i < SHARDS; i++) all.push(...(await runShard(env, i)));
      return json(all.map(({ slug, r }) => ({ slug, ...r })));
    }

    return html(renderNotFound(env), 404, 0);
  },

  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext) {
    const minute = new Date(event.scheduledTime).getUTCMinutes();
    ctx.waitUntil(runShard(env, minute));
  },
} satisfies ExportedHandler<Env>;
