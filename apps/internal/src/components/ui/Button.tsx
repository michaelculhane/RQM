import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-slate-800 text-white hover:bg-slate-700 border border-slate-800 hover:border-slate-700',
  secondary:
    'bg-white text-slate-700 hover:bg-gray-50 border border-gray-300',
  ghost:
    'bg-transparent text-slate-600 hover:bg-gray-100 border border-transparent',
  danger:
    'bg-red-600 text-white hover:bg-red-700 border border-red-600 hover:border-red-700',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center rounded-md font-medium
        transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
