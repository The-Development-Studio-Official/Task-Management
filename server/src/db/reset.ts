import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function resetSchema() {
  console.log('Resetting public schema completely...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
    max: 1
  });
  
  try {
    // This totally wipes everything and gives us a clean slate
    await pool.query('DROP SCHEMA public CASCADE;');
    await pool.query('CREATE SCHEMA public;');
    await pool.query('GRANT ALL ON SCHEMA public TO task360_pb5h_user;');
    await pool.query('GRANT ALL ON SCHEMA public TO public;');
    console.log('Wiped out all existing tables perfectly.');
  } catch (err) {
    console.error('Error dropping schema:', err);
  } finally {
    await pool.end();
  }
}

resetSchema();
