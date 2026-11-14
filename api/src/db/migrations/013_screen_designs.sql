-- AI screen designs, one per screen (flow screen key) and device. The default state is also
-- applied to the screen's page nodes; this keeps every state and the repair notes.

CREATE TABLE IF NOT EXISTS screen_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  screen_key TEXT NOT NULL,
  device TEXT NOT NULL CHECK (device IN ('phone', 'tablet', 'desktop')),
  spec JSONB NOT NULL,
  repairs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by BIGINT REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, screen_key, device)
);
