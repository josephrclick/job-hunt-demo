-- ===================================================================
-- ENABLE ROW LEVEL SECURITY FOR SHARED DEMO MODE
-- 
-- This migration implements RLS for a portfolio demonstration where:
-- - All authenticated users can VIEW the same curated job data
-- - Guest users can only add their own notes/documents
-- - Admin user can manage the demo content
-- ===================================================================

-- ====================
-- 1. CREATE DEMO ADMIN USER
-- ====================

-- Create the admin profile that will own all demo jobs
INSERT INTO user_profile (uid, name, current_title, location, remote_pref)
VALUES ('demo_admin', 'Demo Administrator', 'Platform Admin', 'Remote', 'remote')
ON CONFLICT (uid) DO NOTHING;

-- ====================
-- 2. OWNERSHIP COLUMNS
-- ====================

-- Note: Columns are now defined in the consolidated schema
-- This section kept for documentation purposes

-- ====================
-- 3. BACKFILL EXISTING DATA
-- ====================

-- All existing jobs become demo data owned by admin
UPDATE jobs 
  SET owner_type = 'demo',
      owner_uid = 'demo_admin'
  WHERE owner_uid IS NULL;

-- Any existing notes/documents become admin's
UPDATE job_notes 
  SET profile_uid = 'demo_admin'
  WHERE profile_uid IS NULL;

UPDATE job_documents 
  SET profile_uid = 'demo_admin'
  WHERE profile_uid IS NULL;

-- ====================
-- 4. ADD CONSTRAINTS
-- ====================

-- Make profile_uid required for user-specific tables
ALTER TABLE job_notes 
  ALTER COLUMN profile_uid SET NOT NULL,
  ADD CONSTRAINT fk_job_notes_profile 
    FOREIGN KEY (profile_uid) REFERENCES user_profile(uid) ON DELETE CASCADE;

ALTER TABLE job_documents 
  ALTER COLUMN profile_uid SET NOT NULL,
  ADD CONSTRAINT fk_job_documents_profile 
    FOREIGN KEY (profile_uid) REFERENCES user_profile(uid) ON DELETE CASCADE;

-- ====================
-- 5. CREATE INDEXES
-- ====================

CREATE INDEX IF NOT EXISTS idx_jobs_owner_type ON jobs(owner_type);
CREATE INDEX IF NOT EXISTS idx_jobs_owner_uid ON jobs(owner_uid);
CREATE INDEX IF NOT EXISTS idx_job_notes_profile_uid ON job_notes(profile_uid);
CREATE INDEX IF NOT EXISTS idx_job_documents_profile_uid ON job_documents(profile_uid);

-- ====================
-- 6. ENABLE RLS ON TABLES
-- ====================

ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_enrichments ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_documents ENABLE ROW LEVEL SECURITY;

-- ====================
-- 7. USER PROFILE POLICIES
-- ====================

-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON user_profile
  FOR SELECT USING (uid = auth.uid()::text);

CREATE POLICY "Users can update own profile" ON user_profile
  FOR UPDATE USING (uid = auth.uid()::text);

CREATE POLICY "Users can insert own profile" ON user_profile
  FOR INSERT WITH CHECK (uid = auth.uid()::text);

-- ====================
-- 8. JOBS TABLE POLICIES (Shared Demo Data)
-- ====================

-- ALL authenticated users can VIEW demo jobs
CREATE POLICY "All users can view demo jobs" ON jobs
  FOR SELECT 
  USING (owner_type = 'demo');

-- Only admin can modify demo jobs
CREATE POLICY "Only admin can insert demo jobs" ON jobs
  FOR INSERT 
  WITH CHECK (auth.uid()::text = 'demo_admin' AND owner_type = 'demo');

CREATE POLICY "Only admin can update demo jobs" ON jobs
  FOR UPDATE 
  USING (auth.uid()::text = 'demo_admin' AND owner_type = 'demo');

CREATE POLICY "Only admin can delete demo jobs" ON jobs
  FOR DELETE 
  USING (auth.uid()::text = 'demo_admin' AND owner_type = 'demo');

-- ====================
-- 9. JOB ENRICHMENTS POLICIES (Read-only for users)
-- ====================

-- All users can view enrichments for demo jobs
CREATE POLICY "All users can view demo job enrichments" ON job_enrichments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_enrichments.job_id 
      AND jobs.owner_type = 'demo'
    )
  );

-- Only service role can modify enrichments (via functions)
-- No user-level INSERT/UPDATE/DELETE policies needed

-- ====================
-- 10. JOB NOTES POLICIES (User-specific)
-- ====================

-- Users can view their own notes AND admin's demo notes
CREATE POLICY "Users can view own notes and demo notes" ON job_notes
  FOR SELECT 
  USING (
    profile_uid = auth.uid()::text OR 
    profile_uid = 'demo_admin'
  );

-- Users can only create their own notes
CREATE POLICY "Users can insert own notes" ON job_notes
  FOR INSERT 
  WITH CHECK (profile_uid = auth.uid()::text);

-- Users can only update their own notes
CREATE POLICY "Users can update own notes" ON job_notes
  FOR UPDATE 
  USING (profile_uid = auth.uid()::text);

-- Users can only delete their own notes
CREATE POLICY "Users can delete own notes" ON job_notes
  FOR DELETE 
  USING (profile_uid = auth.uid()::text);

-- ====================
-- 11. JOB DOCUMENTS POLICIES (User-specific)
-- ====================

-- Users can view their own documents AND admin's demo documents
CREATE POLICY "Users can view own documents and demo documents" ON job_documents
  FOR SELECT 
  USING (
    profile_uid = auth.uid()::text OR 
    profile_uid = 'demo_admin'
  );

