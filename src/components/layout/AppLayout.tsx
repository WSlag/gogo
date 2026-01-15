import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Home, ShoppingBag, Car, Package, User, Wallet, UtensilsCrossed, MapPin, ChevronDown, Bell, MessageCircle } from 'lucide-react'
import { BottomNav } from './BottomNav'
import { Toast } from './Toast'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/store/authStore'

const sidebarItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/food', label: 'Restaurant', icon: UtensilsCrossed },
  { path: '/grocery', label: 'Grocery', icon: ShoppingBag },
  { path: '/rides', label: 'Rides', icon: Car },
  { path: '/orders', label: 'Orders', icon: Package },
  { path: '/wallet', label: 'Wallet', icon: Wallet },
  { path: '/account', label: 'Account', icon: User },
]

export function AppLayout() {
  const location = useLocation()
  const { profile, isAuthenticated } = useAuthStore()

  // Get user display info
  const userInitials = profile?.firstName && profile?.lastName
    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    : profile?.firstName?.[0]?.toUpperCase() || ''
  const userFullName = profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : profile?.firstName || ''
  const userPhone = profile?.phone || ''

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Top Header - Clean DoorDash style with search */}
      <header className="hidden lg:flex fixed top-0 left-0 right-0 z-50 h-16 items-center bg-white border-b border-gray-200">
        {/* Logo - aligned with sidebar */}
        <div className="flex items-center justify-start w-[240px] shrink-0 px-6">
          <span className="text-2xl font-bold text-primary-600 tracking-tight">GOGO Express</span>
        </div>

        {/* Center - Search Bar (40% width) */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="h-11 w-full rounded-full bg-gray-100 px-5 text-sm text-gray-900 placeholder-gray-500 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-300 border border-transparent hover:bg-gray-50"
            />
          </div>
        </div>

        {/* Right side - Location and actions */}
        <div className="flex items-center gap-1 ml-auto pr-6">
          {/* Location selector */}
          <button className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
            <MapPin className="h-4 w-4 text-primary-600" />
            <span className="max-w-[140px] truncate">Cotabato City</span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>

          {/* Notification */}
          <button className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary-600 ring-2 ring-white" />
          </button>

          {/* Chat */}
          <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <MessageCircle className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar - DoorDash exact style */}
      <aside className="hidden lg:flex fixed top-16 bottom-0 left-0 z-40 w-[240px] flex-col bg-white border-r border-gray-200">
        {/* Navigation - DoorDash exact spacing */}
        <nav className="flex-1 overflow-y-auto py-4 px-4">
          {/* Extra top spacing like DoorDash */}
          <div className="h-6" />

          <ul className="flex flex-col gap-[10px]">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path))
              const Icon = item.icon

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'flex items-center gap-4 px-4 h-[52px] text-[15px] font-medium transition-colors rounded-full',
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <Icon className={cn('h-6 w-6 shrink-0', isActive ? 'text-primary-600' : 'text-gray-500')} strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>

          {/* Divider - DoorDash style with more margin */}
          <div className="mt-10 mb-6 h-px bg-gray-200" />

          {/* Sign up link */}
          <NavLink
            to="/auth/login"
            className="flex items-center gap-4 px-4 h-[52px] text-[15px] font-medium text-gray-700 hover:bg-gray-50 rounded-full transition-colors"
          >
            <User className="h-6 w-6 text-gray-500" strokeWidth={1.5} />
            <span>Sign up or Login</span>
          </NavLink>
        </nav>

        {/* User Section - Clean profile card at bottom (only show when authenticated) */}
        {isAuthenticated && profile && (
          <div className="border-t border-gray-200 p-3">
            <NavLink
              to="/account"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{userFullName}</p>
                <p className="text-xs text-gray-500 truncate">{userPhone}</p>
              </div>
            </NavLink>
          </div>
        )}
      </aside>

      {/* Main Content - proper margin for sidebar */}
      <main className="min-h-screen ml-0 lg:ml-[240px] lg:pt-20 main-content">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />
      <Toast />
    </div>
  )
}
