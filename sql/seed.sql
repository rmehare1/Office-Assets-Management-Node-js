USE office_assets;

-- Password for all users: 'password' (bcrypt hash)
-- Generated with bcryptjs, 10 rounds
INSERT INTO users (id, name, email, password, department, role, phone, join_date) VALUES
('u1', 'Sarah Johnson', 'sarah.johnson@company.com', '$2a$10$1b31xQqwYW/GnUabA.//zuo5HrHivN4gMctIokksXJcfFY8vs05dK', 'Engineering', 'IT Asset Manager', '+1 (555) 123-4567', '2022-03-15'),
('u2', 'Mike Chen', 'mike.chen@company.com', '$2a$10$1b31xQqwYW/GnUabA.//zuo5HrHivN4gMctIokksXJcfFY8vs05dK', 'Engineering', 'Senior Developer', '+1 (555) 234-5678', '2021-07-01'),
('u3', 'Alex Rivera', 'alex.rivera@company.com', '$2a$10$1b31xQqwYW/GnUabA.//zuo5HrHivN4gMctIokksXJcfFY8vs05dK', 'Design', 'UX Designer', '+1 (555) 345-6789', '2023-01-10'),
('u4', 'Emma Wilson', 'emma.wilson@company.com', '$2a$10$1b31xQqwYW/GnUabA.//zuo5HrHivN4gMctIokksXJcfFY8vs05dK', 'Product', 'Product Manager', '+1 (555) 456-7890', '2022-09-20'),
('u5', 'Admin User', 'admin@company.com', '$2a$10$1b31xQqwYW/GnUabA.//zuo5HrHivN4gMctIokksXJcfFY8vs05dK', 'IT', 'admin', '+1 (555) 567-8901', '2021-01-01');

INSERT INTO categories (id, name, icon) VALUES
('cat_1', 'Laptop', 'laptop_mac'),
('cat_2', 'Monitor', 'monitor'),
('cat_3', 'Phone', 'phone_android'),
('cat_4', 'Furniture', 'chair'),
('cat_5', 'Accessory', 'headphones'),
('cat_6', 'Other', 'devices_other');

INSERT INTO statuses (id, name, color) VALUES
('stat_1', 'Available', '0xFF27AE60'),
('stat_2', 'Assigned', '0xFF4A90D9'),
('stat_3', 'Maintenance', '0xFFE67E22'),
('stat_4', 'Retired', '0xFFE74C3C');

INSERT INTO assets (id, name, category_id, status_id, assigned_to, serial_number, location, purchase_date, purchase_price, notes) VALUES
('a1',  'MacBook Pro 16"',      'cat_1', 'stat_2', 'u1', 'MBP-2024-001',  'Floor 3, Desk 12',     '2024-01-15', 2499.99, 'M3 Pro chip, 36GB RAM, 512GB SSD'),
('a2',  'Dell UltraSharp 27"',  'cat_2', 'stat_1', NULL, 'DU27-2024-042', 'Storage Room B',       '2024-03-20', 619.99,  '4K USB-C monitor'),
('a3',  'iPhone 15 Pro',        'cat_3', 'stat_2', 'u2', 'IP15-2024-018', 'Floor 2, Desk 5',      '2024-02-10', 1199.00, 'Company phone for on-call rotation'),
('a4',  'Herman Miller Aeron',  'cat_4', 'stat_2', 'u1', 'HMA-2023-067',  'Floor 3, Desk 12',     '2023-08-05', 1395.00, 'Size B, fully loaded'),
('a5',  'ThinkPad X1 Carbon',   'cat_1', 'stat_3', 'u3', 'TPX1-2023-033', 'IT Repair Center',     '2023-06-12', 1849.00, 'Battery replacement in progress'),
('a6',  'Sony WH-1000XM5',      'cat_5', 'stat_2', 'u1', 'SNY-2024-091',  'Floor 3, Desk 12',     '2024-04-01', 349.99,  'Noise-canceling headphones'),
('a7',  'LG 34" Ultrawide',     'cat_2', 'stat_4', NULL, 'LG34-2021-012', 'Disposal Queue',       '2021-11-30', 799.99,  'Panel defect, scheduled for recycling'),
('a8',  'Standing Desk Frame',  'cat_4', 'stat_1', NULL, 'SDK-2024-005',  'Storage Room A',       '2024-05-20', 549.00,  'Electric sit-stand frame, fits 48-72" tops'),
('a9',  'iPad Pro 12.9"',       'cat_6', 'stat_2', 'u4', 'IPD-2024-007',  'Floor 1, Meeting Room C', '2024-03-10', 1099.00, 'Used for presentations and design reviews'),
('a10', 'Logitech MX Master 3S','cat_5', 'stat_1', NULL, 'LMX-2024-028',  'Storage Room B',       '2024-06-01', 99.99,   NULL);
