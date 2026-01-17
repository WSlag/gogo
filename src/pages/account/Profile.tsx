import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
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
  Car,
  Gift,
  Crown,
  Camera,
  Sparkles,
} from 'lucide-react'

interface MenuItem {
  icon: typeof User
  label: string
  subtitle?: string
  path: string
  badge?: string
  badgeColor?: string
}

const accountMenuItems: MenuItem[] = [
  { icon: User, label: 'Edit Profile', subtitle: 'Name, photo, email', path: '/account/edit' },
  { icon: MapPin, label: 'Saved Addresses', subtitle: 'Home, work, favorites', path: '/account/addresses', badge: '3', badgeColor: 'bg-primary-600' },
  { icon: Wallet, label: 'Payment Methods', subtitle: 'Cards, GCash, PayMaya', path: '/account/payment' },
  { icon: Bell, label: 'Notifications', subtitle: 'Alerts & preferences', path: '/account/notifications', badge: '5', badgeColor: 'bg-primary-600' },
  { icon: Shield, label: 'Privacy & Security', subtitle: 'Password, 2FA, data', path: '/account/privacy' },
]

const supportMenuItems: MenuItem[] = [
  { icon: HelpCircle, label: 'Help Center', subtitle: 'FAQs & support', path: '/help' },
  { icon: Star, label: 'Rate the App', subtitle: 'Love GOGO Express? Rate us!', path: '/rate' },
  { icon: Share2, label: 'Share GOGO Express', subtitle: 'Invite friends', path: '/share' },
  { icon: Settings, label: 'App Settings', subtitle: 'Language, theme', path: '/account/settings' },
]

