-- Add missing team_name column to users table
-- Note: team_name is nullable; consider normalizing with a teams table in future migrations
ALTER TABLE "users" ADD COLUMN "team_name" varchar(255);

-- Add missing description column to tasks table
-- Note: description is nullable to allow tasks without detailed descriptions
ALTER TABLE "tasks" ADD COLUMN "description" text;
