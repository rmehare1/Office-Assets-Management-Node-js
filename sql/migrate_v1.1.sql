-- Migration: v1.1 — Add locations, departments tables; update assets table
-- Run once against your existing office_assets database

USE office_assets;

-- 1. Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id          VARCHAR(36) PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id          VARCHAR(36) PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Add location_id and location_name columns to assets
--    (copies old location text into location_name for backward compat)
ALTER TABLE assets
  ADD COLUMN location_id   VARCHAR(36)           NULL AFTER serial_number,
  ADD COLUMN location_name VARCHAR(200) NOT NULL DEFAULT '' AFTER location_id;

-- 4. Copy existing free-text location into location_name
UPDATE assets SET location_name = location WHERE location IS NOT NULL;

-- 5. Drop the old location column
ALTER TABLE assets DROP COLUMN location;

-- 6. Add foreign key constraint
ALTER TABLE assets
  ADD CONSTRAINT fk_assets_location
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL;
