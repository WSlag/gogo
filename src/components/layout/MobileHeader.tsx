import { useNavigate } from 'react-router-dom'
import { MapPin, Bell, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

interface MobileHeaderProps {
  className?: string
}

export function MobileHeader({ className }: MobileHeaderProps) {
  const navigate = useNavigate()

  return (
    <header
      className={cn(
        'sticky top-0 z-40 bg-white border-b border-gray-100 lg:hidden',
        className
      )}
    >
      <div className="h-12 px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/icons/icon-32x32.png"
            alt="GOGO Express"
            className="h-8 w-8 rounded-lg"
          />
          <span className="text-xl font-bold text-primary-600">GOGO Express</span>
        </div>

        {/* Right side - Location & Notifications */}
        <div className="flex items-center gap-1">
          {/* Location Selector */}
          <button
            onClick={() => navigate('/rides/location')}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <MapPin className="h-4 w-4 text-primary-600" />
            <span className="max-w-[100px] truncate">Cotabato</span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary-600 ring-2 ring-white" />
          </button>
        </div>
      </div>
    </header>
  )
}
