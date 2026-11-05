import type { CheckResult, Status } from './check';

export interface Latest {
  slug: string;
  ts: number;
  status: Status;
  latency: number | null;
  code: number | null;
  error: string | null;
  since: number;
}

export interface Point {
  ts: number;
  status: Status;
  latency: number | null;
}

const HOUR = 3600_000;
const DAY = 24 * HOUR;

export async function saveResults(DB: D1Database, ts: number, rows: { slug: string; r: CheckResult }[]) {
  if (!rows.length) return;
  const ins = DB.prepare('INSERT INTO checks (slug, ts, status, latency, code, error) VALUES (?1, ?2, ?3, ?4, ?5, ?6)');
  const up = DB.prepare(
    `INSERT INTO latest (slug, ts, status, latency, code, error, since) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?2)
     ON CONFLICT (slug) DO UPDATE SET
       since = CASE WHEN latest.status = excluded.status THEN latest.since ELSE excluded.ts END,
       ts = excluded.ts, status = excluded.status, latency = excluded.latency,
       code = excluded.code, error = excluded.error`,
  );
  const stmts = rows.flatMap(({ slug, r }) => {
    const args = [slug, ts, r.status, r.latency ?? null, r.code ?? null, r.error ?? null];
    return [ins.bind(...args), up.bind(...args)];
  });
  await DB.batch(stmts);
}

export async function allLatest(DB: D1Database): Promise<Map<string, Latest>> {
  const { results } = await DB.prepare('SELECT slug, ts, status, latency, code, error, since FROM latest').all<Latest>();
  return new Map(results.map((r) => [r.slug, r]));
}

export async function getLatest(DB: D1Database, slug: string): Promise<Latest | null> {
  return DB.prepare('SELECT slug, ts, status, latency, code, error, since FROM latest WHERE slug = ?1').bind(slug).first<Latest>();
}

export async function reportsLastHour(DB: D1Database, now: number): Promise<Map<string, number>> {
  const { results } = await DB.prepare('SELECT slug, COUNT(*) AS c FROM reports WHERE ts > ?1 GROUP BY slug')
    .bind(now - HOUR)
    .all<{ slug: string; c: number }>();
  return new Map(results.map((r) => [r.slug, r.c]));
}

export async function history(DB: D1Database, slug: string, since: number): Promise<Point[]> {
  const { results } = await DB.prepare('SELECT ts, status, latency FROM checks WHERE slug = ?1 AND ts > ?2 ORDER BY ts')
    .bind(slug, since)
    .all<Point>();
  return results;
}

export async function uptime(DB: D1Database, slug: string, since: number): Promise<{ total: number; ok: number }> {
  const r = await DB.prepare(
    `SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN status IN ('up','slow') THEN 1 ELSE 0 END), 0) AS ok
     FROM checks WHERE slug = ?1 AND ts > ?2`,
  )
    .bind(slug, since)
    .first<{ total: number; ok: number }>();
  return r ?? { total: 0, ok: 0 };
}

export async function reportTimes(DB: D1Database, slug: string, since: number): Promise<number[]> {
  const { results } = await DB.prepare('SELECT ts FROM reports WHERE slug = ?1 AND ts > ?2').bind(slug, since).all<{ ts: number }>();
  return results.map((r) => r.ts);
}

/** Guarda un reporte; la misma persona solo cuenta una vez cada 30 minutos por servicio. */
export async function addReport(DB: D1Database, slug: string, who: string, now: number): Promise<{ dup: boolean; count: number }> {
  const dup = await DB.prepare('SELECT 1 FROM reports WHERE slug = ?1 AND who = ?2 AND ts > ?3 LIMIT 1')
    .bind(slug, who, now - 30 * 60_000)
    .first();
  if (!dup) await DB.prepare('INSERT INTO reports (slug, ts, who) VALUES (?1, ?2, ?3)').bind(slug, now, who).run();
  const c = await DB.prepare('SELECT COUNT(*) AS c FROM reports WHERE slug = ?1 AND ts > ?2').bind(slug, now - HOUR).first<{ c: number }>();
  return { dup: !!dup, count: c?.c ?? 0 };
}

export async function prune(DB: D1Database, now: number) {
  await DB.batch([
    DB.prepare('DELETE FROM checks WHERE ts < ?1').bind(now - 8 * DAY),
    DB.prepare('DELETE FROM reports WHERE ts < ?1').bind(now - 2 * DAY),
  ]);
}

export { HOUR, DAY };
