import type { Env } from '../index';
import type { Latest, Point } from '../db';
import { HOUR } from '../db';
import { CATEGORIES, SERVICES, hostOf, type Service } from '../services';
import { dot, esc, gtHour, info, layout, type Color } from './layout';

export interface ServiceData {
  latest: Latest | null;
  points: Point[]; // últimas 24 h
  up24: { total: number; ok: number };
  up7: { total: number; ok: number };
  reports: number[]; // timestamps últimas 24 h
  now: number;
}

const pct = (u: { total: number; ok: number }) => (u.total ? `${((u.ok / u.total) * 100).toFixed(u.ok === u.total || u.ok === 0 ? 0 : 1)}%` : '—');

function headline(s: Service, l: Latest | null): string {
  if (!l) return `Todavía estamos revisando ${s.name}`;
  switch (l.status) {
    case 'up':
      return `${s.name} está funcionando`;
    case 'slow':
      return `${s.name} está respondiendo muy lento`;
    case 'dns':
      return `${s.name} tiene una falla de DNS`;
    case 'down':
      return `${s.name} parece estar caído`;
  }
}

function hourlyBars(points: Point[], now: number): string {
  const start = now - 24 * HOUR;
  const buckets = Array.from({ length: 24 }, () => ({ total: 0, ok: 0, slow: 0 }));
  for (const p of points) {
    const i = Math.min(23, Math.floor((p.ts - start) / HOUR));
    if (i < 0) continue;
    const b = buckets[i];
    b.total++;
    if (p.status === 'up' || p.status === 'slow') b.ok++;
    if (p.status === 'slow') b.slow++;
  }
  return buckets
    .map((b, i) => {
      const from = start + i * HOUR;
      let c: Color = 'gray';
      let t = 'sin datos';
      if (b.total) {
        const r = b.ok / b.total;
        c = r === 1 && !b.slow ? 'green' : r >= 0.5 ? 'orange' : 'red';
        t = `${Math.round(r * 100)}% funcionando`;
      }
      return `<i class="${c === 'gray' ? '' : c}" title="${gtHour(from)} · ${t}"></i>`;
    })
    .join('');
}

