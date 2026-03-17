# HR Ticketing Tool — POC Demo Scope

## Goal
Demonstrate the core value of the HR ticketing system to stakeholders:
an employee submits a service request via the portal, HR agents work the
request in the internal tool, and the employee can track progress in real time.

## Deployment
- **Internal tool:** Vercel (Next.js)
- **Employee portal:** Vercel (Next.js)
- **Database / Auth / Storage:** Supabase Cloud (free tier)
- **Auth:** Supabase email/password — no SAML for POC
- **Background jobs:** None — notifications and automations skipped for POC

---

## Teams in Demo (4 of 5)
- Operations (Recruitment)
- Benefits
- HR Systems
- Processing

---

## Service Catalog (5 services)

| Service | Team | Child Table |
|---|---|---|
| **Hiring Request** | Operations | `requests_hiring` |
| **Benefits Inquiry** | Benefits | `requests_benefits_inquiry` |
| **System Access Request** | HR Systems | `requests_system_access` |
| **Change of Address** | Processing | `requests_change_of_address` |
| **Direct Deposit Change** | Processing | `requests_direct_deposit` |

### Sample Form Fields per Service

**Hiring Request**
- Job title
- Department
- Headcount type (Backfill / New)
- Target start date
- Hiring manager
- Is this budgeted? (Yes / No)

**Benefits Inquiry**
- Inquiry type (Enrollment / Coverage question / Dependent change / Other)
- Coverage type (Medical / Dental / Vision / All)
- Preferred contact method

**System Access Request**
- System name
- Access type (New access / Modify / Remove)
- Justification
- Required by date

**Change of Address**
- New address (line 1, line 2, city, province/state, postal/zip)
- Effective date

**Direct Deposit Change**
- Bank name
- Account type (Chequing / Savings)
- Effective date
- (Note: no actual account numbers collected in demo)

---

## Data Model (Simplified for POC)

```
requests (root)
  id, opened_by, opened_for, opened_at,
  service_id, team_id, status, priority,
  description, assigned_to, closed_at

  ├── requests_hiring
  ├── requests_benefits_inquiry
  ├── requests_system_access
  ├── requests_change_of_address
  └── requests_direct_deposit
```

No mid-level inheritance tables for POC — root → leaf only to keep it simple.
Full multi-level inheritance introduced in production build.

---

## User Roles in Demo

| Role | Description |
|---|---|
| **Employee** | Submits requests, tracks status via portal |
| **HR Agent** | Works requests, adds notes, changes status |
| **HR Admin** | Manages services, users, and assignments |

### Demo Seed Accounts

| Name | Role | Team |
|---|---|---|
| Alice Employee | Employee | — |
| Bob Agent | HR Agent | Benefits |
| Carol Agent | HR Agent | Operations |
| Dave Agent | HR Agent | HR Systems |
| Eve Agent | HR Agent | Processing |
| Frank Admin | HR Admin | — |

---

## Employee Portal — Features in Demo

- [ ] Sign up / log in (email + password)
- [ ] Service catalog — browse available HR services
- [ ] Submit a request — dynamic form per service
- [ ] My Requests — list of own submissions with current status
- [ ] Request detail — view status, timeline, agent replies
- [ ] Reply to an agent comment on a request

**Not included in demo:**
- Email notifications
- File attachments
- Password reset flow
- Multi-language

---

## Internal HR Tool — Features in Demo

### Request Management
- [ ] Request queue — list view with filters (status, team, priority, service)
- [ ] Request detail — full view of all fields including service-specific fields
- [ ] Status management — move request through workflow
- [ ] Assignment — assign to self or another agent
- [ ] Priority — set and change priority

### Comments
- [ ] Add internal note (hidden from employee)
- [ ] Add public reply (visible to employee in portal)
- [ ] Activity timeline on request detail

### Service Catalog (Admin)
- [ ] View all services
- [ ] Enable / disable a service

### User Management (Admin)
- [ ] View all users
- [ ] Change a user's role or team

**Not included in demo:**
- SLA tracking and breach alerts
- Email / in-app notifications
- BullMQ event-driven automation
- Audit log viewer
- Reporting and dashboards
- Configurable permission rules UI
- SAML SSO
- Full admin service builder (form schema editor)

---

## Status Workflow (Simplified)

```
Open → In Progress → Pending Employee → Resolved → Closed
```

---

## Security (Simplified for POC)

- Employees can only see their own requests (enforced via RLS)
- HR agents can only see requests belonging to their team (enforced via RLS)
- Internal notes are hidden from employees (enforced via RLS)
- HR admins can see all requests across all teams
- No configurable permission rules UI — hardcoded RLS policies for POC

---

## Demo Script (Suggested Flow)

1. **Log in as Alice (Employee)** via the portal
   - Browse the service catalog
   - Submit a Benefits Inquiry
   - Submit a Change of Address

2. **Log in as Bob (Benefits Agent)** in the internal tool
   - See Alice's Benefits Inquiry in the queue
   - Assign it to himself
   - Add an internal note
   - Change status to In Progress
   - Send Alice a public reply asking for more info

3. **Switch back to Alice in the portal**
   - Show the status has updated in real time
   - Show the agent reply in the timeline
   - Alice replies with the requested info

4. **Back to Bob in the internal tool**
   - Bob resolves the request
   - Alice sees Resolved status in the portal

5. **Log in as Frank (Admin)**
   - Show the full request queue across all teams
   - Show user management
   - Show service catalog management

---

## Out of Scope for POC (Full Build Only)

- SAML / SSO authentication
- Email notifications
- BullMQ event-driven automation
- SLA policies and breach alerts
- Full audit log with field-level diffs
- Configurable permission rules (ABAC admin UI)
- Reporting and dashboards
- CSV export
- File attachments
- Multi-level table inheritance
- Employee Relations team
- Mobile responsiveness (desktop only for demo)
