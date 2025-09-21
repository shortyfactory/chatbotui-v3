--------------- PROMPTS ---------------

-- Drop the trigger first add_default_prompts_to_workspace_trigger
DROP TRIGGER IF EXISTS add_default_prompts_to_workspace_trigger ON public.workspaces;

-- Drop the function add_default_prompts_to_workspace
DROP FUNCTION IF EXISTS add_default_prompts_to_workspace();

--------------- PROMPTS LIBRARY ---------------

-- TABLE --

CREATE TABLE IF NOT EXISTS prompts_library (
    -- ID
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- METADATA
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,

    -- REQUIRED
    content TEXT NOT NULL CHECK (char_length(content) <= 100000),
    name TEXT NOT NULL CHECK (char_length(name) <= 100)
);

-- TRIGGERS --

CREATE TRIGGER update_prompts_library_updated_at
BEFORE UPDATE ON prompts_library
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
