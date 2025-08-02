-- ===================================================================
-- CHAT SYSTEM MIGRATION
-- Add AI chat functionality with rate limiting and RAG support
-- ===================================================================

-- Chat usage tracking table
CREATE TABLE user_chat_usage (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  daily_requests INTEGER DEFAULT 0,
  hourly_requests INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  last_hour_reset TIMESTAMPTZ DEFAULT NOW(),
  total_tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE user_chat_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat usage" ON user_chat_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_user_chat_usage_user_id ON user_chat_usage(user_id);
CREATE INDEX idx_user_chat_usage_resets ON user_chat_usage(last_reset_date, last_hour_reset);

-- Function to search embeddings using pgvector (enhanced version of existing match_chunks)
CREATE OR REPLACE FUNCTION search_embeddings(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE(
  content text,
  similarity float,
  entity_id text,
  source_type text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb_embeddings.content,
    1 - (kb_embeddings.embedding <=> query_embedding) AS similarity,
    kb_embeddings.entity_id::text,
    kb_embeddings.metadata->>'source_type' AS source_type
  FROM kb_embeddings
  WHERE 1 - (kb_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Function to update chat usage
CREATE OR REPLACE FUNCTION update_chat_usage(
  p_user_id uuid,
  p_tokens_used integer
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO user_chat_usage (
    user_id, 
    daily_requests, 
    hourly_requests, 
    total_tokens_used,
    last_reset_date,
    last_hour_reset
  )
  VALUES (
    p_user_id, 
    1, 
    1, 
    p_tokens_used,
    CURRENT_DATE,
    date_trunc('hour', NOW())
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    daily_requests = CASE 
      WHEN user_chat_usage.last_reset_date < CURRENT_DATE 
      THEN 1 
      ELSE user_chat_usage.daily_requests + 1 
    END,
    hourly_requests = CASE 
      WHEN user_chat_usage.last_hour_reset < date_trunc('hour', NOW())
      THEN 1 
      ELSE user_chat_usage.hourly_requests + 1 
    END,
    total_tokens_used = user_chat_usage.total_tokens_used + p_tokens_used,
    last_reset_date = CURRENT_DATE,
    last_hour_reset = GREATEST(user_chat_usage.last_hour_reset, date_trunc('hour', NOW())),
    updated_at = NOW();
END;
$$;

-- Update trigger for user_chat_usage
CREATE TRIGGER update_user_chat_usage_updated_at
  BEFORE UPDATE ON user_chat_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE user_chat_usage IS 'Rate limiting and usage tracking for AI chat functionality';
COMMENT ON FUNCTION search_embeddings IS 'Vector similarity search for RAG context retrieval';
COMMENT ON FUNCTION update_chat_usage IS 'Atomic update of user chat usage counters with automatic resets';