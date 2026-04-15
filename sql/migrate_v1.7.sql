-- migrate_v1.7.sql: Add last_service_date to assets and create maintenance_alerts table
-- Run once: mysql -u USER -pPASS DATABASE < migrate_v1.7.sql

USE office_assets;

-- Add last_service_date to assets
ALTER TABLE assets
  ADD COLUMN last_service_date DATE NULL AFTER purchase_price;

-- Create maintenance_alerts table
CREATE TABLE IF NOT EXISTS maintenance_alerts (
  id VARCHAR(36) PRIMARY KEY,
  asset_id VARCHAR(36) NOT NULL,
  status ENUM('Pending', 'Notified', 'Completed', 'Dismissed') NOT NULL DEFAULT 'Pending',
  overdue_days INT NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);
