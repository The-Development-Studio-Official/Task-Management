import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const username = 'superadmin@123';
  const email = 'superadmin@123';
  const plainPassword = 'admin@123';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  try {
    console.log('Attempting to seed user...');
    
    // Use raw SQL with pool directly
    await pool.query(`
      INSERT INTO users (username, email, password_hash, role) 
      VALUES ($1, $2, $3, $4) 
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = $3, role = $4
    `, [username, email, passwordHash, 'superadmin']);
    
    console.log('Seed completed successfully!');
    await pool.end();
  } catch (err: any) {
    console.error('Seed error:', err.message);
    await pool.end();
    throw err;
  }
  
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
