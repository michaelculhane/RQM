-- ============================================================
-- Migration: Replace profiles.custom_role_id (single) with
-- profile_roles junction table (many-to-many).
-- ============================================================

-- ============================================================
-- 1. Create profile_roles junction table
-- ============================================================

CREATE TABLE profile_roles (
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id    UUID NOT NULL REFERENCES roles(id)    ON DELETE CASCADE,
  PRIMARY KEY (profile_id, role_id)
);

-- ============================================================
-- 2. Migrate existing single-role assignments
-- ============================================================

INSERT INTO profile_roles (profile_id, role_id)
SELECT id, custom_role_id
FROM profiles
WHERE custom_role_id IS NOT NULL;

-- ============================================================
-- 3. Drop the old single-role column
-- ============================================================

ALTER TABLE profiles DROP COLUMN custom_role_id;

-- ============================================================
-- 4. RLS on profile_roles
-- ============================================================

ALTER TABLE profile_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile_roles_select_hr" ON profile_roles FOR SELECT
  USING (get_my_role() IN ('hr_agent', 'hr_admin'));

CREATE POLICY "profile_roles_insert_admin" ON profile_roles FOR INSERT
  WITH CHECK (get_my_role() = 'hr_admin');

CREATE POLICY "profile_roles_delete_admin" ON profile_roles FOR DELETE
  USING (get_my_role() = 'hr_admin');

-- ============================================================
-- 5. Replace has_task_permission to use profile_roles join
--    and include the opened_by_self criteria from 0005
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
      -- Self criteria: when true, task must have been opened by/for this user
      AND (NOT rp.opened_by_self OR EXISTS (
            SELECT 1 FROM tasks t
            WHERE t.id = p_task_id
              AND (t.opened_by = auth.uid() OR t.opened_for = auth.uid())
          ))
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
