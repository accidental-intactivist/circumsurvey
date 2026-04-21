-- ═══════════════════════════════════════════════════════════════
-- CircumSurvey D1 Schema v1
-- Database: circumsurvey (9018c642-05c8-4335-93cc-4282c5e7ff12)
-- Region: WNAM
--
-- Design principles:
-- - Respondents + demographics + religion as 1:1 tables for fast
--   cross-tabs without scanning the long-form responses table
-- - responses as long-form (respondent_id, question_id, value_text,
--   value_num) so all 360+ questions are queryable with same pattern
-- - questions as static metadata layer, regenerated from master doc
-- ═══════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS responses;
DROP TABLE IF EXISTS religion;
DROP TABLE IF EXISTS demographics;
DROP TABLE IF EXISTS respondents;
DROP TABLE IF EXISTS questions;

-- ───────────────────────────────────────────────────────────────
-- Core respondent record (one per survey submission)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE respondents (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  submitted_at    TEXT NOT NULL,                    -- ISO-8601 from Google Form timestamp
  pathway         TEXT,                              -- intact | circumcised | restoring | observer | trans | intersex | NULL
  consent         INTEGER NOT NULL DEFAULT 1,
  source_row_idx  INTEGER,                           -- original CSV row for traceability
  imported_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_respondents_pathway ON respondents(pathway);
CREATE INDEX idx_respondents_submitted ON respondents(submitted_at);

-- ───────────────────────────────────────────────────────────────
-- Demographics (1:1 with respondents)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE demographics (
  respondent_id        INTEGER PRIMARY KEY,
  country_born         TEXT,
  country_now          TEXT,
  us_state_born        TEXT,
  us_state_now         TEXT,
  canada_province_born TEXT,
  canada_province_now  TEXT,
  race_ethnicity       TEXT,                         -- comma-joined for multi-select
  age_bracket          TEXT,
  generation           TEXT,
  education            TEXT,
  family_upbringing    TEXT,
  mother_education     TEXT,
  mother_profession    TEXT,
  father_education     TEXT,
  father_profession    TEXT,
  socioeconomic        TEXT,
  politics             TEXT,
  birth_location       TEXT,
  birth_attendant      TEXT,
  sexuality            TEXT,
  gender               TEXT,
  sex_assigned         TEXT,
  FOREIGN KEY (respondent_id) REFERENCES respondents(id) ON DELETE CASCADE
);

CREATE INDEX idx_demographics_country ON demographics(country_born);
CREATE INDEX idx_demographics_generation ON demographics(generation);
CREATE INDEX idx_demographics_politics ON demographics(politics);

-- ───────────────────────────────────────────────────────────────
-- Religion (1:1 with respondents)
-- Separate from demographics because religion is its own large
-- cluster of related fields and we want to cross-tab by it often
-- ───────────────────────────────────────────────────────────────
CREATE TABLE religion (
  respondent_id           INTEGER PRIMARY KEY,
  upbringing_significance TEXT,
  primary_tradition       TEXT,
  cultural_background     TEXT,
  christian_denomination  TEXT,
  jewish_denomination     TEXT,
  islamic_madhhab         TEXT,
  FOREIGN KEY (respondent_id) REFERENCES respondents(id) ON DELETE CASCADE
);

CREATE INDEX idx_religion_tradition ON religion(primary_tradition);

-- ───────────────────────────────────────────────────────────────
-- Responses (long-form, one row per respondent-question pair)
-- ~180K rows at n=500 × 360 questions. Easily handled by D1/SQLite.
-- ───────────────────────────────────────────────────────────────
CREATE TABLE responses (
  respondent_id INTEGER NOT NULL,
  question_id   TEXT NOT NULL,                      -- stable slug, e.g. 'mobile', 'confidence', 'q066_intact_advantages'
  value_text    TEXT,                                -- free-text, single-select label, or comma-joined multi-select
  value_num     REAL,                                -- populated for 1-5 scales or numeric counts
  PRIMARY KEY (respondent_id, question_id),
  FOREIGN KEY (respondent_id) REFERENCES respondents(id) ON DELETE CASCADE
);

CREATE INDEX idx_responses_qid ON responses(question_id);

-- ───────────────────────────────────────────────────────────────
-- Questions metadata (static, regenerated from master doc)
-- Drives the Explorer UI without touching response data
-- ───────────────────────────────────────────────────────────────
CREATE TABLE questions (
  id         TEXT PRIMARY KEY,                      -- matches responses.question_id
  section    TEXT,                                   -- 'Sexual Experience', 'Demographics', etc.
  pathway    TEXT,                                   -- 'all' | 'intact' | 'circumcised' | ...
  prompt     TEXT NOT NULL,                          -- master-doc verbatim wording
  subtitle   TEXT,                                   -- master-doc description
  type       TEXT,                                   -- 'single_select' | 'multi_select' | 'scale_1_5' | 'open_text'
  opts_json  TEXT,                                   -- JSON array of option labels if applicable
  tier       INTEGER DEFAULT 3,                      -- 1=curated, 2=browseable, 3=indexed
  col_idx    INTEGER                                 -- original CSV column index for traceability
);

CREATE INDEX idx_questions_section ON questions(section);
CREATE INDEX idx_questions_pathway ON questions(pathway);
CREATE INDEX idx_questions_tier ON questions(tier);
