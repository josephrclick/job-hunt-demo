-- Add default value for jobs.status column
ALTER TABLE jobs 
ALTER COLUMN status SET DEFAULT 'new';

-- Update existing NULL status values to 'new'
UPDATE jobs 
SET status = 'new' 
WHERE status IS NULL;