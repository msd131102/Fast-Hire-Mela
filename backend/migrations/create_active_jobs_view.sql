-- Create a view for visible jobs with user activity check
-- This eliminates the need to repeat WHERE conditions in every query
-- This is the single source of truth for job visibility

CREATE OR REPLACE VIEW visible_jobs AS
SELECT
  j.*
FROM jobs j
LEFT JOIN app_users u ON j.posted_by = u.id
WHERE
  j.is_active = true
  AND (j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP)
  AND (
    j.posted_by IS NULL        -- system/admin jobs
    OR u.is_active = true     -- only active posters
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON jobs(posted_by);
CREATE INDEX IF NOT EXISTS idx_users_active ON app_users(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_expiry ON jobs(expires_at);
