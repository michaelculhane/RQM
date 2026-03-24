-- ============================================================
-- Migration: Introduce tasks as the root table.
-- requests now extends tasks (id is both PK and FK to tasks.id).
-- ============================================================

-- ============================================================
-- 1. Create tasks table
-- ============================================================

CREATE TABLE tasks (
  id          UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
  opened_by   UUID             NOT NULL,
  opened_for  UUID             NOT NULL,
  opened_at   TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  team_id     UUID             NOT NULL,
  status      request_status   NOT NULL DEFAULT 'open',
  priority    request_priority NOT NULL DEFAULT 'medium',
  description TEXT,
  assigned_to UUID,
  closed_at   TIMESTAMPTZ,
  CONSTRAINT tasks_opened_by_fkey   FOREIGN KEY (opened_by)   REFERENCES profiles(id),
  CONSTRAINT tasks_opened_for_fkey  FOREIGN KEY (opened_for)  REFERENCES profiles(id),
  CONSTRAINT tasks_team_id_fkey     FOREIGN KEY (team_id)     REFERENCES teams(id),
  CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES profiles(id)
);

-- ============================================================
-- 2. Copy existing request rows into tasks (same UUIDs)
-- ============================================================

INSERT INTO tasks (id, opened_by, opened_for, opened_at, team_id, status, priority, description, assigned_to, closed_at)
SELECT id, opened_by, opened_for, opened_at, team_id, status, priority, description, assigned_to, closed_at
FROM requests;

-- ============================================================
-- 3. Add FK from requests.id -> tasks.id
--    (must happen AFTER populating tasks so FK check passes)
-- ============================================================

ALTER TABLE requests
  ADD CONSTRAINT requests_task_fkey FOREIGN KEY (id) REFERENCES tasks(id) ON DELETE CASCADE;

-- ============================================================
-- 4. Drop old RLS policies that reference columns being removed
--    (must happen BEFORE dropping those columns)
-- ============================================================

DROP POLICY "requests_select_employee" ON requests;
DROP POLICY "requests_select_agent"    ON requests;
DROP POLICY "requests_select_admin"    ON requests;
DROP POLICY "requests_insert_employee" ON requests;
DROP POLICY "requests_update_hr"       ON requests;

DROP POLICY "hiring_all"    ON requests_hiring;
DROP POLICY "benefits_all"  ON requests_benefits_inquiry;
DROP POLICY "sysaccess_all" ON requests_system_access;
DROP POLICY "address_all"   ON requests_change_of_address;
DROP POLICY "deposit_all"   ON requests_direct_deposit;

DROP POLICY "comments_select_employee" ON comments;
DROP POLICY "comments_select_agent"    ON comments;
DROP POLICY "comments_insert_employee" ON comments;
DROP POLICY "comments_insert_hr"       ON comments;

DROP POLICY "activity_select_employee" ON activity;
DROP POLICY "activity_select_agent"    ON activity;

-- ============================================================
-- 5. Drop columns that moved to tasks
-- ============================================================

ALTER TABLE requests
  DROP COLUMN opened_by,
  DROP COLUMN opened_for,
  DROP COLUMN opened_at,
  DROP COLUMN team_id,
  DROP COLUMN status,
  DROP COLUMN priority,
  DROP COLUMN description,
  DROP COLUMN assigned_to,
  DROP COLUMN closed_at;

-- ============================================================
-- 6. Indexes
-- ============================================================

DROP INDEX IF EXISTS idx_requests_opened_by;
DROP INDEX IF EXISTS idx_requests_team_id;
DROP INDEX IF EXISTS idx_requests_status;

CREATE INDEX idx_tasks_opened_by ON tasks(opened_by);
CREATE INDEX idx_tasks_team_id   ON tasks(team_id);
CREATE INDEX idx_tasks_status    ON tasks(status);
CREATE INDEX idx_tasks_opened_at ON tasks(opened_at);

-- ============================================================
-- 7. RLS on tasks
-- ============================================================

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select_employee" ON tasks FOR SELECT
  USING (get_my_role() = 'employee' AND (opened_by = auth.uid() OR opened_for = auth.uid()));
CREATE POLICY "tasks_select_agent" ON tasks FOR SELECT
  USING (get_my_role() = 'hr_agent' AND team_id = get_my_team_id());
