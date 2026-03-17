export type Role = 'employee' | 'hr_agent' | 'hr_admin'
export type Status = 'open' | 'in_progress' | 'pending_employee' | 'resolved' | 'closed'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface Team {
  id: string
  name: string
  slug: string
}

export interface Service {
  id: string
  name: string
  slug: string
  team_id: string
  description: string | null
  enabled: boolean
  teams?: Team
}

export interface Profile {
  id: string
  email: string
  full_name: string
  role: Role
  team_id: string | null
}

export interface Request {
  id: string
  opened_by: string
  opened_for: string
  opened_at: string
  service_id: string
  team_id: string
  status: Status
  priority: Priority
  description: string | null
  assigned_to: string | null
  closed_at: string | null
  services?: Service
  teams?: Team
  opener?: Profile
  assignee?: Profile
}

export interface Comment {
  id: string
  request_id: string
  author_id: string
  body: string
  is_internal: boolean
  created_at: string
  author?: Profile
}

export interface Activity {
  id: string
  request_id: string
  actor_id: string | null
  type: string
  metadata: Record<string, unknown> | null
  created_at: string
  actor?: Profile
}