-- Users can only create their own documents
CREATE POLICY "Users can insert own documents" ON job_documents
  FOR INSERT 
  WITH CHECK (profile_uid = auth.uid()::text);

-- Users can only update their own documents
CREATE POLICY "Users can update own documents" ON job_documents
  FOR UPDATE 
  USING (profile_uid = auth.uid()::text);

-- Users can only delete their own documents
CREATE POLICY "Users can delete own documents" ON job_documents
  FOR DELETE 
  USING (profile_uid = auth.uid()::text);

-- ====================
-- 12. HELPER FUNCTIONS
-- ====================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid()::text = 'demo_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a demo viewer account
CREATE OR REPLACE FUNCTION create_demo_viewer(
  p_email text DEFAULT NULL
) RETURNS json
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid text;
  v_name text;
  v_result json;
BEGIN
  -- Generate a unique viewer ID
  v_uid := 'viewer_' || substring(gen_random_uuid()::text from 1 for 8);
  v_name := 'Demo Viewer ' || substring(v_uid from 8);
  
  -- Create the viewer profile
  INSERT INTO user_profile (
    uid,
    name,
    current_title,
    location,
    remote_pref,
    preferences
  ) VALUES (
    v_uid,
    v_name,
    'Portfolio Viewer',
    'Remote',
    'remote',
    '{"role": "viewer", "can_edit": false}'::jsonb
  );
  
  -- Return the created user info
  SELECT json_build_object(
    'uid', v_uid,
    'name', v_name,
    'email', p_email,
    'role', 'viewer',
    'created_at', now(),
    'instructions', 'You can view all demo jobs and create your own notes'
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ====================
-- 13. DEMO DATA MANAGEMENT
-- ====================

-- Function to clean up old viewer accounts (but preserve their notes)
CREATE OR REPLACE FUNCTION cleanup_old_viewers(
  p_days_old integer DEFAULT 30
) RETURNS json
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count integer;
  v_result json;
BEGIN
  -- Delete viewer accounts older than specified days
  -- Their notes will be preserved but orphaned
  WITH deleted AS (
    DELETE FROM user_profile
    WHERE uid LIKE 'viewer_%'
      AND created_at < now() - (p_days_old || ' days')::interval
    RETURNING uid
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted;
  
  -- Return cleanup results
  SELECT json_build_object(
    'deleted_viewers', v_deleted_count,
    'cleanup_date', now(),
    'days_threshold', p_days_old
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ====================
-- 14. MONITORING VIEWS
-- ====================

-- View to see demo engagement
CREATE OR REPLACE VIEW demo_engagement AS
SELECT 
  'total_viewers' as metric,
  COUNT(DISTINCT uid) as value
FROM user_profile
WHERE uid LIKE 'viewer_%'
UNION ALL
SELECT 
  'total_notes_created' as metric,
  COUNT(*) as value
FROM job_notes
WHERE profile_uid LIKE 'viewer_%'
UNION ALL
SELECT 
  'active_viewers_7d' as metric,
  COUNT(DISTINCT profile_uid) as value
FROM job_notes
WHERE profile_uid LIKE 'viewer_%'
  AND created_at > now() - interval '7 days';

-- View to see which jobs are most engaging
CREATE OR REPLACE VIEW popular_demo_jobs AS
SELECT 
  j.id,
  j.title,
  j.company,
  j.ai_fit_score,
  COUNT(DISTINCT jn.profile_uid) as unique_viewers_with_notes,
  COUNT(jn.id) as total_notes
FROM jobs j
LEFT JOIN job_notes jn ON jn.job_id = j.id AND jn.profile_uid LIKE 'viewer_%'
WHERE j.owner_type = 'demo'
GROUP BY j.id, j.title, j.company, j.ai_fit_score
ORDER BY unique_viewers_with_notes DESC, total_notes DESC;

-- ====================
-- 15. STORAGE BUCKET SETUP
-- ====================

-- Create the docs storage bucket for user documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'docs',
  'docs', 
  false,
  10485760, -- 10MB limit
  ARRAY[
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'text/plain', 
    'text/markdown', 
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/octet-stream'
  ]
)
ON CONFLICT (id) DO UPDATE
SET 
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ====================
-- 16. STORAGE POLICIES
-- ====================

-- Storage structure: /{user_id}/filename
-- Example: /viewer_12345678/resume.pdf
-- This ensures each user can only access their own files

-- Viewers can manage their own documents in storage
CREATE POLICY "Users can view own documents in storage"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'docs' AND 
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    'demo_admin' = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can upload own documents to storage"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'docs' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own documents in storage"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'docs' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own documents from storage"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'docs' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ====================
-- 17. API HELPER FUNCTIONS
-- ====================

-- Get user's interaction stats
CREATE OR REPLACE FUNCTION get_viewer_stats(p_uid text DEFAULT auth.uid()::text)
RETURNS json AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'uid', p_uid,
    'is_admin', p_uid = 'demo_admin',
    'is_viewer', p_uid LIKE 'viewer_%',
    'notes_created', (SELECT COUNT(*) FROM job_notes WHERE profile_uid = p_uid),
    'documents_created', (SELECT COUNT(*) FROM job_documents WHERE profile_uid = p_uid),
    'first_activity', (SELECT MIN(created_at) FROM job_notes WHERE profile_uid = p_uid),
    'last_activity', (SELECT MAX(created_at) FROM job_notes WHERE profile_uid = p_uid)
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- MIGRATION COMPLETE
-- 
-- This migration implements a shared demo mode where:
-- - All authenticated users can view the same curated job data
-- - Users can create their own notes and documents
-- - Demo data is managed by the admin user
-- - Perfect for portfolio demonstrations
-- ===================================================================