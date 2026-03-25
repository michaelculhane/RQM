CREATE TABLE announcements (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT        NOT NULL,
  body        TEXT,
  image_url   TEXT,
  color_theme TEXT        NOT NULL DEFAULT 'blue',
  cta_label   TEXT,
  cta_url     TEXT,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Employees see active announcements; agents/admins see all (for management)
CREATE POLICY "announcements_select" ON announcements
  FOR SELECT USING (
    (is_active = true AND auth.uid() IS NOT NULL)
    OR get_my_role() IN ('hr_agent', 'hr_admin')
  );

CREATE POLICY "announcements_insert" ON announcements
  FOR INSERT WITH CHECK (get_my_role() = 'hr_admin');

CREATE POLICY "announcements_update" ON announcements
  FOR UPDATE USING (get_my_role() = 'hr_admin');

CREATE POLICY "announcements_delete" ON announcements
  FOR DELETE USING (get_my_role() = 'hr_admin');

-- Sample announcements
INSERT INTO announcements (title, body, color_theme, cta_label, cta_url, sort_order) VALUES
  (
    'Benefits Open Enrollment is Now Open',
    'Annual open enrollment runs through March 31. Review your health, dental, and vision options and make any changes in the HR Portal.',
    'blue',
    'Review Benefits',
    '/services',
    1
  ),
  (
    'Updated Parental Leave Policy',
    'We''ve expanded parental leave to 16 weeks fully paid for all parents. Read the full policy update in our Knowledge Base.',
    'purple',
    'Read the Policy',
    '/knowledge',
    2
  ),
  (
    'Q1 Performance Reviews Due April 15',
    'It''s performance review season. Schedule time with your manager, submit your self-assessment, and set goals for Q2.',
    'green',
    'Get Started',
    '/services',
    3
  );
