import express, { Request, Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/db.js';
import { tasks, users } from '../db/schema.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all tasks
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const allTasks = await db
      .select({
        id: tasks.id,
        name: tasks.name,
        description: tasks.description,
        priority: tasks.priority,
        status: tasks.status,
        deadline: tasks.deadline,
        assignedToId: tasks.assignedToId,
        createdById: tasks.createdById,
      })
      .from(tasks)
      .orderBy(desc(tasks.id));

    // Enrich with user data
    const enrichedTasks = await Promise.all(
      allTasks.map(async (task) => {
        const assignedUser = task.assignedToId 
          ? (await db.select().from(users).where(eq(users.id, task.assignedToId)))[0]
          : null;
        const createdUser = (await db.select().from(users).where(eq(users.id, task.createdById)))[0];
        
        return {
          ...task,
          assignedTo: assignedUser ? { id: assignedUser.id, username: assignedUser.username } : null,
          createdBy: { id: createdUser.id, username: createdUser.username }
        };
      })
    );

    res.json(enrichedTasks);
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks', details: error?.message });
  }
});

// Get task by ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }

    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json(task);
  } catch (error: any) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task', details: error?.message });
  }
});

// Create task
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, description, priority, status, assignedToId, deadline } = req.body;

    if (!name || !priority || !status) {
      res.status(400).json({ error: 'name, priority, and status are required' });
      return;
    }

    // Verify assignee exists if provided
    if (assignedToId) {
      const [assignee] = await db.select().from(users).where(eq(users.id, assignedToId));
      if (!assignee) {
        res.status(404).json({ error: 'Assigned user not found' });
        return;
      }
    }

    const [newTask] = await db
      .insert(tasks)
      .values({
        name,
        description: description || null,
        priority,
        status,
        assignedToId: assignedToId || null,
        createdById: req.user.id,
        deadline: deadline ? new Date(deadline) : null,
      })
      .returning();

    res.status(201).json(newTask);
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task', details: error?.message });
  }
});

// Update task
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }

    const { name, description, priority, status, assignedToId, deadline } = req.body;

    // Verify task exists
    const [existingTask] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!existingTask) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Verify assignee exists if provided
    if (assignedToId) {
      const [assignee] = await db.select().from(users).where(eq(users.id, assignedToId));
      if (!assignee) {
        res.status(404).json({ error: 'Assigned user not found' });
        return;
      }
    }

    const [updatedTask] = await db
      .update(tasks)
      .set({
        name: name || existingTask.name,
        description: description !== undefined ? description : existingTask.description,
        priority: priority || existingTask.priority,
        status: status || existingTask.status,
        assignedToId: assignedToId !== undefined ? assignedToId : existingTask.assignedToId,
        deadline: deadline ? new Date(deadline) : existingTask.deadline,
      })
      .where(eq(tasks.id, taskId))
      .returning();

    res.json(updatedTask);
  } catch (error: any) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task', details: error?.message });
  }
});

// Delete task
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }

    // Verify task exists
    const [existingTask] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!existingTask) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    await db.delete(tasks).where(eq(tasks.id, taskId));
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task', details: error?.message });
  }
});

export default router;
