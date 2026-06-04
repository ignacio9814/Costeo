import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  size?: ModalSize
  children: React.ReactNode
  footer?: React.ReactNode
}

const sizes: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-3xl',
  xl: 'sm:max-w-5xl',
}

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        className={cn(
          'relative z-10 w-full bg-white dark:bg-[#1A1D2E]',
          'shadow-2xl flex flex-col',
          'rounded-t-2xl sm:rounded-xl',
          'max-h-[90vh]',
          sizes[size]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
