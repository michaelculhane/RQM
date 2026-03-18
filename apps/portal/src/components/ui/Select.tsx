import { SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
}

export default function Select({
  label,
  error,
  options,
  id,
  className = '',
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '_')

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          w-full rounded-md border px-3 py-2 text-sm shadow-sm bg-white
          focus:outline-none focus:ring-1
          ${error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'
          }
          disabled:bg-gray-50 disabled:text-gray-500
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
