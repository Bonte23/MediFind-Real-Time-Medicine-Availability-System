/**
 * MediFind Database CLI Initializer & Seeder
 */
const { initializeDatabase } = require('../config/db');

async function run() {
  console.log('--- Initializing MediFind Database ---');
  try {
    await initializeDatabase();
    console.log('Database initialization complete!');
    process.exit(0);
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  }
}

run();
