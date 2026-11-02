-- Journey review product: plans, reviews, public share links

ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

ALTER TABLE projects ADD COLUMN IF NOT EXISTS share_token_hash TEXT UNIQUE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS user_plan_usage (
  user_id BIGINT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  ai_reviews_this_month INT NOT NULL DEFAULT 0,
  period_start DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE)::date
);

CREATE TABLE IF NOT EXISTS review_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  owner_user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued',
  previous_run_id UUID REFERENCES review_runs (id) ON DELETE SET NULL,
  issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS review_runs_project_idx ON review_runs (project_id, created_at DESC);

CREATE TABLE IF NOT EXISTS url_check_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  owner_user_id BIGINT REFERENCES users (id) ON DELETE SET NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS url_check_log_public_idx ON url_check_log (created_at DESC) WHERE is_public = true;
