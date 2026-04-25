-- Database Schema for MRN System
-- Import this file into phpMyAdmin

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'requester', 'coo', 'fulfillment') NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MRN Sheet Table (supports multiple items)
CREATE TABLE IF NOT EXISTS mrns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requester_id INT NOT NULL,
    department_id INT NOT NULL,
    location_id INT NOT NULL,
    purpose TEXT,
    status ENUM('pending', 'approved', 'rejected', 'fulfilled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MRN Items Table (linked to a specific MRN sheet)
CREATE TABLE IF NOT EXISTS mrn_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mrn_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (mrn_id) REFERENCES mrns(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Demo Data
INSERT IGNORE INTO departments (name) VALUES ('IT'), ('HR'), ('Operations'), ('Sales');
INSERT IGNORE INTO locations (name) VALUES ('New York HQ'), ('London Office'), ('Tokyo Branch');

-- Default Passwords are 'password123' (hashed with bcrypt)
INSERT IGNORE INTO users (username, password, role, full_name) VALUES 
('admin', '$2y$10$TKh8H1.Pb6Yx2b.mQ1m/O.p8xX4rF6J9x2A1w0tM0.xMzN8S5uA3S', 'admin', 'System Administrator'),
('requester1', '$2y$10$TKh8H1.Pb6Yx2b.mQ1m/O.p8xX4rF6J9x2A1w0tM0.xMzN8S5uA3S', 'requester', 'Alice Requester'),
('coo', '$2y$10$TKh8H1.Pb6Yx2b.mQ1m/O.p8xX4rF6J9x2A1w0tM0.xMzN8S5uA3S', 'coo', 'John COO'),
('inventory', '$2y$10$TKh8H1.Pb6Yx2b.mQ1m/O.p8xX4rF6J9x2A1w0tM0.xMzN8S5uA3S', 'fulfillment', 'Bob Fulfillment');