export default function Profile() {
  const navigate = useNavigate()
  const { logout, profile, user: firebaseUser, role } = useAuth()
  const [copied, setCopied] = useState(false)

  // Use actual user data from auth context with fallbacks
  const user = {
    firstName: profile?.firstName || 'User',
    lastName: profile?.lastName || '',
    phone: profile?.phone || firebaseUser?.phoneNumber || 'Not set',
    email: profile?.email || firebaseUser?.email || '',
    memberSince: profile?.createdAt
      ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'New member',
    totalOrders: profile?.stats?.totalOrders || 0,
    totalRides: profile?.stats?.totalRides || 0,
    rating: profile?.stats?.rating || 5.0,
    membershipTier: profile?.membershipTier || 'Bronze',
    walletBalance: profile?.walletBalance || 0,
    loyaltyPoints: profile?.loyaltyPoints || 0,
  }

  const handleLogout = async () => {
    await logout()
  }

  // Calculate membership progress (mock)
  const pointsToNextTier = 5000
  const progressPercent = (user.loyaltyPoints / pointsToNextTier) * 100

  return (
    <div className="bg-gray-50 min-h-screen pb-24 lg:pb-0 page-content">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="px-6 py-4 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Account</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-4 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-4">

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Profile Header */}
            <div className="p-4">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-xl font-bold text-white">
                    {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                  </div>
                  <button
                    onClick={() => navigate('/account/edit')}
                    className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <Camera className="h-3 w-3" />
                  </button>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 truncate leading-tight">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-sm text-gray-500 leading-tight">{user.phone}</p>
                  {/* Membership tier badge */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                      <Crown className="h-3 w-3" />
                      {user.membershipTier}
                    </span>
                    <span className="text-xs text-gray-400">Since {user.memberSince}</span>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => navigate('/account/edit')}
                  className="shrink-0 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200 active:scale-95"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 border-t border-gray-100">
              <button
                onClick={() => navigate('/orders')}
                className="py-3 text-center hover:bg-gray-50 transition-colors border-r border-gray-100"
              >
                <p className="text-xl font-bold text-gray-900 leading-tight">{user.totalOrders}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Orders</p>
              </button>
              <button
                onClick={() => navigate('/rides/history')}
                className="py-3 text-center hover:bg-gray-50 transition-colors border-r border-gray-100"
              >
                <p className="text-xl font-bold text-gray-900 leading-tight">{user.totalRides}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Rides</p>
              </button>
              <button
                onClick={() => navigate('/wallet')}
                className="py-3 text-center hover:bg-gray-50 transition-colors border-r border-gray-100"
              >
                <p className="text-lg font-bold text-primary-600 leading-tight">P{user.walletBalance.toLocaleString()}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Wallet</p>
              </button>
              <div className="py-3 text-center">
                <div className="flex items-center justify-center gap-0.5">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <p className="text-xl font-bold text-gray-900 leading-tight">{user.rating}</p>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">Rating</p>
              </div>
            </div>

            {/* Loyalty Progress */}
            <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-100/50">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-medium text-gray-700">Loyalty Points</span>
                </div>
                <span className="text-xs font-bold text-amber-600">{user.loyaltyPoints.toLocaleString()} pts</span>
              </div>
              <div className="h-1.5 bg-amber-200/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-amber-700/70 mt-1">
                {(pointsToNextTier - user.loyaltyPoints).toLocaleString()} points to Platinum
              </p>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Driver Mode Card */}
            <button
              onClick={() => navigate(role === 'driver' || role === 'admin' ? '/driver' : '/driver/register')}
              className="group rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 p-3.5 text-left text-white shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 shrink-0">
                  <Car className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm leading-tight">Driver Mode</h3>
                  <p className="text-[11px] text-white/70 leading-tight">Start earning today</p>
                </div>
                <ChevronRight className="h-4 w-4 text-white/50 shrink-0" />
              </div>
            </button>

            {/* Wallet Card */}
            <button
              onClick={() => navigate('/wallet')}
              className="group rounded-xl bg-white border-2 border-gray-200 p-3.5 text-left shadow-sm hover:border-primary-300 hover:shadow-md active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 shrink-0">
                  <Wallet className="h-4.5 w-4.5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm leading-tight text-gray-900">GOGO Express Wallet</h3>
                  <p className="text-[11px] text-gray-500 leading-tight">Top up & pay easily</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
              </div>
            </button>
          </div>

          {/* Invite Friends Card */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl p-4 border border-primary-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 shrink-0">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base leading-tight text-gray-900">Invite Friends</h3>
                <p className="text-xs text-gray-500 leading-tight">Share GOGO Express with friends and family</p>
              </div>
              <button
                onClick={async () => {
                  const shareUrl = 'https://gogoph-app.web.app'
                  const shareData = {
                    title: 'GOGO Express',
                    text: 'Check out GOGO Express - Your all-in-one delivery and ride app!',
                    url: shareUrl
                  }

                  // Try Web Share API first (mobile)
                  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                    try {
                      await navigator.share(shareData)
                    } catch (err) {
                      // User cancelled or error - fall back to clipboard
                      if ((err as Error).name !== 'AbortError') {
                        await navigator.clipboard.writeText(shareUrl)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }
                    }
                  } else {
                    // Fallback: copy to clipboard
                    try {
                      await navigator.clipboard.writeText(shareUrl)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    } catch {
                      // Final fallback for older browsers
                      const textArea = document.createElement('textarea')
                      textArea.value = shareUrl
                      document.body.appendChild(textArea)
                      textArea.select()
                      document.execCommand('copy')
                      document.body.removeChild(textArea)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }
                  }
                }}
                className="flex items-center justify-center gap-2 bg-primary-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-primary-700 active:scale-[0.98] transition-all shrink-0"
              >
                <Share2 className="h-4 w-4" />
                {copied ? 'Copied!' : 'Share'}
              </button>
            </div>
          </div>

          {/* Account Settings */}
          <section>
            <h3 className="mb-2 px-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Account Settings
            </h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
              {accountMenuItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="flex w-full items-center gap-3 px-3 py-3 text-left transition-all hover:bg-gray-50 active:bg-gray-100 group"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 shrink-0">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-900 block leading-tight">
                        {item.label}
                      </span>
                      {item.subtitle && (
                        <span className="text-[11px] text-gray-500 leading-tight">{item.subtitle}</span>
                      )}
                    </div>
                    {item.badge && (
                      <span className={`rounded-full ${item.badgeColor || 'bg-primary-600'} px-2 py-0.5 text-[10px] font-semibold text-white`}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                  </button>
                )
              })}
            </div>
          </section>

          {/* Support */}
          <section>
            <h3 className="mb-2 px-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Support & Info
            </h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
              {supportMenuItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="flex w-full items-center gap-3 px-3 py-3 text-left transition-all hover:bg-gray-50 active:bg-gray-100 group"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 shrink-0">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-900 block leading-tight">
                        {item.label}
                      </span>
                      {item.subtitle && (
                        <span className="text-[11px] text-gray-500 leading-tight">{item.subtitle}</span>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                  </button>
                )
              })}
            </div>
          </section>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 py-3 text-red-600 text-sm font-medium transition-all hover:bg-red-50 hover:border-red-200 active:scale-[0.99]"
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </button>

          {/* Version Info */}
          <div className="pb-4 text-center">
            <p className="text-[11px] text-gray-400">
              GOGO Express v1.0.0
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
