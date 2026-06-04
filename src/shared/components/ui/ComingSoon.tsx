import { Construction } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface ComingSoonProps {
  title: string
  description?: string
  iconColor?: string
}

export function ComingSoon({
  title,
  description = 'Este módulo está en desarrollo activo y estará disponible próximamente.',
  iconColor = 'text-indigo-500',
}: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
      <div className={cn('p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 mb-6', iconColor)}>
        <Construction size={32} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
        {description}
      </p>
    </div>
  )
}
