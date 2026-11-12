ALTER TABLE users ADD COLUMN IF NOT EXISTS github_oauth_access_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_oauth_scopes TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_oauth_updated_at TIMESTAMPTZ;
