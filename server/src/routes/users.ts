import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../db/db.js';
import { users } from '../db/schema.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();
const SALT_ROUNDS = 10;

// Get all users (accessible to authenticated users)
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      profilePicture: users.profilePicture,
    }).from(users);
    
    res.json(allUsers);
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users', details: error?.message });
  }
});

// Get single user by ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [user] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      profilePicture: users.profilePicture,
    }).from(users).where(eq(users.id, parseInt(id)));
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json(user);
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user', details: error?.message });
  }
});

// Create new user (ONLY SUPERADMIN)
router.post('/', authenticate, requireRole('superadmin'), async (req: Request, res: Response) => {
  try {
    const { username, email, password, role = 'user', teamName } = req.body;

    // Validation
    if (!username || !email || !password) {
      res.status(400).json({ error: 'Username, email, and password are required' });
      return;
    }

    // Validate role
    const validRoles = ['superadmin', 'admin', 'user'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ error: 'Invalid role. Must be superadmin, admin, or user' });
      return;
    }

    // Check if user already exists
    const [existingUser] = await db.select().from(users).where(eq(users.username, username));
    if (existingUser) {
      res.status(409).json({ error: 'Username already exists' });
      return;
    }

    const [existingEmail] = await db.select().from(users).where(eq(users.email, email));
    if (existingEmail) {
      res.status(409).json({ error: 'Email already exists' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const [newUser] = await db.insert(users).values({
      username,
      email,
      passwordHash,
      role: role as any,
      teamName: teamName || null,
    }).returning();

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      message: 'User created successfully'
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user', details: error?.message });
  }
});

// Update user (ONLY SUPERADMIN can update roles and any user info)
router.put('/:id', authenticate, requireRole('superadmin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, role, profilePicture, teamName } = req.body;

    // Check if user exists
    const [existingUser] = await db.select().from(users).where(eq(users.id, parseInt(id)));
    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Validate role if provided
    if (role) {
      const validRoles = ['superadmin', 'admin', 'user'];
      if (!validRoles.includes(role)) {
        res.status(400).json({ error: 'Invalid role. Must be superadmin, admin, or user' });
        return;
      }
    }

    // Check for duplicate username (if trying to change it)
    if (username && username !== existingUser.username) {
      const [duplicateUser] = await db.select().from(users).where(eq(users.username, username));
      if (duplicateUser) {
        res.status(409).json({ error: 'Username already exists' });
        return;
      }
    }

    // Check for duplicate email (if trying to change it)
    if (email && email !== existingUser.email) {
      const [duplicateEmail] = await db.select().from(users).where(eq(users.email, email));
      if (duplicateEmail) {
        res.status(409).json({ error: 'Email already exists' });
        return;
      }
    }

    // Update user
    const updateData: any = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (profilePicture) updateData.profilePicture = profilePicture;
    if (teamName !== undefined) updateData.teamName = teamName;

    const [updatedUser] = await db.update(users).set(updateData).where(eq(users.id, parseInt(id))).returning();

    res.json({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture,
      message: 'User updated successfully'
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user', details: error?.message });
  }
});

// Delete user (ONLY SUPERADMIN)
router.delete('/:id', authenticate, requireRole('superadmin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (req.user?.id === parseInt(id)) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    const [user] = await db.select().from(users).where(eq(users.id, parseInt(id)));
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await db.delete(users).where(eq(users.id, parseInt(id)));

    res.json({ message: 'User deleted successfully', deletedUserId: id });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user', details: error?.message });
  }
});

export default router;
