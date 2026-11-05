import type { Env } from '../index';
import type { Status } from '../check';
import type { Latest } from '../db';

export const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export type Color = 'green' | 'orange' | 'red' | 'gray';

export const STATUS: Record<Status | 'unknown', { label: string; color: Color }> = {
  up: { label: 'Funcionando', color: 'green' },
  slow: { label: 'Lento', color: 'orange' },
  dns: { label: 'Falla de DNS', color: 'orange' },
  down: { label: 'Caído', color: 'red' },
  unknown: { label: 'Sin datos aún', color: 'gray' },
};

export const info = (l?: Latest | null) => STATUS[l?.status ?? 'unknown'];

/** Texto corto de estado; las fechas van en <time data-ts> y el JS las convierte en "hace X min". */
export function shortMeta(l?: Latest | null): string {
  if (!l) return STATUS.unknown.label;
  const s = STATUS[l.status];
  if ((l.status === 'up' || l.status === 'slow') && l.latency != null) return `${s.label} · ${l.latency} ms`;
  return `${s.label} · <time data-ts="${l.since}"></time>`;
}

export const dot = (c: Color) => `<span class="dot ${c}" aria-hidden="true"></span>`;

export const RADAR_SVG = `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="none" stroke="#1f3a5f" stroke-width="2"/><circle cx="16" cy="16" r="8.5" fill="none" stroke="#1f3a5f" stroke-width="1.5"/><path class="sweep" d="M16 16 L16 2 A14 14 0 0 1 28.1 9 Z" fill="url(#g)"/><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#38bdf8" stop-opacity=".05"/><stop offset="1" stop-color="#38bdf8" stop-opacity=".9"/></linearGradient></defs><circle cx="16" cy="16" r="2.2" fill="#38bdf8"/><circle cx="22" cy="10.5" r="1.8" fill="#22c55e"/></svg>`;

export const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#070b14"/><circle cx="16" cy="16" r="11" fill="none" stroke="#1f3a5f" stroke-width="2"/><path d="M16 16 L16 5 A11 11 0 0 1 25.5 10.5 Z" fill="#38bdf8" opacity=".85"/><circle cx="16" cy="16" r="2.2" fill="#38bdf8"/><circle cx="21.5" cy="11" r="2" fill="#22c55e"/></svg>`;

