-- Enable Row-Level Security (RLS) on the `analytics` table
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Add a policy to allow only superadmins to read from the `analytics` table
CREATE POLICY superadmin_read_policy ON analytics
FOR ALL
USING (
    EXISTS (
        SELECT 1
            FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.is_superadmin = TRUE
    )
);