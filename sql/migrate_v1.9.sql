-- Migration v1.9: Asset Audit History
CREATE TABLE IF NOT EXISTS asset_audit_logs (
  id              VARCHAR(36) PRIMARY KEY,
  asset_id        VARCHAR(36) NOT NULL,
  user_id         VARCHAR(36),
  user_name       VARCHAR(100) NOT NULL,
  action          VARCHAR(255) NOT NULL,
  details         TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
