import express, { Request, Response } from 'express';
import { eq, and, or, desc } from 'drizzle-orm';
import { db } from '../db/db.js';
import { chatMessages, users } from '../db/schema.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all users (for sidebar)
router.get('/users', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      profilePicture: users.profilePicture,
    }).from(users);
    
    res.json(allUsers);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users', details: error?.message });
  }
});

// Get messages between current user and another user
router.get('/messages/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { userId } = req.params;
    const currentUserId = req.user.id;
    const otherUserId = parseInt(userId as string);

    if (isNaN(otherUserId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const messages = await db
      .select()
      .from(chatMessages)
      .where(
        or(
          and(
            eq(chatMessages.senderId, currentUserId),
            eq(chatMessages.channelOrReceiverId, otherUserId.toString())
          ),
          and(
            eq(chatMessages.senderId, otherUserId),
            eq(chatMessages.channelOrReceiverId, currentUserId.toString())
          )
        )
      )
      .orderBy(chatMessages.createdAt);

    res.json(messages);
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: error?.message });
  }
});

// Send a message
router.post('/send', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { recipientId, message } = req.body;

    if (!recipientId || !message) {
      res.status(400).json({ error: 'recipientId and message are required' });
      return;
    }

    if (typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Message must be a non-empty string' });
      return;
    }

    // Verify recipient exists
    const [recipient] = await db
      .select()
      .from(users)
      .where(eq(users.id, recipientId));

    if (!recipient) {
      res.status(404).json({ error: 'Recipient not found' });
      return;
    }

    // Insert message
    const [newMessage] = await db
      .insert(chatMessages)
      .values({
        senderId: req.user.id,
        channelOrReceiverId: recipientId.toString(),
        message: message.trim(),
      })
      .returning();

    res.json(newMessage);
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message', details: error?.message });
  }
});

// Get group chats (optional - for channel-based messaging)
router.get('/channels', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    // This could fetch distinct channels from chatMessages
    // For now, return empty array
    res.json([]);
  } catch (error: any) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ error: 'Failed to fetch channels', details: error?.message });
  }
});

export default router;
