-- ============================================================
-- Knowledge Base — Demo Articles
-- Run this AFTER seed.sql (requires Frank's profile to exist)
-- Author: Frank Admin (aaaaaaaa-aaaa-aaaa-aaaa-000000000006)
-- ============================================================

INSERT INTO knowledge_articles (id, title, slug, body, status, category, author_id, published_at) VALUES

-- ============================================================
-- Benefits
-- ============================================================
(
  'bbbbbbbb-0000-0000-0000-000000000001',
  'Benefits Enrollment Guide',
  'benefits-enrollment-guide',
  'Overview
--------
Open enrollment takes place each year in November. During this window you can enrol in, change, or waive coverage for Medical, Dental, and Vision plans. Changes take effect on January 1 of the following year.

Outside of open enrollment, you may only make changes if you experience a Qualifying Life Event (QLE), such as:
- Marriage or divorce
- Birth or adoption of a child
- Loss of coverage from another plan
- Change in employment status for you or a spouse

How to Enrol
------------
1. Log in to the benefits portal at benefits.company.com
2. Select "Start Enrollment" from the dashboard
3. Review each benefit category and make your elections
4. Submit your elections before the deadline

If you miss the open enrollment deadline, you will be automatically re-enrolled in your existing elections for the following year.

Need Help?
----------
Submit a Benefits Inquiry through the HR Portal and a member of the Benefits team will be in touch within 2 business days.',
  'published',
  'Benefits',
  'aaaaaaaa-aaaa-aaaa-aaaa-000000000006',
  NOW() - INTERVAL '30 days'
),

(
  'bbbbbbbb-0000-0000-0000-000000000002',
  'Understanding Your Health Coverage',
  'understanding-health-coverage',
  'Plan Options
------------
We offer three tiers of medical coverage:

Basic Plan
  - Lower monthly premium
  - Higher deductible ($2,000 individual / $4,000 family)
  - In-network coverage only
  - Preventive care covered at 100%

Standard Plan
  - Mid-range premium
  - Moderate deductible ($1,000 individual / $2,000 family)
  - In- and out-of-network coverage
  - Prescription drug coverage included

Premium Plan
  - Higher monthly premium
  - Low deductible ($500 individual / $1,000 family)
  - In- and out-of-network coverage
  - Mental health and wellness benefits included
  - Dental and vision bundled

Key Terms
---------
Deductible: The amount you pay out of pocket before the plan begins to share costs.

Co-pay: A fixed amount you pay for a covered service (e.g., $20 for a GP visit).

Out-of-pocket maximum: The most you will pay in a plan year. After reaching this limit, the plan covers 100% of covered services.

Premium: The amount deducted from your paycheque each pay period for coverage.

Adding Dependants
-----------------
You may add a spouse, common-law partner, or eligible children to your plan. Dependant changes must be made within 30 days of a Qualifying Life Event. Submit a Benefits Inquiry if you need to add or remove a dependant.',
  'published',
  'Benefits',
  'aaaaaaaa-aaaa-aaaa-aaaa-000000000006',
  NOW() - INTERVAL '25 days'
),

-- ============================================================
-- Payroll
-- ============================================================
(
  'bbbbbbbb-0000-0000-0000-000000000003',
  'Payroll Schedule & Pay Stubs',
  'payroll-schedule-pay-stubs',
  'Pay Schedule
------------
Employees are paid bi-weekly on Fridays. There are 26 pay periods per year. The payroll cutoff for each period is the Tuesday prior to the pay date.

If a pay date falls on a statutory holiday, payment will be issued on the preceding business day.

Accessing Your Pay Stub
-----------------------
Pay stubs are available electronically via the payroll portal at payroll.company.com. You will receive an email notification each pay period when your stub is ready.

Pay stubs show:
- Gross earnings (regular, overtime, vacation payout)
- All deductions (tax, CPP/EI or FICA, benefits premiums)
- Net pay and year-to-date totals

Direct Deposit
--------------
All payments are made via direct deposit. To update your banking information, submit a Direct Deposit Change request through the HR Portal. Changes must be submitted at least 5 business days before the next pay date to take effect.

Payroll Errors
--------------
If you believe there is an error on your pay stub, contact Payroll by submitting a request through the HR Portal within 30 days of the pay date.',
  'published',
  'Payroll',
  'aaaaaaaa-aaaa-aaaa-aaaa-000000000006',
  NOW() - INTERVAL '20 days'
),

(
  'bbbbbbbb-0000-0000-0000-000000000004',
  'How to Update Your Direct Deposit',
  'how-to-update-direct-deposit',
  'You can change your direct deposit banking information at any time through the HR Portal.

Steps
-----
1. Log in to the HR Portal
2. Go to Services and select "Direct Deposit Change"
3. Enter your bank name and account type (Chequing or Savings)
4. Submit the request

Important Notes
---------------
- Submit changes at least 5 business days before your next pay date
- Changes will appear on your following pay stub once processed
- For security, account numbers are not collected through this form — the Processing team will contact you directly to verify your banking details

If you have questions about the status of your request, you can track it in My Requests.',
  'published',
  'Payroll',
  'aaaaaaaa-aaaa-aaaa-aaaa-000000000006',
  NOW() - INTERVAL '18 days'
),

-- ============================================================
-- Onboarding
-- ============================================================
(
  'bbbbbbbb-0000-0000-0000-000000000005',
  'New Employee Onboarding Checklist',
  'new-employee-onboarding-checklist',
  'Welcome! This checklist outlines the key steps to complete during your first 30 days.

Week 1
------
  Complete all new hire paperwork with HR
  Confirm your direct deposit banking information
  Enrol in benefits (you have 30 days from your start date)
  Set up your company email and laptop with IT
  Request access to required systems via the HR Portal (System Access Request)
  Meet with your manager to review your role and 30/60/90 day plan

Week 2–3
--------
  Complete required compliance training (links sent by email)
  Set up 1-on-1 meetings with key team members
  Review the company handbook (available on the intranet)
  Confirm your home address on file (Change of Address request if needed)

Day 30
------
  30-day check-in with your manager
  Confirm all system access is in place
  Review your benefits elections to ensure they are correct

Need Help?
----------
Reach out to your HR Business Partner or submit a request through the HR Portal for any onboarding-related questions.',
  'published',
  'Onboarding',
  'aaaaaaaa-aaaa-aaaa-aaaa-000000000006',
  NOW() - INTERVAL '15 days'
),

-- ============================================================
-- IT / Systems
-- ============================================================
(
  'bbbbbbbb-0000-0000-0000-000000000006',
  'How to Request System Access',
  'how-to-request-system-access',
  'Use the System Access Request form in the HR Portal to request access to any company system or application.

When to Submit a Request
------------------------
- You need access to a new tool for your role
- Your access level needs to change (e.g., read-only to admin)
- A team member no longer needs access and it should be removed
- You are onboarding a new employee onto your team

What to Include
---------------
System Name: Be specific — include the full product name and environment (e.g., "Salesforce Production", "GitHub - Engineering Org").

Access Type:
  New access   — first-time provisioning
  Modify       — changing existing permissions
  Remove       — revoking access (e.g., for offboarding)

Justification: Explain why the access is needed and how it relates to your role or project.

Required By Date: If the access is time-sensitive, include the date you need it by.

Processing Times
----------------
Standard requests are processed within 3 business days.
Urgent requests (required within 24 hours) should be flagged as High priority and include a note in the justification.

After submitting, you can track your request status in My Requests.',
  'published',
  'IT & Systems',
  'aaaaaaaa-aaaa-aaaa-aaaa-000000000006',
  NOW() - INTERVAL '12 days'
),

-- ============================================================
-- Policies
-- ============================================================
(
  'bbbbbbbb-0000-0000-0000-000000000007',
  'Time Off & Leave Policy Summary',
  'time-off-leave-policy',
  'Vacation
--------
Full-time employees accrue vacation based on years of service:
  0–2 years:    10 days per year (3.85 hours per bi-weekly pay period)
  3–5 years:    15 days per year
  6+ years:     20 days per year

Vacation requests must be approved by your manager at least 2 weeks in advance for requests up to 1 week, and 4 weeks in advance for longer periods.

Sick Leave
----------
Employees receive 10 paid sick days per calendar year. Sick days do not roll over. If you are absent for more than 3 consecutive days, a doctor''s note may be requested.

Statutory Holidays
------------------
The company observes all federally mandated statutory holidays plus the following additional days:
  - Family Day (third Monday in February)
  - Easter Monday
  - Christmas Eve (half day)

Leaves of Absence
-----------------
Extended leaves (parental, medical, compassionate) are handled on a case-by-case basis. Contact HR to discuss your situation and we will work with you on a leave plan.

How to Request Time Off
-----------------------
Submit time-off requests through your manager using the company scheduling system. For extended leaves, submit a request through the HR Portal or contact your HR Business Partner directly.',
  'published',
  'Policies',
  'aaaaaaaa-aaaa-aaaa-aaaa-000000000006',
  NOW() - INTERVAL '10 days'
),

(
  'bbbbbbbb-0000-0000-0000-000000000008',
  'Remote Work Policy',
  'remote-work-policy',
  'Eligibility
-----------
Employees in eligible roles may work remotely up to 3 days per week, subject to manager approval. Eligibility is determined by your role requirements and team needs.

Expectations While Remote
--------------------------
- Be available and responsive during your core working hours (10am–3pm local time)
- Join video calls with camera on when appropriate
- Maintain a professional, distraction-free environment during meetings
- Ensure a stable internet connection — persistent connectivity issues should be reported to IT

Equipment
---------
The company will provide a laptop and necessary peripherals. Employees working remotely are responsible for maintaining their equipment in good condition.

If you need additional equipment (monitor, keyboard, etc.), submit a System Access Request through the HR Portal with the details of what you need.

Security Requirements
---------------------
- Use the company VPN when accessing internal systems remotely
- Do not use public Wi-Fi without the VPN active
- Lock your screen when stepping away
- Do not share your credentials with anyone

Changes to Your Work Location
------------------------------
If you are relocating permanently or changing your primary work location, submit a Change of Address request through the HR Portal and notify your manager.',
  'published',
  'Policies',
  'aaaaaaaa-aaaa-aaaa-aaaa-000000000006',
  NOW() - INTERVAL '8 days'
),

-- ============================================================
-- Draft (not visible to employees)
-- ============================================================
(
  'bbbbbbbb-0000-0000-0000-000000000009',
  'Performance Review Process 2025',
  'performance-review-process-2025',
  'DRAFT — do not publish until reviewed by HRBP team.

Overview
--------
The 2025 performance review cycle runs October 1 – November 15.

Phases:
1. Employee self-assessment (Oct 1–15)
2. Manager review and rating (Oct 16–31)
3. Calibration sessions (Nov 1–7)
4. Employee conversations (Nov 8–15)
5. Merit increase processing (December payroll)',
  'draft',
  'Policies',
  'aaaaaaaa-aaaa-aaaa-aaaa-000000000006',
  NULL
);
