-- Render job queue, flow-map jobs, session recordings.

CREATE TABLE render_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  kind TEXT NOT NULL CHECK (kind IN ('screenshot_url', 'render_frame', 'flow_map')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  payload JSONB NOT NULL DEFAULT '{}',
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  locked_by TEXT,
  locked_until TIMESTAMPTZ
);

CREATE INDEX idx_render_jobs_pending ON render_jobs (status, created_at)
  WHERE status = 'pending';

CREATE TABLE flow_map_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  render_job_id UUID REFERENCES render_jobs(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  input JSONB NOT NULL,
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

CREATE INDEX idx_flow_map_jobs_project ON flow_map_jobs (project_id, created_at DESC);

CREATE TABLE audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_map_job_id UUID NOT NULL REFERENCES flow_map_jobs(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  rule_id TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warn', 'error')),
  message TEXT NOT NULL,
  evidence JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_findings_job ON audit_findings (flow_map_job_id);

CREATE TABLE recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Recording',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'uploading', 'ready', 'built', 'failed')),
  viewport JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '90 days'),
  built_page_id TEXT,
  built_version INTEGER
);

CREATE INDEX idx_recordings_project ON recordings (project_id, created_at DESC);
CREATE INDEX idx_recordings_expires ON recordings (expires_at) WHERE status != 'built';

CREATE TABLE recording_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES recordings(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL,
  url TEXT NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL,
  viewport JSONB NOT NULL,
  click JSONB,
  asset_id UUID REFERENCES project_assets(id) ON DELETE SET NULL,
  UNIQUE (recording_id, step_index)
);

CREATE INDEX idx_recording_steps_recording ON recording_steps (recording_id, step_index);
