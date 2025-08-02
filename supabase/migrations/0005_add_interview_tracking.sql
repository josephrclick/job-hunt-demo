-- ===================================================================
-- ADD INTERVIEW TRACKING FUNCTIONALITY
-- 
-- This migration adds interview tracking tables and functionality
-- that was missing from the consolidated schema
-- ===================================================================

-- ====================
-- 1. CREATE INTERVIEW STAGE ENUM
-- ====================

CREATE TYPE interview_stage AS ENUM (
  'not_started',
  'phone_screen',
  'technical_1',
  'technical_2', 
  'behavioral',
  'onsite',
  'system_design',
  'final',
  'offer',
  'completed'
);

-- ====================
-- 2. ADD COLUMNS TO JOBS TABLE
-- ====================

ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS current_interview_stage interview_stage DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS interview_status text DEFAULT 'not_applied' CHECK (
  interview_status IN (
    'not_applied', 
    'applied', 
    'interviewing', 
    'on_hold', 
    'rejected', 
    'offer_received', 
    'offer_accepted', 
    'offer_declined', 
    'withdrawn'
  )
);

-- ====================
-- 3. CREATE INTERVIEW ROUNDS TABLE
-- ====================

CREATE TABLE interview_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  profile_uid TEXT NOT NULL,
  round_number INTEGER NOT NULL CHECK (round_number >= 1 AND round_number <= 8),
  stage interview_stage NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (
    status IN ('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show')
  ),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  interviewer_names TEXT[],
  interviewer_emails TEXT[],
  interview_format TEXT CHECK (
    interview_format IN ('video', 'phone', 'onsite', 'take_home', 'panel', 'casual')
  ),
  meeting_link TEXT,
  location TEXT,
  next_steps TEXT,
  next_step_date DATE,
  outcome TEXT CHECK (
    outcome IN ('passed', 'failed', 'pending', 'strong_yes', 'yes', 'no', 'strong_no', 'mixed')
  ),
  feedback_summary TEXT,
  technical_topics TEXT[],
  questions_asked TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(job_id, round_number)
);

-- ====================
-- 4. CREATE INDEXES
-- ====================

CREATE INDEX idx_interview_rounds_job_id ON interview_rounds(job_id);
CREATE INDEX idx_interview_rounds_profile_uid ON interview_rounds(profile_uid);
CREATE INDEX idx_interview_rounds_scheduled_date ON interview_rounds(scheduled_date);
CREATE INDEX idx_interview_rounds_job_status ON interview_rounds(job_id, status);
CREATE INDEX idx_interview_rounds_outcome ON interview_rounds(job_id, outcome);

-- ====================
-- 5. CREATE HELPER FUNCTIONS
-- ====================

-- Function to get next logical interview stage
CREATE OR REPLACE FUNCTION next_interview_stage(current_stage interview_stage)
RETURNS interview_stage AS $$
BEGIN
  RETURN CASE current_stage
    WHEN 'not_started' THEN 'phone_screen'
    WHEN 'phone_screen' THEN 'technical_1'
    WHEN 'technical_1' THEN 'technical_2'
    WHEN 'technical_2' THEN 'behavioral'
    WHEN 'behavioral' THEN 'onsite'
    WHEN 'onsite' THEN 'system_design'
    WHEN 'system_design' THEN 'final'
    WHEN 'final' THEN 'offer'
    WHEN 'offer' THEN 'completed'
    ELSE current_stage
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update current interview stage based on rounds
CREATE OR REPLACE FUNCTION update_job_interview_stage()
RETURNS TRIGGER AS $$
DECLARE
  max_completed_stage interview_stage;
  any_scheduled BOOLEAN;
BEGIN
  -- Get the highest completed stage
  SELECT stage INTO max_completed_stage
  FROM interview_rounds
  WHERE job_id = NEW.job_id 
    AND status = 'completed' 
    AND outcome IN ('passed', 'strong_yes', 'yes')
  ORDER BY round_number DESC
  LIMIT 1;

  -- Check if there are any scheduled rounds
  SELECT EXISTS (
    SELECT 1 FROM interview_rounds 
    WHERE job_id = NEW.job_id AND status = 'scheduled'
  ) INTO any_scheduled;

  -- Update the job's current stage
  IF max_completed_stage IS NOT NULL THEN
    UPDATE jobs 
    SET 
      current_interview_stage = next_interview_stage(max_completed_stage),
      interview_status = CASE
        WHEN NEW.outcome IN ('failed', 'no', 'strong_no') THEN 'rejected'
        WHEN any_scheduled THEN 'interviewing'
        WHEN max_completed_stage = 'offer' THEN 'offer_received'
        ELSE 'interviewing'
      END,
      updated_at = NOW()
    WHERE id = NEW.job_id;
  ELSIF any_scheduled THEN
    UPDATE jobs 
    SET 
      interview_status = 'interviewing',
      updated_at = NOW()
    WHERE id = NEW.job_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================
-- 6. CREATE TRIGGERS
-- ====================

-- Trigger to auto-update job interview stage
CREATE TRIGGER update_job_stage_on_round_change
AFTER INSERT OR UPDATE ON interview_rounds
FOR EACH ROW
EXECUTE FUNCTION update_job_interview_stage();

-- Add updated_at trigger
CREATE TRIGGER update_interview_rounds_updated_at 
  BEFORE UPDATE ON interview_rounds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ====================
