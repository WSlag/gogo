import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Car,
  Store,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ChevronRight,
  Bell,
  Settings,
  LogOut,
  Database,
} from 'lucide-react'
import { PesoSign } from '@/components/icons'
import { Card } from '@/components/ui'
import { db, auth } from '@/services/firebase/config'
import { doc, setDoc, GeoPoint, Timestamp, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { useAuthStore } from '@/store/authStore'
import { signOut } from 'firebase/auth'

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
  const { logout } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>(MOCK_STATS)
  const [activities, setActivities] = useState<RecentActivity[]>(MOCK_ACTIVITIES)
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedMessage, setSeedMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch counts from each collection
      const [usersSnapshot, driversSnapshot, merchantsSnapshot, ordersSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'drivers')),
        getDocs(query(collection(db, 'merchants'), where('isApproved', '==', true))),
        getDocs(collection(db, 'orders')),
      ])

      const totalUsers = usersSnapshot.size
      const totalDrivers = driversSnapshot.size
      const totalMerchants = merchantsSnapshot.size
      const totalOrders = ordersSnapshot.size

      // Count active drivers (status === 'online')
      const activeDrivers = driversSnapshot.docs.filter(doc => doc.data().status === 'online').length

      // Get today's orders and revenue
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      let todayOrders = 0
      let todayRevenue = 0
      ordersSnapshot.docs.forEach(doc => {
        const data = doc.data()
        const createdAt = data.createdAt?.toDate()
        if (createdAt && createdAt >= today) {
          todayOrders++
          todayRevenue += data.total || 0
        }
      })

      // Count pending approvals
      // For merchants, check both applicationStatus === 'pending' and isApproved === false
      const [pendingDriversSnapshot, pendingMerchantsByStatus, pendingMerchantsByApproval] = await Promise.all([
        getDocs(query(collection(db, 'users'), where('role', '==', 'driver'), where('driverInfo.applicationStatus', '==', 'pending'))),
        getDocs(query(collection(db, 'merchants'), where('applicationStatus', '==', 'pending'))),
        getDocs(query(collection(db, 'merchants'), where('isApproved', '==', false))),
      ])

      // Deduplicate merchant counts
      const pendingMerchantIds = new Set<string>()
      pendingMerchantsByStatus.docs.forEach(doc => pendingMerchantIds.add(doc.id))
      pendingMerchantsByApproval.docs.forEach(doc => pendingMerchantIds.add(doc.id))

      setStats({
        totalUsers: totalUsers || MOCK_STATS.totalUsers,
        totalDrivers: totalDrivers || MOCK_STATS.totalDrivers,
        totalMerchants: totalMerchants || MOCK_STATS.totalMerchants,
        totalOrders: totalOrders || MOCK_STATS.totalOrders,
        todayOrders: todayOrders || MOCK_STATS.todayOrders,
        todayRevenue: todayRevenue || MOCK_STATS.todayRevenue,
        activeDrivers: activeDrivers || MOCK_STATS.activeDrivers,
        pendingDriverApprovals: pendingDriversSnapshot.size || MOCK_STATS.pendingDriverApprovals,
        pendingMerchantApprovals: pendingMerchantIds.size || MOCK_STATS.pendingMerchantApprovals,
      })

      // Fetch recent activities from orders
      const recentOrdersSnapshot = await getDocs(query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc'),
        limit(5)
      ))

      const recentActivities: RecentActivity[] = recentOrdersSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          type: 'order' as const,
          action: data.status === 'delivered' ? 'Order Delivered' : 'New Order',
          details: `Order #${doc.id.slice(-6).toUpperCase()} ${data.status === 'delivered' ? 'delivered' : 'placed'} by ${data.customerName || 'Customer'}`,
          time: data.createdAt?.toDate() || new Date(),
        }
      })

      if (recentActivities.length > 0) {
        setActivities(recentActivities)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Keep mock data on error
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      logout()
      navigate('/auth/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  // Seed test drivers function
  const seedTestDrivers = async () => {
    setIsSeeding(true)
    setSeedMessage(null)

    const now = Timestamp.now()
    const createTimestamp = (dateStr: string) => Timestamp.fromDate(new Date(dateStr))

    const testDrivers = [
      {
        id: 'test_driver_motorcycle_001',
        userId: 'test_driver_motorcycle_001',
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        phone: '+639171234567',
        email: 'juan.driver@test.com',
        profileImage: 'https://ui-avatars.com/api/?name=Juan+Dela+Cruz&background=10B981&color=fff',
        vehicleType: 'motorcycle',
        vehicle: { type: 'motorcycle', make: 'Honda', model: 'Click 125i', year: 2023, color: 'Red', plateNumber: 'ABC 1234' },
        license: { number: 'N01-12-345678', expiry: createTimestamp('2026-06-15'), type: 'Professional' },
        documents: {},
        rating: 4.8,
        totalRides: 256,
        totalDeliveries: 89,
        status: 'online',
        currentLocation: new GeoPoint(14.5995, 120.9842),
        earnings: { today: 850, thisWeek: 4250, thisMonth: 18500, total: 156000, pendingPayout: 2500 },
        acceptanceRate: 92,
        cancellationRate: 3,
        verified: true,
        verifiedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'test_driver_car_001',
        userId: 'test_driver_car_001',
        firstName: 'Maria',
        lastName: 'Santos',
        phone: '+639182345678',
        email: 'maria.driver@test.com',
        profileImage: 'https://ui-avatars.com/api/?name=Maria+Santos&background=3B82F6&color=fff',
        vehicleType: 'car',
        vehicle: { type: 'car', make: 'Toyota', model: 'Vios', year: 2022, color: 'White', plateNumber: 'XYZ 5678' },
        license: { number: 'N02-34-567890', expiry: createTimestamp('2026-08-20'), type: 'Professional' },
        documents: {},
        rating: 4.9,
        totalRides: 512,
        totalDeliveries: 0,
        status: 'online',
        currentLocation: new GeoPoint(14.5547, 121.0244),
        earnings: { today: 1200, thisWeek: 6800, thisMonth: 28500, total: 285000, pendingPayout: 4200 },
        acceptanceRate: 95,
        cancellationRate: 2,
        verified: true,
        verifiedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'test_driver_taxi_001',
        userId: 'test_driver_taxi_001',
        firstName: 'Pedro',
        lastName: 'Reyes',
        phone: '+639193456789',
        email: 'pedro.driver@test.com',
        profileImage: 'https://ui-avatars.com/api/?name=Pedro+Reyes&background=F59E0B&color=fff',
        vehicleType: 'taxi',
        vehicle: { type: 'taxi', make: 'Toyota', model: 'Innova', year: 2021, color: 'Yellow', plateNumber: 'TAX 9012' },
        license: { number: 'N03-45-678901', expiry: createTimestamp('2026-03-10'), type: 'Professional' },
        documents: {},
        rating: 4.7,
        totalRides: 1024,
        totalDeliveries: 0,
        status: 'online',
        currentLocation: new GeoPoint(14.6507, 121.0495),
        earnings: { today: 1500, thisWeek: 8500, thisMonth: 35000, total: 420000, pendingPayout: 5500 },
        acceptanceRate: 88,
        cancellationRate: 5,
        verified: true,
        verifiedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'test_driver_premium_001',
        userId: 'test_driver_premium_001',
        firstName: 'Carlo',
        lastName: 'Mendoza',
        phone: '+639204567890',
        email: 'carlo.driver@test.com',
        profileImage: 'https://ui-avatars.com/api/?name=Carlo+Mendoza&background=8B5CF6&color=fff',
        vehicleType: 'premium',
        vehicle: { type: 'premium', make: 'Honda', model: 'Accord', year: 2023, color: 'Black', plateNumber: 'PRE 3456' },
        license: { number: 'N04-56-789012', expiry: createTimestamp('2027-01-15'), type: 'Professional' },
        documents: {},
        rating: 4.95,
        totalRides: 328,
        totalDeliveries: 0,
        status: 'online',
        currentLocation: new GeoPoint(14.5176, 121.0509),
        earnings: { today: 2500, thisWeek: 12500, thisMonth: 52000, total: 380000, pendingPayout: 8500 },
        acceptanceRate: 98,
        cancellationRate: 1,
        verified: true,
        verifiedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'test_driver_van_001',
        userId: 'test_driver_van_001',
        firstName: 'Roberto',
        lastName: 'Garcia',
        phone: '+639215678901',
        email: 'roberto.driver@test.com',
        profileImage: 'https://ui-avatars.com/api/?name=Roberto+Garcia&background=EF4444&color=fff',
        vehicleType: 'van',
        vehicle: { type: 'van', make: 'Toyota', model: 'HiAce', year: 2022, color: 'Silver', plateNumber: 'VAN 7890' },
        license: { number: 'N05-67-890123', expiry: createTimestamp('2026-09-25'), type: 'Professional' },
        documents: {},
        rating: 4.85,
        totalRides: 189,
        totalDeliveries: 156,
        status: 'online',
        currentLocation: new GeoPoint(14.5794, 120.9772),
        earnings: { today: 1800, thisWeek: 9200, thisMonth: 38000, total: 295000, pendingPayout: 6200 },
        acceptanceRate: 90,
        cancellationRate: 4,
        verified: true,
        verifiedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ]

    let successCount = 0
    for (const driver of testDrivers) {
      try {
        await setDoc(doc(db, 'drivers', driver.id), driver, { merge: true })
        successCount++
      } catch (error) {
        console.error(`Failed to seed ${driver.firstName}:`, error)
      }
    }

    setIsSeeding(false)
    setSeedMessage(`Successfully seeded ${successCount} test drivers!`)
    setTimeout(() => setSeedMessage(null), 5000)
  }

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
      value: `₱${(stats.todayRevenue / 1000).toFixed(0)}K`,
      icon: PesoSign,
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
            <h1 className="text-xl font-bold">GOGO Express Admin</h1>
            <p className="text-gray-400 text-sm">Dashboard Overview</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-lg hover:bg-gray-800"
            >
              <Bell className="h-5 w-5" />
              {(stats.pendingDriverApprovals + stats.pendingMerchantApprovals) > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => navigate('/account/settings')}
              className="p-2 rounded-lg hover:bg-gray-800"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-800"
            >
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
            <div className="text-center p-4 bg-error-light rounded-xl">
              <p className="text-2xl font-bold text-error">12</p>
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
              <button
                onClick={seedTestDrivers}
                disabled={isSeeding}
                className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition disabled:opacity-50"
              >
                <Database className="h-6 w-6 text-emerald-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{isSeeding ? 'Seeding...' : 'Seed Drivers'}</p>
                  <p className="text-xs text-gray-500">Add test data</p>
                </div>
              </button>
            </div>
            {seedMessage && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                {seedMessage}
              </div>
            )}
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
              <button
                onClick={() => navigate('/admin/orders')}
                className="text-sm text-primary-600 font-medium"
              >
                View All
              </button>
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
