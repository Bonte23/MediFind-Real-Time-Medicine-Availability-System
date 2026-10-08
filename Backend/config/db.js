/**
 * Database Connection Manager for MediFind
 * Supports MySQL with fallback to SQLite for zero-config local reliability.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

let pool = null;
let sqliteDb = null;
let dbType = 'mysql';

/**
 * Initialize Database Connection
 */
async function initializeDatabase() {
  const mysql = require('mysql2/promise');

  try {
    // Attempt connecting to MySQL Server
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });

    const dbName = process.env.DB_NAME || 'medifind_db';
    try {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    } catch (createErr) {
      // Ignore privilege errors since Render's MySQL image creates the DB automatically.
      if (createErr.code === 'ER_DBACCESS_DENIED_ERROR' || createErr.code === 'ER_ACCESS_DENIED_ERROR') {
        console.warn(`[DATABASE] Skipping CREATE DATABASE: User lacks privileges, assuming database already exists.`);
      } else {
        throw createErr;
      }
    }
    await connection.end();

    // Create Pool
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
      multipleStatements: true,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });

    // Test connection
    const testConn = await pool.getConnection();
    await testConn.ping();
    testConn.release();
    dbType = 'mysql';
    console.log(`[DATABASE] Connected successfully to MySQL database "${dbName}".`);
  } catch (err) {
    // In production, a MySQL failure is fatal — SQLite on an ephemeral filesystem
    // would silently wipe all data on every redeploy. Fail loud and fast instead.
    if (process.env.NODE_ENV === 'production') {
      console.error('[DATABASE] FATAL: MySQL connection failed in production environment.');
      console.error(`[DATABASE] Error: ${err.message}`);
      console.error('[DATABASE] Refusing SQLite fallback in production. Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME environment variables on Render.');
      process.exit(1);
    }

    // Local development / test — fall back to embedded SQLite for zero-config convenience
    console.warn(`[DATABASE] MySQL server connection not available (${err.message}). Using local embedded SQL engine.`);

    const Database = require('better-sqlite3');
    const dbPath = path.join(__dirname, '..', 'database', 'medifind.sqlite');
    sqliteDb = new Database(dbPath);
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.pragma('foreign_keys = ON');
    dbType = 'sqlite';
    console.log(`[DATABASE] Connected to local database file at "${dbPath}".`);
  }

  // Ensure tables and seed data are initialized
  await bootstrapDatabase();
}

function adaptSqlForSqlite(sql) {
  return sql
    .replace(/DATE_ADD\s*\(\s*(?:NOW\(\)|CURRENT_TIMESTAMP)\s*,\s*INTERVAL\s*(\d+)\s*(HOUR|DAY|MINUTE)\s*\)/gi, (m, val, unit) => `datetime('now', 'localtime', '+${val} ${unit.toLowerCase()}s')`)
    .replace(/DATE_SUB\s*\(\s*(?:NOW\(\)|CURRENT_TIMESTAMP)\s*,\s*INTERVAL\s*(\d+)\s*(HOUR|DAY|MINUTE)\s*\)/gi, (m, val, unit) => `datetime('now', 'localtime', '-${val} ${unit.toLowerCase()}s')`)
    .replace(/NOW\(\)/gi, "datetime('now', 'localtime')");
}

const stmtCache = new Map();

function getPreparedStatement(adaptedSql) {
  let stmt = stmtCache.get(adaptedSql);
  if (!stmt) {
    stmt = sqliteDb.prepare(adaptedSql);
    stmtCache.set(adaptedSql, stmt);
  }
  return stmt;
}

/**
 * Executes a SELECT / READ query returning an array of row objects
 */
async function query(sql, params = []) {
  if (dbType === 'mysql' && pool) {
    const [rows] = await pool.query(sql, params);
    return rows;
  } else if (sqliteDb) {
    const adaptedSql = adaptSqlForSqlite(sql);
    const stmt = getPreparedStatement(adaptedSql);
    return stmt.all(params);
  }
  throw new Error('Database is not initialized.');
}

/**
 * Executes a SELECT query returning a single row or null
 */
