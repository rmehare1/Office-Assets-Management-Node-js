-- Migration: v1.4 — Add reset token columns to users for forgot password flow
USE office_assets;

ALTER TABLE users 
ADD COLUMN reset_token VARCHAR(100) NULL,
ADD COLUMN reset_token_expires DATETIME NULL;