const CSS = `
:root{--bg:#070b14;--panel:#0d1424;--line:#1c2742;--line2:#2d3f66;--text:#e6ecf7;--muted:#8b97b3;--green:#22c55e;--orange:#f59e0b;--red:#ef4444;--gray:#4b5872;--accent:#38bdf8}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:radial-gradient(1100px 520px at 15% -12%,#10234a 0%,transparent 62%),var(--bg);color:var(--text);font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,Ubuntu,sans-serif;min-height:100vh}
a{color:inherit}
.wrap{max-width:1120px;margin:0 auto;padding:0 20px}
.top{border-bottom:1px solid var(--line);background:rgba(7,11,20,.82);backdrop-filter:blur(8px);position:sticky;top:0;z-index:10}
.top-in{display:flex;align-items:center;justify-content:space-between;height:60px;gap:16px}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;font-size:20px}
.brand b{color:var(--accent)}
.brand svg{width:30px;height:30px}
.sweep{transform-origin:16px 16px;animation:spin 3.2s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
nav{display:flex;gap:18px;font-size:14px;color:var(--muted)}
nav a{text-decoration:none}nav a:hover{color:var(--text)}
@media(max-width:520px){nav a.hide-sm{display:none}}
.hero{padding:42px 0 6px}
h1{font-size:clamp(28px,4.4vw,44px);line-height:1.15;margin:0 0 10px;letter-spacing:-.5px}
.lead{color:var(--muted);font-size:18px;max-width:700px;margin:0}
.summary{display:flex;flex-wrap:wrap;gap:10px;margin:22px 0 4px}
.chip{display:inline-flex;align-items:center;gap:8px;background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-size:14px}
.chip b{font-variant-numeric:tabular-nums}
.dot{width:10px;height:10px;border-radius:50%;flex:none;background:var(--gray);display:inline-block}
.dot.green{background:var(--green);animation:pg 2.6s infinite}
.dot.orange{background:var(--orange);box-shadow:0 0 10px rgba(245,158,11,.7)}
.dot.red{background:var(--red);animation:pr 1.3s infinite}
@keyframes pg{0%{box-shadow:0 0 0 0 rgba(34,197,94,.55)}70%,100%{box-shadow:0 0 0 8px rgba(34,197,94,0)}}
@keyframes pr{0%{box-shadow:0 0 0 0 rgba(239,68,68,.7)}70%,100%{box-shadow:0 0 0 9px rgba(239,68,68,0)}}
@media (prefers-reduced-motion:reduce){.dot,.sweep{animation:none!important}}
.tools{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:18px 0 6px}
@media(max-width:720px){.tools{grid-template-columns:1fr}}
.field{display:flex;gap:8px;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:6px;align-items:center}
.field:focus-within{border-color:var(--line2)}
.field svg{width:18px;height:18px;margin-left:8px;color:var(--muted);flex:none}
.field input{flex:1;min-width:0;background:transparent;border:0;outline:0;color:var(--text);font:inherit;padding:8px 6px}
.btn{background:var(--accent);color:#04121f;border:0;border-radius:9px;padding:9px 16px;font:600 15px system-ui,sans-serif;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.btn:hover{filter:brightness(1.08)}
.btn.warn{background:#fbbf24}
.btn[disabled]{opacity:.65;cursor:default;filter:none}
.legend{display:flex;flex-wrap:wrap;gap:16px;color:var(--muted);font-size:13px;margin:12px 0 0}
.legend span{display:inline-flex;align-items:center;gap:6px}
.cat{margin:34px 0 0}
.cat h2{font-size:13px;text-transform:uppercase;letter-spacing:1.3px;color:var(--muted);margin:0 0 12px;font-weight:600}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}
.card{display:flex;gap:12px;align-items:center;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:13px 14px;text-decoration:none;transition:border-color .15s,transform .15s}
.card:hover{border-color:var(--line2);transform:translateY(-1px)}
.card .name{font-weight:600;line-height:1.3}
.card .meta{font-size:13px;color:var(--muted)}
.card.red{border-color:rgba(239,68,68,.5);background:linear-gradient(rgba(239,68,68,.07),rgba(239,68,68,.07)),var(--panel)}
.card.orange{border-color:rgba(245,158,11,.45)}
.rep{margin-left:auto;font-size:12px;color:#fca5a5;white-space:nowrap}
.empty{display:none;color:var(--muted);padding:20px 0}
.crumbs{font-size:14px;color:var(--muted);margin:26px 0 0}
.crumbs a{text-decoration:none}.crumbs a:hover{color:var(--text)}
.status{display:flex;gap:20px;align-items:center;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:22px;margin:20px 0 14px}
.status .dot{width:22px;height:22px}
.status.red{border-color:rgba(239,68,68,.55);background:linear-gradient(rgba(239,68,68,.07),rgba(239,68,68,.07)),var(--panel)}
.status.orange{border-color:rgba(245,158,11,.5)}
.status.green{border-color:rgba(34,197,94,.35)}
.status h2{margin:0;font-size:22px;line-height:1.25}
.status p{margin:4px 0 0;color:var(--muted);font-size:14px}
.report{display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin:0 0 8px}
.report small{color:var(--muted)}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:18px 0}
@media(max-width:640px){.stats{grid-template-columns:1fr}}
.stat{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px 16px}
.stat b{display:block;font-size:26px;font-variant-numeric:tabular-nums}
.stat span{color:var(--muted);font-size:13px}
.panel{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px;margin:12px 0}
.panel h3{margin:0 0 12px;font-size:16px}
.bars{display:grid;grid-template-columns:repeat(24,1fr);gap:3px;height:34px}
.bars i{border-radius:3px;background:var(--line)}
.bars i.green{background:var(--green)}.bars i.orange{background:var(--orange)}.bars i.red{background:var(--red)}
.axis{display:flex;justify-content:space-between;color:var(--muted);font-size:12px;margin-top:6px}
.spark{width:100%;height:90px;display:block}
.rbars{display:grid;grid-template-columns:repeat(24,1fr);gap:3px;height:60px;align-items:end}
.rbars i{background:#f87171;border-radius:2px 2px 0 0;min-height:2px}
.rbars i.z{background:var(--line)}
.prose{color:#c7d0e3;max-width:760px}
.prose h2{color:var(--text);font-size:22px;margin:36px 0 8px}
.prose h3{font-size:17px;color:var(--text);margin:20px 0 4px}
.prose p{margin:6px 0}
.prose a{color:var(--accent)}
.links{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
.links a{font-size:14px;padding:6px 12px;border:1px solid var(--line);border-radius:999px;text-decoration:none;display:inline-flex;gap:8px;align-items:center}
.links a:hover{border-color:var(--line2)}
.result dl{display:grid;grid-template-columns:max-content 1fr;gap:6px 18px;margin:12px 0 0;font-size:15px}
.result dt{color:var(--muted)}.result dd{margin:0;word-break:break-all}
.note{color:var(--muted);font-size:13px}
.err{color:#fca5a5;margin:10px 0 0}
.foot{border-top:1px solid var(--line);margin-top:64px;padding:26px 0 40px;color:var(--muted);font-size:14px}
.foot .wrap{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px}
.foot a{text-decoration:none}.foot a:hover{color:var(--text)}
`;

