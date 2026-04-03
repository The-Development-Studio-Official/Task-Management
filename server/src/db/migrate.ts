import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPoolConfig } from './poolConfig.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsFolder = path.resolve(__dirname, '../../drizzle');

export async function runMigrations() {
  console.log('Running migrations...');
  const migrationPool = new Pool(buildPoolConfig({ max: 1 }));

  try {
    const tempDb = drizzle(migrationPool);
    await migrate(tempDb, { migrationsFolder });
    console.log('Migrations completed successfully.');
  } finally {
    await migrationPool.end();
  }
}

runMigrations().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
