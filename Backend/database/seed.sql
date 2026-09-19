-- ==========================================================
-- MediFind Seed Data (MySQL Workbench Compatible)
-- Default Passwords:
-- Admin: Admin@123
-- Pharmacist 1, 2, 3: Pharm@123
-- Patient 1, 2, 3: Patient@123
-- (Bcrypt hash: $2a$10$Q7eY.r1uGq5tW1U0m7G77.qfWn/N1XhCg9tHhFzW5vC0x1sM2Yn3m)
-- ==========================================================

USE `medifind_db`;

-- Clear existing data if needed (respecting foreign key order)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `audit_logs`;
TRUNCATE TABLE `complaints`;
TRUNCATE TABLE `notifications`;
TRUNCATE TABLE `reservations`;
TRUNCATE TABLE `prescriptions`;
TRUNCATE TABLE `inventory`;
TRUNCATE TABLE `medicines`;
TRUNCATE TABLE `pharmacies`;
TRUNCATE TABLE `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. USERS
INSERT INTO `users` (`user_id`, `full_name`, `email`, `phone`, `password`, `role`, `status`, `address`, `latitude`, `longitude`) VALUES
(1, 'System Administrator', 'admin@medifind.com', '+1-800-555-0100', '$2a$10$wEkgY8xW0FqM19nZ2HjJce94k4kZ4FzIeS8mK9d5l/eEaE9fG4Z3e', 'admin', 'active', '100 Medical Center Dr, Suite 500', 40.7128, -74.0060),
(2, 'Dr. Sarah Jenkins (CityCare)', 'pharmacist@medifind.com', '+1-800-555-0101', '$2a$10$wEkgY8xW0FqM19nZ2HjJce94k4kZ4FzIeS8mK9d5l/eEaE9fG4Z3e', 'pharmacist', 'active', '45 Broadway, Downtown', 40.7138, -74.0072),
(3, 'Pharm. David Miller (MetroPharma)', 'david@metropharma.com', '+1-800-555-0102', '$2a$10$wEkgY8xW0FqM19nZ2HjJce94k4kZ4FzIeS8mK9d5l/eEaE9fG4Z3e', 'pharmacist', 'active', '124 5th Avenue, Midtown', 40.7308, -73.9973),
(4, 'Pharm. Elena Rostova (HealthFirst)', 'elena@healthfirst.com', '+1-800-555-0103', '$2a$10$wEkgY8xW0FqM19nZ2HjJce94k4kZ4FzIeS8mK9d5l/eEaE9fG4Z3e', 'pharmacist', 'active', '520 Lexington Ave, Uptown', 40.7580, -73.9740),
(5, 'Pharm. Robert Chen (Apex Chemist)', 'robert@apexchemist.com', '+1-800-555-0104', '$2a$10$wEkgY8xW0FqM19nZ2HjJce94k4kZ4FzIeS8mK9d5l/eEaE9fG4Z3e', 'pharmacist', 'pending', '789 Grand Concourse, Bronx', 40.8250, -73.9260),
(6, 'John Doe (Patient)', 'patient@medifind.com', '+1-800-555-0105', '$2a$10$wEkgY8xW0FqM19nZ2HjJce94k4kZ4FzIeS8mK9d5l/eEaE9fG4Z3e', 'patient', 'active', '240 Mercer St, Greenwich Village', 40.7282, -73.9965),
(7, 'Emily Watson', 'emily.w@example.com', '+1-800-555-0106', '$2a$10$wEkgY8xW0FqM19nZ2HjJce94k4kZ4FzIeS8mK9d5l/eEaE9fG4Z3e', 'patient', 'active', '150 West End Ave, Upper West', 40.7750, -73.9850),
(8, 'Michael Chang', 'michael.c@example.com', '+1-800-555-0107', '$2a$10$wEkgY8xW0FqM19nZ2HjJce94k4kZ4FzIeS8mK9d5l/eEaE9fG4Z3e', 'patient', 'active', '350 5th Ave, Empire Zone', 40.7484, -73.9857);

-- 2. PHARMACIES
INSERT INTO `pharmacies` (`pharmacy_id`, `user_id`, `pharmacy_name`, `license_number`, `address`, `city`, `latitude`, `longitude`, `phone`, `email`, `opening_hours`, `is_24_hours`, `approval_status`) VALUES
(1, 2, 'CityCare Central Pharmacy', 'PHARM-NY-2024-001', '45 Broadway, Financial District', 'New York', 40.7075, -74.0112, '+1-212-555-0111', 'contact@citycarepharm.com', '07:00 AM - 11:00 PM', FALSE, 'approved'),
(2, 3, 'MetroPharma 24/7 Superstore', 'PHARM-NY-2024-002', '124 5th Avenue, Union Square', 'New York', 40.7380, -73.9910, '+1-212-555-0222', 'support@metropharma.com', '24 Hours Open', TRUE, 'approved'),
(3, 4, 'HealthFirst Community Chemist', 'PHARM-NY-2024-003', '520 Lexington Ave, Midtown East', 'New York', 40.7550, -73.9730, '+1-212-555-0333', 'rx@healthfirst.com', '08:00 AM - 09:00 PM', FALSE, 'approved'),
(4, 5, 'Apex Chemist & Surgical', 'PHARM-NY-2024-004', '789 Grand Concourse, South Bronx', 'New York', 40.8250, -73.9260, '+1-718-555-0444', 'admin@apexchemist.com', '09:00 AM - 08:00 PM', FALSE, 'pending');

-- 3. MEDICINES
INSERT INTO `medicines` (`medicine_id`, `medicine_name`, `generic_name`, `category`, `manufacturer`, `description`, `dosage_form`, `strength`, `requires_prescription`, `side_effects`) VALUES
(1, 'Amoxicillin 500mg', 'Amoxicillin Trihydrate', 'Antibiotics', 'GlaxoSmithKline (GSK)', 'Broad-spectrum penicillin antibiotic used to treat bacterial infections such as pneumonia, bronchitis, and infections of the ear, nose, throat, or skin.', 'Capsule', '500mg', TRUE, 'Nausea, diarrhea, mild rash'),
(2, 'Paracetamol (Panadol) 500mg', 'Acetaminophen', 'Analgesics & Antipyretics', 'Haleon', 'Effective relief for mild to moderate pain, headaches, muscle aches, toothaches, arthritis, and fever reduction.', 'Tablet', '500mg', FALSE, 'Rare: allergic reaction, liver strain with excessive dosage'),
(3, 'Azithromycin (Zithromax) 250mg', 'Azithromycin', 'Antibiotics', 'Pfizer Inc.', 'Macrolide antibiotic used for respiratory tract infections, ear infections, and skin/soft tissue infections.', 'Tablet', '250mg', TRUE, 'Abdominal pain, mild diarrhea, headache'),
(4, 'Ibuprofen (Advil) 400mg', 'Ibuprofen', 'Analgesics & NSAIDs', 'Pfizer Inc.', 'Nonsteroidal anti-inflammatory drug used for reducing inflammation, arthritis swelling, menstrual cramps, and pain.', 'Tablet', '400mg', FALSE, 'Upset stomach, heartburn, dizziness'),
(5, 'Metformin 850mg', 'Metformin Hydrochloride', 'Antidiabetic', 'Merck & Co.', 'First-line medication for the treatment of type 2 diabetes mellitus, assisting in controlling blood glucose levels.', 'Tablet', '850mg', TRUE, 'Gastrointestinal upset, metallic taste, nausea'),
(6, 'Amlodipine 10mg', 'Amlodipine Besylate', 'Cardiovascular & Hypertensive', 'Novartis', 'Calcium channel blocker prescribed for hypertension (high blood pressure) and chronic stable angina.', 'Tablet', '10mg', TRUE, 'Swelling in ankles/feet, dizziness, fatigue'),
(7, 'Cetirizine (Zyrtec) 10mg', 'Cetirizine Hydrochloride', 'Antihistamines & Allergy', 'Johnson & Johnson', 'Second-generation antihistamine used to relieve allergy symptoms such as watery eyes, runny nose, sneezing, and hives.', 'Tablet', '10mg', FALSE, 'Drowsiness, dry mouth, headache'),
(8, 'Omeprazole (Prilosec) 20mg', 'Omeprazole', 'Gastrointestinal & Antacids', 'AstraZeneca', 'Proton pump inhibitor (PPI) that decreases stomach acid production to treat acid reflux, GERD, and stomach ulcers.', 'Capsule', '20mg', FALSE, 'Headache, abdominal cramps, nausea'),
(9, 'Salbutamol (Ventolin) Inhaler', 'Albuterol Sulfate', 'Respiratory & Asthma', 'GlaxoSmithKline (GSK)', 'Fast-acting bronchodilator for the rapid relief and prevention of bronchospasm in asthma and COPD.', 'Inhaler', '100mcg/dose', TRUE, 'Tremor, palpitation, slight nervousness'),
(10, 'Ciprofloxacin 500mg', 'Ciprofloxacin HCl', 'Antibiotics', 'Bayer Pharma', 'Fluoroquinolone antibiotic for urinary tract, bone, joint, and severe bacterial gastrointestinal infections.', 'Tablet', '500mg', TRUE, 'Nausea, dizziness, tendon pain'),
(11, 'Atorvastatin (Lipitor) 20mg', 'Atorvastatin Calcium', 'Cardiovascular & Cholesterol', 'Pfizer Inc.', 'HMG-CoA reductase inhibitor (statin) used to lower LDL cholesterol and reduce cardiovascular risk.', 'Tablet', '20mg', TRUE, 'Muscle ache, joint stiffness, digestive discomfort'),
(12, 'Losartan Potassium 50mg', 'Losartan', 'Cardiovascular & Hypertensive', 'Sanofi', 'Angiotensin II receptor antagonist used to treat high blood pressure and protect kidney function in diabetics.', 'Tablet', '50mg', TRUE, 'Dizziness, low blood pressure, sinus congestion'),
(13, 'Augmentin 625mg', 'Amoxicillin + Clavulanic Acid', 'Antibiotics', 'GlaxoSmithKline (GSK)', 'Potentiated penicillin antibiotic for resistant bacterial infections including sinusitis and dental abscesses.', 'Tablet', '625mg', TRUE, 'Diarrhea, vomiting, mild skin rash'),
(14, 'Loratadine (Claritin) 10mg', 'Loratadine', 'Antihistamines & Allergy', 'Bayer Health', 'Non-drowsy 24-hour antihistamine for seasonal allergic rhinitis and urticaria (hives).', 'Tablet', '10mg', FALSE, 'Headache, fatigue, dry mouth'),
(15, 'Insulin Glargine (Lantus)', 'Insulin Glargine', 'Antidiabetic', 'Sanofi', 'Long-acting synthetic human insulin analog injected once daily for glycemic control.', 'Injection', '100 units/ml (3ml pen)', TRUE, 'Hypoglycemia, injection site redness'),
(16, 'Hydrocortisone Cream 1%', 'Hydrocortisone', 'Dermatological', 'Perrigo', 'Mild corticosteroid topical cream for the temporary relief of itching, rashes, eczema, and insect bites.', 'Cream', '30g tube', FALSE, 'Mild skin thinning with prolonged misuse');

-- 4. INVENTORY
INSERT INTO `inventory` (`inventory_id`, `pharmacy_id`, `medicine_id`, `quantity`, `reserved_quantity`, `price`, `batch_number`, `expiry_date`, `availability_status`) VALUES
-- CityCare Central Pharmacy (Pharmacy 1)
(1, 1, 1, 45, 2, 12.50, 'AMX-2024-B1', '2026-11-30', 'In Stock'),
(2, 1, 2, 120, 0, 4.25, 'PAN-2024-09', '2027-05-15', 'In Stock'),
(3, 1, 3, 18, 1, 24.00, 'AZI-2024-04', '2026-09-20', 'In Stock'),
(4, 1, 4, 80, 0, 6.50, 'IBU-2024-A3', '2027-02-28', 'In Stock'),
(5, 1, 5, 5, 0, 15.00, 'MET-2023-99', '2026-12-15', 'Low Stock'),
(6, 1, 6, 0, 0, 18.20, 'AML-2023-55', '2026-08-01', 'Out of Stock'),
(7, 1, 9, 12, 1, 32.00, 'VEN-2024-88', '2027-01-10', 'In Stock'),
(8, 1, 13, 25, 0, 22.50, 'AUG-2024-12', '2026-10-30', 'In Stock'),

-- MetroPharma 24/7 Superstore (Pharmacy 2)
(9, 2, 1, 60, 0, 11.90, 'AMX-2024-M2', '2027-03-15', 'In Stock'),
(10, 2, 2, 200, 0, 3.99, 'PAN-2024-M1', '2027-08-20', 'In Stock'),
(11, 2, 3, 30, 0, 22.80, 'AZI-2024-M4', '2026-12-30', 'In Stock'),
(12, 2, 5, 45, 0, 14.20, 'MET-2024-M1', '2027-04-10', 'In Stock'),
(13, 2, 6, 35, 0, 17.50, 'AML-2024-M2', '2027-06-25', 'In Stock'),
(14, 2, 7, 75, 0, 8.50, 'ZYR-2024-M9', '2027-09-12', 'In Stock'),
(15, 2, 8, 50, 0, 16.00, 'OME-2024-M3', '2027-07-01', 'In Stock'),
(16, 2, 9, 28, 0, 29.99, 'VEN-2024-M8', '2027-04-30', 'In Stock'),
(17, 2, 11, 40, 0, 28.00, 'LIP-2024-M5', '2027-03-01', 'In Stock'),
(18, 2, 15, 14, 0, 85.00, 'LAN-2024-M1', '2026-11-20', 'In Stock'),

-- HealthFirst Community Chemist (Pharmacy 3)
(19, 3, 1, 15, 0, 13.00, 'AMX-2024-H1', '2026-10-15', 'In Stock'),
(20, 3, 2, 90, 0, 4.50, 'PAN-2024-H4', '2027-01-20', 'In Stock'),
(21, 3, 4, 60, 0, 6.90, 'IBU-2024-H2', '2027-03-10', 'In Stock'),
(22, 3, 7, 40, 0, 8.90, 'ZYR-2024-H5', '2027-05-18', 'In Stock'),
(23, 3, 8, 3, 0, 17.00, 'OME-2023-H9', '2026-12-01', 'Low Stock'),
(24, 3, 10, 22, 0, 19.50, 'CIP-2024-H3', '2026-11-15', 'In Stock'),
(25, 3, 12, 18, 0, 16.75, 'LOS-2024-H1', '2027-02-14', 'In Stock'),
(26, 3, 14, 45, 0, 7.99, 'LOR-2024-H7', '2027-08-30', 'In Stock'),
(27, 3, 16, 25, 0, 9.20, 'HYD-2024-H2', '2026-12-31', 'In Stock');

-- 5. PRESCRIPTIONS
INSERT INTO `prescriptions` (`prescription_id`, `user_id`, `pharmacy_id`, `image_path`, `notes`, `status`, `pharmacist_notes`) VALUES
(1, 6, 1, '/uploads/prescriptions/sample_prescription_1.jpg', 'Prescribed by Dr. Robert Vance for acute bronchitis.', 'reviewed', 'Validated. Amoxicillin 500mg 3x daily for 7 days.'),
(2, 7, 2, '/uploads/prescriptions/sample_prescription_2.jpg', 'Asthma maintenance refill prescribed by Pulmonology Clinic.', 'fulfilled', 'Ventolin inhaler dispensed.');

-- 6. RESERVATIONS
INSERT INTO `reservations` (`reservation_id`, `reservation_code`, `user_id`, `inventory_id`, `prescription_id`, `quantity`, `unit_price`, `total_price`, `reservation_date`, `expiry_time`, `status`, `patient_notes`) VALUES
(1, 'RES-2024-9841', 6, 1, 1, 2, 12.50, 25.00, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 22 HOUR), 'Confirmed', 'Will pick up today around 4:00 PM.'),
(2, 'RES-2024-7123', 6, 7, NULL, 1, 32.00, 32.00, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 23 HOUR), 'Pending', 'Urgent need for Ventolin inhaler.'),
(3, 'RES-2024-4509', 7, 10, NULL, 1, 3.99, 3.99, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 4 HOUR), 'Collected', 'Picked up by family member.'),
(4, 'RES-2024-3312', 8, 3, NULL, 1, 24.00, 24.00, DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_ADD(NOW(), INTERVAL 21 HOUR), 'Confirmed', 'Need for travel kit.');

-- 7. NOTIFICATIONS
INSERT INTO `notifications` (`notification_id`, `user_id`, `title`, `message`, `type`, `is_read`, `link`) VALUES
(1, 6, 'Reservation Confirmed', 'Your reservation for Amoxicillin 500mg at CityCare Central Pharmacy has been CONFIRMED (Code: RES-2024-9841). Please collect within 24 hours.', 'reservation', FALSE, '/patient/reservations'),
(2, 6, 'Reservation Under Review', 'Your reservation request RES-2024-7123 for Salbutamol Inhaler has been received by CityCare Central Pharmacy.', 'reservation', FALSE, '/patient/reservations'),
(3, 2, 'New Reservation Request', 'Patient John Doe reserved 2x Amoxicillin 500mg. Action required.', 'reservation', TRUE, '/pharmacy/reservations'),
(4, 2, 'Low Stock Alert', 'Metformin 850mg is running low (5 units remaining). Please restock soon.', 'inventory', FALSE, '/pharmacy/inventory'),
(5, 1, 'New Pharmacy Registration', 'Apex Chemist & Surgical (User: robert@apexchemist.com) submitted registration for approval.', 'approval', FALSE, '/admin/pharmacies');

-- 8. COMPLAINTS
INSERT INTO `complaints` (`complaint_id`, `user_id`, `pharmacy_id`, `subject`, `description`, `status`, `admin_response`) VALUES
(1, 6, 1, 'Inaccurate Stock Information for Amlodipine', 'I arrived at the pharmacy yesterday after seeing 2 units listed online, but staff said it was out of stock. Please ensure inventory sync is prompt.', 'resolved', 'Thank you John. We contacted CityCare Central; their physical inventory audit is complete and the listing has been marked Out of Stock. We apologize for the inconvenience.'),
(2, 7, 2, 'Store Hours Clarification', 'Map showed 24 hours open, but front counter was closed for sanitation between 3 AM - 4 AM.', 'in_review', 'Currently reviewing operating schedule policy with MetroPharma.');

-- 9. AUDIT LOGS
INSERT INTO `audit_logs` (`log_id`, `user_id`, `action`, `description`, `ip_address`) VALUES
(1, 1, 'SYSTEM_INIT', 'System database initialized and seed data successfully loaded.', '127.0.0.1'),
(2, 2, 'STOCK_UPDATE', 'CityCare updated Amoxicillin quantity to 45.', '192.168.1.10'),
(3, 6, 'RESERVATION_CREATE', 'Patient John Doe created reservation RES-2024-9841.', '192.168.1.50'),
(4, 2, 'RESERVATION_CONFIRM', 'CityCare accepted reservation RES-2024-9841.', '192.168.1.10');
