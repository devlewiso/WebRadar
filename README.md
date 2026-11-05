# WebRadar

**¿Está caído?** Estado en vivo de los sitios más usados en Guatemala: bancos, gobierno, telefonía, universidades, noticias y apps.

- 🟢 **Verde**: el sitio respondió en menos de 4 segundos.
- 🟠 **Naranja**: respondió muy lento o su dominio tiene una falla de DNS.
- 🔴 **Rojo**: no respondió, no se pudo conectar o devolvió un error 5xx (se intenta dos veces antes de marcarlo).

Cada servicio tiene su página (`/estado/banrural`, `/estado/sat`…) con historial de 24 horas, tiempo de respuesta, disponibilidad de 7 días y un botón para que la gente reporte fallas. También hay un revisador público para cualquier sitio en `/revisar`.

## Cómo está hecho

Un solo Cloudflare Worker, sin frameworks:

- **Cron cada minuto**: revisa una quinta parte de los servicios, así cada sitio se revisa cada 5 minutos sin pasar el límite de subrequests del plan gratis.
- **D1** guarda el historial (8 días), el último estado de cada servicio y los reportes (2 días, con un hash diario en vez de la IP).
- Las páginas se generan en el servidor (buenas para SEO) y se guardan 60 s en el caché de Cloudflare.

La lista de servicios está en [`src/services.ts`](src/services.ts).

## Desarrollo

```bash
npm install
cp .dev.vars.example .dev.vars
npm run db:local          # crea las tablas en la base local
npm run dev               # http://localhost:5182
curl localhost:5182/__revisar-todo   # (solo en dev) revisa todo de una vez
```

Para probar el cron en local: `curl "localhost:5182/__scheduled?cron=*+*+*+*+*"`.

## Desplegar

```bash
npx wrangler d1 create webradar     # copiá el database_id a wrangler.jsonc
npm run db:remote
npx wrangler secret put IP_SALT
npm run deploy
```

El dominio propio está en `routes` dentro de `wrangler.jsonc`.

## Agregar un servicio

Agregá una línea en `src/services.ts` con `slug`, `name`, `url` y `category`. La página y el sitemap se generan solos.

---

Hecho por [neuralcodelab.com](https://neuralcodelab.com). WebRadar no tiene relación con los sitios que revisa.
