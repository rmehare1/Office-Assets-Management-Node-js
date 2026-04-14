-- migrate_v1.5.sql: Add rejection_reason to tickets table
-- Run once: mysql -u USER -pPASS DATABASE < migrate_v1.5.sql

USE office_assets;

ALTER TABLE tickets
  ADD COLUMN rejection_reason TEXT NULL AFTER status;
