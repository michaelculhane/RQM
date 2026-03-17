# HR Ticketing Tool — POC Demo

Two Next.js apps + Supabase backend demonstrating a full HR service request workflow.

| App | URL | Purpose |
|---|---|---|
| Employee Portal | `localhost:3000` | Employees submit and track requests |
| Internal HR Tool | `localhost:3001` | HR agents work requests; admins manage services/users |

---

## Quick Start

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) → New project.

Copy your **Project URL** and **anon public key** from Settings → API.

### 2. Apply the database schema

In the Supabase **SQL Editor**, run the contents of:
```
supabase/migrations/0001_initial.sql
```

### 3. Seed demo data

In the Supabase **SQL Editor**, run the contents of:
```
supabase/seed.sql
```

This creates demo accounts (password `Demo1234!` for all):

| Email | Role | Team |
|---|---|---|
| alice@demo.com | Employee | — |
| bob@demo.com | HR Agent | Benefits |
| carol@demo.com | HR Agent | Operations |
| dave@demo.com | HR Agent | HR Systems |
| eve@demo.com | HR Agent | Processing |
| frank@demo.com | HR Admin | — |

### 4. Configure environment variables

In **both** `apps/portal` and `apps/internal`, copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Install dependencies and run

```bash
# From the repo root
npm install

# Run both apps concurrently (two terminals)
npm run dev:portal     # → http://localhost:3000
npm run dev:internal   # → http://localhost:3001
```

---

## Demo Script

### Step 1 — Log in as Alice (Employee) at localhost:3000
- Browse the **Service Catalog**
- Submit a **Benefits Inquiry**
- Submit a **Change of Address**

### Step 2 — Log in as Bob (HR Agent) at localhost:3001
- See Alice's Benefits Inquiry in the **Queue**
- Assign it to himself
- Add an **internal note** (hidden from Alice)
- Change status to **In Progress**
- Send Alice a **public reply** asking for more info

### Step 3 — Switch back to Alice at localhost:3000
- Status has updated in real time
- Agent reply visible in the request timeline
- Alice replies with the requested info

### Step 4 — Back to Bob at localhost:3001
- Bob **resolves** the request
- Alice sees **Resolved** status in the portal

### Step 5 — Log in as Frank (Admin) at localhost:3001
- Full request queue across all teams
- **Admin → Users** — change roles and team assignments
- **Admin → Services** — enable/disable services

---

## Deploy to Vercel

Deploy each app separately. In each Vercel project:
- Set **Root Directory** to `apps/portal` or `apps/internal`
- Add env vars: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Project Structure

```
rqm/
├── supabase/
│   ├── migrations/0001_initial.sql   # Full schema + RLS
│   └── seed.sql                      # Demo accounts + data
├── apps/
│   ├── portal/                       # Employee portal (Next.js 14)
│   └── internal/                     # Internal HR tool (Next.js 14)
└── package.json                      # npm workspaces
```

## Status Workflow

```
Open → In Progress → Pending Employee → Resolved → Closed
```

## Security

- Employees see only their own requests (Supabase RLS)
- HR agents see only their team's requests (Supabase RLS)
- Internal notes are hidden from employees (Supabase RLS)
- HR admins see everything
