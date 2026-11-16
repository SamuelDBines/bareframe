-- Per-project review notes (distinct from canvas annotation callouts).
CREATE TABLE IF NOT EXISTS project_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  author_user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  frame_id TEXT,
  node_id TEXT,
  page_url TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  converted_to_backlog_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS project_notes_project_idx ON project_notes (project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS project_notes_project_status_idx ON project_notes (project_id, status);
CREATE INDEX IF NOT EXISTS project_notes_frame_idx ON project_notes (project_id, frame_id) WHERE frame_id IS NOT NULL;