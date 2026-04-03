import express from 'express';
import cors from 'cors';
import pino from 'pino';
import dotenv from 'dotenv';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import tasksRoutes from './routes/tasks.js';
import activityLogsRoutes from './routes/activityLogs.js';
import dashboardRoutes from './routes/dashboard.js';
import usersRoutes from './routes/users.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './db/schema.js';

dotenv.config();

const app = express();
const logger = pino();
const PORT = process.env.PORT || 5000;

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

// Initialize database and run migrations
async function initializeDatabase() {
  try {
    const migrationPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1
    });
    
    const tempDb = drizzle(migrationPool);
    logger.info('Running database migrations...');
    await migrate(tempDb, { migrationsFolder: './drizzle' });
    logger.info('Migrations completed successfully');
    await migrationPool.end();
  } catch (err: any) {
    // If schema already exists or type already exists, that's fine
    if (err?.message?.includes('already exists') || 
        err?.message?.includes('does not exist') ||
        err?.cause?.code === '42710' ||  // PostgreSQL duplicate type error
        err?.cause?.code === '42P07') {  // PostgreSQL duplicate object error
      logger.info('Database schema already configured, continuing startup');
    } else {
      logger.error({err},'Database initialization error:');
      // Still allow the server to start even if migrations fail
      // The database might be in a good state anyway
    }
  }
}

app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`API Server listening on port ${PORT}`);
});
