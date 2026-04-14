require('dotenv').config();
const pool = require('../src/config/database');

async function migrate() {
  try {
    console.log('Adding rejection_reason column to tickets table...');
    await pool.query('ALTER TABLE tickets ADD COLUMN rejection_reason TEXT NULL AFTER status;');
    console.log('Migration successful!');
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMNNAME') {
      console.log('Column rejection_reason already exists.');
    } else {
      console.error('Migration failed:', err);
    }
    process.exit(1);
  }
}

migrate();
