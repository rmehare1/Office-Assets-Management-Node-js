-- migrate_v1.2.sql: Add tickets table for ticket system
-- Run once: mysql -u USER -pPASS DATABASE < migrate_v1.2.sql

CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('new_asset_request', 'return_asset') NOT NULL,
  asset_id VARCHAR(36) NULL,
  status ENUM('pending', 'approved', 'rejected', 'closed') NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL
);
