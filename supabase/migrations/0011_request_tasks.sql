-- ============================================================
-- Request Tasks
-- ============================================================

-- Allow employees to read form templates/fields (needed for task forms)
DROP POLICY IF EXISTS "form_templates_select"       ON form_templates;
DROP POLICY IF EXISTS "form_template_fields_select" ON form_template_fields;

CREATE POLICY "form_templates_select" ON form_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "form_template_fields_select" ON form_template_fields
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- New activity type
ALTER TYPE activity_type_enum ADD VALUE IF NOT EXISTS 'task_completed';

-- ============================================================
-- Tables
-- ============================================================

CREATE TYPE request_task_status AS ENUM ('open', 'completed', 'cancelled');

CREATE TABLE request_tasks (
  id               UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id       UUID                NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  form_template_id UUID                REFERENCES form_templates(id),
  title            TEXT                NOT NULL,
  status           request_task_status NOT NULL DEFAULT 'open',
  assigned_to      UUID                REFERENCES profiles(id),
  due_date         DATE,
  created_by       UUID                REFERENCES profiles(id),
  created_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);

CREATE TABLE request_task_submissions (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id      UUID        NOT NULL REFERENCES request_tasks(id) ON DELETE CASCADE,
  submitted_by UUID        REFERENCES profiles(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  form_values  JSONB       NOT NULL
);

CREATE INDEX idx_request_tasks_request  ON request_tasks(request_id);
CREATE INDEX idx_request_tasks_assigned ON request_tasks(assigned_to);
CREATE INDEX idx_request_tasks_status   ON request_tasks(status);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE request_tasks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_task_submissions ENABLE ROW LEVEL SECURITY;

-- Employees see tasks assigned to them
CREATE POLICY "request_tasks_select_employee" ON request_tasks FOR SELECT
  USING (assigned_to = auth.uid());
-- Agents see tasks on their team's requests
CREATE POLICY "request_tasks_select_agent" ON request_tasks FOR SELECT
  USING (
    get_my_role() = 'hr_agent' AND
    EXISTS (SELECT 1 FROM tasks t WHERE t.id = request_id AND t.team_id = get_my_team_id())
  );
CREATE POLICY "request_tasks_select_admin" ON request_tasks FOR SELECT
  USING (get_my_role() = 'hr_admin');

CREATE POLICY "request_tasks_insert" ON request_tasks FOR INSERT
  WITH CHECK (get_my_role() IN ('hr_agent', 'hr_admin'));
CREATE POLICY "request_tasks_update_hr" ON request_tasks FOR UPDATE
  USING (get_my_role() IN ('hr_agent', 'hr_admin'));
-- Employees can update (via RPC only — SECURITY DEFINER bypasses this, but kept for completeness)
CREATE POLICY "request_tasks_update_employee" ON request_tasks FOR UPDATE
  USING (assigned_to = auth.uid() AND status = 'open');

CREATE POLICY "submissions_select" ON request_task_submissions FOR SELECT
  USING (
    submitted_by = auth.uid() OR
    get_my_role() IN ('hr_agent', 'hr_admin')
  );
CREATE POLICY "submissions_insert" ON request_task_submissions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- RPC: submit_request_task
-- Atomically: saves submission, applies write-backs, marks
-- task completed, logs activity.
-- ============================================================

CREATE OR REPLACE FUNCTION submit_request_task(
  p_task_id     UUID,
  p_form_values JSONB
)
RETURNS VOID AS $$
DECLARE
  v_task    request_tasks%ROWTYPE;
  v_field   form_template_fields%ROWTYPE;
  v_value   TEXT;
  v_mapping JSONB;
BEGIN
  SELECT * INTO v_task FROM request_tasks WHERE id = p_task_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task not found';
  END IF;
  IF v_task.assigned_to != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to submit this task';
  END IF;
  IF v_task.status != 'open' THEN
    RAISE EXCEPTION 'Task is already %', v_task.status;
  END IF;

  -- 1. Save submission
  INSERT INTO request_task_submissions (task_id, submitted_by, form_values)
  VALUES (p_task_id, auth.uid(), p_form_values);

  -- 2. Apply field write-backs to parent request's service table
  IF v_task.form_template_id IS NOT NULL THEN
    FOR v_field IN
      SELECT * FROM form_template_fields
      WHERE form_template_id = v_task.form_template_id
        AND request_field_mapping IS NOT NULL
    LOOP
      v_mapping := v_field.request_field_mapping;
      v_value   := p_form_values->>(v_field.field_name);
      IF v_value IS NOT NULL
        AND v_mapping->>'target_table' IS NOT NULL
        AND v_mapping->>'target_field' IS NOT NULL
      THEN
        EXECUTE format(
          'UPDATE %I SET %I = $1 WHERE request_id = $2',
          v_mapping->>'target_table',
          v_mapping->>'target_field'
        ) USING v_value, v_task.request_id;
      END IF;
    END LOOP;
  END IF;

  -- 3. Mark task completed
  UPDATE request_tasks
  SET status = 'completed', completed_at = NOW()
  WHERE id = p_task_id;

  -- 4. Activity log (visible to employee + assigned agent)
  INSERT INTO activity (request_id, actor_id, type, metadata)
  VALUES (
    v_task.request_id,
    auth.uid(),
    'task_completed',
    jsonb_build_object('task_id', p_task_id, 'task_title', v_task.title)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
