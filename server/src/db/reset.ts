import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { buildPoolConfig } from './poolConfig.js';
dotenv.config();

async function resetSchema() {
  console.log('Resetting public schema completely...');
  const pool = new Pool(buildPoolConfig({ max: 1 }));
  
  try {
    await pool.query('DROP SCHEMA public CASCADE;');
    await pool.query('CREATE SCHEMA public;');
    await pool.query('GRANT ALL ON SCHEMA public TO CURRENT_USER;');
    await pool.query('GRANT ALL ON SCHEMA public TO public;');
    console.log('Wiped out all existing tables perfectly.');
  } catch (err) {
    console.error('Error dropping schema:', err);
  } finally {
    await pool.end();
  }
}

resetSchema();
