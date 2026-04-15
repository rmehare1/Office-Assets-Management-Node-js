-- migrate_v1.6.sql: Add barcode_value column to assets table
-- Run once: mysql -u USER -pPASS DATABASE < migrate_v1.6.sql

USE office_assets;

ALTER TABLE assets
  ADD COLUMN barcode_value VARCHAR(500) NULL AFTER serial_number;

CREATE INDEX idx_assets_barcode ON assets(barcode_value);
