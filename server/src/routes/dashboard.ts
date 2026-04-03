import express, { Request, Response } from 'express';
import { eq, count } from 'drizzle-orm';
import { db } from '../db/db.js';
import { tasks, users } from '../db/schema.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard stats
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get all tasks
    const allTasks = await db.select({
      id: tasks.id,
      name: tasks.name,
      priority: tasks.priority,
      status: tasks.status,
      deadline: tasks.deadline,
      assignedToId: tasks.assignedToId,
      createdById: tasks.createdById
    }).from(tasks);
    const totalTasks = allTasks.length;

    // Count by status
    const completedTasks = allTasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = allTasks.filter(t => t.status === 'in progress').length;
    
    // Count overdue tasks
    const now = new Date();
    const overdueTasks = allTasks.filter(t => {
      if (!t.deadline || t.status === 'completed') return false;
      return new Date(t.deadline) < now;
    }).length;

    // Get user count
    const [{ value: totalUsers }] = await db
      .select({ value: count() })
      .from(users);

    // Get current user's tasks
    const [{ value: myTasksCount }] = await db
      .select({ value: count() })
      .from(tasks)
      .where(eq(tasks.createdById, req.user.id));

    // Get tasks assigned to current user
    const [{ value: assignedToMeCount }] = await db
      .select({ value: count() })
      .from(tasks)
      .where(eq(tasks.assignedToId, req.user.id));

    res.json({
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      totalUsers,
      myTasks: myTasksCount,
      assignedToMe: assignedToMeCount,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats', details: error?.message });
  }
});

// Get recent tasks
router.get('/recent-tasks', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const recentTasks = await db
      .select({
        id: tasks.id,
        name: tasks.name,
        priority: tasks.priority,
        status: tasks.status,
        deadline: tasks.deadline,
        assignedToId: tasks.assignedToId,
        createdById: tasks.createdById
      })
      .from(tasks)
      .limit(10);

    // Enrich with user data
    const enrichedTasks = await Promise.all(
      recentTasks.map(async (task) => {
        const assignedUser = task.assignedToId
          ? (await db.select({ id: users.id, username: users.username }).from(users).where(eq(users.id, task.assignedToId)))[0]
          : null;

        return {
          ...task,
          assignedTo: assignedUser ? { id: assignedUser.id, username: assignedUser.username } : null
        };
      })
    );

    res.json(enrichedTasks);
  } catch (error: any) {
    console.error('Error fetching recent tasks:', error);
    res.status(500).json({ error: 'Failed to fetch recent tasks', details: error?.message });
  }
});

export default router;
