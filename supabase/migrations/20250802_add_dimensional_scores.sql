-- Add dimensional scores to job_enrichments table
-- These scores provide multi-dimensional evaluation of job opportunities

BEGIN;

-- Add dimensional score columns
ALTER TABLE job_enrichments
ADD COLUMN IF NOT EXISTS compensation_competitiveness_score INTEGER CHECK (compensation_competitiveness_score >= 0 AND compensation_competitiveness_score <= 100),
ADD COLUMN IF NOT EXISTS growth_opportunity_score INTEGER CHECK (growth_opportunity_score >= 0 AND growth_opportunity_score <= 100),
ADD COLUMN IF NOT EXISTS tech_innovation_score INTEGER CHECK (tech_innovation_score >= 0 AND tech_innovation_score <= 100),
ADD COLUMN IF NOT EXISTS team_culture_score INTEGER CHECK (team_culture_score >= 0 AND team_culture_score <= 100),
ADD COLUMN IF NOT EXISTS work_life_balance_score INTEGER CHECK (work_life_balance_score >= 0 AND work_life_balance_score <= 100),
ADD COLUMN IF NOT EXISTS location_flexibility_score INTEGER CHECK (location_flexibility_score >= 0 AND location_flexibility_score <= 100);

-- Add comments for documentation
COMMENT ON COLUMN job_enrichments.compensation_competitiveness_score IS 'Compensation competitiveness score (0-100) relative to market rates and user expectations';
COMMENT ON COLUMN job_enrichments.growth_opportunity_score IS 'Career growth and learning opportunity score (0-100)';
COMMENT ON COLUMN job_enrichments.tech_innovation_score IS 'Technology stack modernity and innovation score (0-100)';
COMMENT ON COLUMN job_enrichments.team_culture_score IS 'Team culture and collaboration score (0-100)';
COMMENT ON COLUMN job_enrichments.work_life_balance_score IS 'Work-life balance indicators score (0-100)';
COMMENT ON COLUMN job_enrichments.location_flexibility_score IS 'Location and remote work flexibility score (0-100)';

-- Add indexes for performance on all dimensional scores
-- Following Supabase best practice: index columns used in filters, ORDER BY, or aggregations
CREATE INDEX IF NOT EXISTS idx_job_enrichments_comp_score ON job_enrichments(compensation_competitiveness_score);
CREATE INDEX IF NOT EXISTS idx_job_enrichments_growth_score ON job_enrichments(growth_opportunity_score);
CREATE INDEX IF NOT EXISTS idx_job_enrichments_tech_score ON job_enrichments(tech_innovation_score);
CREATE INDEX IF NOT EXISTS idx_job_enrichments_culture_score ON job_enrichments(team_culture_score);
CREATE INDEX IF NOT EXISTS idx_job_enrichments_wlb_score ON job_enrichments(work_life_balance_score);
CREATE INDEX IF NOT EXISTS idx_job_enrichments_location_score ON job_enrichments(location_flexibility_score);

-- Composite index for common multi-dimensional queries
CREATE INDEX IF NOT EXISTS idx_job_enrichments_all_scores ON job_enrichments(
  compensation_competitiveness_score,
  growth_opportunity_score,
  tech_innovation_score,
  team_culture_score,
  work_life_balance_score,
  location_flexibility_score
);

COMMIT;