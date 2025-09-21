-- FUNCTION

CREATE OR REPLACE FUNCTION add_default_prompts_to_workspace() 
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    summary_prompt_id UUID;
    hello_world_prompt_id UUID;
    marketing_expert_prompt_id UUID;
BEGIN
    -- Insert default prompts
    INSERT INTO public.prompts(user_id, sharing, content, name)
    VALUES
        (NEW.user_id, 'private', 'Please provide a summary from the file.', 'Summary Prompt')
    RETURNING id INTO summary_prompt_id;

    INSERT INTO public.prompts(user_id, sharing, content, name)
    VALUES
        (NEW.user_id, 'private', 'Write "Hello, World!" in {{programming_language}} programming language.', 'Hello World Prompt')
    RETURNING id INTO hello_world_prompt_id;

    INSERT INTO public.prompts(user_id, sharing, content, name)
    VALUES
        (NEW.user_id, 'private', 'As a marketing expert, provide strategies to increase brand awareness.', 'Marketing Expert Prompt')
    RETURNING id INTO marketing_expert_prompt_id;

    -- Insert into prompt_workspaces
    INSERT INTO public.prompt_workspaces(user_id, prompt_id, workspace_id)
    VALUES
        (NEW.user_id, summary_prompt_id, NEW.id),
        (NEW.user_id, hello_world_prompt_id, NEW.id),
        (NEW.user_id, marketing_expert_prompt_id, NEW.id);

    RETURN NEW;
END;
$$;


-- TRIGGER

CREATE TRIGGER add_default_prompts_to_workspace_trigger
AFTER INSERT ON public.workspaces
FOR EACH ROW
EXECUTE PROCEDURE public.add_default_prompts_to_workspace();
