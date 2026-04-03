import express from 'express';
import cors from 'cors';
import pino from 'pino';
import dotenv from 'dotenv';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import tasksRoutes from './routes/tasks.js';
import activityLogsRoutes from './routes/activityLogs.js';
import dashboardRoutes from './routes/dashboard.js';
import usersRoutes from './routes/users.js';
import { buildPoolConfig } from './db/poolConfig.js';

dotenv.config();

const app = express();
const logger = pino();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsFolder = path.resolve(__dirname, '../drizzle');

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Incoming request');
  next();
});

app.use('/api/tasks', tasksRoutes);
app.use('/api/activity-logs', activityLogsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((err: any, req: any, res: any, next: any) => {
  logger.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

async function ensureEssentialSchema(pool: Pool) {
  await pool.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "team_name" varchar(255);');
  await pool.query('ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "description" text;');
}

// Initialize database and run migrations
async function initializeDatabase() {
  const migrationPool = new Pool(buildPoolConfig({ max: 1 }));

  try {
    const tempDb = drizzle(migrationPool);
    logger.info({ migrationsFolder }, 'Running database migrations...');
    await migrate(tempDb, { migrationsFolder });
    logger.info('Migrations completed successfully');
  } catch (err: any) {
    if (
      err?.message?.includes('already exists') ||
      err?.message?.includes('does not exist') ||
      err?.cause?.code === '42710' ||
      err?.cause?.code === '42P07'
    ) {
      logger.info('Database schema already configured, continuing startup');
    } else {
      logger.error({ err }, 'Database migration error');
    }
  }

  try {
    await ensureEssentialSchema(migrationPool);
    logger.info('Essential schema checks completed');
  } catch (err: any) {
    logger.error({ err }, 'Failed to ensure essential schema columns');
  } finally {
    await migrationPool.end();
  }
}

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      logger.info(`API Server listening on port ${PORT}`);
    });
  } catch (err: any) {
    logger.error({ err }, 'Fatal startup error');
    process.exit(1);
  }
}

startServer();
