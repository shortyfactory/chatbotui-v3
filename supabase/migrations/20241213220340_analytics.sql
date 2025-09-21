-- Remove function `get_user_statistics` to retrieve basic user statistics as this function is no longer needed
DROP FUNCTION IF EXISTS get_user_statistics();

-- TABLE --
-- This migration creates an analytics table to track user activity
CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    username TEXT,
    display_name TEXT,
    email VARCHAR,
    is_superadmin BOOLEAN DEFAULT FALSE,
    prompts_count BIGINT DEFAULT 0,
    presets_count BIGINT DEFAULT 0,
    files_count BIGINT DEFAULT 0,
    messages_count BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- FUNCTIONS --
-- Create a trigger to create an analytics record when a new profile is created
CREATE OR REPLACE FUNCTION create_analytics_record_for_new_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO analytics (
        user_id, 
        username, 
        display_name, 
        email, 
        is_superadmin, 
        prompts_count, 
        presets_count, 
        files_count, 
        messages_count
    )
    SELECT 
        NEW.user_id AS user_id,
        NEW.username,
        NEW.display_name,
        u.email,
        NEW.is_superadmin,
        0 AS prompts_count,
        0 AS presets_count,
        0 AS files_count,
        0 AS messages_count
    FROM auth.users u
    WHERE u.id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the analytics record when a profile is updated
CREATE OR REPLACE FUNCTION update_analytics_record_on_profile_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE analytics
    SET 
        username = NEW.username,
        display_name = NEW.display_name,
        is_superadmin = NEW.is_superadmin,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_prompts_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE analytics
    SET prompts_count = prompts_count + 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_presets_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE analytics
    SET presets_count = presets_count + 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_files_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE analytics
    SET files_count = files_count + 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_messages_count_for_analytics()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'user' THEN
        UPDATE analytics
        SET messages_count = messages_count + 1,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- TRIGGERS --
CREATE TRIGGER after_profile_update_for_analytics
AFTER UPDATE OF username, display_name, is_superadmin ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_analytics_record_on_profile_update();

CREATE TRIGGER after_profile_creation_for_analytics
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_analytics_record_for_new_profile();

CREATE TRIGGER after_prompt_insert_for_analytics
AFTER INSERT ON prompts
FOR EACH ROW
EXECUTE FUNCTION increment_prompts_count();

CREATE TRIGGER after_preset_insert_for_analytics
AFTER INSERT ON presets
FOR EACH ROW
EXECUTE FUNCTION increment_presets_count();

CREATE TRIGGER after_file_insert_for_analytics
AFTER INSERT ON files
FOR EACH ROW
EXECUTE FUNCTION increment_files_count();

CREATE TRIGGER after_message_insert_for_analytics
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION increment_messages_count_for_analytics();


-- FILL EXISTING DATA --
INSERT INTO analytics (
    user_id, 
    username, 
    display_name, 
    email, 
    is_superadmin, 
    prompts_count, 
    presets_count, 
    files_count, 
    messages_count,
    created_at,
    updated_at
)
SELECT 
    p.user_id AS user_id,
    p.username AS username,
    p.display_name AS display_name,
    u.email AS email,
    p.is_superadmin AS is_superadmin,
    COALESCE((SELECT COUNT(*) FROM prompts WHERE prompts.user_id = p.user_id), 0) AS prompts_count,
    COALESCE((SELECT COUNT(*) FROM presets WHERE presets.user_id = p.user_id), 0) AS presets_count,
    COALESCE((SELECT COUNT(*) FROM files WHERE files.user_id = p.user_id), 0) AS files_count,
    COALESCE((SELECT COUNT(*) FROM messages WHERE messages.user_id = p.user_id AND messages.role = 'user'), 0) AS messages_count,
    NOW() AS created_at,
    NOW() AS updated_at
FROM profiles p
JOIN auth.users u ON u.id = p.user_id;