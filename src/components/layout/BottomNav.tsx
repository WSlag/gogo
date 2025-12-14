import { NavLink, useLocation } from 'react-router-dom'
import { Home, Search, Package, User } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useCartStore } from '@/store'

interface NavItem {
  path: string
  label: string
  icon: typeof Home
}

const navItems: NavItem[] = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/food', label: 'Browse', icon: Search },
  { path: '/orders', label: 'Orders', icon: Package },
  { path: '/account', label: 'Account', icon: User },
]

export function BottomNav() {
  const location = useLocation()
  const itemCount = useCartStore((state) => state.itemCount)

  // Hide bottom nav on certain routes
  const hiddenRoutes = ['/auth', '/ride/tracking', '/order/tracking']
  const shouldHide = hiddenRoutes.some((route) =>
    location.pathname.startsWith(route)
  )

  if (shouldHide) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-[0_-1px_3px_rgba(0,0,0,0.05)] pb-safe lg:hidden">
      <div className="flex h-14 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path))
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all',
                isActive ? 'text-primary-600' : 'text-gray-500'
              )}
            >
              <div className="relative">
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                  isActive && 'bg-primary-50'
                )}>
                  <Icon
                    className={cn('h-5 w-5', isActive && 'text-primary-600')}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                {item.path === '/orders' && itemCount > 0 && (
                  <span className="absolute -right-1 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white shadow-sm">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-[11px]',
                  isActive ? 'font-semibold text-primary-600' : 'font-medium text-gray-500'
                )}
              >
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
