-- Database Schema for MRN System
-- Import this file into Namecheap's phpMyAdmin

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('requester', 'coo', 'fulfillment') NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS mrns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requester_id INT NOT NULL,
    department_id INT NOT NULL,
    location_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    purpose TEXT,
    status ENUM('pending', 'approved', 'rejected', 'fulfilled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Insert Demo Data
INSERT IGNORE INTO departments (name) VALUES ('IT'), ('HR'), ('Operations'), ('Sales');
INSERT IGNORE INTO locations (name) VALUES ('New York HQ'), ('London Office'), ('Tokyo Branch');

-- Default Passwords are 'password123' (hashed with bcrypt)
-- Using PHP password_hash('password123', PASSWORD_DEFAULT) output for $2y$10$w...
INSERT IGNORE INTO users (username, password, role, full_name) VALUES 
('requester1', '$2y$10$TKh8H1.Pb6Yx2b.mQ1m/O.p8xX4rF6J9x2A1w0tM0.xMzN8S5uA3S', 'requester', 'Alice Requester'),
('coo', '$2y$10$TKh8H1.Pb6Yx2b.mQ1m/O.p8xX4rF6J9x2A1w0tM0.xMzN8S5uA3S', 'coo', 'John COO'),
('inventory', '$2y$10$TKh8H1.Pb6Yx2b.mQ1m/O.p8xX4rF6J9x2A1w0tM0.xMzN8S5uA3S', 'fulfillment', 'Bob Fulfillment');
