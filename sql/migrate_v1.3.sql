-- Migration: v1.3 — Make department nullable in users table
USE office_assets;
ALTER TABLE users MODIFY COLUMN department VARCHAR(100) NULL;
