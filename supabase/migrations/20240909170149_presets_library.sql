--------------- PRESETS ---------------

-- TABLE --

CREATE TABLE IF NOT EXISTS presets_library (
    -- ID
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- RELATIONSHIPS
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- OPTIONAL RELATIONSHIPS
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,

    -- METADATA
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,

    -- SHARING
    sharing TEXT NOT NULL DEFAULT 'public',

    -- REQUIRED
    context_length INT NOT NULL DEFAULT 128000,
    description TEXT CHECK (char_length(description) <= 500),
    embeddings_provider TEXT NOT NULL CHECK (char_length(embeddings_provider) <= 1000) DEFAULT 'openai',
    include_profile_context BOOLEAN NOT NULL DEFAULT TRUE,
    include_workspace_instructions BOOLEAN NOT NULL DEFAULT TRUE,
    model TEXT NOT NULL CHECK (char_length(model) <= 1000) DEFAULT 'gpt-4o',
    name TEXT NOT NULL CHECK (char_length(name) <= 100),
    prompt TEXT NOT NULL CHECK (char_length(prompt) <= 100000),
    temperature REAL NOT NULL DEFAULT 0.5
);

-- TRIGGERS --

CREATE TRIGGER update_presets_library_updated_at
BEFORE UPDATE ON presets_library 
FOR EACH ROW 
EXECUTE PROCEDURE update_updated_at_column();
