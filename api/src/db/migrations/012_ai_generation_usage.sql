-- "Describe → flow → designs": monthly usage of AI flow generations and screen designs.
-- One row per user, kind and calendar month, so no reset logic is needed.

CREATE TABLE IF NOT EXISTS ai_generation_usage (
  user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('flow', 'screen_design')),
  period_start DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE)::date,
  count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, kind, period_start)
);
