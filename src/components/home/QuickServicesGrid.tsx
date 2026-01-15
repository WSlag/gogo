import { useNavigate } from 'react-router-dom'
import {
  UtensilsCrossed,
  ShoppingCart,
  Package,
  Wallet,
  Plane,
  Pill,
  MoreHorizontal,
  Car
} from 'lucide-react'
import { cn } from '@/utils/cn'

interface ServiceItem {
  id: string
  label: string
  icon: typeof UtensilsCrossed
  path: string
  color: string
  bgColor: string
  badge?: string
}

// Clean design - unified gray background, colored icons on hover only
const services: ServiceItem[] = [
  {
    id: 'food',
    label: 'Food',
    icon: UtensilsCrossed,
    path: '/food',
    color: 'text-gray-600 group-hover:text-orange-600',
    bgColor: 'bg-gray-50 group-hover:bg-orange-50'
  },
  {
    id: 'grocery',
    label: 'Grocery',
    icon: ShoppingCart,
    path: '/grocery',
    color: 'text-gray-600 group-hover:text-green-600',
    bgColor: 'bg-gray-50 group-hover:bg-green-50'
  },
  {
    id: 'delivery',
    label: 'Package',
    icon: Package,
    path: '/rides?type=delivery',
    color: 'text-gray-600 group-hover:text-blue-600',
    bgColor: 'bg-gray-50 group-hover:bg-blue-50'
  },
  {
    id: 'wallet',
    label: 'Wallet',
    icon: Wallet,
    path: '/wallet',
    color: 'text-gray-600 group-hover:text-purple-600',
    bgColor: 'bg-gray-50 group-hover:bg-purple-50'
  },
  {
    id: 'airport',
    label: 'Airport',
    icon: Plane,
    path: '/rides?type=airport',
    color: 'text-gray-600 group-hover:text-sky-600',
    bgColor: 'bg-gray-50 group-hover:bg-sky-50'
  },
  {
    id: 'rides',
    label: 'Rides',
    icon: Car,
    path: '/rides',
    color: 'text-gray-600 group-hover:text-primary-600',
    bgColor: 'bg-gray-50 group-hover:bg-primary-50'
  },
  {
    id: 'pharmacy',
    label: 'Pharmacy',
    icon: Pill,
    path: '/pharmacy',
    color: 'text-gray-600 group-hover:text-rose-600',
    bgColor: 'bg-gray-50 group-hover:bg-rose-50'
  },
  {
    id: 'more',
    label: 'More',
    icon: MoreHorizontal,
    path: '/',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50'
  }
]

interface QuickServicesGridProps {
  className?: string
  showHeader?: boolean
  columns?: 4 | 5
}

export function QuickServicesGrid({
  className,
  showHeader = true,
  columns = 4
}: QuickServicesGridProps) {
  const navigate = useNavigate()

  return (
    <section className={cn('', className)}>
      {showHeader && (
        <h2 className="text-base font-bold text-gray-900 mb-4">Quick Services</h2>
      )}

      <div
        className={cn(
          'grid gap-3',
          columns === 4 ? 'grid-cols-4' : 'grid-cols-5'
        )}
      >
        {services.map((service) => {
          const Icon = service.icon
          return (
            <button
              key={service.id}
              onClick={() => navigate(service.path)}
              className="flex flex-col items-center gap-2.5 py-3 px-2 rounded-xl hover:bg-gray-50 active:scale-95 transition-all group"
            >
              {/* Icon container - Clean unified design */}
              <div className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl transition-all',
                service.bgColor
              )}>
                <Icon className={cn('h-6 w-6 transition-colors', service.color)} strokeWidth={1.75} />
              </div>

              {/* Label */}
              <span className="text-xs font-medium text-gray-700 text-center">
                {service.label}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

// Compact inline version for ride-first layout
export function QuickServicesInline({ className }: { className?: string }) {
  const navigate = useNavigate()

  const inlineServices = services.filter(s =>
    ['food', 'grocery', 'delivery', 'wallet'].includes(s.id)
  )

  return (
    <div className={cn('flex gap-4 overflow-x-auto hide-scrollbar', className)}>
      {inlineServices.map((service) => {
        const Icon = service.icon
        return (
          <button
            key={service.id}
            onClick={() => navigate(service.path)}
            className="flex flex-col items-center gap-1.5 shrink-0"
          >
            <div className={cn(
              'flex h-14 w-14 items-center justify-center rounded-2xl',
              service.bgColor
            )}>
              <Icon className={cn('h-7 w-7', service.color)} strokeWidth={1.75} />
            </div>
            <span className="text-xs font-medium text-gray-700">{service.label}</span>
          </button>
        )
      })}
    </div>
  )
}