const CLIENT_JS = `(function(){
var L={up:['Funcionando','green'],slow:['Lento','orange'],dns:['Falla de DNS','orange'],down:['Caído','red']};
function ago(ts){var s=Math.max(0,Math.round((Date.now()-ts)/1000));if(s<45)return'hace unos segundos';var m=Math.round(s/60);if(m<60)return'hace '+m+' min';var h=Math.floor(m/60);if(h<24)return'hace '+h+' h'+(h<6&&m%60?' '+(m%60)+' min':'');var d=Math.floor(h/24);return'hace '+d+(d==1?' día':' días')}
function tick(){document.querySelectorAll('time[data-ts]').forEach(function(el){var t=+el.getAttribute('data-ts');if(t)el.textContent=ago(t)})}
tick();setInterval(tick,30000);
function norm(v){return v.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'')}
var q=document.getElementById('q');
if(q){q.addEventListener('input',function(){var v=norm(q.value.trim()),any=false;document.querySelectorAll('.card').forEach(function(c){var ok=c.getAttribute('data-k').indexOf(v)>=0;c.style.display=ok?'':'none';if(ok)any=true});document.querySelectorAll('.cat').forEach(function(s){var vis=[].some.call(s.querySelectorAll('.card'),function(c){return c.style.display!=='none'});s.style.display=vis?'':'none'});var e=document.getElementById('empty');if(e)e.style.display=any?'none':'block'})}
var b=document.getElementById('report');
if(b){var slug=b.getAttribute('data-slug'),key='rep:'+slug,last=+(localStorage.getItem(key)||0);
if(Date.now()-last<30*60000){b.disabled=true;b.textContent='Ya lo reportaste ✓'}
b.addEventListener('click',function(){b.disabled=true;b.textContent='Enviando…';fetch('/api/reportar/'+slug,{method:'POST'}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){localStorage.setItem(key,String(Date.now()));b.textContent='¡Gracias! Reporte enviado ✓';var c=document.getElementById('repcount');if(c)c.textContent=j.count}).catch(function(){b.disabled=false;b.textContent='No se pudo enviar, probá otra vez'})})}
if(document.body.hasAttribute('data-live')){setInterval(function(){if(document.hidden)return;fetch('/api/estado').then(function(r){return r.json()}).then(function(j){var n={green:0,orange:0,red:0};j.services.forEach(function(s){var c=document.querySelector('.card[data-slug="'+s.slug+'"]');if(!c||!L[s.status])return;var l=L[s.status];n[l[1]]++;c.className='card '+l[1];c.querySelector('.dot').className='dot '+l[1];var m=c.querySelector('.meta');if(s.status=='up'||s.status=='slow'){m.textContent=l[0]+(s.latency!=null?' · '+s.latency+' ms':'')}else{m.innerHTML=l[0]+' · <time data-ts="'+s.since+'"></time>'}});['green','orange','red'].forEach(function(k){var e=document.getElementById('n-'+k);if(e)e.textContent=n[k]});var u=document.getElementById('updated');if(u&&j.updated)u.setAttribute('data-ts',j.updated);tick()}).catch(function(){})},60000)}
})();`;

export interface PageOpts {
  title: string;
  description: string;
  path: string;
  body: string;
  jsonld?: object[];
  noindex?: boolean;
  live?: boolean;
}

export function layout(env: Env, o: PageOpts): string {
  const base = env.SITE_URL.replace(/\/$/, '');
  const canonical = base + o.path;
  const ads = env.ADSENSE_CLIENT
    ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(env.ADSENSE_CLIENT)}" crossorigin="anonymous"></script>`
    : '';
  const ld = (o.jsonld ?? []).map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('');
  return `<!doctype html>
<html lang="es-GT">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.description)}">
<link rel="canonical" href="${esc(canonical)}">
${o.noindex ? '<meta name="robots" content="noindex">' : ''}
<meta property="og:type" content="website">
<meta property="og:site_name" content="WebRadar">
<meta property="og:locale" content="es_GT">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#070b14">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>${CSS}</style>
${ads}
${ld}
</head>
<body${o.live ? ' data-live' : ''}>
<header class="top"><div class="wrap top-in">
<a class="brand" href="/" aria-label="WebRadar, inicio">${RADAR_SVG}<span>Web<b>Radar</b></span></a>
<nav><a href="/revisar">Revisar un sitio</a><a class="hide-sm" href="/acerca">Cómo funciona</a></nav>
</div></header>
<main class="wrap">
${o.body}
</main>
<footer class="foot"><div class="wrap">
<span>WebRadar · estado en vivo de los sitios que más usás en Guatemala</span>
<span><a href="/acerca">Cómo funciona</a> · <a href="/acerca#privacidad">Privacidad</a> · Hecho por <a href="https://neuralcodelab.com" rel="noopener">neuralcodelab.com</a></span>
</div></footer>
<script>${CLIENT_JS}</script>
</body>
</html>`;
}

/** Hora de Guatemala (UTC-6, sin horario de verano). */
export function gtHour(ts: number): string {
  const d = new Date(ts - 6 * 3600_000);
  return `${String(d.getUTCHours()).padStart(2, '0')}:00`;
}
