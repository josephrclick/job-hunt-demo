-- ===================================================================
-- DEMO AUTHENTICATION HELPER
-- 
-- Provides a function to create demo users with preset passwords
-- for easy portfolio testing
-- ===================================================================

-- Function to create a demo user with auth account
-- NOTE: This requires service_role access and should only be used for demo purposes
CREATE OR REPLACE FUNCTION create_demo_user_with_auth(
  p_email text,
  p_password text DEFAULT 'demo123!'
) RETURNS json
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_uid text;
  v_result json;
BEGIN
  -- Note: Direct auth user creation requires using Supabase Admin API
  -- This function prepares the user_profile for when the user signs up
  
  -- Generate a consistent uid based on email
  v_uid := 'viewer_' || substring(md5(p_email) from 1 for 8);
  
  -- Create or update the user profile
  INSERT INTO user_profile (
    uid,
    name,
    current_title,
    location,
    remote_pref,
    preferences
  ) VALUES (
    v_uid,
    'Demo User - ' || split_part(p_email, '@', 1),
    'Portfolio Viewer',
    'Remote',
    'remote',
    '{"role": "viewer", "can_edit": false}'::jsonb
  )
  ON CONFLICT (uid) DO UPDATE
  SET 
    name = EXCLUDED.name,
    updated_at = now();
  
  -- Return instructions for creating the auth account
  SELECT json_build_object(
    'success', true,
    'profile_uid', v_uid,
    'email', p_email,
    'next_steps', 'Use Supabase Dashboard or Admin API to create auth account with email: ' || p_email || ' and password: ' || p_password,
    'note', 'For production, use anonymous auth or magic links instead of passwords'
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Create some preset demo accounts
-- These need to be created in Supabase Auth Dashboard or via Admin API
COMMENT ON FUNCTION create_demo_user_with_auth IS 'Prepares user_profile for demo users. Auth accounts must be created separately via Supabase Dashboard with suggested credentials:

Demo Users:
1. demo@jobhunthub.com / demo123!
2. recruiter@jobhunthub.com / demo123!
3. hiring.manager@jobhunthub.com / demo123!

For production, use anonymous auth or magic links instead.';

-- ===================================================================
-- IMPORTANT: Demo User Setup Instructions
-- 
-- Since we cannot create auth users directly from SQL, follow these steps:
-- 
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Invite User" or "Create User"
-- 3. Create these demo accounts:
--    - demo@jobhunthub.com (password: demo123!)
--    - recruiter@jobhunthub.com (password: demo123!)
--    - hiring.manager@jobhunthub.com (password: demo123!)
-- 
-- 4. After creating auth accounts, run this to create matching profiles:
--    SELECT create_demo_user_with_auth('demo@jobhunthub.com');
--    SELECT create_demo_user_with_auth('recruiter@jobhunthub.com');
--    SELECT create_demo_user_with_auth('hiring.manager@jobhunthub.com');
-- 
-- For easier demo access, consider implementing:
-- - Anonymous authentication (no password needed)
-- - Magic link authentication (email only)
-- - Social auth (Google, GitHub)
-- ===================================================================