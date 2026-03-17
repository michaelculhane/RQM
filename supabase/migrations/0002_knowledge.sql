-- ============================================================
-- Knowledge Base
-- ============================================================

CREATE TYPE article_status AS ENUM ('draft', 'published', 'retired');

CREATE TABLE knowledge_articles (
  id           UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT           NOT NULL,
  slug         TEXT           NOT NULL UNIQUE,
  body         TEXT           NOT NULL DEFAULT '',
  status       article_status NOT NULL DEFAULT 'draft',
  category     TEXT,
  author_id    UUID           NOT NULL REFERENCES profiles(id),
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_knowledge_status   ON knowledge_articles(status);
CREATE INDEX idx_knowledge_category ON knowledge_articles(category);

-- Auto-update updated_at on every write
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER knowledge_articles_updated_at
  BEFORE UPDATE ON knowledge_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ka_select_employee" ON knowledge_articles
  FOR SELECT USING (get_my_role() = 'employee' AND status = 'published');

CREATE POLICY "ka_select_hr" ON knowledge_articles
  FOR SELECT USING (get_my_role() IN ('hr_agent', 'hr_admin'));

CREATE POLICY "ka_insert_hr" ON knowledge_articles
  FOR INSERT WITH CHECK (get_my_role() IN ('hr_agent', 'hr_admin') AND author_id = auth.uid());

CREATE POLICY "ka_update_hr" ON knowledge_articles
  FOR UPDATE USING (get_my_role() IN ('hr_agent', 'hr_admin'));
