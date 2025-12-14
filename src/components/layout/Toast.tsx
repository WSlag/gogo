import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useUIStore } from '@/store'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const styles = {
  success: 'bg-success text-white',
  error: 'bg-error text-white',
  info: 'bg-info text-white',
  warning: 'bg-warning text-white',
}

export function Toast() {
  const { toast, hideToast } = useUIStore()

  useEffect(() => {
    if (toast?.isVisible) {
      const timer = setTimeout(() => {
        hideToast()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [toast, hideToast])

  if (!toast?.isVisible) return null

  const Icon = icons[toast.type]

  return (
    <div className="fixed left-4 right-4 top-4 z-50 animate-in slide-in-from-top duration-300">
      <div
        className={cn(
          'mx-auto flex max-w-md items-center gap-3 rounded-lg px-4 py-3 shadow-lg',
          styles[toast.type]
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <p className="flex-1 text-sm font-medium">{toast.message}</p>
        <button
          onClick={hideToast}
          className="shrink-0 rounded-full p-1 hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
