import { forwardRef } from 'react'
import { cn } from '@/shared/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
  rightElement?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, rightElement, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-9 rounded-lg border',
              'border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-900/50',
              'text-sm text-gray-900 dark:text-gray-100',
              'placeholder:text-gray-400 dark:placeholder:text-gray-600',
              'px-3',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-150',
              icon && 'pl-9',
              rightElement && 'pr-9',
              error && 'border-red-400 focus:ring-red-500',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
