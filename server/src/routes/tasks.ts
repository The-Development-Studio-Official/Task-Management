import express, { Request, Response } from 'express';
import { eq, desc, inArray } from 'drizzle-orm';
import { db } from '../db/db.js';
import { tasks, users } from '../db/schema.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const parseOptionalUserId = (value: unknown): number | null | 'invalid' => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 'invalid';
};

const parseOptionalDeadline = (value: unknown): Date | null | 'invalid' => {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? 'invalid' : value;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? 'invalid' : parsed;
};

// Get all tasks
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Fetch all tasks
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

    if (allTasks.length === 0) {
      res.json([]);
      return;
    }

    // Get all unique user IDs (filter out null values)
    const userIds = new Set([
      ...allTasks.map(t => t.createdById).filter(id => id !== null && id !== undefined),
      ...allTasks.map(t => t.assignedToId).filter(id => id !== null && id !== undefined)
    ]);

    // Batch fetch all users
    const userMap = new Map();
    if (userIds.size > 0) {
      const userIdArray = Array.from(userIds) as number[];
      const allUsers = await db
        .select({
          id: users.id,
          username: users.username,
          role: users.role,
        })
        .from(users)
        .where(inArray(users.id, userIdArray));

      allUsers.forEach(user => {
        userMap.set(user.id, user);
      });
    }

    // Map tasks with user data
    const enrichedTasks = allTasks.map(task => {
      const createdUser = userMap.get(task.createdById);
      const assignedUser = task.assignedToId ? userMap.get(task.assignedToId) : null;

      return {
        ...task,
        assignedTo: assignedUser ? { id: assignedUser.id, username: assignedUser.username } : null,
        createdBy: { 
          id: task.createdById, 
          username: createdUser?.username || 'Unknown', 
          role: createdUser?.role
        }
      };
    });

    res.json(enrichedTasks);
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tasks', 
      details: error?.message,
      cause: error?.cause?.message
    });
  }
});

// Get task by ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const taskId = parseInt(req.params.id as string);
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
    const parsedAssignedToId = parseOptionalUserId(assignedToId);
    const parsedDeadline = parseOptionalDeadline(deadline);

    if (!name || !priority || !status) {
      res.status(400).json({ error: 'name, priority, and status are required' });
      return;
    }

    if (parsedAssignedToId === 'invalid') {
      res.status(400).json({ error: 'assignedToId must be a valid user id' });
      return;
    }

    if (parsedDeadline === 'invalid') {
      res.status(400).json({ error: 'deadline must be a valid date' });
      return;
    }

    // Verify assignee exists if provided
    if (parsedAssignedToId) {
      const [assignee] = await db.select({ id: users.id }).from(users).where(eq(users.id, parsedAssignedToId));
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
        assignedToId: parsedAssignedToId,
        createdById: req.user.id,
        deadline: parsedDeadline,
      })
      .returning({
        id: tasks.id,
        name: tasks.name,
        description: tasks.description,
        priority: tasks.priority,
        status: tasks.status,
        deadline: tasks.deadline,
        assignedToId: tasks.assignedToId,
        createdById: tasks.createdById,
      });

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

    const taskId = parseInt(req.params.id as string);
    if (isNaN(taskId)) {
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }

    const { name, description, priority, status, assignedToId, deadline } = req.body;
    const parsedAssignedToId = parseOptionalUserId(assignedToId);
    const parsedDeadline = parseOptionalDeadline(deadline);

    if (parsedAssignedToId === 'invalid') {
      res.status(400).json({ error: 'assignedToId must be a valid user id' });
      return;
    }

    if (parsedDeadline === 'invalid') {
      res.status(400).json({ error: 'deadline must be a valid date' });
      return;
    }

    // Verify task exists
    const [existingTask] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!existingTask) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Verify assignee exists if provided
    if (parsedAssignedToId) {
      const [assignee] = await db.select({ id: users.id }).from(users).where(eq(users.id, parsedAssignedToId));
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
        assignedToId: assignedToId !== undefined ? parsedAssignedToId : existingTask.assignedToId,
        deadline: deadline !== undefined ? parsedDeadline : existingTask.deadline,
      })
      .where(eq(tasks.id, taskId))
      .returning({
        id: tasks.id,
        name: tasks.name,
        description: tasks.description,
        priority: tasks.priority,
        status: tasks.status,
        deadline: tasks.deadline,
        assignedToId: tasks.assignedToId,
        createdById: tasks.createdById,
      });

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

    const taskId = parseInt(req.params.id as string);
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
