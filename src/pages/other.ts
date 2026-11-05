import type { Env } from '../index';
import { SLOW_MS, TIMEOUT_MS, type CheckResult } from '../check';
import { SERVICES } from '../services';
import { dot, esc, layout, STATUS } from './layout';

export interface CheckerData {
  input: string;
  url?: string;
  error?: string;
  result?: CheckResult;
  ips?: string[];
}

export function renderChecker(env: Env, d: CheckerData): string {
  let out = '';
  if (d.error) out = `<p class="err">${esc(d.error)}</p>`;
  if (d.url && d.result) {
    const r = d.result;
    const st = STATUS[r.status];
    const host = new URL(d.url).hostname;
    const known = SERVICES.find((s) => new URL(s.url).hostname === host);
    const title =
      r.status === 'up'
        ? `${host} está funcionando`
        : r.status === 'slow'
          ? `${host} responde muy lento`
          : r.status === 'dns'
            ? `${host} tiene una falla de DNS`
            : `${host} parece estar caído`;
    const rows: [string, string][] = [
      ['Dirección', esc(d.url)],
      ['Estado', esc(st.label)],
      ['Código HTTP', r.code ? String(r.code) : '—'],
      ['Tiempo de respuesta', r.latency != null ? `${r.latency} ms` : '—'],
      ['DNS', d.ips?.length ? esc(d.ips.slice(0, 4).join(', ')) : r.status === 'dns' ? 'No resuelve' : '—'],
    ];
    if (r.location) rows.push(['Redirige a', esc(r.location.slice(0, 200))]);
    if (r.error) rows.push(['Detalle', esc(r.error)]);
    out = `<div class="status ${st.color} result">${dot(st.color)}<div style="flex:1;min-width:0"><h2>${esc(title)}</h2>
<dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
${known ? `<p style="margin-top:12px">Este sitio lo revisamos cada 5 minutos: <a href="/estado/${known.slug}" style="color:var(--accent)">ver historial de ${esc(known.name)}</a>.</p>` : ''}
</div></div>`;
  }

  const body = `
<section class="hero">
<h1>Revisar si una página está caída</h1>
<p class="lead">Escribí la dirección de cualquier sitio y lo revisamos al instante desde la nube: si responde, cuánto tarda y si su DNS funciona.</p>
<form class="field" action="/revisar" method="get" style="margin-top:22px;max-width:640px">
<input name="url" type="text" inputmode="url" value="${esc(d.input)}" placeholder="ejemplo.com" aria-label="Dirección del sitio" autofocus>
<button class="btn" type="submit">Revisar</button>
</form>
</section>
${out}
<section class="prose">
<h2>¿Cómo funciona el revisador?</h2>
<p>Hacemos una visita a la página desde servidores en la nube, igual que un navegador, sin seguir redirecciones. Si responde en menos de ${SLOW_MS / 1000} segundos sale <strong>verde</strong>; si tarda más, <strong>naranja</strong>. Si no responde en ${TIMEOUT_MS / 1000} segundos o devuelve un error del servidor (500 o más), sale <strong>rojo</strong>. Cuando no responde, también revisamos su DNS: si el dominio no apunta a ningún lado, sale <strong>naranja</strong> con “falla de DNS”.</p>
<p>Un resultado verde aquí y una página que no te carga a vos suele significar que el problema es tu conexión, tu red o tu dispositivo.</p>
</section>`;

  return layout(env, {
    title: d.url ? `¿Está caído ${new URL(d.url).hostname}? · WebRadar` : 'Revisar si una página está caída ahora mismo · WebRadar',
    description: 'Revisá al instante si cualquier página web está caída o funcionando, cuánto tarda en responder y si su DNS está bien.',
    path: '/revisar',
    body,
    noindex: !!d.input,
  });
}

export function renderAbout(env: Env): string {
  const body = `
<section class="hero"><h1>Cómo funciona WebRadar</h1>
<p class="lead">Un radar que revisa todo el día si los sitios que más usamos en Guatemala están funcionando.</p></section>
<section class="prose">
<h2>Qué revisamos</h2>
<p>Revisamos ${SERVICES.length} sitios de bancos, gobierno, telefonía, universidades, noticias y apps. Cada uno se revisa cada 5 minutos desde servidores de Cloudflare. Guardamos el resultado para mostrar el historial de las últimas 24 horas y los últimos 7 días.</p>
<h2>Qué significan los colores</h2>
<p>${dot('green')} <strong>Verde:</strong> el sitio respondió en menos de 4 segundos.</p>
<p>${dot('orange')} <strong>Naranja:</strong> respondió muy lento, o su dominio tiene una falla de DNS (no apunta a ningún servidor).</p>
<p>${dot('red')} <strong>Rojo:</strong> no respondió en 10 segundos, no se pudo conectar o devolvió un error del servidor. Antes de marcarlo en rojo lo intentamos dos veces.</p>
<h2>Lo que no medimos</h2>
<p>Revisamos la página principal de cada servicio, no su app ni su banca en línea por dentro. Por eso existe el botón “A mí tampoco me funciona”: si mucha gente lo toca al mismo tiempo, es señal de una falla aunque el sitio responda.</p>
<h2>Nuestro robot</h2>
<p>Las revisiones salen con el identificador <code>WebRadarBot/1.0</code>. Hacemos una sola visita ligera cada 5 minutos, sin descargar el contenido. Si administrás uno de estos sitios y preferís que no lo revisemos, abrí un aviso en <a href="https://github.com/devlewiso/WebRadar/issues" rel="noopener">GitHub</a>.</p>
<h2 id="privacidad">Privacidad</h2>
<p>No pedimos cuentas ni datos personales. Cuando reportás un problema guardamos la hora y un código cifrado que cambia cada día, solo para contar una vez a cada persona. Nunca guardamos tu dirección IP, y los reportes se borran a los 2 días. El sitio puede mostrar anuncios de Google AdSense, que usa sus propias cookies según la <a href="https://policies.google.com/technologies/ads" rel="noopener">política de Google</a>.</p>
<p>WebRadar no tiene relación con ninguno de los sitios que revisa. Las marcas pertenecen a sus dueños.</p>
</section>`;
  return layout(env, {
    title: 'Cómo funciona WebRadar · Monitor de sitios caídos en Guatemala',
    description: 'Cómo revisa WebRadar si un sitio está caído, qué significan los colores y cómo cuidamos tu privacidad.',
    path: '/acerca',
    body,
  });
}

export function renderNotFound(env: Env): string {
  return layout(env, {
    title: 'Página no encontrada · WebRadar',
    description: 'Esta página no existe.',
    path: '/404',
    noindex: true,
    body: `<section class="hero"><h1>No encontramos esa página</h1><p class="lead">Volvé al <a href="/" style="color:var(--accent)">inicio</a> o <a href="/revisar" style="color:var(--accent)">revisá un sitio</a>.</p></section>`,
  });
}