CREATE POLICY "tasks_select_admin" ON tasks FOR SELECT
  USING (get_my_role() = 'hr_admin');
CREATE POLICY "tasks_insert" ON tasks FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "tasks_update_hr" ON tasks FOR UPDATE
  USING (
    get_my_role() IN ('hr_agent', 'hr_admin') AND (
      get_my_role() = 'hr_admin' OR team_id = get_my_team_id()
    )
  );

-- ============================================================
-- 8. New requests RLS (columns moved to tasks)
-- ============================================================

CREATE POLICY "requests_select_employee" ON requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tasks t WHERE t.id = requests.id
    AND get_my_role() = 'employee' AND t.opened_by = auth.uid()
  ));
CREATE POLICY "requests_select_agent" ON requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tasks t WHERE t.id = requests.id
    AND get_my_role() = 'hr_agent' AND t.team_id = get_my_team_id()
  ));
CREATE POLICY "requests_select_admin" ON requests FOR SELECT
  USING (get_my_role() = 'hr_admin');
CREATE POLICY "requests_insert" ON requests FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 9. New child table RLS (reference tasks instead of requests)
-- ============================================================

CREATE POLICY "hiring_all" ON requests_hiring FOR ALL USING (
  EXISTS (SELECT 1 FROM tasks t WHERE t.id = request_id AND (
    (get_my_role() = 'employee' AND t.opened_by = auth.uid()) OR
    (get_my_role() = 'hr_agent' AND t.team_id = get_my_team_id()) OR
    get_my_role() = 'hr_admin'
  ))
);
CREATE POLICY "benefits_all" ON requests_benefits_inquiry FOR ALL USING (
  EXISTS (SELECT 1 FROM tasks t WHERE t.id = request_id AND (
    (get_my_role() = 'employee' AND t.opened_by = auth.uid()) OR
    (get_my_role() = 'hr_agent' AND t.team_id = get_my_team_id()) OR
    get_my_role() = 'hr_admin'
  ))
);
CREATE POLICY "sysaccess_all" ON requests_system_access FOR ALL USING (
  EXISTS (SELECT 1 FROM tasks t WHERE t.id = request_id AND (
    (get_my_role() = 'employee' AND t.opened_by = auth.uid()) OR
    (get_my_role() = 'hr_agent' AND t.team_id = get_my_team_id()) OR
    get_my_role() = 'hr_admin'
  ))
);
CREATE POLICY "address_all" ON requests_change_of_address FOR ALL USING (
  EXISTS (SELECT 1 FROM tasks t WHERE t.id = request_id AND (
    (get_my_role() = 'employee' AND t.opened_by = auth.uid()) OR
    (get_my_role() = 'hr_agent' AND t.team_id = get_my_team_id()) OR
    get_my_role() = 'hr_admin'
  ))
);
CREATE POLICY "deposit_all" ON requests_direct_deposit FOR ALL USING (
  EXISTS (SELECT 1 FROM tasks t WHERE t.id = request_id AND (
    (get_my_role() = 'employee' AND t.opened_by = auth.uid()) OR
    (get_my_role() = 'hr_agent' AND t.team_id = get_my_team_id()) OR
    get_my_role() = 'hr_admin'
  ))
);

-- ============================================================
-- 10. New comments RLS
-- ============================================================

CREATE POLICY "comments_select_employee" ON comments FOR SELECT
  USING (
    get_my_role() = 'employee' AND is_internal = FALSE AND
    EXISTS (SELECT 1 FROM tasks t WHERE t.id = request_id AND t.opened_by = auth.uid())
  );
CREATE POLICY "comments_select_agent" ON comments FOR SELECT
  USING (
    get_my_role() = 'hr_agent' AND
    EXISTS (SELECT 1 FROM tasks t WHERE t.id = request_id AND t.team_id = get_my_team_id())
  );
CREATE POLICY "comments_insert_employee" ON comments FOR INSERT
  WITH CHECK (
    get_my_role() = 'employee' AND author_id = auth.uid() AND is_internal = FALSE AND
    EXISTS (SELECT 1 FROM tasks t WHERE t.id = request_id AND t.opened_by = auth.uid())
  );
