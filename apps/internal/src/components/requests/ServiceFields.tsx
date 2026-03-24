interface ServiceFieldsProps {
  serviceSlug: string
  details: Record<string, unknown>
}

interface FieldDef {
  key: string
  label: string
  format?: (v: unknown) => string
}

const fieldsBySlug: Record<string, FieldDef[]> = {
  'hiring-request': [
    { key: 'job_title', label: 'Job Title' },
    { key: 'department', label: 'Department' },
    { key: 'headcount_type', label: 'Headcount Type' },
    { key: 'target_start_date', label: 'Target Start Date' },
    { key: 'hiring_manager', label: 'Hiring Manager' },
    {
      key: 'is_budgeted',
      label: 'Budgeted Position',
      format: (v) => (v ? 'Yes' : 'No'),
    },
  ],
  'benefits-inquiry': [
    { key: 'inquiry_type', label: 'Inquiry Type' },
    { key: 'coverage_type', label: 'Coverage Type' },
    { key: 'preferred_contact', label: 'Preferred Contact Method' },
  ],
  'system-access-request': [
    { key: 'system_name', label: 'System Name' },
    { key: 'access_type', label: 'Access Type' },
    { key: 'justification', label: 'Justification' },
    { key: 'required_by_date', label: 'Required By Date' },
  ],
  'change-of-address': [
    { key: 'address_line1', label: 'Address Line 1' },
    { key: 'address_line2', label: 'Address Line 2' },
    { key: 'city', label: 'City' },
    { key: 'province_state', label: 'State' },
    { key: 'postal_zip', label: 'ZIP Code' },
    { key: 'effective_date', label: 'Effective Date' },
  ],
  'direct-deposit-change': [
    { key: 'bank_name', label: 'Bank Name' },
    { key: 'account_type', label: 'Account Type' },
    { key: 'effective_date', label: 'Effective Date' },
  ],
  'name-change': [
    { key: 'new_last_name', label: 'New Last Name' },
  ],
  'where-is-my-wgi': [
    { key: 'eligibility_date', label: 'Believed WGI Eligibility Date' },
  ],
}

function formatValue(value: unknown, format?: (v: unknown) => string): string {
  if (value === null || value === undefined || value === '') return '—'
  if (format) return format(value)
  return String(value)
}

export default function ServiceFields({ serviceSlug, details }: ServiceFieldsProps) {
  const fields = fieldsBySlug[serviceSlug]

  if (!fields || !details) {
    return (
      <p className="text-sm text-gray-400 italic">
        No additional details for this service type.
      </p>
    )
  }

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
      {fields.map(({ key, label, format }) => {
        const value = details[key]
        return (
          <div key={key}>
            <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
              {label}
            </dt>
            <dd className="text-sm text-gray-800">
              {formatValue(value, format)}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
