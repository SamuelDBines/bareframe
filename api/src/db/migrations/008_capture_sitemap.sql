-- App capture ingest + token provenance

ALTER TABLE project_api_tokens
  ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS capture_events (
  id BIGSERIAL PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  asset_id UUID REFERENCES project_assets(id) ON DELETE SET NULL,
  viewport JSONB,
  clicked_selector TEXT,
  navigated_from TEXT,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_capture_events_project ON capture_events(project_id);
CREATE INDEX IF NOT EXISTS idx_capture_events_project_url ON capture_events(project_id, url);

CREATE TABLE IF NOT EXISTS capture_flow_state (
  project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  page_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
