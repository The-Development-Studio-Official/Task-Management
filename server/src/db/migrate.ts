import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

export async function runMigrations() {
  console.log('Running migrations...');
  const migrationPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1 // limit connections for migrations
  });
  
  const tempDb = drizzle(migrationPool);
  await migrate(tempDb, { migrationsFolder: './drizzle' });
  await migrationPool.end();
  console.log('Migrations completed successfully.');
}

runMigrations().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
