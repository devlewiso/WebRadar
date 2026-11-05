import type { Env } from '../index';
import type { Latest } from '../db';
import { CATEGORIES, SERVICES, hostOf, type Category } from '../services';
import { dot, esc, info, layout, shortMeta } from './layout';

const SEARCH_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`;
const GLOBE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>`;

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function renderHome(env: Env, latest: Map<string, Latest>, reports: Map<string, number>): string {
  const n = { green: 0, orange: 0, red: 0 };
  let updated = 0;
  for (const s of SERVICES) {
    const l = latest.get(s.slug);
    const c = info(l).color;
    if (c !== 'gray') n[c]++;
    if (l && l.ts > updated) updated = l.ts;
  }

  const sections = (Object.keys(CATEGORIES) as Category[])
    .map((cat) => {
      const cards = SERVICES.filter((s) => s.category === cat)
        .map((s) => {
          const l = latest.get(s.slug);
          const c = info(l).color;
          const r = reports.get(s.slug) ?? 0;
          const k = norm(`${s.name} ${s.full ?? ''} ${hostOf(s)} ${CATEGORIES[s.category]}`);
          return `<a class="card ${c}" href="/estado/${s.slug}" data-slug="${s.slug}" data-k="${esc(k)}">
${dot(c)}<div><div class="name">${esc(s.name)}</div><div class="meta">${shortMeta(l)}</div></div>${
            r ? `<span class="rep" title="Reportes de la gente en la última hora">${r} ${r === 1 ? 'reporte' : 'reportes'}</span>` : ''
          }</a>`;
        })
        .join('\n');
      return `<section class="cat" id="${cat}"><h2>${esc(CATEGORIES[cat])}</h2><div class="grid">${cards}</div></section>`;
    })
    .join('\n');

  const body = `
<section class="hero">
<h1>¿Está caído? Estado en vivo de los sitios de Guatemala</h1>
<p class="lead">Revisamos cada 5 minutos los bancos, el gobierno, la telefonía y las apps que más usás. Verde funciona, naranja tiene problemas, rojo está caído.</p>
<div class="summary">
<span class="chip">${dot('green')}<b id="n-green">${n.green}</b> funcionando</span>
<span class="chip">${dot('orange')}<b id="n-orange">${n.orange}</b> con problemas</span>
<span class="chip">${dot('red')}<b id="n-red">${n.red}</b> caídos</span>
${updated ? `<span class="chip">Actualizado <time id="updated" data-ts="${updated}"></time></span>` : ''}
</div>
<div class="tools">
<label class="field">${SEARCH_ICON}<input id="q" type="search" placeholder="Buscar: Banrural, SAT, Tigo, WhatsApp…" autocomplete="off" aria-label="Buscar un servicio"></label>
<form class="field" action="/revisar" method="get">${GLOBE_ICON}<input name="url" type="text" inputmode="url" placeholder="Revisar cualquier sitio: ejemplo.com" aria-label="Dirección del sitio a revisar"><button class="btn" type="submit">Revisar</button></form>
</div>
<div class="legend">
<span>${dot('green')} Funcionando</span>
<span>${dot('orange')} Lento o falla de DNS</span>
<span>${dot('red')} Caído</span>
<span>${dot('gray')} Sin datos aún</span>
</div>
</section>
${sections}
<p class="empty" id="empty">No encontramos ese servicio. Probá revisarlo con el buscador de “Revisar cualquier sitio”.</p>

<section class="prose">
<h2>¿Cómo saber si una página está caída?</h2>
<p>Cuando una página no te carga puede ser el sitio, tu internet o tu celular. WebRadar revisa cada servicio desde servidores en la nube cada 5 minutos: si aquí sale <strong>rojo</strong>, el problema es del sitio y no tuyo. Si sale <strong>verde</strong> pero a vos no te funciona, probá cambiar entre WiFi y datos, borrar la caché del navegador o reiniciar la app.</p>
<h3>¿Qué significa la luz naranja?</h3>
<p>Que el sitio responde pero muy lento (más de 4 segundos), o que su dominio tiene una falla de DNS: la dirección no está apuntando a ningún servidor.</p>
<h3>¿Para qué sirve el botón de reportar?</h3>
<p>En la página de cada servicio podés avisar que a vos tampoco te funciona. Si mucha gente reporta al mismo tiempo, es señal de una caída aunque la página principal siga respondiendo, por ejemplo cuando falla la app o la banca en línea.</p>
</section>`;

  return layout(env, {
    title: '¿Está caído? Estado en vivo de bancos, SAT, Tigo, WhatsApp y más en Guatemala · WebRadar',
    description:
      'Revisá en vivo si Banrural, Banco Industrial, la SAT, el IGSS, Tigo, Claro, WhatsApp y otros sitios están caídos en Guatemala. Actualizado cada 5 minutos.',
    path: '/',
    body,
    live: true,
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'WebRadar',
        url: env.SITE_URL,
        inLanguage: 'es-GT',
        description: 'Estado en vivo de los sitios web más usados en Guatemala.',
      },
    ],
  });
}