CREATE POLICY "comments_insert_hr" ON comments FOR INSERT
  WITH CHECK (
    get_my_role() IN ('hr_agent', 'hr_admin') AND author_id = auth.uid() AND (
      get_my_role() = 'hr_admin' OR
      EXISTS (SELECT 1 FROM tasks t WHERE t.id = request_id AND t.team_id = get_my_team_id())
    )
  );

-- ============================================================
-- 11. New activity RLS
-- ============================================================

CREATE POLICY "activity_select_employee" ON activity FOR SELECT
  USING (
    get_my_role() = 'employee' AND
    EXISTS (SELECT 1 FROM tasks t WHERE t.id = request_id AND t.opened_by = auth.uid())
  );
CREATE POLICY "activity_select_agent" ON activity FOR SELECT
  USING (
    get_my_role() = 'hr_agent' AND
    EXISTS (SELECT 1 FROM tasks t WHERE t.id = request_id AND t.team_id = get_my_team_id())
  );

-- ============================================================
-- 12. Update create_request RPC to insert into tasks first
-- ============================================================

CREATE OR REPLACE FUNCTION create_request(
  p_service_slug TEXT,
  p_description  TEXT,
  p_fields       JSONB
)
RETURNS UUID AS $$
DECLARE
  v_service    services%ROWTYPE;
  v_task_id    UUID;
BEGIN
  SELECT * INTO v_service FROM services WHERE slug = p_service_slug AND enabled = TRUE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Service not found or disabled: %', p_service_slug;
  END IF;

  -- Insert the root task
  INSERT INTO tasks (opened_by, opened_for, team_id, description)
  VALUES (auth.uid(), auth.uid(), v_service.team_id, p_description)
  RETURNING id INTO v_task_id;

  -- Insert the request (service link)
  INSERT INTO requests (id, service_id)
  VALUES (v_task_id, v_service.id);

  -- Audit
  INSERT INTO activity (request_id, actor_id, type)
  VALUES (v_task_id, auth.uid(), 'created');

  -- Insert service-specific detail row
  CASE p_service_slug
    WHEN 'hiring-request' THEN
      INSERT INTO requests_hiring (
        request_id, job_title, department, headcount_type,
        target_start_date, hiring_manager, is_budgeted
      ) VALUES (
        v_task_id,
        p_fields->>'job_title',
        p_fields->>'department',
        (p_fields->>'headcount_type')::headcount_type_enum,
        NULLIF(p_fields->>'target_start_date', '')::DATE,
        p_fields->>'hiring_manager',
        COALESCE((p_fields->>'is_budgeted')::BOOLEAN, FALSE)
      );

    WHEN 'benefits-inquiry' THEN
      INSERT INTO requests_benefits_inquiry (
        request_id, inquiry_type, coverage_type, preferred_contact
      ) VALUES (
        v_task_id,
        (p_fields->>'inquiry_type')::inquiry_type_enum,
        (p_fields->>'coverage_type')::coverage_type_enum,
        p_fields->>'preferred_contact'
      );

    WHEN 'system-access-request' THEN
      INSERT INTO requests_system_access (
        request_id, system_name, access_type, justification, required_by_date
      ) VALUES (
        v_task_id,
        p_fields->>'system_name',
        (p_fields->>'access_type')::access_type_enum,
        p_fields->>'justification',
        NULLIF(p_fields->>'required_by_date', '')::DATE
      );

    WHEN 'change-of-address' THEN
      INSERT INTO requests_change_of_address (
        request_id, address_line1, address_line2, city, province_state, postal_zip, effective_date
      ) VALUES (
        v_task_id,
        p_fields->>'address_line1',
        NULLIF(p_fields->>'address_line2', ''),
        p_fields->>'city',
        p_fields->>'province_state',
        p_fields->>'postal_zip',
        NULLIF(p_fields->>'effective_date', '')::DATE
      );

    WHEN 'direct-deposit-change' THEN
      INSERT INTO requests_direct_deposit (
        request_id, bank_name, account_type, effective_date
      ) VALUES (
        v_task_id,
        p_fields->>'bank_name',
        (p_fields->>'account_type')::account_type_enum,
        NULLIF(p_fields->>'effective_date', '')::DATE
      );

    ELSE
      RAISE EXCEPTION 'Unknown service slug: %', p_service_slug;
  END CASE;

  RETURN v_task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
