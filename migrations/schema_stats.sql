-- Global Circumcision Atlas: statistics ledger (Phase A).
-- Additive only; safe to run against production:
--   npx wrangler d1 execute circumsurvey --remote --file=migrations/schema_stats.sql

CREATE TABLE IF NOT EXISTS geo_units (
  code        TEXT PRIMARY KEY,          -- ISO3 ('KEN') or ISO3:region-slug ('KEN:nyanza', 'USA:midwest')
  name        TEXT NOT NULL,
  level       TEXT NOT NULL,             -- 'country' | 'region'
  parent      TEXT,                      -- ISO3 for regions
  topo_ref    TEXT                       -- optional boundary reference
);

CREATE TABLE IF NOT EXISTS stat_sources (
  id          TEXT PRIMARY KEY,          -- e.g. 'dhs-KE2014DHS', 'jama-peds-2025-yang-tobian'
  citation    TEXT NOT NULL,
  url         TEXT,
  kind        TEXT,                      -- survey | claims | registry | literature
  access      TEXT,                      -- open | fee | request
  bias_note   TEXT,                      -- e.g. 'inpatient only', 'proponent-authored compilation'
  weight      REAL DEFAULT 1,            -- down-weight biased compilations (never hide them)
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS stat_observations (
  id            TEXT PRIMARY KEY,        -- deterministic, e.g. 'dhs:KE2014DHS:national'
  geo           TEXT NOT NULL,
  geo_name      TEXT,
  level         TEXT NOT NULL,
  parent        TEXT,
  depth         INTEGER DEFAULT 0,
  period        INTEGER NOT NULL,        -- survey / data year
  metric        TEXT NOT NULL,           -- prevalence_adult | newborn_inpatient | ...
  value         REAL NOT NULL,
  ci_low        REAL,
  ci_high       REAL,
  n             INTEGER,
  population    TEXT,
  method        TEXT,
  source_id     TEXT NOT NULL REFERENCES stat_sources(id),
  tier          TEXT DEFAULT 'documented',
  quote         TEXT,                    -- verbatim quote + page for literature extractions
  extracted_by  TEXT,                    -- 'collector:dhs' | 'curator:seed' | 'extractor:A+B'
  status        TEXT DEFAULT 'approved', -- pending | approved | rejected
  flags         TEXT,                    -- JSON array of validator flags
  updated_at    TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_stat_obs_metric_level ON stat_observations (metric, level, status);
CREATE INDEX IF NOT EXISTS idx_stat_obs_parent ON stat_observations (parent, metric);
CREATE INDEX IF NOT EXISTS idx_stat_obs_geo ON stat_observations (geo, metric, period);

CREATE TABLE IF NOT EXISTS stat_estimates (
  id             TEXT PRIMARY KEY,
  geo            TEXT NOT NULL,
  period         INTEGER NOT NULL,
  metric         TEXT NOT NULL,          -- e.g. newborn_all_settings
  median         REAL NOT NULL,
  low            REAL,                   -- 80% interval
  high           REAL,
  model_version  TEXT NOT NULL,
  inputs         TEXT,                   -- JSON: observation ids + assumption ranges
  updated_at     TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS stat_reviews (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  observation_id  TEXT NOT NULL,
  reviewer        TEXT,
  decision        TEXT NOT NULL,         -- approve | reject | edit
  note            TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);
