-- Add a boolean column `is_superadmin` to the `profiles` table
ALTER TABLE profiles
ADD COLUMN is_superadmin BOOLEAN DEFAULT FALSE;
