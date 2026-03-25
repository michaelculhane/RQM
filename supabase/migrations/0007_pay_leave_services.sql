-- ============================================================
-- Pay & Leave Services
-- ============================================================

-- New team
INSERT INTO teams (id, name, slug) VALUES
  ('11111111-1111-1111-1111-000000000005', 'Pay & Leave', 'pay-leave');

-- New services
INSERT INTO services (id, name, slug, team_id, description, enabled) VALUES
  (
    '22222222-2222-2222-2222-000000000006',
    'Compensation Policy Inquiry',
    'compensation-policy-inquiry',
    '11111111-1111-1111-1111-000000000005',
    'Questions about compensation policies.',
    TRUE
  ),
  (
    '22222222-2222-2222-2222-000000000007',
    'Insurance Inquiry',
    'insurance-inquiry',
    '11111111-1111-1111-1111-000000000005',
    'Questions about your insurance coverage.',
    TRUE
  ),
  (
    '22222222-2222-2222-2222-000000000008',
    'Leave Category Review',
    'leave-category-review',
    '11111111-1111-1111-1111-000000000005',
    'Request a review of your leave category.',
    TRUE
  ),
  (
    '22222222-2222-2222-2222-000000000009',
    'Leave Balance Transfer',
    'leave-balance-transfer',
    '11111111-1111-1111-1111-000000000005',
    'Transfer your leave balance. Please attach your SF1150 or last leave and earnings statement.',
    TRUE
  ),
  (
    '22222222-2222-2222-2222-000000000010',
    'Length of Service Awards Status',
    'length-of-service-awards',
    '11111111-1111-1111-1111-000000000005',
    'Check the status of your length of service award.',
    TRUE
  ),
  (
    '22222222-2222-2222-2222-000000000011',
    'Name Change',
    'name-change',
    '11111111-1111-1111-1111-000000000005',
    'Update your last name on file.',
    TRUE
  ),
  (
    '22222222-2222-2222-2222-000000000012',
    'Non-Ratings Based Awards',
    'non-ratings-based-awards',
    '11111111-1111-1111-1111-000000000005',
    'Submit a non-ratings based award nomination. Please attach your completed DI-451 form.',
    TRUE
  ),
  (
    '22222222-2222-2222-2222-000000000013',
    'Paid Parental Leave',
    'paid-parental-leave',
    '11111111-1111-1111-1111-000000000005',
    'Request paid parental leave.',
    TRUE
  ),
  (
    '22222222-2222-2222-2222-000000000014',
    'Pay & Leave General Inquiry',
    'pay-leave-general-inquiry',
    '11111111-1111-1111-1111-000000000005',
    'General questions about pay and leave.',
    TRUE
  ),
  (
    '22222222-2222-2222-2222-000000000015',
    'Reconsideration of Qualifications',
    'reconsideration-of-qualifications',
    '11111111-1111-1111-1111-000000000005',
    'Request a reconsideration of your qualifications determination.',
    TRUE
  ),
  (
    '22222222-2222-2222-2222-000000000016',
    'Voluntary Leave Transfer Program',
    'voluntary-leave-transfer',
    '11111111-1111-1111-1111-000000000005',
    'Apply to or donate leave through the Voluntary Leave Transfer Program.',
    TRUE
  ),
  (
    '22222222-2222-2222-2222-000000000017',
    'Where is my WGI?',
    'where-is-my-wgi',
    '11111111-1111-1111-1111-000000000005',
    'Inquire about the status of your Within Grade Increase.',
    TRUE
  );

-- ============================================================
-- Child tables for services with specific fields
-- ============================================================

CREATE TABLE requests_name_change (
  request_id    UUID  PRIMARY KEY REFERENCES requests(id) ON DELETE CASCADE,
  new_last_name TEXT  NOT NULL
);

CREATE TABLE requests_wgi (
  request_id       UUID  PRIMARY KEY REFERENCES requests(id) ON DELETE CASCADE,
  eligibility_date DATE  NOT NULL
);

ALTER TABLE requests_name_change ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests_wgi         ENABLE ROW LEVEL SECURITY;

-- RLS follows the same pattern as other child tables in 0003_tasks.sql:
-- join through tasks for opened_by / team_id

CREATE POLICY "name_change_all" ON requests_name_change FOR ALL USING (
  EXISTS (SELECT 1 FROM tasks t WHERE t.id = request_id AND (
    (get_my_role() = 'employee' AND t.opened_by = auth.uid()) OR
    (get_my_role() = 'hr_agent' AND t.team_id = get_my_team_id()) OR
    get_my_role() = 'hr_admin'
  ))
);

CREATE POLICY "wgi_all" ON requests_wgi FOR ALL USING (
  EXISTS (SELECT 1 FROM tasks t WHERE t.id = request_id AND (
    (get_my_role() = 'employee' AND t.opened_by = auth.uid()) OR
    (get_my_role() = 'hr_agent' AND t.team_id = get_my_team_id()) OR
    get_my_role() = 'hr_admin'
  ))
);

-- ============================================================
-- Update create_request RPC
-- ============================================================

CREATE OR REPLACE FUNCTION create_request(
  p_service_slug TEXT,
  p_description  TEXT,
  p_fields       JSONB
)
RETURNS UUID AS $$
DECLARE
  v_service  services%ROWTYPE;
  v_task_id  UUID;
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

    WHEN 'name-change' THEN
      INSERT INTO requests_name_change (request_id, new_last_name)
      VALUES (v_task_id, p_fields->>'new_last_name');

    WHEN 'where-is-my-wgi' THEN
      INSERT INTO requests_wgi (request_id, eligibility_date)
      VALUES (v_task_id, (p_fields->>'eligibility_date')::DATE);

    ELSE
      -- Inquiry-type services require no child table; description field is sufficient.
      NULL;
  END CASE;

  RETURN v_task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
