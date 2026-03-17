-- ============================================================
-- HR Ticketing Demo — Seed Data
-- Run this in the Supabase SQL Editor AFTER applying migrations.
-- Password for all demo accounts: Demo1234!
-- ============================================================

-- ============================================================
-- 1. Teams
-- ============================================================

INSERT INTO teams (id, name, slug) VALUES
  ('11111111-1111-1111-1111-000000000001', 'Operations',  'operations'),
  ('11111111-1111-1111-1111-000000000002', 'Benefits',    'benefits'),
  ('11111111-1111-1111-1111-000000000003', 'HR Systems',  'hr-systems'),
  ('11111111-1111-1111-1111-000000000004', 'Processing',  'processing');

-- ============================================================
-- 2. Services
-- ============================================================

INSERT INTO services (id, name, slug, team_id, description, enabled) VALUES
  (
    '22222222-2222-2222-2222-000000000001',
    'Hiring Request',
    'hiring-request',
    '11111111-1111-1111-1111-000000000001',
    'Submit a request to open a new or backfill position.',
    TRUE
  ),
  (
    '22222222-2222-2222-2222-000000000002',
    'Benefits Inquiry',
    'benefits-inquiry',
    '11111111-1111-1111-1111-000000000002',
    'Questions about enrollment, coverage, dependents, or other benefits topics.',
    TRUE
  ),
  (
    '22222222-2222-2222-2222-000000000003',
    'System Access Request',
    'system-access-request',
    '11111111-1111-1111-1111-000000000003',
    'Request new access, modifications, or removal of system permissions.',
    TRUE
  ),
  (
    '22222222-2222-2222-2222-000000000004',
    'Change of Address',
    'change-of-address',
    '11111111-1111-1111-1111-000000000004',
    'Update your home address on file.',
    TRUE
  ),
  (
    '22222222-2222-2222-2222-000000000005',
    'Direct Deposit Change',
    'direct-deposit-change',
    '11111111-1111-1111-1111-000000000004',
    'Update your direct deposit banking information.',
    TRUE
  );

-- ============================================================
-- 3. Auth Users (creates profiles via trigger)
--    All passwords: Demo1234!
-- ============================================================

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
    'authenticated', 'authenticated',
    'alice@demo.com',
    crypt('Demo1234!', gen_salt('bf')),
    NOW(), '{"full_name": "Alice Employee"}',
    NOW(), NOW(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'aaaaaaaa-aaaa-aaaa-aaaa-000000000002',
    'authenticated', 'authenticated',
    'bob@demo.com',
    crypt('Demo1234!', gen_salt('bf')),
    NOW(), '{"full_name": "Bob Agent"}',
    NOW(), NOW(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'aaaaaaaa-aaaa-aaaa-aaaa-000000000003',
    'authenticated', 'authenticated',
    'carol@demo.com',
    crypt('Demo1234!', gen_salt('bf')),
    NOW(), '{"full_name": "Carol Agent"}',
    NOW(), NOW(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'aaaaaaaa-aaaa-aaaa-aaaa-000000000004',
    'authenticated', 'authenticated',
    'dave@demo.com',
    crypt('Demo1234!', gen_salt('bf')),
    NOW(), '{"full_name": "Dave Agent"}',
    NOW(), NOW(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'aaaaaaaa-aaaa-aaaa-aaaa-000000000005',
    'authenticated', 'authenticated',
    'eve@demo.com',
    crypt('Demo1234!', gen_salt('bf')),
    NOW(), '{"full_name": "Eve Agent"}',
    NOW(), NOW(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'aaaaaaaa-aaaa-aaaa-aaaa-000000000006',
    'authenticated', 'authenticated',
    'frank@demo.com',
    crypt('Demo1234!', gen_salt('bf')),
    NOW(), '{"full_name": "Frank Admin"}',
    NOW(), NOW(), '', '', '', ''
  );

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at) VALUES
  (uuid_generate_v4(), 'alice@demo.com',  'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
   json_build_object('sub', 'aaaaaaaa-aaaa-aaaa-aaaa-000000000001', 'email', 'alice@demo.com'),
   'email', NOW(), NOW()),
  (uuid_generate_v4(), 'bob@demo.com',    'aaaaaaaa-aaaa-aaaa-aaaa-000000000002',
   json_build_object('sub', 'aaaaaaaa-aaaa-aaaa-aaaa-000000000002', 'email', 'bob@demo.com'),
   'email', NOW(), NOW()),
  (uuid_generate_v4(), 'carol@demo.com',  'aaaaaaaa-aaaa-aaaa-aaaa-000000000003',
   json_build_object('sub', 'aaaaaaaa-aaaa-aaaa-aaaa-000000000003', 'email', 'carol@demo.com'),
   'email', NOW(), NOW()),
  (uuid_generate_v4(), 'dave@demo.com',   'aaaaaaaa-aaaa-aaaa-aaaa-000000000004',
   json_build_object('sub', 'aaaaaaaa-aaaa-aaaa-aaaa-000000000004', 'email', 'dave@demo.com'),
   'email', NOW(), NOW()),
  (uuid_generate_v4(), 'eve@demo.com',    'aaaaaaaa-aaaa-aaaa-aaaa-000000000005',
   json_build_object('sub', 'aaaaaaaa-aaaa-aaaa-aaaa-000000000005', 'email', 'eve@demo.com'),
   'email', NOW(), NOW()),
  (uuid_generate_v4(), 'frank@demo.com',  'aaaaaaaa-aaaa-aaaa-aaaa-000000000006',
   json_build_object('sub', 'aaaaaaaa-aaaa-aaaa-aaaa-000000000006', 'email', 'frank@demo.com'),
   'email', NOW(), NOW());

-- ============================================================
-- 4. Update profiles with roles + team assignments
--    (profiles were auto-created by the trigger above)
-- ============================================================

UPDATE profiles SET role = 'employee',  team_id = NULL
  WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000001';  -- Alice

UPDATE profiles SET role = 'hr_agent',  team_id = '11111111-1111-1111-1111-000000000002'
  WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000002';  -- Bob  (Benefits)

UPDATE profiles SET role = 'hr_agent',  team_id = '11111111-1111-1111-1111-000000000001'
  WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000003';  -- Carol (Operations)

UPDATE profiles SET role = 'hr_agent',  team_id = '11111111-1111-1111-1111-000000000003'
  WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000004';  -- Dave  (HR Systems)

UPDATE profiles SET role = 'hr_agent',  team_id = '11111111-1111-1111-1111-000000000004'
  WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000005';  -- Eve   (Processing)

UPDATE profiles SET role = 'hr_admin',  team_id = NULL
  WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000006';  -- Frank (Admin)
