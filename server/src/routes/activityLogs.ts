import express, { Request, Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/db.js';
import { activityLogs, users } from '../db/schema.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all activity logs
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const logs = await db
      .select({
        id: activityLogs.id,
        userId: activityLogs.userId,
        action: activityLogs.action,
        metadata: activityLogs.metadata,
        createdAt: activityLogs.createdAt,
      })
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(100);

    // Enrich with user data
    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        const [user] = await db.select().from(users).where(eq(users.id, log.userId));
        return {
          ...log,
          user: user ? { id: user.id, username: user.username, role: user.role } : null
        };
      })
    );

    res.json(enrichedLogs);
  } catch (error: any) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs', details: error?.message });
  }
});

// Create activity log
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { action, metadata } = req.body;

    if (!action) {
      res.status(400).json({ error: 'action is required' });
      return;
    }

    const [newLog] = await db
      .insert(activityLogs)
      .values({
        userId: req.user.id,
        action,
        metadata: metadata || null,
      })
      .returning();

    res.status(201).json(newLog);
  } catch (error: any) {
    console.error('Error creating activity log:', error);
    res.status(500).json({ error: 'Failed to create activity log', details: error?.message });
  }
});

export default router;
