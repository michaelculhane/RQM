import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '_')

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full rounded-md border px-3 py-2 text-sm shadow-sm placeholder-gray-400
          focus:outline-none focus:ring-1
          ${error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'
          }
          disabled:bg-gray-50 disabled:text-gray-500
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
