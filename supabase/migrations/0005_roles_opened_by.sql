-- ============================================================
-- Migration: Add opened_by_self criteria to role_permissions.
-- When true, a permission rule only applies to tasks the current
-- user opened (or was opened for) — enabling "see your own requests."
-- ============================================================

ALTER TABLE role_permissions
  ADD COLUMN opened_by_self BOOLEAN NOT NULL DEFAULT FALSE;
