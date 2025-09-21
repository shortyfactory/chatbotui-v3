--------------- PROMPTS LIBRARY ---------------

-- Add the description field to prompts_library
ALTER TABLE prompts_library 
ADD COLUMN description TEXT CHECK (char_length(description) <= 500);