-- 7. ENABLE RLS
-- ====================

ALTER TABLE interview_rounds ENABLE ROW LEVEL SECURITY;

-- ====================
-- 8. CREATE RLS POLICIES
-- ====================

-- Users can view their own interview rounds AND demo admin's rounds
CREATE POLICY "Users can view own interview rounds and demo rounds" ON interview_rounds
  FOR SELECT 
  USING (
    profile_uid = auth.uid()::text OR 
    profile_uid = 'demo_admin'
  );

-- Users can only create their own interview rounds
CREATE POLICY "Users can insert own interview rounds" ON interview_rounds
  FOR INSERT 
  WITH CHECK (profile_uid = auth.uid()::text);

-- Users can only update their own interview rounds
CREATE POLICY "Users can update own interview rounds" ON interview_rounds
  FOR UPDATE 
  USING (profile_uid = auth.uid()::text);

-- Users can only delete their own interview rounds
CREATE POLICY "Users can delete own interview rounds" ON interview_rounds
  FOR DELETE 
  USING (profile_uid = auth.uid()::text);

-- ====================
-- 9. CREATE INTERVIEW TEMPLATES VIEW
-- ====================

CREATE OR REPLACE VIEW interview_templates AS
SELECT 
  'FAANG' as template_name,
  jsonb_build_array(
    jsonb_build_object('round_number', 1, 'stage', 'phone_screen', 'interview_format', 'phone'),
    jsonb_build_object('round_number', 2, 'stage', 'technical_1', 'interview_format', 'video'),
    jsonb_build_object('round_number', 3, 'stage', 'technical_2', 'interview_format', 'video'),
    jsonb_build_object('round_number', 4, 'stage', 'behavioral', 'interview_format', 'video'),
    jsonb_build_object('round_number', 5, 'stage', 'system_design', 'interview_format', 'video'),
    jsonb_build_object('round_number', 6, 'stage', 'onsite', 'interview_format', 'onsite'),
    jsonb_build_object('round_number', 7, 'stage', 'final', 'interview_format', 'video')
  ) as rounds
UNION ALL
SELECT 
  'Startup' as template_name,
  jsonb_build_array(
    jsonb_build_object('round_number', 1, 'stage', 'phone_screen', 'interview_format', 'phone'),
    jsonb_build_object('round_number', 2, 'stage', 'technical_1', 'interview_format', 'video'),
    jsonb_build_object('round_number', 3, 'stage', 'final', 'interview_format', 'video')
  ) as rounds
UNION ALL
SELECT 
  'Enterprise' as template_name,
  jsonb_build_array(
    jsonb_build_object('round_number', 1, 'stage', 'phone_screen', 'interview_format', 'phone'),
    jsonb_build_object('round_number', 2, 'stage', 'technical_1', 'interview_format', 'video'),
    jsonb_build_object('round_number', 3, 'stage', 'behavioral', 'interview_format', 'video'),
    jsonb_build_object('round_number', 4, 'stage', 'onsite', 'interview_format', 'onsite'),
    jsonb_build_object('round_number', 5, 'stage', 'final', 'interview_format', 'video')
  ) as rounds;

-- Grant access to the view
GRANT SELECT ON interview_templates TO authenticated;

-- ====================
-- 10. FUNCTION FOR BULK UPSERT
-- ====================

CREATE OR REPLACE FUNCTION upsert_interview_rounds(
  p_job_id UUID,
  p_profile_uid TEXT,
  p_rounds JSONB
)
RETURNS SETOF interview_rounds AS $$
BEGIN
  RETURN QUERY
  INSERT INTO interview_rounds (
    job_id, profile_uid, round_number, stage, status, scheduled_date,
    interview_format, interviewer_names, next_steps, next_step_date
  )
  SELECT 
    p_job_id,
    p_profile_uid,
    (value->>'round_number')::INTEGER,
    (value->>'stage')::interview_stage,
    COALESCE(value->>'status', 'scheduled'),
    (value->>'scheduled_date')::TIMESTAMP WITH TIME ZONE,
    value->>'interview_format',
    ARRAY(SELECT jsonb_array_elements_text(value->'interviewer_names')),
    value->>'next_steps',
    (value->>'next_step_date')::DATE
  FROM jsonb_array_elements(p_rounds)
  ON CONFLICT (job_id, round_number) 
  DO UPDATE SET
    stage = EXCLUDED.stage,
    status = EXCLUDED.status,
    scheduled_date = EXCLUDED.scheduled_date,
    interview_format = EXCLUDED.interview_format,
    interviewer_names = EXCLUDED.interviewer_names,
    next_steps = EXCLUDED.next_steps,
    next_step_date = EXCLUDED.next_step_date,
    updated_at = NOW()
  RETURNING *;
END;
$$ LANGUAGE plpgsql;

-- ====================
-- 11. ADD CONSTRAINTS
-- ====================

-- Add foreign key constraint for profile_uid
ALTER TABLE interview_rounds 
  ADD CONSTRAINT fk_interview_rounds_profile 
    FOREIGN KEY (profile_uid) REFERENCES user_profile(uid) ON DELETE CASCADE;

-- ===================================================================
-- MIGRATION COMPLETE
-- 
-- This migration adds comprehensive interview tracking functionality
-- with proper RLS policies for the shared demo mode
-- ===================================================================