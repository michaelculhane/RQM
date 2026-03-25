-- ============================================================
-- Request Task Form Templates
-- ============================================================

CREATE TYPE form_field_type AS ENUM ('text', 'textarea', 'date', 'select', 'checkbox', 'file');

CREATE TABLE form_templates (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT         NOT NULL,
  description TEXT,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_by  UUID         REFERENCES profiles(id),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE form_template_fields (
  id                    UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_template_id      UUID             NOT NULL REFERENCES form_templates(id) ON DELETE CASCADE,
  field_name            TEXT             NOT NULL,
  label                 TEXT             NOT NULL,
  field_type            form_field_type  NOT NULL DEFAULT 'text',
  options               JSONB,
  is_required           BOOLEAN          NOT NULL DEFAULT FALSE,
  is_pii                BOOLEAN          NOT NULL DEFAULT FALSE,
  display_order         INT              NOT NULL DEFAULT 0,
  request_field_mapping JSONB
);

CREATE INDEX idx_form_template_fields_template ON form_template_fields(form_template_id);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE form_templates       ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_template_fields ENABLE ROW LEVEL SECURITY;

-- All HR staff can read; only admins can write
CREATE POLICY "form_templates_select" ON form_templates
  FOR SELECT USING (get_my_role() IN ('hr_agent', 'hr_admin'));
CREATE POLICY "form_templates_insert" ON form_templates
  FOR INSERT WITH CHECK (get_my_role() = 'hr_admin');
CREATE POLICY "form_templates_update" ON form_templates
  FOR UPDATE USING (get_my_role() = 'hr_admin');
CREATE POLICY "form_templates_delete" ON form_templates
  FOR DELETE USING (get_my_role() = 'hr_admin');

CREATE POLICY "form_template_fields_select" ON form_template_fields
  FOR SELECT USING (get_my_role() IN ('hr_agent', 'hr_admin'));
CREATE POLICY "form_template_fields_insert" ON form_template_fields
  FOR INSERT WITH CHECK (get_my_role() = 'hr_admin');
CREATE POLICY "form_template_fields_update" ON form_template_fields
  FOR UPDATE USING (get_my_role() = 'hr_admin');
CREATE POLICY "form_template_fields_delete" ON form_template_fields
  FOR DELETE USING (get_my_role() = 'hr_admin');