function sparkline(points: Point[], now: number): string {
  const W = 720;
  const H = 90;
  const start = now - 24 * HOUR;
  const lat = points.filter((p) => p.latency != null).map((p) => p.latency!);
  if (!lat.length) return '<p class="note">Aún no hay suficientes datos de velocidad.</p>';
  const max = Math.max(500, ...lat) * 1.1;
  const x = (ts: number) => (((ts - start) / (24 * HOUR)) * W).toFixed(1);
  const y = (ms: number) => (H - 4 - (ms / max) * (H - 10)).toFixed(1);
  let d = '';
  let pen = false;
  const downs: string[] = [];
  for (const p of points) {
    if (p.latency == null || p.status === 'down' || p.status === 'dns') {
      pen = false;
      if (p.status === 'down' || p.status === 'dns') downs.push(`<rect x="${x(p.ts)}" y="0" width="3" height="${H}" fill="${p.status === 'down' ? '#ef4444' : '#f59e0b'}" opacity=".55"/>`);
      continue;
    }
    d += `${pen ? 'L' : 'M'}${x(p.ts)} ${y(p.latency)} `;
    pen = true;
  }
  const avg = Math.round(lat.reduce((a, b) => a + b, 0) / lat.length);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Tiempo de respuesta en las últimas 24 horas, promedio ${avg} ms">
<line x1="0" x2="${W}" y1="${y(avg)}" y2="${y(avg)}" stroke="#2d3f66" stroke-dasharray="4 4"/>
${downs.join('')}
<path d="${d}" fill="none" stroke="#38bdf8" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
</svg>`;
}

function reportBars(times: number[], now: number): string {
  const start = now - 24 * HOUR;
  const counts = Array(24).fill(0) as number[];
  for (const t of times) {
    const i = Math.min(23, Math.floor((t - start) / HOUR));
    if (i >= 0) counts[i]++;
  }
  const max = Math.max(...counts);
  if (!max) return '<p class="note">Nadie ha reportado problemas en las últimas 24 horas.</p>';
  return `<div class="rbars">${counts
    .map((c, i) => `<i class="${c ? '' : 'z'}" style="height:${c ? Math.max(6, (c / max) * 100) : 4}%" title="${gtHour(start + i * HOUR)} · ${c} ${c === 1 ? 'reporte' : 'reportes'}"></i>`)
    .join('')}</div><div class="axis"><span>hace 24 h</span><span>hace 12 h</span><span>ahora</span></div>`;
}

const TIPS: Record<Service['category'], (n: string) => string> = {
  bancos: (n) =>
    `Mientras ${n} vuelve, probá con la app del banco o en un cajero. Ojo: cuando un banco se cae aumentan las estafas. Nunca des tus claves ni códigos por WhatsApp, llamadas o enlaces que te manden; entrá solo escribiendo la dirección oficial.`,
  gobierno: (n) =>
    `Los portales del gobierno como ${n} se saturan en fechas límite y a media mañana. Si no te carga, probá temprano o de noche, y guardá el comprobante de cada trámite que completés.`,
  servicios: (n) =>
    `Si el sitio de ${n} funciona pero no tenés señal, internet o luz, la falla puede ser solo de tu zona. Revisá los canales oficiales de ${n} para avisos de mantenimiento.`,
  educacion: (n) =>
    `En épocas de asignación, pagos o notas los portales de ${n} reciben mucho tráfico y se ponen lentos. Probá en otro horario y no cerrés la página a medio trámite.`,
  noticias: (n) => `Si ${n} no te carga, puede ser un pico de visitas por una noticia grande. Esperá unos minutos y volvé a intentar.`,
  apps: (n) =>
    `Si ${n} sale funcionando aquí pero a vos no te carga, probá cerrar y abrir la app, cambiar entre WiFi y datos, o actualizarla. Si mucha gente lo reporta al mismo tiempo, es una caída aunque el sitio responda.`,
};

export function renderService(env: Env, s: Service, d: ServiceData): string {
  const l = d.latest;
  const st = info(l);
  const host = hostOf(s);
  const full = s.full ? ` (${s.full})` : '';
  const lastRep = d.reports.filter((t) => t > d.now - HOUR).length;
  const lat = d.points.filter((p) => p.latency != null).map((p) => p.latency!);
  const avg = lat.length ? `${Math.round(lat.reduce((a, b) => a + b, 0) / lat.length)} ms` : '—';

  const detail = l
    ? [
        `Última revisión <time data-ts="${l.ts}"></time>`,
        l.code ? `HTTP ${l.code}` : '',
        l.latency != null ? `${l.latency} ms` : '',
        l.error ? esc(l.error) : '',
      ]
        .filter(Boolean)
        .join(' · ') + `<br>En este estado desde <time data-ts="${l.since}"></time>`
    : 'La primera revisión aparece en menos de 5 minutos.';

  const related = SERVICES.filter((o) => o.category === s.category && o.slug !== s.slug)
    .map((o) => `<a href="/estado/${o.slug}">${esc(o.name)}</a>`)
    .join('');

  const faqs: [string, string][] = [
    [
      `¿Está caído ${s.name} hoy?`,
      l
        ? `Según nuestra última revisión, ${s.name} está: ${st.label.toLowerCase()}. Revisamos ${host} cada 5 minutos y esta página se actualiza sola.`
        : `Estamos empezando a revisar ${s.name}; el primer resultado aparece en pocos minutos.`,
    ],
    [
      `¿Por qué no me funciona ${s.name} si aquí sale verde?`,
      `Revisamos el sitio web ${host} desde servidores en la nube. Si aquí sale verde, el sitio responde; el problema puede estar en tu internet, tu celular o en una parte específica del servicio, como la app o el inicio de sesión. Si te pasa, reportalo con el botón para que otras personas lo vean.`,
    ],
    [`¿Qué hago si ${s.name} está caído?`, TIPS[s.category](s.name)],
    [
      '¿Qué significan los colores?',
      'Verde: el sitio responde normal. Naranja: responde muy lento (más de 4 segundos) o su dominio tiene una falla de DNS. Rojo: no responde o devuelve un error del servidor.',
    ],
  ];

  const body = `
<nav class="crumbs" aria-label="Ruta"><a href="/">Inicio</a> › <a href="/#${s.category}">${esc(CATEGORIES[s.category])}</a> › ${esc(s.name)}</nav>
<h1 style="margin-top:12px">¿Está caído ${esc(s.name)} hoy?</h1>
<p class="lead">Estado en vivo de ${esc(s.name)}${esc(full)} en Guatemala. Revisamos ${esc(host)} cada 5 minutos.</p>

<div class="status ${st.color}">
${dot(st.color)}
<div><h2>${esc(headline(s, l))}</h2><p>${detail}</p></div>
</div>

<div class="report">
<button class="btn warn" id="report" data-slug="${s.slug}" type="button">A mí tampoco me funciona</button>
<small><b id="repcount">${lastRep}</b> ${lastRep === 1 ? 'persona reportó' : 'personas reportaron'} problemas en la última hora</small>
</div>

<div class="stats">
<div class="stat"><b>${pct(d.up24)}</b><span>funcionando en las últimas 24 h</span></div>
<div class="stat"><b>${pct(d.up7)}</b><span>funcionando en los últimos 7 días</span></div>
<div class="stat"><b>${avg}</b><span>tiempo de respuesta promedio (24 h)</span></div>
</div>

<div class="panel">
<h3>Últimas 24 horas, hora por hora</h3>
<div class="bars">${hourlyBars(d.points, d.now)}</div>
<div class="axis"><span>hace 24 h</span><span>hace 12 h</span><span>ahora</span></div>
</div>

<div class="panel">
<h3>Tiempo de respuesta (24 h)</h3>
${sparkline(d.points, d.now)}
<div class="axis"><span>hace 24 h</span><span>hace 12 h</span><span>ahora</span></div>
</div>

<div class="panel">
<h3>Reportes de la gente (24 h)</h3>
${reportBars(d.reports, d.now)}
</div>

<section class="prose">
${faqs.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('\n')}
<p>Sitio oficial: <a href="${esc(s.url)}" rel="noopener nofollow" target="_blank">${esc(host)}</a>. WebRadar no tiene relación con ${esc(s.name)}.</p>
</section>

<section class="cat"><h2>Otros servicios de ${esc(CATEGORIES[s.category].toLowerCase())}</h2><div class="links">${related}</div></section>
`;

  return layout(env, {
    title: `¿Está caído ${s.name} hoy? Estado en vivo en Guatemala · WebRadar`,
    description: `Revisá si ${s.name}${full} está caído o funcionando ahora mismo. Estado en vivo, historial de 24 horas y reportes de la gente en Guatemala.`,
    path: `/estado/${s.slug}`,
    body,
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: env.SITE_URL },
          { '@type': 'ListItem', position: 2, name: s.name, item: `${env.SITE_URL.replace(/\/$/, '')}/estado/${s.slug}` },
        ],
      },
    ],
  });
}