async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows && rows.length > 0 ? rows[0] : null;
}

/**
 * Executes an INSERT, UPDATE, or DELETE query
 * Returns { insertId, affectedRows, changes }
 */
async function execute(sql, params = []) {
  if (dbType === 'mysql' && pool) {
    const [result] = await pool.query(sql, params);
    return {
      insertId: result.insertId,
      affectedRows: result.affectedRows
    };
  } else if (sqliteDb) {
    const adaptedSql = adaptSqlForSqlite(sql);
    const stmt = getPreparedStatement(adaptedSql);
    const info = stmt.run(params);
    return {
      insertId: info.lastInsertRowid,
      affectedRows: info.changes
    };
  }
  throw new Error('Database is not initialized.');
}

/**
 * Bootstrap tables and initial system configuration
 */
async function bootstrapDatabase() {
  const bcrypt = require('bcryptjs');
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@medifind.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecurePassword2026!';
  const adminName = process.env.ADMIN_NAME || 'System Administrator';
  const adminPhone = process.env.ADMIN_PHONE || '+1-800-555-0100';

  if (dbType === 'mysql' && pool) {
    try {
      const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schemaSql);
      }

      // Check if admin user exists; if not, initialize
      const [admins] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
      if (admins[0].count === 0) {
        const adminHash = bcrypt.hashSync(adminPassword, 10);
        await pool.query(
          "INSERT INTO users (full_name, email, phone, password, role, status) VALUES (?, ?, ?, ?, 'admin', 'active')",
          [adminName, adminEmail, adminPhone, adminHash]
        );
        console.log(`[DATABASE] Administrator initialized successfully (${adminEmail}).`);
      }

      // Initialize master medicines catalog if empty
      const [medCount] = await pool.query('SELECT COUNT(*) as count FROM medicines');
      if (medCount[0].count === 0) {
        const masterMeds = getMasterMedicines();
        for (const med of masterMeds) {
          await pool.query(
            `INSERT INTO medicines (medicine_name, generic_name, category, manufacturer, description, dosage_form, strength, requires_prescription, side_effects)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            med
          );
        }
        console.log('[DATABASE] Master medicines reference catalog initialized.');
      }
    } catch (e) {
      console.error('[DATABASE] Error during MySQL bootstrap:', e.message);
      if (process.env.NODE_ENV === 'production') {
        console.error('[DATABASE] FATAL: Schema or bootstrap failed. Halting application startup.');
        process.exit(1);
      }
    }
  } else if (dbType === 'sqlite' && sqliteDb) {
    try {
      sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS users (
          user_id INTEGER PRIMARY KEY AUTOINCREMENT,
          full_name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'patient',
          status TEXT NOT NULL DEFAULT 'active',
          address TEXT,
          latitude REAL,
          longitude REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS pharmacies (
          pharmacy_id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          pharmacy_name TEXT NOT NULL,
          license_number TEXT NOT NULL UNIQUE,
          address TEXT NOT NULL,
          city TEXT NOT NULL DEFAULT 'New York',
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          phone TEXT NOT NULL,
          email TEXT NOT NULL,
          opening_hours TEXT DEFAULT '08:00 AM - 10:00 PM',
          is_24_hours INTEGER DEFAULT 0,
          approval_status TEXT NOT NULL DEFAULT 'pending',
          rejection_reason TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS medicines (
          medicine_id INTEGER PRIMARY KEY AUTOINCREMENT,
          medicine_name TEXT NOT NULL,
          generic_name TEXT,
          category TEXT NOT NULL,
          manufacturer TEXT NOT NULL,
          description TEXT,
          dosage_form TEXT NOT NULL DEFAULT 'Tablet',
          strength TEXT,
          requires_prescription INTEGER NOT NULL DEFAULT 0,
          side_effects TEXT,
          image_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS inventory (
          inventory_id INTEGER PRIMARY KEY AUTOINCREMENT,
          pharmacy_id INTEGER NOT NULL,
          medicine_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 0,
          reserved_quantity INTEGER NOT NULL DEFAULT 0,
          price REAL NOT NULL,
          batch_number TEXT,
          expiry_date TEXT NOT NULL,
          availability_status TEXT NOT NULL DEFAULT 'In Stock',
          last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(pharmacy_id) ON DELETE CASCADE,
          FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE,
          UNIQUE(pharmacy_id, medicine_id)
        );

        CREATE TABLE IF NOT EXISTS prescriptions (
          prescription_id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          pharmacy_id INTEGER,
          image_path TEXT NOT NULL,
          notes TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          pharmacist_notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(pharmacy_id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS reservations (
          reservation_id INTEGER PRIMARY KEY AUTOINCREMENT,
          reservation_code TEXT NOT NULL UNIQUE,
          user_id INTEGER NOT NULL,
          inventory_id INTEGER NOT NULL,
          prescription_id INTEGER,
          quantity INTEGER NOT NULL DEFAULT 1,
          unit_price REAL NOT NULL,
          total_price REAL NOT NULL,
          reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          expiry_time DATETIME NOT NULL,
          status TEXT NOT NULL DEFAULT 'Pending',
          rejection_reason TEXT,
          patient_notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id) ON DELETE CASCADE,
          FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS notifications (
          notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'system',
          is_read INTEGER NOT NULL DEFAULT 0,
          link TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS complaints (
          complaint_id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          pharmacy_id INTEGER,
          subject TEXT NOT NULL,
          description TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          admin_response TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(pharmacy_id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
          log_id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          action TEXT NOT NULL,
          description TEXT NOT NULL,
          ip_address TEXT DEFAULT '127.0.0.1',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
        );
      `);

      // Initialize administrator account if not present
      const adminCount = sqliteDb.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get();
      if (adminCount.count === 0) {
        const adminHash = bcrypt.hashSync(adminPassword, 10);
        const insertAdmin = sqliteDb.prepare(`
          INSERT INTO users (full_name, email, phone, password, role, status)
          VALUES (?, ?, ?, ?, 'admin', 'active')
        `);
        insertAdmin.run(adminName, adminEmail, adminPhone, adminHash);
        console.log(`[DATABASE] Administrator initialized successfully (${adminEmail}).`);
      }

      // Initialize master medicines reference catalog if empty
      const medCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM medicines').get();
      if (medCount.count === 0) {
        const insertMed = sqliteDb.prepare(`
          INSERT INTO medicines (medicine_name, generic_name, category, manufacturer, description, dosage_form, strength, requires_prescription, side_effects)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const masterMeds = getMasterMedicines();
        for (const med of masterMeds) {
          insertMed.run(...med);
        }
        console.log('[DATABASE] Master medicines reference catalog initialized.');
      }
    } catch (e) {
      console.error('[DATABASE] Error during SQLite bootstrap:', e.message);
    }
  }
}

function getMasterMedicines() {
  return [
    ['Amoxicillin 500mg', 'Amoxicillin Trihydrate', 'Antibiotics', 'GlaxoSmithKline (GSK)', 'Broad-spectrum penicillin antibiotic used to treat bacterial infections.', 'Capsule', '500mg', 1, 'Nausea, diarrhea, mild rash'],
    ['Paracetamol (Panadol) 500mg', 'Acetaminophen', 'Analgesics & Antipyretics', 'Haleon', 'Relief for mild to moderate pain and fever reduction.', 'Tablet', '500mg', 0, 'Rare allergic reaction, liver strain with excessive dosage'],
    ['Azithromycin (Zithromax) 250mg', 'Azithromycin', 'Antibiotics', 'Pfizer Inc.', 'Macrolide antibiotic for respiratory tract and soft tissue infections.', 'Tablet', '250mg', 1, 'Abdominal pain, mild diarrhea, headache'],
    ['Ibuprofen (Advil) 400mg', 'Ibuprofen', 'Analgesics & NSAIDs', 'Pfizer Inc.', 'Nonsteroidal anti-inflammatory drug for pain and swelling.', 'Tablet', '400mg', 0, 'Upset stomach, heartburn, dizziness'],
    ['Metformin 850mg', 'Metformin Hydrochloride', 'Antidiabetic', 'Merck & Co.', 'First-line medication for type 2 diabetes mellitus.', 'Tablet', '850mg', 1, 'Gastrointestinal upset, metallic taste, nausea'],
    ['Amlodipine 10mg', 'Amlodipine Besylate', 'Cardiovascular & Hypertensive', 'Novartis', 'Calcium channel blocker prescribed for hypertension and angina.', 'Tablet', '10mg', 1, 'Swelling in ankles/feet, dizziness, fatigue'],
    ['Cetirizine (Zyrtec) 10mg', 'Cetirizine Hydrochloride', 'Antihistamines & Allergy', 'Johnson & Johnson', 'Antihistamine used to relieve seasonal allergy symptoms.', 'Tablet', '10mg', 0, 'Drowsiness, dry mouth, headache'],
    ['Omeprazole (Prilosec) 20mg', 'Omeprazole', 'Gastrointestinal & Antacids', 'AstraZeneca', 'Proton pump inhibitor (PPI) for acid reflux and stomach ulcers.', 'Capsule', '20mg', 0, 'Headache, abdominal cramps, nausea'],
    ['Salbutamol (Ventolin) Inhaler', 'Albuterol Sulfate', 'Respiratory & Asthma', 'GlaxoSmithKline (GSK)', 'Fast-acting bronchodilator for asthma and COPD relief.', 'Inhaler', '100mcg/dose', 1, 'Tremor, palpitation, slight nervousness'],
    ['Ciprofloxacin 500mg', 'Ciprofloxacin HCl', 'Antibiotics', 'Bayer Pharma', 'Fluoroquinolone antibiotic for urinary tract and gastrointestinal infections.', 'Tablet', '500mg', 1, 'Nausea, dizziness, tendon pain'],
    ['Atorvastatin (Lipitor) 20mg', 'Atorvastatin Calcium', 'Cardiovascular & Cholesterol', 'Pfizer Inc.', 'Statin used to lower LDL cholesterol and reduce cardiovascular risk.', 'Tablet', '20mg', 1, 'Muscle ache, joint stiffness, digestive discomfort'],
    ['Losartan Potassium 50mg', 'Losartan', 'Cardiovascular & Hypertensive', 'Sanofi', 'Angiotensin II receptor antagonist for high blood pressure.', 'Tablet', '50mg', 1, 'Dizziness, low blood pressure, sinus congestion'],
    ['Augmentin 625mg', 'Amoxicillin + Clavulanic Acid', 'Antibiotics', 'GlaxoSmithKline (GSK)', 'Potentiated penicillin antibiotic for bacterial infections.', 'Tablet', '625mg', 1, 'Diarrhea, vomiting, mild skin rash'],
    ['Loratadine (Claritin) 10mg', 'Loratadine', 'Antihistamines & Allergy', 'Bayer Health', 'Non-drowsy 24-hour antihistamine for allergic rhinitis and hives.', 'Tablet', '10mg', 0, 'Headache, fatigue, dry mouth'],
    ['Insulin Glargine (Lantus)', 'Insulin Glargine', 'Antidiabetic', 'Sanofi', 'Long-acting synthetic human insulin analog for glycemic control.', 'Injection', '100 units/ml (3ml pen)', 1, 'Hypoglycemia, injection site redness'],
    ['Hydrocortisone Cream 1%', 'Hydrocortisone', 'Dermatological', 'Perrigo', 'Mild corticosteroid topical cream for rashes and eczema relief.', 'Cream', '30g tube', 0, 'Mild skin thinning with prolonged misuse']
  ];
}

module.exports = {
  initializeDatabase,
  query,
  queryOne,
  execute,
  getDbType: () => dbType,
  closeDatabase: () => {
    try {
      stmtCache.clear();
      if (sqliteDb && sqliteDb.open) {
        sqliteDb.close();
        sqliteDb = null;
        console.log('[DATABASE] SQLite connection closed cleanly.');
      }
    } catch (_) { /* ignore */ }
  }
};
