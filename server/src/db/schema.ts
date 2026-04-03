import { pgTable, serial, text, varchar, timestamp, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const roleEnum = pgEnum('role', ['superadmin', 'admin', 'user']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').default('user').notNull(),
  teamName: varchar('team_name', { length: 255 }),
  reportingManagerId: integer('reporting_manager_id'),
  profilePicture: text('profile_picture'),
});

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  priority: varchar('priority', { length: 50 }).notNull().default('medium'),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  assignedToId: integer('assigned_to_id').references(() => users.id),
  createdById: integer('created_by_id').references(() => users.id).notNull(),
  deadline: timestamp('deadline'),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  action: text('action').notNull(),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').references(() => users.id).notNull(),
  channelOrReceiverId: varchar('channel_or_receiver_id', { length: 255 }).notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  reportingManager: one(users, {
    fields: [users.reportingManagerId],
    references: [users.id],
    relationName: 'reporting_manager'
  }),
  tasksAssigned: many(tasks, { relationName: 'assigned_tasks' }),
  tasksCreated: many(tasks, { relationName: 'created_tasks' }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
    relationName: 'assigned_tasks'
  }),
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
    relationName: 'created_tasks'
  }),
}));
