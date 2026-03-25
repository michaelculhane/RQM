export type Role = 'employee' | 'hr_agent' | 'hr_admin'
export type Status = 'open' | 'in_progress' | 'pending_employee' | 'resolved' | 'closed'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface Team {
  id: string
  name: string
  slug: string
}

export interface Category {
  id: string
  name: string
  slug: string
  sort_order: number
}

export interface Service {
  id: string
  name: string
  slug: string
  team_id: string
  category_id: string | null
  description: string | null
  enabled: boolean
  teams?: Team
  categories?: Category
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

export type RequestTaskStatus = 'open' | 'completed' | 'cancelled'
export type FormFieldType = 'text' | 'textarea' | 'date' | 'select' | 'checkbox' | 'file'

export interface FormTemplateField {
  id: string
  form_template_id: string
  field_name: string
  label: string
  field_type: FormFieldType
  options: string[] | null
  is_required: boolean
  is_pii: boolean
  display_order: number
  request_field_mapping: { target_table: string; target_field: string } | null
}

export interface FormTemplate {
  id: string
  name: string
  description: string | null
  is_active: boolean
  form_template_fields?: FormTemplateField[]
}

export interface RequestTask {
  id: string
  request_id: string
  form_template_id: string | null
  title: string
  status: RequestTaskStatus
  assigned_to: string | null
  due_date: string | null
  created_at: string
  completed_at: string | null
  form_templates?: FormTemplate
  requests?: {
    service_id: string
    services?: { name: string; slug: string }
  }
}

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
