-- Run this in phpMyAdmin to update your database schema to support multiple items per MRN

-- 1. We must drop the old mrns table which only supported 1 item
DROP TABLE IF EXISTS mrns;

-- 2. Create the new general MRNs (Sheets) table
CREATE TABLE mrns (
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

-- 3. Create the new Items table that links back to a specific MRN sheet
CREATE TABLE mrn_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mrn_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (mrn_id) REFERENCES mrns(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
