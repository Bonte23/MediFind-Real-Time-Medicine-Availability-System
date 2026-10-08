-- ==========================================================
-- Design and Development of a Real-Time Medicine Availability
-- and Pharmacy Locator System (MediFind)
-- MySQL Workbench Compatible Schema
-- ==========================================================


-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('patient', 'pharmacist', 'admin') NOT NULL DEFAULT 'patient',
  `status` ENUM('active', 'suspended', 'pending') NOT NULL DEFAULT 'active',
  `address` VARCHAR(255) NULL,
  `latitude` DECIMAL(10, 8) NULL,
  `longitude` DECIMAL(11, 8) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. PHARMACIES TABLE
CREATE TABLE IF NOT EXISTS `pharmacies` (
  `pharmacy_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `pharmacy_name` VARCHAR(180) NOT NULL,
  `license_number` VARCHAR(100) NOT NULL UNIQUE,
  `address` VARCHAR(255) NOT NULL,
  `city` VARCHAR(100) NOT NULL DEFAULT 'Metropolis',
  `latitude` DECIMAL(10, 8) NOT NULL,
  `longitude` DECIMAL(11, 8) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `opening_hours` VARCHAR(100) DEFAULT '08:00 AM - 10:00 PM',
  `is_24_hours` BOOLEAN DEFAULT FALSE,
  `approval_status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `rejection_reason` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  INDEX `idx_pharmacies_status` (`approval_status`),
  INDEX `idx_pharmacies_location` (`latitude`, `longitude`),
  INDEX `idx_pharmacies_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. MEDICINES TABLE
CREATE TABLE IF NOT EXISTS `medicines` (
  `medicine_id` INT AUTO_INCREMENT PRIMARY KEY,
  `medicine_name` VARCHAR(180) NOT NULL,
  `generic_name` VARCHAR(180) NULL,
  `category` VARCHAR(100) NOT NULL,
  `manufacturer` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `dosage_form` VARCHAR(50) NOT NULL DEFAULT 'Tablet', -- Tablet, Syrup, Capsule, Injection, Inhaler, Drops, Cream
  `strength` VARCHAR(50) NULL, -- e.g. 500mg, 10mg/ml
  `requires_prescription` BOOLEAN NOT NULL DEFAULT FALSE,
  `side_effects` TEXT NULL,
  `image_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_medicines_name` (`medicine_name`),
  INDEX `idx_medicines_category` (`category`),
  INDEX `idx_medicines_manufacturer` (`manufacturer`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. INVENTORY TABLE
CREATE TABLE IF NOT EXISTS `inventory` (
  `inventory_id` INT AUTO_INCREMENT PRIMARY KEY,
  `pharmacy_id` INT NOT NULL,
  `medicine_id` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 0,
  `reserved_quantity` INT NOT NULL DEFAULT 0,
  `price` DECIMAL(10, 2) NOT NULL,
  `batch_number` VARCHAR(80) NULL,
  `expiry_date` DATE NOT NULL,
  `availability_status` ENUM('In Stock', 'Low Stock', 'Out of Stock', 'Expired') NOT NULL DEFAULT 'In Stock',
  `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`pharmacy_id`) REFERENCES `pharmacies` (`pharmacy_id`) ON DELETE CASCADE,
  FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`medicine_id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_pharmacy_medicine` (`pharmacy_id`, `medicine_id`),
  INDEX `idx_inventory_status` (`availability_status`),
  INDEX `idx_inventory_expiry` (`expiry_date`),
  INDEX `idx_inventory_price` (`price`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS `prescriptions` (
  `prescription_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `pharmacy_id` INT NULL,
  `image_path` VARCHAR(255) NOT NULL,
  `notes` TEXT NULL,
  `status` ENUM('pending', 'reviewed', 'fulfilled', 'rejected') NOT NULL DEFAULT 'pending',
  `pharmacist_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`pharmacy_id`) REFERENCES `pharmacies` (`pharmacy_id`) ON DELETE SET NULL,
  INDEX `idx_prescriptions_user` (`user_id`),
  INDEX `idx_prescriptions_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS `reservations` (
  `reservation_id` INT AUTO_INCREMENT PRIMARY KEY,
  `reservation_code` VARCHAR(20) NOT NULL UNIQUE,
  `user_id` INT NOT NULL,
  `inventory_id` INT NOT NULL,
  `prescription_id` INT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10, 2) NOT NULL,
  `total_price` DECIMAL(10, 2) NOT NULL,
  `reservation_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `expiry_time` TIMESTAMP NOT NULL,
  `status` ENUM('Pending', 'Confirmed', 'Collected', 'Rejected', 'Cancelled', 'Expired') NOT NULL DEFAULT 'Pending',
  `rejection_reason` VARCHAR(255) NULL,
  `patient_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`inventory_id`) ON DELETE CASCADE,
  FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`prescription_id`) ON DELETE SET NULL,
  INDEX `idx_reservations_code` (`reservation_code`),
  INDEX `idx_reservations_status` (`status`),
  INDEX `idx_reservations_user` (`user_id`),
  INDEX `idx_reservations_inventory` (`inventory_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS `notifications` (
  `notification_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(180) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('reservation', 'inventory', 'approval', 'system', 'prescription') NOT NULL DEFAULT 'system',
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `link` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  INDEX `idx_notifications_user` (`user_id`),
  INDEX `idx_notifications_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS `complaints` (
  `complaint_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `pharmacy_id` INT NULL,
  `subject` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `status` ENUM('pending', 'in_review', 'resolved') NOT NULL DEFAULT 'pending',
  `admin_response` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`pharmacy_id`) REFERENCES `pharmacies` (`pharmacy_id`) ON DELETE SET NULL,
  INDEX `idx_complaints_user` (`user_id`),
  INDEX `idx_complaints_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. AUDIT_LOGS TABLE
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `log_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `action` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `ip_address` VARCHAR(50) DEFAULT '127.0.0.1',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  INDEX `idx_audit_logs_action` (`action`),
  INDEX `idx_audit_logs_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
