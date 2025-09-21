-- Add a function `get_user_statistics` to retrieve basic user statistics
CREATE OR REPLACE FUNCTION get_user_statistics()
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    display_name TEXT,
    email VARCHAR,
    is_superadmin BOOLEAN,
    prompts_count BIGINT,
    presets_count BIGINT,
    files_count BIGINT,
    messages_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.user_id,
        p.username,
        p.display_name,
        u.email,
        p.is_superadmin,
        -- Count of prompts related to the user
        (SELECT COUNT(*) FROM prompts prm WHERE prm.user_id = p.user_id) AS prompts_count,
        -- Count of presets related to the user
        (SELECT COUNT(*) FROM presets prs WHERE prs.user_id = p.user_id) AS presets_count,
        -- Count of files related to the user
        (SELECT COUNT(*) FROM files f WHERE f.user_id = p.user_id) AS files_count,
        -- Count of messages where user_id matches and role is "user"
        (SELECT COUNT(*) FROM messages m WHERE m.user_id = p.user_id AND m.role = 'user') AS messages_count
    FROM profiles p
    JOIN auth.users u ON u.id = p.user_id
    WHERE 
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.is_superadmin = TRUE
        );
END;
$$;
