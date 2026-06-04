import { cn } from '@/shared/utils/cn'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 text-center', className)}>
      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 text-gray-400 dark:text-gray-500 mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed mb-5">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
