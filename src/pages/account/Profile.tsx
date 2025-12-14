import { useNavigate } from 'react-router-dom'
import {
  User,
  MapPin,
  Bell,
  Shield,
  HelpCircle,
  Star,
  Share2,
  LogOut,
  ChevronRight,
  Settings,
  Wallet,
} from 'lucide-react'

interface MenuItem {
  icon: typeof User
  label: string
  path: string
  badge?: string
}

const accountMenuItems: MenuItem[] = [
  { icon: User, label: 'Edit Profile', path: '/account/edit' },
  { icon: MapPin, label: 'Saved Addresses', path: '/account/addresses', badge: '3' },
  { icon: Wallet, label: 'Payment Methods', path: '/account/payment' },
  { icon: Bell, label: 'Notifications', path: '/account/notifications', badge: '5' },
  { icon: Shield, label: 'Privacy & Security', path: '/account/privacy' },
]

const supportMenuItems: MenuItem[] = [
  { icon: HelpCircle, label: 'Help Center', path: '/help' },
  { icon: Star, label: 'Rate the App', path: '/rate' },
  { icon: Share2, label: 'Share GOGO', path: '/share' },
  { icon: Settings, label: 'App Settings', path: '/account/settings' },
]

export default function Profile() {
  const navigate = useNavigate()

  // Mock user data
  const user = {
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    phone: '+63 917 123 4567',
    email: 'juan@email.com',
    memberSince: 'December 2024',
    totalOrders: 45,
    totalRides: 23,
  }

  const handleLogout = () => {
    navigate('/auth/login')
  }

  return (
    <div className="bg-white pb-20 lg:pb-0 page-content">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="px-4 py-4 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Account</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl font-bold text-gray-600">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-gray-500">{user.phone}</p>
          </div>
          <button
            onClick={() => navigate('/account/edit')}
            className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            Edit
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 rounded-xl bg-gray-50 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{user.totalOrders}</p>
            <p className="text-xs text-gray-500">Orders</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{user.totalRides}</p>
            <p className="text-xs text-gray-500">Rides</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">4.9</p>
            <p className="text-xs text-gray-500">Rating</p>
          </div>
        </div>

        {/* Referral Card */}
        <button
          onClick={() => navigate('/referral')}
          className="w-full rounded-xl bg-gray-900 p-4 text-left text-white"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <Share2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Invite Friends, Earn P100</h3>
              <p className="mt-0.5 text-sm text-gray-400">
                Share your referral code
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </button>

        {/* Account Settings */}
        <section>
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            Account
          </h3>
          <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
            {accountMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-gray-50"
                >
                  <Icon className="h-5 w-5 text-gray-500" />
                  <span className="flex-1 font-medium text-gray-900">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="rounded-full bg-primary-600 px-2 py-0.5 text-xs font-medium text-white">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              )
            })}
          </div>
        </section>

        {/* Support */}
        <section>
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            Support
          </h3>
          <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
            {supportMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-gray-50"
                >
                  <Icon className="h-5 w-5 text-gray-500" />
                  <span className="flex-1 font-medium text-gray-900">
                    {item.label}
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              )
            })}
          </div>
        </section>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl border border-red-100 p-4 text-left text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Log Out</span>
        </button>

        {/* Version Info */}
        <div className="pb-4 text-center">
          <p className="text-xs text-gray-400">
            GOGO v1.0.0
          </p>
        </div>
        </div>
      </main>
    </div>
  )
}
