-- Product packages (Bareframe core paid product output)
CREATE TABLE IF NOT EXISTS product_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  revision INT NOT NULL DEFAULT 0,
  document JSONB NOT NULL,
  designer_project_id UUID REFERENCES projects (id) ON DELETE SET NULL,
  share_token_hash TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS product_packages_owner_idx ON product_packages (owner_user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS package_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  package_id UUID REFERENCES product_packages (id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  stage TEXT,
  progress JSONB NOT NULL DEFAULT '{}'::jsonb,
  intake JSONB NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS package_generation_jobs_owner_idx ON package_generation_jobs (owner_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS user_package_usage (
  user_id BIGINT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  packages_this_month INT NOT NULL DEFAULT 0,
  period_start DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE)::date
);
