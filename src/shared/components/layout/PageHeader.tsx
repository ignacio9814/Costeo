import { cn } from '@/shared/utils/cn'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-6', className)}>
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 ml-6 flex-shrink-0">{actions}</div>
      )}
    </div>
  )
}
