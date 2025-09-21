-- Migration for automated file cleanup using pg_cron in self-hosted Supabase

--------------- Enable Extensions ---------------

-- Enable the pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable the uuid-ossp extension if UUIDs are used but not yet enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------- FUNCTIONS ---------------

-- Use the existing delete_storage_object_from_bucket function to avoid redundancy
-- Reuses delete_storage_object function for HTTP-based deletion as defined previously.

-- Function to delete files older than 30 days, along with related data
CREATE OR REPLACE FUNCTION delete_old_files()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    file RECORD;
    status INT;
    content TEXT;
    deleted_paths TEXT[] := '{}';  -- Array to keep track of deleted paths
BEGIN
    -- Loop through each file older than 30 days
    FOR file IN
        SELECT * FROM files WHERE created_at < NOW() - INTERVAL '30 days'
    LOOP
        -- Delete related entries in other tables if cascade isn’t set up
        DELETE FROM file_workspaces WHERE file_id = file.id;

        -- Delete file record from files table
        DELETE FROM files WHERE id = file.id;

        -- Check if the file_path has already been deleted from storage
        IF NOT file.file_path = ANY(deleted_paths) THEN
            -- Call function to remove file from storage bucket
            BEGIN
                SELECT INTO status, content
                delete_storage_object_from_bucket('files', file.file_path);

                -- Check if the status is 404 (object not found) and handle it gracefully
                IF status = 404 THEN
                    RAISE NOTICE 'File not found in storage, skipping: %', file.file_path;
                ELSIF status <> 200 THEN
                    RAISE WARNING 'Could not delete file from storage: Status % Content %', status, content;
                END IF;
                
                -- Add the file_path to the deleted_paths array
                deleted_paths := array_append(deleted_paths, file.file_path);
            EXCEPTION WHEN others THEN
                RAISE WARNING 'Error occurred during deletion of storage object: %', SQLERRM;
            END;
        END IF;
    END LOOP;
END;
$$;


--------------- SCHEDULING JOB ---------------

-- Schedule the delete_old_files function to run daily at midnight
SELECT cron.schedule('daily-file-cleanup', '0 0 * * *', 'SELECT delete_old_files();');

--------------- END OF MIGRATION ---------------
