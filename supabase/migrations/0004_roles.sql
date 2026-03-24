-- ============================================================
-- Migration: RBAC — custom roles with criteria-based permissions
-- ============================================================

-- ============================================================
-- 1. roles table
-- ============================================================

CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. team_roles: associate roles with teams (organizational grouping)
-- ============================================================

CREATE TABLE team_roles (
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (team_id, role_id)
);

-- ============================================================
-- 3. role_permissions: per-role CRUD grants with optional criteria
--    status_in    — NULL = any status; otherwise task.status must be in the array
--    service_slug — NULL = any service; otherwise task's service slug must match
-- ============================================================

CREATE TABLE role_permissions (
  id           UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id      UUID    NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  table_name   TEXT    NOT NULL,
  can_read     BOOLEAN NOT NULL DEFAULT FALSE,
  can_create   BOOLEAN NOT NULL DEFAULT FALSE,
  can_update   BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete   BOOLEAN NOT NULL DEFAULT FALSE,
  status_in    TEXT[],  -- NULL = any status
  service_slug TEXT     -- NULL = any service
);

-- ============================================================
-- 4. profile_roles: assign one or more custom roles to a user
-- ============================================================

CREATE TABLE profile_roles (
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id    UUID NOT NULL REFERENCES roles(id)    ON DELETE CASCADE,
  PRIMARY KEY (profile_id, role_id)
);

-- ============================================================
-- 5. RLS on roles
-- ============================================================

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roles_select_hr" ON roles FOR SELECT
  USING (get_my_role() IN ('hr_agent', 'hr_admin'));

CREATE POLICY "roles_insert_admin" ON roles FOR INSERT
  WITH CHECK (get_my_role() = 'hr_admin');

CREATE POLICY "roles_update_admin" ON roles FOR UPDATE
  USING  (get_my_role() = 'hr_admin')
  WITH CHECK (get_my_role() = 'hr_admin');

CREATE POLICY "roles_delete_admin" ON roles FOR DELETE
  USING (get_my_role() = 'hr_admin');

-- ============================================================
-- 6. RLS on team_roles
-- ============================================================

ALTER TABLE team_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_roles_select_hr" ON team_roles FOR SELECT
  USING (get_my_role() IN ('hr_agent', 'hr_admin'));

CREATE POLICY "team_roles_insert_admin" ON team_roles FOR INSERT
  WITH CHECK (get_my_role() = 'hr_admin');

CREATE POLICY "team_roles_delete_admin" ON team_roles FOR DELETE
  USING (get_my_role() = 'hr_admin');

-- ============================================================
-- 7. RLS on role_permissions
-- ============================================================

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "role_permissions_select_hr" ON role_permissions FOR SELECT
  USING (get_my_role() IN ('hr_agent', 'hr_admin'));

CREATE POLICY "role_permissions_insert_admin" ON role_permissions FOR INSERT
  WITH CHECK (get_my_role() = 'hr_admin');

CREATE POLICY "role_permissions_update_admin" ON role_permissions FOR UPDATE
  USING  (get_my_role() = 'hr_admin')
  WITH CHECK (get_my_role() = 'hr_admin');

CREATE POLICY "role_permissions_delete_admin" ON role_permissions FOR DELETE
  USING (get_my_role() = 'hr_admin');

-- ============================================================
-- 8. RLS on profile_roles
-- ============================================================

ALTER TABLE profile_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile_roles_select_hr" ON profile_roles FOR SELECT
  USING (get_my_role() IN ('hr_agent', 'hr_admin'));

CREATE POLICY "profile_roles_insert_admin" ON profile_roles FOR INSERT
  WITH CHECK (get_my_role() = 'hr_admin');

CREATE POLICY "profile_roles_delete_admin" ON profile_roles FOR DELETE
  USING (get_my_role() = 'hr_admin');

-- ============================================================
-- 9. Helper: check whether the current user has any custom role
--    that permits a given operation on a specific task row.
--    Joins profile_roles → role_permissions to support multiple roles.
--    SECURITY DEFINER bypasses RLS on referenced tables.
-- ============================================================

CREATE OR REPLACE FUNCTION has_task_permission(p_task_id UUID, p_op TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profile_roles     pr
    JOIN role_permissions  rp ON rp.role_id = pr.role_id
    WHERE pr.profile_id = auth.uid()
      AND rp.table_name = 'tasks'
      AND CASE p_op
            WHEN 'read'   THEN rp.can_read
            WHEN 'create' THEN rp.can_create
            WHEN 'update' THEN rp.can_update
            WHEN 'delete' THEN rp.can_delete
            ELSE FALSE
          END
      -- Status criteria: NULL = any status
      AND (rp.status_in IS NULL OR EXISTS (
            SELECT 1 FROM tasks t
            WHERE t.id = p_task_id
              AND t.status::TEXT = ANY(rp.status_in)
          ))
      -- Service criteria: NULL = any service
      AND (rp.service_slug IS NULL OR EXISTS (
            SELECT 1 FROM requests r
            JOIN services s ON s.id = r.service_id
            WHERE r.id = p_task_id
              AND s.slug = rp.service_slug
          ))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- 10. Additive RLS policies on tasks for custom-role users
--     (existing employee / hr_agent / hr_admin policies remain)
-- ============================================================

CREATE POLICY "tasks_select_custom_role" ON tasks FOR SELECT
  USING (has_task_permission(id, 'read'));

CREATE POLICY "tasks_update_custom_role" ON tasks FOR UPDATE
  USING (has_task_permission(id, 'update'));
