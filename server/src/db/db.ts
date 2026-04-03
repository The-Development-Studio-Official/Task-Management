import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';
import * as dotenv from 'dotenv';
import { buildPoolConfig } from './poolConfig.js';

dotenv.config();

const pool = new Pool(buildPoolConfig());

pool.on('error', (err) => {
  console.error('Unexpected Postgres pool error:', err);
});

export const db = drizzle(pool, { schema });
export { pool };
