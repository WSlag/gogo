import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Bell, MapPin, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui'
import { useUIStore } from '@/store'

interface HeaderProps {
  title?: string
  showBack?: boolean
  showLocation?: boolean
  showNotifications?: boolean
  transparent?: boolean
  className?: string
  rightContent?: React.ReactNode
}

export function Header({
  title,
  showBack = false,
  showLocation = false,
  showNotifications = true,
  transparent = false,
  className,
  rightContent,
}: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { setLocationPickerOpen } = useUIStore()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  // Don't show header on auth pages
  if (location.pathname.startsWith('/auth')) return null

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-14 items-center justify-between px-4',
        transparent
          ? 'bg-transparent'
          : 'border-b border-gray-100 bg-white/95 backdrop-blur-sm',
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-2">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        {showLocation && (
          <button
            onClick={() => setLocationPickerOpen(true)}
            className="flex items-center gap-1 rounded-lg py-1 pr-2 hover:bg-gray-100"
          >
            <MapPin className="h-5 w-5 text-primary-600" />
            <div className="flex flex-col items-start">
              <span className="text-xs text-gray-500">Deliver to</span>
              <span className="flex items-center gap-1 text-sm font-medium text-gray-900">
                Current Location
                <ChevronDown className="h-4 w-4" />
              </span>
            </div>
          </button>
        )}

        {title && !showLocation && (
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {rightContent}

        {showNotifications && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/notifications')}
            className="relative text-gray-700"
          >
            <Bell className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" />
          </Button>
        )}
      </div>
    </header>
  )
}
