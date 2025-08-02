-- ===================================================================
-- SECURE SYSTEM TABLES WITH ROW LEVEL SECURITY
-- 
-- This migration adds RLS policies to sensitive system tables to prevent
-- unauthorized access by authenticated users. Following Supabase best
-- practices for securing configuration and monitoring data.
-- ===================================================================

BEGIN;

-- ====================
-- 1. ENABLE RLS ON SYSTEM TABLES
-- ====================

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE circuit_breaker_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_enrichments ENABLE ROW LEVEL SECURITY;

-- ====================
-- 2. CREATE SECURITY DEFINER FUNCTIONS
-- ====================

-- Function to check if user is service role
-- Uses security definer to bypass RLS and check actual role
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if the current user has service_role privileges
  -- In Supabase, service role bypasses RLS entirely
  RETURN current_setting('request.jwt.claims', true)::json->>'role' = 'service_role';
EXCEPTION
  WHEN OTHERS THEN
    -- If we can't determine the role, default to false for security
    RETURN FALSE;
END;
$$;

-- Function to check if user is admin (for future use)
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if the authenticated user is the demo_admin
  RETURN auth.uid()::text = 'demo_admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- ====================
-- 3. APP_CONFIG POLICIES
-- ====================

-- Only service role can view app_config (contains sensitive keys)
CREATE POLICY "Service role can view app_config" ON app_config
  FOR SELECT
  USING (is_service_role());

-- Only service role can modify app_config
CREATE POLICY "Service role can insert app_config" ON app_config
  FOR INSERT
  WITH CHECK (is_service_role());

CREATE POLICY "Service role can update app_config" ON app_config
  FOR UPDATE
  USING (is_service_role());

CREATE POLICY "Service role can delete app_config" ON app_config
  FOR DELETE
  USING (is_service_role());

-- ====================
-- 4. PIPELINE_TRACES POLICIES
-- ====================

-- Service role has full access to pipeline traces
CREATE POLICY "Service role can view all pipeline_traces" ON pipeline_traces
  FOR SELECT
  USING (is_service_role());

-- Authenticated users can only view their own traces
CREATE POLICY "Users can view own pipeline_traces" ON pipeline_traces
  FOR SELECT
  TO authenticated
  USING (profile_uid = auth.uid()::text);

-- Only service role can insert traces
CREATE POLICY "Service role can insert pipeline_traces" ON pipeline_traces
  FOR INSERT
  WITH CHECK (is_service_role());

-- No update/delete for pipeline_traces (audit trail)

-- ====================
-- 5. CIRCUIT_BREAKER_STATE POLICIES
-- ====================

-- Only service role can view circuit breaker state
CREATE POLICY "Service role can view circuit_breaker_state" ON circuit_breaker_state
  FOR SELECT
  USING (is_service_role());

-- Only service role can modify circuit breaker state
CREATE POLICY "Service role can update circuit_breaker_state" ON circuit_breaker_state
  FOR UPDATE
  USING (is_service_role());

CREATE POLICY "Service role can insert circuit_breaker_state" ON circuit_breaker_state
  FOR INSERT
  WITH CHECK (is_service_role());

-- ====================
-- 6. FAILED_ENRICHMENTS POLICIES
-- ====================

-- Service role can view all failed enrichments
CREATE POLICY "Service role can view all failed_enrichments" ON failed_enrichments
  FOR SELECT
  USING (is_service_role());

-- Authenticated users can view their own failed enrichments
CREATE POLICY "Users can view own failed_enrichments" ON failed_enrichments
  FOR SELECT
  TO authenticated
  USING (profile_uid = auth.uid()::text);

-- Only service role can insert failed enrichments
CREATE POLICY "Service role can insert failed_enrichments" ON failed_enrichments
  FOR INSERT
  WITH CHECK (is_service_role());

-- ====================
-- 7. CREATE PUBLIC READ-ONLY VIEWS
-- ====================

-- Create a safe view for non-sensitive config that authenticated users can access
CREATE OR REPLACE VIEW public_app_config AS
SELECT 
  key,
  CASE 
    WHEN key IN ('service_role_key', 'openai_api_key', 'internal_api_secret') THEN '[REDACTED]'
    ELSE value
  END as value,
  description,
  created_at,
  updated_at
FROM app_config
WHERE key NOT LIKE '%secret%' 
  AND key NOT LIKE '%key%'
  AND key NOT LIKE '%password%';

-- Grant access to the public view
GRANT SELECT ON public_app_config TO authenticated;

-- Create a view for users to see their own pipeline performance
CREATE OR REPLACE VIEW my_pipeline_performance AS
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  service_name,
  operation,
  COUNT(*) as execution_count,
  AVG(duration_ms) as avg_duration_ms,
  MIN(duration_ms) as min_duration_ms,
  MAX(duration_ms) as max_duration_ms,
  COUNT(CASE WHEN status = 'error' THEN 1 END) as error_count
FROM pipeline_traces
WHERE profile_uid = auth.uid()::text
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', created_at), service_name, operation
ORDER BY hour DESC;

-- Grant access to the performance view
GRANT SELECT ON my_pipeline_performance TO authenticated;

-- ====================
-- 8. SECURITY DOCUMENTATION
-- ====================

COMMENT ON POLICY "Service role can view app_config" ON app_config IS 
'Restricts app_config access to service role only, protecting sensitive configuration like API keys';

COMMENT ON FUNCTION is_service_role() IS 
'Security definer function to check if current user has service_role privileges. Used in RLS policies to restrict access to sensitive system tables.';

COMMENT ON VIEW public_app_config IS 
'Safe view of app_config that redacts sensitive values and only shows non-secret configuration to authenticated users';

-- ====================
-- 9. REVOKE DIRECT TABLE ACCESS
-- ====================

-- Revoke direct access from public and anon roles
REVOKE ALL ON app_config FROM public;
REVOKE ALL ON app_config FROM anon;
REVOKE ALL ON pipeline_traces FROM anon;
REVOKE ALL ON circuit_breaker_state FROM public;
REVOKE ALL ON circuit_breaker_state FROM anon;
REVOKE ALL ON circuit_breaker_state FROM authenticated;
REVOKE ALL ON failed_enrichments FROM anon;

COMMIT;

-- ===================================================================
-- MIGRATION COMPLETE
-- 
-- This migration secures sensitive system tables by:
-- 1. Enabling RLS on all system tables
-- 2. Creating security definer functions for role checking
-- 3. Implementing restrictive policies (service role only for sensitive data)
-- 4. Providing safe public views for non-sensitive data
-- 5. Revoking unnecessary direct access
-- 
-- Following Supabase security best practices from the documentation.
-- ===================================================================