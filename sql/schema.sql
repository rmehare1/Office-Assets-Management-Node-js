CREATE DATABASE IF NOT EXISTS office_assets;
USE office_assets;

CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(36) PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,
  department    VARCHAR(100) NOT NULL,
  role          VARCHAR(100) NOT NULL,
  phone         VARCHAR(20),
  avatar_url    VARCHAR(500),
  join_date     DATE NOT NULL DEFAULT (CURRENT_DATE),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
  id              VARCHAR(36) PRIMARY KEY,
  name            VARCHAR(200) NOT NULL,
  category        ENUM('laptop','monitor','phone','furniture','accessory','other') NOT NULL,
  status          ENUM('available','assigned','maintenance','retired') NOT NULL DEFAULT 'available',
  assigned_to     VARCHAR(36),
  serial_number   VARCHAR(100) NOT NULL UNIQUE,
  location        VARCHAR(200) NOT NULL,
  purchase_date   DATE NOT NULL,
  purchase_price  DECIMAL(10,2) NOT NULL,
  image_url       VARCHAR(500),
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);
