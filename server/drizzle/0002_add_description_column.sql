-- Add description column to tasks if it doesn't exist
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "description" text;
