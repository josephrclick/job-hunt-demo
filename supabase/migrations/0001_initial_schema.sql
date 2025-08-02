-- ===================================================================
-- CONSOLIDATED DATABASE SCHEMA
-- Job Hunt Hub - AI-powered job hunting platform
-- 
-- This migration replaces all previous migrations and creates the 
-- complete database schema in a single file.
-- ===================================================================

-- ====================
-- 1. EXTENSIONS
-- ====================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================
-- 2. ENUMS
-- ====================

CREATE TYPE enrichment_status_enum AS ENUM (
  'pending',
  'processing', 
  'pass_a_complete',
  'completed',
  'failed',
  'permanently_failed'
);

CREATE TYPE kb_source_type AS ENUM (
  'note',
  'doc', 
  'summary',
  'job'
);

CREATE TYPE remote_preference AS ENUM ('remote', 'hybrid', 'onsite');

-- ====================
-- 3. USER PROFILE SYSTEM
-- ====================

-- Single user profile
CREATE TABLE user_profile (
  uid text PRIMARY KEY,
  name text,
  current_title text,
  seniority text,
  location text,
  min_base_comp integer,
  remote_pref remote_preference DEFAULT 'remote',
  strengths jsonb,
  red_flags jsonb,
  interview_style text,
  dealbreakers jsonb,
  preferences jsonb,
  embedding vector(1536),
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Skills taxonomy
CREATE TABLE skills_taxonomy (
  skill text PRIMARY KEY,
  category text,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- User profile indexes
CREATE INDEX idx_user_profile_embedding ON user_profile USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_user_profile_strengths ON user_profile USING GIN (strengths);
CREATE INDEX idx_user_profile_red_flags ON user_profile USING GIN (red_flags);
CREATE INDEX idx_user_profile_dealbreakers ON user_profile USING GIN (dealbreakers);
CREATE INDEX idx_user_profile_preferences ON user_profile USING GIN (preferences);
CREATE INDEX idx_skills_taxonomy_category ON skills_taxonomy (category);

-- ====================
-- 4. CORE JOB SYSTEM
-- ====================

-- Main jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url text UNIQUE NOT NULL,
  title text NOT NULL,
  company text NOT NULL,
  description text,
  location text,
  employment_type text,
  experience_level text,
  salary text,
  posted_date timestamptz,
  applicant_count integer,
  skills text[],
  source text,
  scraped_at timestamptz NOT NULL,
  status text,
  ai_fit_score integer CHECK (ai_fit_score >= 0 AND ai_fit_score <= 100),
  scraper_raw_json JSONB,
  owner_type TEXT DEFAULT 'demo' CHECK (owner_type IN ('demo', 'user')),
  owner_uid TEXT,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Job enrichments for AI analysis
CREATE TABLE job_enrichments (
  job_id UUID PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
  profile_uid text REFERENCES user_profile(uid),
  status enrichment_status_enum DEFAULT 'pending',
  ai_fit_score integer CHECK (ai_fit_score >= 0 AND ai_fit_score <= 100),
  dealbreaker_hit boolean,
  comp_min integer,
  comp_max integer,
  comp_currency text DEFAULT 'USD',
  remote_policy text,
  skills_matched jsonb,
  skills_gap jsonb,
  tech_stack jsonb,
  ai_resume_tips text[],
  ai_tailored_summary text,
  risks jsonb,
  raw_json jsonb,
  skill_coverage_pct integer CHECK (skill_coverage_pct >= 0 AND skill_coverage_pct <= 100),
  confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100),
  resume_bullet text,
  extracted_fields jsonb,
  error_count integer DEFAULT 0,
  last_error text,
  correlation_id text,
  enrichment_started_at timestamptz,
  enrichment_completed_at timestamptz,
  fit_reasoning text,
  key_strengths text[],
  concerns text[],
  insights text[],
  skills_sought jsonb,
  compensation_competitiveness_score integer CHECK (compensation_competitiveness_score >= 0 AND compensation_competitiveness_score <= 100),
  growth_opportunity_score integer CHECK (growth_opportunity_score >= 0 AND growth_opportunity_score <= 100),
  tech_innovation_score integer CHECK (tech_innovation_score >= 0 AND tech_innovation_score <= 100),
  team_culture_score integer CHECK (team_culture_score >= 0 AND team_culture_score <= 100),
  work_life_balance_score integer CHECK (work_life_balance_score >= 0 AND work_life_balance_score <= 100),
  location_flexibility_score integer CHECK (location_flexibility_score >= 0 AND location_flexibility_score <= 100),
  sales_engineering_signals jsonb,
  interview_intelligence jsonb,
  quick_wins jsonb,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Job content tables
CREATE TABLE job_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  profile_uid TEXT NOT NULL,
  content text NOT NULL,
  note_type text,
  note_status text DEFAULT 'active',
  is_blocker boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  embedding_status text,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

CREATE TABLE job_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  profile_uid TEXT NOT NULL,
  title text NOT NULL,
  doc_type text NOT NULL,
  content text,
  doc_status text DEFAULT 'draft',
  file_size integer,
  mime_type text,
  tags text[] DEFAULT '{}',
  memo text,
  metadata jsonb DEFAULT '{}',
  processed_at timestamptz,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Jobs indexes
CREATE UNIQUE INDEX idx_jobs_url ON jobs (url);
CREATE INDEX idx_jobs_company ON jobs (company);
CREATE INDEX idx_jobs_status ON jobs (status);
CREATE INDEX idx_jobs_ai_fit_score ON jobs (ai_fit_score);
CREATE INDEX idx_jobs_created_at ON jobs (created_at);
CREATE INDEX idx_jobs_source ON jobs (source);

-- Job enrichments indexes
CREATE INDEX idx_job_enrichments_profile_uid ON job_enrichments (profile_uid);
CREATE INDEX idx_job_enrichments_status ON job_enrichments (status);
CREATE INDEX idx_job_enrichments_ai_fit_score ON job_enrichments (ai_fit_score);
CREATE INDEX idx_job_enrichments_dealbreaker_hit ON job_enrichments (dealbreaker_hit);
CREATE INDEX idx_job_enrichments_correlation_id ON job_enrichments (correlation_id);
CREATE INDEX idx_job_enrichments_skills_sought ON job_enrichments USING GIN (skills_sought);
CREATE INDEX idx_job_enrichments_se_signals ON job_enrichments USING GIN (sales_engineering_signals);
CREATE INDEX idx_job_enrichments_interview_intel ON job_enrichments USING GIN (interview_intelligence);
CREATE INDEX idx_job_enrichments_quick_wins ON job_enrichments USING GIN (quick_wins);

-- Job content indexes
CREATE INDEX idx_job_notes_job_id ON job_notes (job_id);
CREATE INDEX idx_job_notes_note_type ON job_notes (note_type);
CREATE INDEX idx_job_notes_note_status ON job_notes (note_status);
CREATE INDEX idx_job_notes_is_blocker ON job_notes (is_blocker);
CREATE INDEX idx_job_notes_tags ON job_notes USING GIN (tags);

CREATE INDEX idx_job_documents_job_id ON job_documents (job_id);
CREATE INDEX idx_job_documents_doc_type ON job_documents (doc_type);
CREATE INDEX idx_job_documents_doc_status ON job_documents (doc_status);
CREATE INDEX idx_job_documents_tags ON job_documents USING GIN (tags);

-- ====================
-- 5. KNOWLEDGE BASE
-- ====================

-- Vector embeddings for semantic search
CREATE TABLE kb_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type text NOT NULL CHECK (entity_type = 'job'),
  entity_id UUID NOT NULL,
  profile_uid TEXT NOT NULL,
  source_id UUID,
  chunk_idx integer,
  content text NOT NULL,
  embedding vector(1536),
  document_type text,
  document_subtypes text[] DEFAULT '{}',
  classification_confidence real,
  metadata jsonb DEFAULT '{}',
  tags text[] DEFAULT '{}',
  chunk_hash text,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Legacy documents table for backward compatibility
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID,
  title text,
  doc_type text,
  content text,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Knowledge base indexes
CREATE INDEX idx_kb_embeddings_embedding ON kb_embeddings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_kb_embeddings_entity ON kb_embeddings (entity_type, entity_id);
CREATE INDEX idx_kb_embeddings_source_id ON kb_embeddings (source_id);
CREATE INDEX idx_kb_embeddings_document_type ON kb_embeddings (document_type);
CREATE INDEX idx_kb_embeddings_tags ON kb_embeddings USING GIN (tags);
CREATE INDEX idx_kb_embeddings_created_at ON kb_embeddings (created_at);

-- ====================
-- 6. PIPELINE MANAGEMENT
-- ====================

-- Execution tracing and monitoring
CREATE TABLE pipeline_traces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  correlation_id text,
  service_name text NOT NULL,
  operation text NOT NULL,
  job_id UUID,
  profile_uid TEXT,
  worker_id text,
  status text NOT NULL,
  duration_ms integer,
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT NOW()
);

-- Circuit breaker for API reliability
CREATE TABLE circuit_breaker_state (
  service_name text PRIMARY KEY,
  status text NOT NULL CHECK (status IN ('open', 'closed', 'half-open')),
  failure_count integer DEFAULT 0,
  failure_threshold integer DEFAULT 5,
  success_threshold integer DEFAULT 3,
  timeout_seconds integer DEFAULT 60,
  window_seconds integer DEFAULT 300,
  last_failure_at timestamptz,
  last_success_at timestamptz,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Application configuration
CREATE TABLE app_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  description text,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Failed enrichment tracking
CREATE TABLE failed_enrichments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  profile_uid text REFERENCES user_profile(uid),
  error text NOT NULL,
  payload jsonb,
  retry_count integer DEFAULT 0,
  created_at timestamptz DEFAULT NOW()
);

-- Pipeline indexes
CREATE INDEX idx_pipeline_traces_correlation_id ON pipeline_traces (correlation_id);
CREATE INDEX idx_pipeline_traces_job_id ON pipeline_traces (job_id);
CREATE INDEX idx_pipeline_traces_service_created_at ON pipeline_traces (service_name, created_at);
CREATE INDEX idx_pipeline_traces_status ON pipeline_traces (status);
CREATE INDEX idx_pipeline_traces_created_at ON pipeline_traces (created_at);

CREATE INDEX idx_failed_enrichments_job_id ON failed_enrichments (job_id);
CREATE INDEX idx_failed_enrichments_created_at ON failed_enrichments (created_at);

-- ====================
-- 7. DATABASE FUNCTIONS
-- ====================

-- Function to create job with enrichment record atomically
CREATE OR REPLACE FUNCTION create_job_with_enrichment(
  p_url text,
  p_title text,
  p_company text,
  p_description text DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_employment_type text DEFAULT NULL,
  p_experience_level text DEFAULT NULL,
  p_salary text DEFAULT NULL,
  p_posted_date timestamptz DEFAULT NULL,
  p_applicant_count integer DEFAULT NULL,
  p_skills text[] DEFAULT NULL,
  p_source text DEFAULT NULL,
  p_scraped_at timestamptz DEFAULT NOW(),
  p_status text DEFAULT NULL,
  p_profile_uid text DEFAULT NULL,
  p_scraper_raw_json JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  job_id UUID;
BEGIN
  -- Insert the job and get the ID
  INSERT INTO jobs (
    url, title, company, description, location, employment_type,
    experience_level, salary, posted_date, applicant_count, skills,
    source, scraped_at, status, scraper_raw_json
  ) VALUES (
    p_url, p_title, p_company, p_description, p_location, p_employment_type,
    p_experience_level, p_salary, p_posted_date, p_applicant_count, p_skills,
    p_source, p_scraped_at, COALESCE(p_status, 'new'), p_scraper_raw_json
  ) RETURNING id INTO job_id;

  -- Create enrichment record
  INSERT INTO job_enrichments (job_id, profile_uid, status)
  VALUES (job_id, p_profile_uid, 'pending');

  RETURN job_id;
END;
$$ LANGUAGE plpgsql;

-- Function to fail job enrichment
CREATE OR REPLACE FUNCTION fail_job_enrichment(
  p_job_id UUID,
  p_error_message text,
  p_payload jsonb DEFAULT NULL
) RETURNS void AS $$
BEGIN
  -- Update enrichment status
  UPDATE job_enrichments 
  SET 
    status = 'failed',
    error_count = error_count + 1,
    last_error = p_error_message,
    updated_at = NOW()
  WHERE job_id = p_job_id;

  -- Log to failed enrichments
  INSERT INTO failed_enrichments (job_id, error, payload)
  VALUES (p_job_id, p_error_message, p_payload);
END;
$$ LANGUAGE plpgsql;

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10,
  min_content_length int DEFAULT 50,
  filter_entity_type text DEFAULT 'job'
) RETURNS TABLE (
  id UUID,
  entity_id UUID,
  content text,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kb.id,
    kb.entity_id,
    kb.content,
    (kb.embedding <=> query_embedding) * -1 + 1 AS similarity
  FROM kb_embeddings kb
  WHERE 
    kb.entity_type = filter_entity_type
    AND LENGTH(kb.content) >= min_content_length
    AND (kb.embedding <=> query_embedding) < (1 - match_threshold)
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- pg_cron dispatcher functions
CREATE OR REPLACE FUNCTION dispatch_pass_a_edge_batch()
RETURNS TEXT AS $$
DECLARE
  http_request_id BIGINT;
  functions_url TEXT;
  job_count INTEGER;
BEGIN
  -- Get the functions URL from app_config
  SELECT value INTO functions_url FROM app_config WHERE key = 'supabase_functions_url';
  IF functions_url IS NULL THEN
    RETURN 'ERROR: supabase_functions_url not configured in app_config';
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
      -- Call Edge Function
      SELECT net.http_post(
        url := functions_url || '/extract-job-facts',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb,
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
  job_count INTEGER;
BEGIN
  -- Get the functions URL from app_config
  SELECT value INTO functions_url FROM app_config WHERE key = 'supabase_functions_url';
  IF functions_url IS NULL THEN
    RETURN 'ERROR: supabase_functions_url not configured in app_config';
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
      -- Call Edge Function
      SELECT net.http_post(
        url := functions_url || '/analyze-job-personal',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb,
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

-- ====================
-- 8. TRIGGERS
-- ====================

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_user_profile_updated_at
  BEFORE UPDATE ON user_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_taxonomy_updated_at
  BEFORE UPDATE ON skills_taxonomy
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_enrichments_updated_at
  BEFORE UPDATE ON job_enrichments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_notes_updated_at
  BEFORE UPDATE ON job_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_documents_updated_at
  BEFORE UPDATE ON job_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kb_embeddings_updated_at
  BEFORE UPDATE ON kb_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_circuit_breaker_state_updated_at
  BEFORE UPDATE ON circuit_breaker_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_config_updated_at
  BEFORE UPDATE ON app_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ====================
-- 9. MONITORING VIEWS
-- ====================

-- Enrichment queue status
CREATE VIEW enrichment_queue_status AS
SELECT 
  status,
  COUNT(*) as count,
  MIN(created_at) as oldest_job,
  MAX(created_at) as newest_job,
  AVG(EXTRACT(EPOCH FROM (NOW() - created_at))) as avg_age_seconds
FROM job_enrichments 
GROUP BY status
ORDER BY status;

-- Cron job health monitoring
CREATE VIEW cron_job_health AS
SELECT 
  'process-pass-a-jobs-edge' as job_name,
  COUNT(*) as executions_last_hour,
  MAX(created_at) as last_execution,
  AVG(duration_ms) as avg_duration_ms,
  COUNT(CASE WHEN status = 'error' THEN 1 END) as error_count
FROM pipeline_traces 
WHERE service_name = 'dispatch_pass_a_edge_batch'
  AND created_at > NOW() - INTERVAL '1 hour'
UNION ALL
SELECT 
  'process-pass-b-jobs-edge' as job_name,
  COUNT(*) as executions_last_hour,
  MAX(created_at) as last_execution,
  AVG(duration_ms) as avg_duration_ms,
  COUNT(CASE WHEN status = 'error' THEN 1 END) as error_count
FROM pipeline_traces 
WHERE service_name = 'dispatch_pass_b_edge_batch'
  AND created_at > NOW() - INTERVAL '1 hour';

-- Pipeline performance metrics
CREATE VIEW pipeline_performance AS
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
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at), service_name, operation
ORDER BY hour DESC, service_name, operation;

-- Stuck enrichment detection
CREATE VIEW stuck_enrichment_jobs AS
SELECT 
  je.job_id,
  j.title,
  j.company,
  je.status,
  je.error_count,
  je.last_error,
  je.enrichment_started_at,
  EXTRACT(EPOCH FROM (NOW() - je.enrichment_started_at))/60 as minutes_stuck
FROM job_enrichments je
JOIN jobs j ON j.id = je.job_id
WHERE je.status = 'processing' 
  AND je.enrichment_started_at < NOW() - INTERVAL '10 minutes'
ORDER BY je.enrichment_started_at ASC;

-- ====================
-- 10. INITIAL CONFIGURATION
-- ====================

-- App configuration
INSERT INTO app_config (key, value, description) VALUES
  ('supabase_functions_url', 'http://kong:8000/functions/v1', 'Base URL for Supabase Edge Functions'),
  ('enrichment_batch_size_pass_a', '5', 'Number of jobs to process in Pass A batch'),
  ('enrichment_batch_size_pass_b', '3', 'Number of jobs to process in Pass B batch')
ON CONFLICT (key) DO NOTHING;

-- ====================
-- 11. PG_CRON JOBS
-- ====================

-- Schedule Pass A processing every 30 seconds
SELECT cron.schedule(
  'process-pass-a-jobs-edge',
  '*/30 * * * * *',
  'SELECT dispatch_pass_a_edge_batch();'
);

-- Schedule Pass B processing every 45 seconds  
SELECT cron.schedule(
  'process-pass-b-jobs-edge', 
  '*/45 * * * * *',
  'SELECT dispatch_pass_b_edge_batch();'
);

-- Schedule cleanup job daily at 2 AM
SELECT cron.schedule(
  'trace-cleanup',
  '0 2 * * *',
  'DELETE FROM pipeline_traces WHERE created_at < NOW() - INTERVAL ''90 days'';'
);

-- ====================
-- 12. COMMENTS
-- ====================

-- Table comments
COMMENT ON TABLE user_profile IS 'Single user profile for the solo job hunting application';
COMMENT ON TABLE jobs IS 'Core job postings with metadata and AI scoring';
COMMENT ON TABLE job_enrichments IS 'AI-powered analysis and personalization data for jobs';
COMMENT ON TABLE job_notes IS 'Interview notes and observations related to jobs';
COMMENT ON TABLE job_documents IS 'Resumes, cover letters, and other job-related documents';
COMMENT ON TABLE kb_embeddings IS 'Vector embeddings for semantic search across job content';
COMMENT ON TABLE pipeline_traces IS 'Execution tracking for the AI enrichment pipeline';
COMMENT ON TABLE failed_enrichments IS 'Error tracking for failed job enrichment attempts';

-- Column comments
COMMENT ON COLUMN jobs.scraper_raw_json IS 'Raw JSON payload from Chrome extension scraper for debugging and auditing purposes';
COMMENT ON COLUMN job_enrichments.skills_sought IS 'Structured skills data extracted from job descriptions. Format: [{"skill": "Python", "type": "programming_language", "level": "expert"}, ...]';
COMMENT ON COLUMN job_enrichments.fit_reasoning IS 'Clear explanation of the AI fit score calculation';
COMMENT ON COLUMN job_enrichments.key_strengths IS 'Array of reasons why this job is good for the user';
COMMENT ON COLUMN job_enrichments.concerns IS 'Array of potential issues or red flags identified';
COMMENT ON COLUMN job_enrichments.insights IS 'Array of key insights about this opportunity';

-- ===================================================================
-- MIGRATION COMPLETE
-- 
-- This consolidated migration creates a complete Job Hunt Hub database
-- with AI-powered job enrichment, vector search capabilities, and 
-- production-ready monitoring and reliability features.
-- ===================================================================