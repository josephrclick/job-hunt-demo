-- ===================================================================
-- FIX SERVICE ROLE KEY CONFIGURATION
-- 
-- This migration addresses the missing service role key configuration
-- that the dispatch functions require for Edge Function calls
-- ===================================================================

BEGIN;

-- Add service role key to app_config table
INSERT INTO app_config (key, value, description) 
VALUES (
  'service_role_key', 
  'YOUR_SERVICE_ROLE_KEY_HERE', -- This should be set via environment variable in production
  'Supabase service role key for Edge Function authentication. Update this with your actual key.'
)
ON CONFLICT (key) DO UPDATE
SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Update dispatch functions to read from app_config instead of GUC
CREATE OR REPLACE FUNCTION dispatch_pass_a_edge_batch()
RETURNS TEXT AS $$
DECLARE
  http_request_id BIGINT;
  functions_url TEXT;
  service_key TEXT;
  job_count INTEGER;
BEGIN
  -- Get the functions URL from app_config
  SELECT value INTO functions_url FROM app_config WHERE key = 'supabase_functions_url';
  IF functions_url IS NULL THEN
    RETURN 'ERROR: supabase_functions_url not configured in app_config';
  END IF;

  -- Get the service role key from app_config
  SELECT value INTO service_key FROM app_config WHERE key = 'service_role_key';
  IF service_key IS NULL OR service_key = 'YOUR_SERVICE_ROLE_KEY_HERE' THEN
    RETURN 'ERROR: service_role_key not properly configured in app_config';
  END IF;

  -- Try to acquire advisory lock (non-blocking)
  IF NOT pg_try_advisory_lock(12345) THEN
    RETURN 'SKIPPED: Another Pass A job is already running';
  END IF;

  BEGIN
    -- Lock and process up to 5 pending jobs
    UPDATE job_enrichments 
    SET 
      status = 'processing',
      enrichment_started_at = NOW(),
      updated_at = NOW()
    WHERE job_id IN (
      SELECT job_id 
      FROM job_enrichments 
      WHERE status = 'pending'
      ORDER BY created_at ASC
      LIMIT 5
      FOR UPDATE SKIP LOCKED
    );

    GET DIAGNOSTICS job_count = ROW_COUNT;

    IF job_count > 0 THEN
      -- Call Edge Function with service role key from app_config
      SELECT net.http_post(
        url := functions_url || '/extract-job-facts',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_key
        ),
        body := '{}'::jsonb
      ) INTO http_request_id;

      RETURN 'SUCCESS: Dispatched Pass A for ' || job_count || ' jobs';
    ELSE
      RETURN 'NO_WORK: No pending jobs found';
    END IF;

  EXCEPTION WHEN OTHERS THEN
    PERFORM pg_advisory_unlock(12345);
    RAISE;
  END;

  -- Release the lock
  PERFORM pg_advisory_unlock(12345);
  RETURN 'SUCCESS: Pass A dispatched';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION dispatch_pass_b_edge_batch()
RETURNS TEXT AS $$
DECLARE
  http_request_id BIGINT;
  functions_url TEXT;
  service_key TEXT;
  job_count INTEGER;
BEGIN
  -- Get the functions URL from app_config
  SELECT value INTO functions_url FROM app_config WHERE key = 'supabase_functions_url';
  IF functions_url IS NULL THEN
    RETURN 'ERROR: supabase_functions_url not configured in app_config';
  END IF;

  -- Get the service role key from app_config
  SELECT value INTO service_key FROM app_config WHERE key = 'service_role_key';
  IF service_key IS NULL OR service_key = 'YOUR_SERVICE_ROLE_KEY_HERE' THEN
    RETURN 'ERROR: service_role_key not properly configured in app_config';
  END IF;

  -- Try to acquire advisory lock (non-blocking)
  IF NOT pg_try_advisory_lock(12346) THEN
    RETURN 'SKIPPED: Another Pass B job is already running';
  END IF;

  BEGIN
    -- Lock and process up to 3 pass_a_complete jobs
    UPDATE job_enrichments 
    SET 
      status = 'processing',
      updated_at = NOW()
    WHERE job_id IN (
      SELECT job_id 
      FROM job_enrichments 
      WHERE status = 'pass_a_complete'
      ORDER BY created_at ASC
      LIMIT 3
      FOR UPDATE SKIP LOCKED
    );

    GET DIAGNOSTICS job_count = ROW_COUNT;

    IF job_count > 0 THEN
      -- Call Edge Function with service role key from app_config
      SELECT net.http_post(
        url := functions_url || '/analyze-job-personal',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_key
        ),
        body := '{}'::jsonb
      ) INTO http_request_id;

      RETURN 'SUCCESS: Dispatched Pass B for ' || job_count || ' jobs';
    ELSE
      RETURN 'NO_WORK: No pass_a_complete jobs found';
    END IF;

  EXCEPTION WHEN OTHERS THEN
    PERFORM pg_advisory_unlock(12346);
    RAISE;
  END;

  -- Release the lock
  PERFORM pg_advisory_unlock(12346);
  RETURN 'SUCCESS: Pass B dispatched';
END;
$$ LANGUAGE plpgsql;

-- Add comment documenting the service role key requirement
COMMENT ON TABLE app_config IS 'Application configuration table. IMPORTANT: The service_role_key must be updated with your actual Supabase service role key for Edge Functions to work properly.';

COMMIT;

-- ===================================================================
-- IMPORTANT POST-MIGRATION STEP:
-- 
-- After running this migration, you MUST update the service_role_key:
-- 
-- UPDATE app_config 
-- SET value = '<your-actual-service-role-key>' 
-- WHERE key = 'service_role_key';
-- 
-- For security, consider storing this in an environment variable
-- and updating it via your deployment process.
-- ===================================================================