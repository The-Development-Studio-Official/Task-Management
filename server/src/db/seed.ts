import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { buildPoolConfig } from './poolConfig.js';

dotenv.config();

async function seed() {
  const pool = new Pool(buildPoolConfig({ max: 1 }));

  const username = 'superadmin@123';
  const email = 'superadmin@123';
  const plainPassword = 'admin@123';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  try {
    console.log('Attempting to seed user...');

    await pool.query(`
      INSERT INTO users (username, email, password_hash, role) 
      VALUES ($1, $2, $3, $4) 
      ON CONFLICT (email) DO UPDATE 
      SET username = EXCLUDED.username, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
    `, [username, email, passwordHash, 'superadmin']);

    console.log('Seed completed successfully!');
  } catch (err: any) {
    console.error('Seed error:', err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
