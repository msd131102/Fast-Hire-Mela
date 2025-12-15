-- Add posted_by column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS posted_by INTEGER REFERENCES app_users(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON jobs(posted_by);
