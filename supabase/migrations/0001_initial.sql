-- ============================================================
-- HR Ticketing System — Initial Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Enums
-- ============================================================

CREATE TYPE user_role AS ENUM ('employee', 'hr_agent', 'hr_admin');
CREATE TYPE request_status AS ENUM ('open', 'in_progress', 'pending_employee', 'resolved', 'closed');
CREATE TYPE request_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE headcount_type_enum AS ENUM ('Backfill', 'New');
CREATE TYPE inquiry_type_enum AS ENUM ('Enrollment', 'Coverage question', 'Dependent change', 'Other');
CREATE TYPE coverage_type_enum AS ENUM ('Medical', 'Dental', 'Vision', 'All');
CREATE TYPE access_type_enum AS ENUM ('New access', 'Modify', 'Remove');
CREATE TYPE account_type_enum AS ENUM ('Chequing', 'Savings');
CREATE TYPE activity_type_enum AS ENUM ('status_change', 'assignment', 'priority_change', 'comment_public', 'comment_internal', 'created');

-- ============================================================
-- Tables
-- ============================================================

CREATE TABLE teams (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT         NOT NULL,
  slug        TEXT         NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE services (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT         NOT NULL,
  slug        TEXT         NOT NULL UNIQUE,
  team_id     UUID         NOT NULL REFERENCES teams(id),
  description TEXT,
  enabled     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE profiles (
  id          UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT         NOT NULL,
  full_name   TEXT         NOT NULL,
  role        user_role    NOT NULL DEFAULT 'employee',
  team_id     UUID         REFERENCES teams(id),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE requests (
  id          UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
  opened_by   UUID             NOT NULL REFERENCES profiles(id),
  opened_for  UUID             NOT NULL REFERENCES profiles(id),
  opened_at   TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  service_id  UUID             NOT NULL REFERENCES services(id),
  team_id     UUID             NOT NULL REFERENCES teams(id),
  status      request_status   NOT NULL DEFAULT 'open',
  priority    request_priority NOT NULL DEFAULT 'medium',
  description TEXT,
  assigned_to UUID             REFERENCES profiles(id),
  closed_at   TIMESTAMPTZ
);

CREATE TABLE requests_hiring (
  request_id       UUID                PRIMARY KEY REFERENCES requests(id) ON DELETE CASCADE,
  job_title        TEXT                NOT NULL,
  department       TEXT                NOT NULL,
  headcount_type   headcount_type_enum NOT NULL,
  target_start_date DATE,
  hiring_manager   TEXT,
  is_budgeted      BOOLEAN             NOT NULL DEFAULT FALSE
);

CREATE TABLE requests_benefits_inquiry (
  request_id        UUID                 PRIMARY KEY REFERENCES requests(id) ON DELETE CASCADE,
  inquiry_type      inquiry_type_enum    NOT NULL,
  coverage_type     coverage_type_enum   NOT NULL,
  preferred_contact TEXT                 NOT NULL
);

CREATE TABLE requests_system_access (
  request_id       UUID              PRIMARY KEY REFERENCES requests(id) ON DELETE CASCADE,
  system_name      TEXT              NOT NULL,
  access_type      access_type_enum  NOT NULL,
  justification    TEXT              NOT NULL,
  required_by_date DATE
);

CREATE TABLE requests_change_of_address (
  request_id     UUID  PRIMARY KEY REFERENCES requests(id) ON DELETE CASCADE,
  address_line1  TEXT  NOT NULL,
  address_line2  TEXT,
  city           TEXT  NOT NULL,
  province_state TEXT  NOT NULL,
  postal_zip     TEXT  NOT NULL,
  effective_date DATE
);

CREATE TABLE requests_direct_deposit (
  request_id     UUID               PRIMARY KEY REFERENCES requests(id) ON DELETE CASCADE,
  bank_name      TEXT               NOT NULL,
  account_type   account_type_enum  NOT NULL,
  effective_date DATE
);

CREATE TABLE comments (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id  UUID         NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  author_id   UUID         NOT NULL REFERENCES profiles(id),
  body        TEXT         NOT NULL,
  is_internal BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE activity (
  id          UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id  UUID               NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  actor_id    UUID               REFERENCES profiles(id),
  type        activity_type_enum NOT NULL,
  metadata    JSONB,
  created_at  TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_requests_opened_by ON requests(opened_by);
CREATE INDEX idx_requests_team_id   ON requests(team_id);
CREATE INDEX idx_requests_status    ON requests(status);
CREATE INDEX idx_comments_request_id ON comments(request_id);
CREATE INDEX idx_activity_request_id ON activity(request_id);

-- ============================================================
-- Helper Functions
-- ============================================================

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_my_team_id()
RETURNS UUID AS $$
  SELECT team_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- Auto-create profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- RPC: create_request (atomic root + child insert)
-- ============================================================

CREATE OR REPLACE FUNCTION create_request(
  p_service_slug TEXT,
  p_description  TEXT,
  p_fields       JSONB
)
RETURNS UUID AS $$
DECLARE
  v_service    services%ROWTYPE;
  v_request_id UUID;
BEGIN
  SELECT * INTO v_service FROM services WHERE slug = p_service_slug AND enabled = TRUE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Service not found or disabled: %', p_service_slug;
  END IF;

  INSERT INTO requests (opened_by, opened_for, service_id, team_id, description)
  VALUES (auth.uid(), auth.uid(), v_service.id, v_service.team_id, p_description)
  RETURNING id INTO v_request_id;

  INSERT INTO activity (request_id, actor_id, type)
  VALUES (v_request_id, auth.uid(), 'created');

  CASE p_service_slug
    WHEN 'hiring-request' THEN
      INSERT INTO requests_hiring (
        request_id, job_title, department, headcount_type,
        target_start_date, hiring_manager, is_budgeted
      ) VALUES (
        v_request_id,
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
        v_request_id,
        (p_fields->>'inquiry_type')::inquiry_type_enum,
        (p_fields->>'coverage_type')::coverage_type_enum,
        p_fields->>'preferred_contact'
      );

    WHEN 'system-access-request' THEN
      INSERT INTO requests_system_access (
        request_id, system_name, access_type, justification, required_by_date
      ) VALUES (
        v_request_id,
        p_fields->>'system_name',
        (p_fields->>'access_type')::access_type_enum,
        p_fields->>'justification',
        NULLIF(p_fields->>'required_by_date', '')::DATE
      );

    WHEN 'change-of-address' THEN
      INSERT INTO requests_change_of_address (
        request_id, address_line1, address_line2, city, province_state, postal_zip, effective_date
      ) VALUES (
        v_request_id,
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
        v_request_id,
        p_fields->>'bank_name',
        (p_fields->>'account_type')::account_type_enum,
        NULLIF(p_fields->>'effective_date', '')::DATE
      );

    ELSE
      RAISE EXCEPTION 'Unknown service slug: %', p_service_slug;
  END CASE;

  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE services              ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests              ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests_hiring       ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests_benefits_inquiry ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests_system_access    ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests_change_of_address ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests_direct_deposit   ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity              ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_own"  ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_select_hr"   ON profiles FOR SELECT USING (get_my_role() IN ('hr_agent', 'hr_admin'));
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE USING (get_my_role() = 'hr_admin');
CREATE POLICY "profiles_insert_self" ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- teams (read-only for authenticated users)
CREATE POLICY "teams_select" ON teams FOR SELECT USING (auth.uid() IS NOT NULL);

-- services
CREATE POLICY "services_select" ON services FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "services_update_admin" ON services FOR UPDATE USING (get_my_role() = 'hr_admin');

-- requests
CREATE POLICY "requests_select_employee" ON requests FOR SELECT
  USING (get_my_role() = 'employee' AND opened_by = auth.uid());
CREATE POLICY "requests_select_agent" ON requests FOR SELECT
  USING (get_my_role() = 'hr_agent' AND team_id = get_my_team_id());
CREATE POLICY "requests_select_admin" ON requests FOR SELECT
  USING (get_my_role() = 'hr_admin');
CREATE POLICY "requests_insert_employee" ON requests FOR INSERT
  WITH CHECK (get_my_role() = 'employee' AND opened_by = auth.uid());
CREATE POLICY "requests_update_hr" ON requests FOR UPDATE
  USING (
    get_my_role() IN ('hr_agent', 'hr_admin') AND (
      get_my_role() = 'hr_admin' OR team_id = get_my_team_id()
    )
  );

-- child tables (helper macro via EXISTS on parent)
CREATE POLICY "hiring_all" ON requests_hiring FOR ALL USING (
  EXISTS (SELECT 1 FROM requests r WHERE r.id = request_id AND (
    (get_my_role() = 'employee' AND r.opened_by = auth.uid()) OR
    (get_my_role() = 'hr_agent'  AND r.team_id = get_my_team_id()) OR
    get_my_role() = 'hr_admin'
  ))
);
CREATE POLICY "benefits_all" ON requests_benefits_inquiry FOR ALL USING (
  EXISTS (SELECT 1 FROM requests r WHERE r.id = request_id AND (
    (get_my_role() = 'employee' AND r.opened_by = auth.uid()) OR
    (get_my_role() = 'hr_agent'  AND r.team_id = get_my_team_id()) OR
    get_my_role() = 'hr_admin'
  ))
);
CREATE POLICY "sysaccess_all" ON requests_system_access FOR ALL USING (
  EXISTS (SELECT 1 FROM requests r WHERE r.id = request_id AND (
    (get_my_role() = 'employee' AND r.opened_by = auth.uid()) OR
    (get_my_role() = 'hr_agent'  AND r.team_id = get_my_team_id()) OR
    get_my_role() = 'hr_admin'
  ))
);
CREATE POLICY "address_all" ON requests_change_of_address FOR ALL USING (
  EXISTS (SELECT 1 FROM requests r WHERE r.id = request_id AND (
    (get_my_role() = 'employee' AND r.opened_by = auth.uid()) OR
    (get_my_role() = 'hr_agent'  AND r.team_id = get_my_team_id()) OR
    get_my_role() = 'hr_admin'
  ))
);
CREATE POLICY "deposit_all" ON requests_direct_deposit FOR ALL USING (
  EXISTS (SELECT 1 FROM requests r WHERE r.id = request_id AND (
    (get_my_role() = 'employee' AND r.opened_by = auth.uid()) OR
    (get_my_role() = 'hr_agent'  AND r.team_id = get_my_team_id()) OR
    get_my_role() = 'hr_admin'
  ))
);

-- comments
CREATE POLICY "comments_select_employee" ON comments FOR SELECT
  USING (
    get_my_role() = 'employee' AND is_internal = FALSE AND
    EXISTS (SELECT 1 FROM requests r WHERE r.id = request_id AND r.opened_by = auth.uid())
  );
CREATE POLICY "comments_select_agent" ON comments FOR SELECT
  USING (
    get_my_role() = 'hr_agent' AND
    EXISTS (SELECT 1 FROM requests r WHERE r.id = request_id AND r.team_id = get_my_team_id())
  );
CREATE POLICY "comments_select_admin" ON comments FOR SELECT
  USING (get_my_role() = 'hr_admin');
CREATE POLICY "comments_insert_employee" ON comments FOR INSERT
  WITH CHECK (
    get_my_role() = 'employee' AND author_id = auth.uid() AND is_internal = FALSE AND
    EXISTS (SELECT 1 FROM requests r WHERE r.id = request_id AND r.opened_by = auth.uid())
  );
CREATE POLICY "comments_insert_hr" ON comments FOR INSERT
  WITH CHECK (
    get_my_role() IN ('hr_agent', 'hr_admin') AND author_id = auth.uid() AND (
      get_my_role() = 'hr_admin' OR
      EXISTS (SELECT 1 FROM requests r WHERE r.id = request_id AND r.team_id = get_my_team_id())
    )
  );

-- activity
CREATE POLICY "activity_select_employee" ON activity FOR SELECT
  USING (
    get_my_role() = 'employee' AND
    EXISTS (SELECT 1 FROM requests r WHERE r.id = request_id AND r.opened_by = auth.uid())
  );
CREATE POLICY "activity_select_agent" ON activity FOR SELECT
  USING (
    get_my_role() = 'hr_agent' AND
    EXISTS (SELECT 1 FROM requests r WHERE r.id = request_id AND r.team_id = get_my_team_id())
  );
CREATE POLICY "activity_select_admin" ON activity FOR SELECT
  USING (get_my_role() = 'hr_admin');
CREATE POLICY "activity_insert" ON activity FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
