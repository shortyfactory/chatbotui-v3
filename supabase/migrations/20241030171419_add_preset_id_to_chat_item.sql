-- Add preset_id column to chats table
ALTER TABLE chats
ADD COLUMN preset_id VARCHAR(255) NULL;
