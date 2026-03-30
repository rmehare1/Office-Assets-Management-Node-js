USE office_assets;

-- Password for all users: 'password' (bcrypt hash)
-- Generated with bcryptjs, 10 rounds
INSERT INTO users (id, name, email, password, department, role, phone, join_date) VALUES
('u1', 'Sarah Johnson', 'sarah.johnson@company.com', '$2a$10$1b31xQqwYW/GnUabA.//zuo5HrHivN4gMctIokksXJcfFY8vs05dK', 'Engineering', 'IT Asset Manager', '+1 (555) 123-4567', '2022-03-15'),
('u2', 'Mike Chen', 'mike.chen@company.com', '$2a$10$1b31xQqwYW/GnUabA.//zuo5HrHivN4gMctIokksXJcfFY8vs05dK', 'Engineering', 'Senior Developer', '+1 (555) 234-5678', '2021-07-01'),
('u3', 'Alex Rivera', 'alex.rivera@company.com', '$2a$10$1b31xQqwYW/GnUabA.//zuo5HrHivN4gMctIokksXJcfFY8vs05dK', 'Design', 'UX Designer', '+1 (555) 345-6789', '2023-01-10'),
('u4', 'Emma Wilson', 'emma.wilson@company.com', '$2a$10$1b31xQqwYW/GnUabA.//zuo5HrHivN4gMctIokksXJcfFY8vs05dK', 'Product', 'Product Manager', '+1 (555) 456-7890', '2022-09-20');

INSERT INTO assets (id, name, category, status, assigned_to, serial_number, location, purchase_date, purchase_price, notes) VALUES
('a1',  'MacBook Pro 16"',      'laptop',    'assigned',    'u1', 'MBP-2024-001',  'Floor 3, Desk 12',     '2024-01-15', 2499.99, 'M3 Pro chip, 36GB RAM, 512GB SSD'),
('a2',  'Dell UltraSharp 27"',  'monitor',   'available',   NULL, 'DU27-2024-042', 'Storage Room B',       '2024-03-20', 619.99,  '4K USB-C monitor'),
('a3',  'iPhone 15 Pro',        'phone',     'assigned',    'u2', 'IP15-2024-018', 'Floor 2, Desk 5',      '2024-02-10', 1199.00, 'Company phone for on-call rotation'),
('a4',  'Herman Miller Aeron',  'furniture', 'assigned',    'u1', 'HMA-2023-067',  'Floor 3, Desk 12',     '2023-08-05', 1395.00, 'Size B, fully loaded'),
('a5',  'ThinkPad X1 Carbon',   'laptop',    'maintenance', 'u3', 'TPX1-2023-033', 'IT Repair Center',     '2023-06-12', 1849.00, 'Battery replacement in progress'),
('a6',  'Sony WH-1000XM5',     'accessory', 'assigned',    'u1', 'SNY-2024-091',  'Floor 3, Desk 12',     '2024-04-01', 349.99,  'Noise-canceling headphones'),
('a7',  'LG 34" Ultrawide',    'monitor',   'retired',     NULL, 'LG34-2021-012', 'Disposal Queue',       '2021-11-30', 799.99,  'Panel defect, scheduled for recycling'),
('a8',  'Standing Desk Frame',  'furniture', 'available',   NULL, 'SDK-2024-005',  'Storage Room A',       '2024-05-20', 549.00,  'Electric sit-stand frame, fits 48-72" tops'),
('a9',  'iPad Pro 12.9"',      'other',     'assigned',    'u4', 'IPD-2024-007',  'Floor 1, Meeting Room C', '2024-03-10', 1099.00, 'Used for presentations and design reviews'),
('a10', 'Logitech MX Master 3S','accessory', 'available',  NULL, 'LMX-2024-028',  'Storage Room B',       '2024-06-01', 99.99,   NULL);
