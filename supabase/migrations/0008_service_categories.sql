-- ============================================================
-- Service Categories
-- ============================================================

CREATE TABLE categories (
  id         UUID  PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT  NOT NULL,
  slug       TEXT  NOT NULL UNIQUE,
  sort_order INT   NOT NULL DEFAULT 0
);

ALTER TABLE services
  ADD COLUMN category_id UUID REFERENCES categories(id);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_select" ON categories FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================================
-- Seed categories
-- ============================================================

INSERT INTO categories (id, name, slug, sort_order) VALUES
  ('33333333-3333-3333-3333-000000000001', 'Compensation',    'compensation',    1),
  ('33333333-3333-3333-3333-000000000002', 'Leave Programs',  'leave-programs',  2),
  ('33333333-3333-3333-3333-000000000003', 'HR Systems',      'hr-systems',      3);

-- ============================================================
-- Assign existing services to categories
-- ============================================================

-- Compensation
UPDATE services SET category_id = '33333333-3333-3333-3333-000000000001'
WHERE slug IN (
  'hiring-request',
  'benefits-inquiry',
  'insurance-inquiry',
  'compensation-policy-inquiry',
  'length-of-service-awards',
  'non-ratings-based-awards',
  'reconsideration-of-qualifications',
  'where-is-my-wgi'
);

-- Leave Programs
UPDATE services SET category_id = '33333333-3333-3333-3333-000000000002'
WHERE slug IN (
  'leave-balance-transfer',
  'leave-category-review',
  'paid-parental-leave',
  'pay-leave-general-inquiry',
  'voluntary-leave-transfer'
);

-- HR Systems
UPDATE services SET category_id = '33333333-3333-3333-3333-000000000003'
WHERE slug IN (
  'system-access-request',
  'direct-deposit-change',
  'change-of-address',
  'name-change'
);
