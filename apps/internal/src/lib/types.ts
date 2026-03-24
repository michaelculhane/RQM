export type Role = 'employee' | 'hr_agent' | 'hr_admin'

export interface CustomRole {
  id: string
  name: string
  description: string | null
  created_at: string
  team_roles?: { team_id: string; teams?: Team }[]
  role_permissions?: RolePermission[]
}

export interface RolePermission {
  id: string
  role_id: string
  table_name: string
  can_read: boolean
  can_create: boolean
  can_update: boolean
  can_delete: boolean
  status_in: string[] | null
  service_slug: string | null
  opened_by_self: boolean
}

export type Status = 'open' | 'in_progress' | 'pending_employee' | 'resolved' | 'closed'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending_employee', label: 'Pending Employee' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

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
  teams?: Team
  profile_roles?: { role_id: string; roles?: CustomRole }[]
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

// Child table types
export interface HiringDetails {
  request_id: string
  job_title: string
  department: string
  headcount_type: string
  target_start_date: string | null
  hiring_manager: string | null
  is_budgeted: boolean
}

export interface BenefitsDetails {
  request_id: string
  inquiry_type: string
  coverage_type: string
  preferred_contact: string
}

export interface SystemAccessDetails {
  request_id: string
  system_name: string
  access_type: string
  justification: string
  required_by_date: string | null
}

export interface AddressDetails {
  request_id: string
  address_line1: string
  address_line2: string | null
  city: string
  province_state: string
  postal_zip: string
  effective_date: string | null
}

export interface DirectDepositDetails {
  request_id: string
  bank_name: string
  account_type: string
  effective_date: string | null
}

export type ServiceDetails =
  | HiringDetails
  | BenefitsDetails
  | SystemAccessDetails
  | AddressDetails
  | DirectDepositDetails

export type ArticleStatus = 'draft' | 'published' | 'retired'

export interface KnowledgeArticle {
  id: string
  title: string
  slug: string
  body: string
  status: ArticleStatus
  category: string | null
  author_id: string
  created_at: string
  updated_at: string
  published_at: string | null
  author?: Profile
}
