-- Domain-bound capture tokens and website setup metadata.

ALTER TABLE project_api_tokens
  ADD COLUMN IF NOT EXISTS allowed_origins TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE capture_flow_state
  ADD COLUMN IF NOT EXISTS setup_origin TEXT,
  ADD COLUMN IF NOT EXISTS setup_url TEXT;
