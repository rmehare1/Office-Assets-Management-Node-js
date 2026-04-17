-- Migration v1.8: E-Waste Management fields
ALTER TABLE assets 
ADD COLUMN decommissioned_at DATETIME NULL,
ADD COLUMN decommission_method VARCHAR(255) NULL,
ADD COLUMN recycler_name VARCHAR(255) NULL,
ADD COLUMN certificate_number VARCHAR(255) NULL;

-- Add Decommissioned status
INSERT INTO statuses (id, name, color) VALUES ('stat_5', 'Decommissioned', '0xFF95A5A6');
