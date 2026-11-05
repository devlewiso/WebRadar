-- Historial de cada revisión (se borra lo que tenga más de 8 días)
CREATE TABLE IF NOT EXISTS checks (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL,
  ts INTEGER NOT NULL,
  status TEXT NOT NULL,
  latency INTEGER,
  code INTEGER,
  error TEXT
);
CREATE INDEX IF NOT EXISTS idx_checks_slug_ts ON checks (slug, ts);

-- Último estado de cada servicio; "since" = desde cuándo está en ese estado
CREATE TABLE IF NOT EXISTS latest (
  slug TEXT PRIMARY KEY,
  ts INTEGER NOT NULL,
  status TEXT NOT NULL,
  latency INTEGER,
  code INTEGER,
  error TEXT,
  since INTEGER NOT NULL
);

-- Reportes de la gente ("a mí tampoco me funciona"); "who" es un hash diario de la IP, nunca la IP
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL,
  ts INTEGER NOT NULL,
  who TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reports_slug_ts ON reports (slug, ts);
