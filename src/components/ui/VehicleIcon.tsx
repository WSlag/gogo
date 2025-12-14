import { cn } from '@/utils/cn'

type IconType = 'motorcycle' | 'car' | 'van' | 'delivery' | 'truck' | 'plane'

interface VehicleIconProps {
  type: IconType
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-9 h-9'
}

export function VehicleIcon({ type, className, size = 'md' }: VehicleIconProps) {
  const iconClass = cn(sizeClasses[size], className)

  switch (type) {
    case 'motorcycle':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5" cy="17" r="3" />
          <circle cx="19" cy="17" r="3" />
          <path d="M9 17h6" />
          <path d="M5 14l2-7h4l3 4h3l2-2" />
          <path d="M11 7l2 4" />
        </svg>
      )

    case 'car':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0" />
          <path d="M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0" />
          <path d="M5 17H3v-4l2-5h9l4 5h3v4h-2" />
          <path d="M9 17h6" />
          <path d="M6 8l1.5 4" />
          <path d="M14 8l-1.5 4" />
        </svg>
      )

    case 'van':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0" />
          <path d="M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0" />
          <path d="M5 17H3V8a1 1 0 0 1 1-1h11v6h4l3 4v2h-3" />
          <path d="M9 17h6" />
          <path d="M15 13V7" />
        </svg>
      )

    case 'delivery':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="14" height="14" rx="1" />
          <path d="M21 16V8a1 1 0 0 0-1-1h-3v10h3a1 1 0 0 0 1-1z" />
          <path d="M7 15v-4h4" />
          <path d="M7 11l4 4" />
        </svg>
      )

    case 'truck':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0" />
          <path d="M15 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0" />
          <path d="M5 18H3V6a1 1 0 0 1 1-1h10v7h4l3 4v2h-2" />
          <path d="M9 18h6" />
          <path d="M14 5v7" />
        </svg>
      )

    case 'plane':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16v-2a4 4 0 0 0-4-4h-2l-3-6H9l1 6H6L4.5 8H2l1 4-1 4h2.5L6 14h4l-1 6h3l3-6h2a4 4 0 0 0 4-4" />
        </svg>
      )

    default:
      return null
  }
}
