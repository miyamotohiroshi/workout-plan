-- MySQL 5.7+ / MariaDB 10.2+ 用。文字コードは utf8mb4。
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS body_records (
  id        CHAR(36) NOT NULL PRIMARY KEY,
  date      DATE NOT NULL,
  weight    DOUBLE NULL,
  body_fat  DOUBLE NULL,
  chest     DOUBLE NULL,
  shoulder  DOUBLE NULL,
  arm       DOUBLE NULL,
  thigh     DOUBLE NULL,
  KEY idx_body_records_date (date)
) DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS exercise_records (
  id            CHAR(36) NOT NULL PRIMARY KEY,
  date          DATE NOT NULL,
  exercise_name VARCHAR(255) NOT NULL,
  weight        DOUBLE NOT NULL,
  reps          INT NOT NULL,
  sets          INT NOT NULL,
  KEY idx_exercise_records_date (date)
) DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS photos (
  id           CHAR(36) NOT NULL PRIMARY KEY,
  date         DATE NOT NULL,
  memo         TEXT NULL,
  storage_path VARCHAR(255) NOT NULL,
  angle        VARCHAR(32) NULL,
  KEY idx_photos_date (date)
) DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS checkins (
  id     CHAR(36) NOT NULL PRIMARY KEY,
  week   DATE NOT NULL,
  days   TEXT NULL,            -- JSON 配列を文字列で保存 (例: ["月","水"])
  weight DOUBLE NULL,
  memo   TEXT NULL,
  KEY idx_checkins_week (week)
) DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS protein_logs (
  id        CHAR(36) NOT NULL PRIMARY KEY,
  date      DATE NOT NULL,
  breakfast TEXT NULL,         -- JSON オブジェクトを文字列で保存
  lunch     TEXT NULL,
  dinner    TEXT NULL,
  snack     TEXT NULL,
  UNIQUE KEY uq_protein_logs_date (date)
) DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS app_settings (
  `key`      VARCHAR(64) NOT NULL PRIMARY KEY,
  `value`    MEDIUMTEXT NULL,  -- JSON を文字列で保存
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) DEFAULT CHARSET=utf8mb4;
