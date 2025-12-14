import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Car,
  Store,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react'
import { Card } from '@/components/ui'

interface DashboardStats {
  totalUsers: number
  totalDrivers: number
  totalMerchants: number
  totalOrders: number
  todayOrders: number
  todayRevenue: number
  activeDrivers: number
  pendingDriverApprovals: number
  pendingMerchantApprovals: number
}

interface RecentActivity {
  id: string
  type: 'order' | 'driver' | 'merchant' | 'user'
  action: string
  details: string
  time: Date
}

const MOCK_STATS: DashboardStats = {
  totalUsers: 15420,
  totalDrivers: 342,
  totalMerchants: 156,
  totalOrders: 85000,
  todayOrders: 1250,
  todayRevenue: 425000,
  activeDrivers: 89,
  pendingDriverApprovals: 12,
  pendingMerchantApprovals: 5,
}

const MOCK_ACTIVITIES: RecentActivity[] = [
  { id: '1', type: 'order', action: 'New Order', details: 'Order #12345 placed by Maria S.', time: new Date() },
  { id: '2', type: 'driver', action: 'Driver Online', details: 'Juan D. went online', time: new Date(Date.now() - 300000) },
  { id: '3', type: 'merchant', action: 'New Application', details: 'Mang Inasal applied as merchant', time: new Date(Date.now() - 600000) },
  { id: '4', type: 'order', action: 'Order Delivered', details: 'Order #12340 delivered successfully', time: new Date(Date.now() - 900000) },
  { id: '5', type: 'user', action: 'New User', details: 'Carlos M. registered', time: new Date(Date.now() - 1200000) },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats] = useState<DashboardStats>(MOCK_STATS)
  const [activities] = useState<RecentActivity[]>(MOCK_ACTIVITIES)

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000)
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff}m ago`
    return `${Math.floor(diff / 60)}h ago`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return ShoppingBag
      case 'driver':
        return Car
      case 'merchant':
        return Store
      case 'user':
        return Users
      default:
        return AlertCircle
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-50 text-blue-600'
      case 'driver':
        return 'bg-green-50 text-green-600'
      case 'merchant':
        return 'bg-orange-50 text-orange-600'
      case 'user':
        return 'bg-purple-50 text-purple-600'
      default:
        return 'bg-gray-50 text-gray-600'
    }
  }

  const quickStats = [
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
      positive: true,
    },
    {
      label: 'Active Drivers',
      value: stats.activeDrivers.toString(),
      subValue: `of ${stats.totalDrivers}`,
      icon: Car,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Merchants',
      value: stats.totalMerchants.toString(),
      icon: Store,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+5%',
      positive: true,
    },
    {
      label: "Today's Revenue",
      value: `P${(stats.todayRevenue / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      change: '+8%',
      positive: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-900 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">GOGO Admin</h1>
            <p className="text-gray-400 text-sm">Dashboard Overview</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-gray-800">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-800">
              <Settings className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-800">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Pending Approvals Banner */}
      {(stats.pendingDriverApprovals > 0 || stats.pendingMerchantApprovals > 0) && (
        <div className="bg-yellow-50 border-b border-yellow-100 px-6 py-3 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            {stats.pendingDriverApprovals} driver and {stats.pendingMerchantApprovals} merchant applications pending review
          </span>
          <button
            onClick={() => navigate('/admin/approvals')}
            className="ml-auto text-sm text-yellow-700 font-medium hover:underline"
          >
            Review Now
          </button>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="!p-4">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  {stat.change && (
                    <div className={`flex items-center gap-1 text-xs ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {stat.change}
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.subValue && (
                    <p className="text-xs text-gray-500">{stat.subValue}</p>
                  )}
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Orders Summary */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Today's Orders</h3>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-sm text-primary-600 font-medium"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">{stats.todayOrders}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">1,180</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <p className="text-2xl font-bold text-yellow-600">58</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <p className="text-2xl font-bold text-red-600">12</p>
              <p className="text-sm text-gray-500">Cancelled</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
              >
                <Users className="h-6 w-6 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Users</p>
                  <p className="text-xs text-gray-500">Manage users</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/admin/drivers')}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
              >
                <Car className="h-6 w-6 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Drivers</p>
                  <p className="text-xs text-gray-500">Manage drivers</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/admin/merchants')}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
              >
                <Store className="h-6 w-6 text-orange-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Merchants</p>
                  <p className="text-xs text-gray-500">Manage merchants</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/admin/analytics')}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
              >
                <TrendingUp className="h-6 w-6 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Analytics</p>
                  <p className="text-xs text-gray-500">View reports</p>
                </div>
              </button>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
              <button className="text-sm text-primary-600 font-medium">View All</button>
            </div>
            <div className="space-y-3">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.type)
                const colorClass = getActivityColor(activity.type)

                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 py-2"
                  >
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500 truncate">{activity.details}</p>
                    </div>
                    <span className="text-xs text-gray-400">{formatTime(activity.time)}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Pending Approvals */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Pending Approvals</h3>
            <button
              onClick={() => navigate('/admin/approvals')}
              className="text-sm text-primary-600 font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Car className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Driver Applications</p>
                  <p className="text-sm text-gray-500">{stats.pendingDriverApprovals} pending</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/admin/approvals?type=driver')}
                className="flex items-center gap-1 text-sm text-primary-600 font-medium"
              >
                Review <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Store className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Merchant Applications</p>
                  <p className="text-sm text-gray-500">{stats.pendingMerchantApprovals} pending</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/admin/approvals?type=merchant')}
                className="flex items-center gap-1 text-sm text-primary-600 font-medium"
              >
                Review <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
