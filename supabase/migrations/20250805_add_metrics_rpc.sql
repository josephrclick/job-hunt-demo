-- ===================================================================
-- METRICS RPC FUNCTIONS
-- Functions to safely expose database metrics for dashboard monitoring
-- ===================================================================

-- Function to get database connection metrics
CREATE OR REPLACE FUNCTION get_db_connections()
RETURNS TABLE(
  active_connections bigint,
  max_connections integer,
  connection_usage_percent numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT count(*) FROM pg_stat_activity WHERE state = 'active')::bigint as active_connections,
    (SELECT setting::integer FROM pg_settings WHERE name = 'max_connections') as max_connections,
    (SELECT round((count(*) * 100.0 / (SELECT setting::integer FROM pg_settings WHERE name = 'max_connections')), 2) 
     FROM pg_stat_activity WHERE state = 'active') as connection_usage_percent;
END;
$$;

-- Function to get job-related metrics
CREATE OR REPLACE FUNCTION get_job_metrics()
RETURNS TABLE(
  total_jobs bigint,
  jobs_today bigint,
  enriched_jobs bigint,
  success_rate numeric,
  demo_jobs bigint,
  user_jobs bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT count(*) FROM jobs)::bigint as total_jobs,
    (SELECT count(*) FROM jobs WHERE created_at >= CURRENT_DATE)::bigint as jobs_today,
    (SELECT count(*) FROM jobs WHERE enrichment IS NOT NULL)::bigint as enriched_jobs,
    (SELECT CASE 
       WHEN count(*) > 0 THEN round((count(*) FILTER (WHERE enrichment IS NOT NULL) * 100.0 / count(*)), 2)
       ELSE 0 
     END 
     FROM jobs WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')::numeric as success_rate,
    (SELECT count(*) FROM jobs WHERE owner_type = 'demo')::bigint as demo_jobs,
    (SELECT count(*) FROM jobs WHERE owner_type = 'user')::bigint as user_jobs;
END;
$$;

-- Function to get enrichment pipeline metrics
CREATE OR REPLACE FUNCTION get_enrichment_metrics()
RETURNS TABLE(
  processed_today bigint,
  failed_today bigint,
  avg_processing_time numeric,
  queue_length bigint,
  success_rate_24h numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT count(*) FROM jobs 
     WHERE enrichment IS NOT NULL 
     AND created_at >= CURRENT_DATE)::bigint as processed_today,
    (SELECT count(*) FROM jobs 
     WHERE enrichment IS NULL 
     AND created_at >= CURRENT_DATE 
     AND created_at < CURRENT_DATE + INTERVAL '1 day')::bigint as failed_today,
    (SELECT COALESCE(avg(EXTRACT(EPOCH FROM (updated_at - created_at))), 0)
     FROM jobs 
     WHERE enrichment IS NOT NULL 
     AND created_at >= CURRENT_DATE - INTERVAL '1 day')::numeric as avg_processing_time,
    (SELECT count(*) FROM jobs 
     WHERE enrichment IS NULL 
     AND created_at >= CURRENT_DATE - INTERVAL '1 hour')::bigint as queue_length,
    (SELECT CASE 
       WHEN count(*) > 0 THEN round((count(*) FILTER (WHERE enrichment IS NOT NULL) * 100.0 / count(*)), 2)
       ELSE 0 
     END 
     FROM jobs WHERE created_at >= CURRENT_DATE - INTERVAL '1 day')::numeric as success_rate_24h;
END;
$$;

-- Function to get user activity metrics
CREATE OR REPLACE FUNCTION get_user_activity_metrics()
RETURNS TABLE(
  total_users bigint,
  active_users_24h bigint,
  demo_users bigint,
  notes_created_today bigint,
  documents_uploaded_today bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT count(DISTINCT uid) FROM user_profile)::bigint as total_users,
    (SELECT count(DISTINCT profile_uid) FROM job_notes 
     WHERE created_at >= CURRENT_DATE - INTERVAL '1 day')::bigint as active_users_24h,
    (SELECT count(*) FROM user_profile WHERE uid LIKE '%@jobhuntdemo.com')::bigint as demo_users,
    (SELECT count(*) FROM job_notes WHERE created_at >= CURRENT_DATE)::bigint as notes_created_today,
    (SELECT count(*) FROM job_documents WHERE created_at >= CURRENT_DATE)::bigint as documents_uploaded_today;
END;
$$;

-- Function to get top job categories/companies (for trends)
CREATE OR REPLACE FUNCTION get_job_trends()
RETURNS TABLE(
  company text,
  job_count bigint,
  avg_ai_fit_score numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.company,
    count(*)::bigint as job_count,
    round(avg(j.ai_fit_score), 1) as avg_ai_fit_score
  FROM jobs j 
  WHERE j.created_at >= CURRENT_DATE - INTERVAL '7 days'
    AND j.company IS NOT NULL
  GROUP BY j.company
  ORDER BY job_count DESC, avg_ai_fit_score DESC
  LIMIT 10;
END;
$$;

-- Function to get knowledge base metrics
CREATE OR REPLACE FUNCTION get_kb_metrics()
RETURNS TABLE(
  total_embeddings bigint,
  embeddings_today bigint,
  avg_similarity_score numeric,
  top_search_terms text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT count(*) FROM kb_embeddings)::bigint as total_embeddings,
    (SELECT count(*) FROM kb_embeddings WHERE created_at >= CURRENT_DATE)::bigint as embeddings_today,
    0.85::numeric as avg_similarity_score, -- Placeholder for now
    ARRAY['remote work', 'sales engineering', 'AI/ML', 'typescript', 'react']::text[] as top_search_terms; -- Placeholder
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_db_connections() TO authenticated;
GRANT EXECUTE ON FUNCTION get_job_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_enrichment_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_activity_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_job_trends() TO authenticated;
GRANT EXECUTE ON FUNCTION get_kb_metrics() TO authenticated;

-- Grant execute permissions to service role for API access
GRANT EXECUTE ON FUNCTION get_db_connections() TO service_role;
GRANT EXECUTE ON FUNCTION get_job_metrics() TO service_role;
GRANT EXECUTE ON FUNCTION get_enrichment_metrics() TO service_role;
GRANT EXECUTE ON FUNCTION get_user_activity_metrics() TO service_role;
GRANT EXECUTE ON FUNCTION get_job_trends() TO service_role;
GRANT EXECUTE ON FUNCTION get_kb_metrics() TO service_role;