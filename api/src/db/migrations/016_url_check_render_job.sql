ALTER TABLE render_jobs DROP CONSTRAINT IF EXISTS render_jobs_kind_check;
ALTER TABLE render_jobs ADD CONSTRAINT render_jobs_kind_check
  CHECK (kind IN ('screenshot_url', 'render_frame', 'flow_map', 'url_check'));