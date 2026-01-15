import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  Star,
  Clock,
  Calendar,
  Filter,
  Download,
  BarChart3,
  PieChart,
} from 'lucide-react'
import { PesoSign } from '@/components/icons'
import { Card, Badge } from '@/components/ui'

interface AnalyticsData {
  overview: {
    totalRevenue: number
    totalOrders: number
    avgOrderValue: number
    totalCustomers: number
    avgRating: number
    avgPrepTime: number
    revenueGrowth: number
    ordersGrowth: number
  }
  topItems: Array<{
    id: string
    name: string
    orders: number
    revenue: number
    rating: number
  }>
  hourlyOrders: Array<{ hour: number; orders: number }>
  ordersByDay: Array<{ day: string; orders: number; revenue: number }>
  customerInsights: {
    newCustomers: number
    returningCustomers: number
    avgOrdersPerCustomer: number
  }
  ratings: {
    average: number
    distribution: { [key: number]: number }
    totalReviews: number
  }
  peakHours: Array<{ hour: string; orders: number }>
}

type TimeRange = 'week' | 'month' | 'year'

export default function MerchantAnalytics() {
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRange, setSelectedRange] = useState<TimeRange>('week')

  useEffect(() => {
    fetchAnalytics()
  }, [selectedRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // In real app, fetch from Firestore/analytics service
      setAnalytics(MOCK_ANALYTICS)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setAnalytics(MOCK_ANALYTICS)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Analytics not available</p>
      </div>
    )
  }

  const maxHourlyOrders = Math.max(...analytics.hourlyOrders.map((h) => h.orders), 1)

  return (
    <div className="min-h-screen bg-gray-100 pb-6">
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/merchant')} className="p-1">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold">Analytics</h1>
          </div>
          <button className="p-2 rounded-lg hover:bg-orange-600">
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="px-4 py-4">
        <div className="flex gap-2 bg-white rounded-xl p-1">
          {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                selectedRange === range
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'This Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="!p-4">
            <div className="flex items-center gap-2 mb-2">
              <PesoSign className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-500">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">₱{(analytics.overview.totalRevenue / 1000).toFixed(0)}K</p>
            <div className={`flex items-center gap-1 mt-1 text-sm ${analytics.overview.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.overview.revenueGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{Math.abs(analytics.overview.revenueGrowth)}%</span>
            </div>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-500">Orders</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalOrders}</p>
            <div className={`flex items-center gap-1 mt-1 text-sm ${analytics.overview.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.overview.ordersGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{Math.abs(analytics.overview.ordersGrowth)}%</span>
            </div>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-gray-500">Customers</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalCustomers}</p>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-gray-500">Rating</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.overview.avgRating.toFixed(1)}</p>
          </Card>
        </div>

        {/* Secondary Stats */}
        <Card className="!p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">₱{analytics.overview.avgOrderValue}</p>
              <p className="text-xs text-gray-500">Avg Order</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.avgPrepTime}m</p>
              <p className="text-xs text-gray-500">Avg Prep Time</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{analytics.customerInsights.avgOrdersPerCustomer.toFixed(1)}</p>
              <p className="text-xs text-gray-500">Orders/Customer</p>
            </div>
          </div>
        </Card>

        {/* Hourly Orders Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Orders by Hour</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-end justify-between h-24 gap-0.5">
            {analytics.hourlyOrders.map((item) => {
              const height = (item.orders / maxHourlyOrders) * 100
              const isPeak = item.orders >= maxHourlyOrders * 0.8
              return (
                <div key={item.hour} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full rounded-t-sm transition-all ${isPeak ? 'bg-orange-500' : 'bg-orange-200'}`}
                    style={{ height: `${height}%`, minHeight: item.orders > 0 ? '4px' : '1px' }}
                  />
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">6AM</span>
            <span className="text-xs text-gray-400">12PM</span>
            <span className="text-xs text-gray-400">6PM</span>
            <span className="text-xs text-gray-400">12AM</span>
          </div>
        </Card>

        {/* Top Items */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Top Selling Items</h3>
            <button className="text-sm text-orange-500 font-medium">View All</button>
          </div>
          <div className="space-y-3">
            {analytics.topItems.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-200 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{item.orders} orders</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      {item.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">₱{item.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Customer Insights */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Customer Insights</h3>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{analytics.customerInsights.newCustomers}</p>
              <p className="text-xs text-gray-500">New Customers</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{analytics.customerInsights.returningCustomers}</p>
              <p className="text-xs text-gray-500">Returning</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Customer Distribution</p>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex">
              <div
                className="bg-green-500 h-full"
                style={{
                  width: `${(analytics.customerInsights.newCustomers / (analytics.customerInsights.newCustomers + analytics.customerInsights.returningCustomers)) * 100}%`,
                }}
              />
              <div className="bg-blue-500 h-full flex-1" />
            </div>
            <div className="flex justify-between mt-1 text-xs">
              <span className="text-green-600">New {Math.round((analytics.customerInsights.newCustomers / (analytics.customerInsights.newCustomers + analytics.customerInsights.returningCustomers)) * 100)}%</span>
              <span className="text-blue-600">Returning {Math.round((analytics.customerInsights.returningCustomers / (analytics.customerInsights.newCustomers + analytics.customerInsights.returningCustomers)) * 100)}%</span>
            </div>
          </div>
        </Card>

        {/* Rating Distribution */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Rating Distribution</h3>
            <Star className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">{analytics.ratings.average.toFixed(1)}</p>
              <div className="flex gap-0.5 justify-center mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= Math.round(analytics.ratings.average) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">{analytics.ratings.totalReviews} reviews</p>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = analytics.ratings.distribution[star] || 0
                const percentage = (count / analytics.ratings.totalReviews) * 100
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-4">{star}</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Peak Hours */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Peak Hours</h3>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            {analytics.peakHours.map((peak) => (
              <div
                key={peak.hour}
                className="px-3 py-2 bg-orange-100 rounded-lg text-center"
              >
                <p className="font-medium text-orange-700">{peak.hour}</p>
                <p className="text-xs text-orange-600">{peak.orders} orders</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

// Mock data
const MOCK_ANALYTICS: AnalyticsData = {
  overview: {
    totalRevenue: 425000,
    totalOrders: 1250,
    avgOrderValue: 340,
    totalCustomers: 890,
    avgRating: 4.7,
    avgPrepTime: 12,
    revenueGrowth: 15,
    ordersGrowth: 12,
  },
  topItems: [
    { id: '1', name: 'Chickenjoy 2pc with Rice', orders: 450, revenue: 85050, rating: 4.8 },
    { id: '2', name: 'Jolly Spaghetti Family', orders: 320, revenue: 51200, rating: 4.7 },
    { id: '3', name: 'Burger Steak 2pc', orders: 280, revenue: 39200, rating: 4.6 },
    { id: '4', name: 'Yum Burger', orders: 250, revenue: 17500, rating: 4.5 },
    { id: '5', name: 'Peach Mango Pie', orders: 200, revenue: 8000, rating: 4.9 },
  ],
  hourlyOrders: [
    { hour: 6, orders: 5 },
    { hour: 7, orders: 12 },
    { hour: 8, orders: 25 },
    { hour: 9, orders: 30 },
    { hour: 10, orders: 35 },
    { hour: 11, orders: 65 },
    { hour: 12, orders: 120 },
    { hour: 13, orders: 95 },
    { hour: 14, orders: 45 },
    { hour: 15, orders: 35 },
    { hour: 16, orders: 40 },
    { hour: 17, orders: 55 },
    { hour: 18, orders: 110 },
    { hour: 19, orders: 130 },
    { hour: 20, orders: 85 },
    { hour: 21, orders: 50 },
    { hour: 22, orders: 25 },
    { hour: 23, orders: 10 },
  ],
  ordersByDay: [
    { day: 'Mon', orders: 165, revenue: 56100 },
    { day: 'Tue', orders: 180, revenue: 61200 },
    { day: 'Wed', orders: 175, revenue: 59500 },
    { day: 'Thu', orders: 190, revenue: 64600 },
    { day: 'Fri', orders: 220, revenue: 74800 },
    { day: 'Sat', orders: 180, revenue: 61200 },
    { day: 'Sun', orders: 140, revenue: 47600 },
  ],
  customerInsights: {
    newCustomers: 245,
    returningCustomers: 645,
    avgOrdersPerCustomer: 1.4,
  },
  ratings: {
    average: 4.7,
    distribution: { 5: 580, 4: 320, 3: 85, 2: 15, 1: 5 },
    totalReviews: 1005,
  },
  peakHours: [
    { hour: '12 PM', orders: 120 },
    { hour: '1 PM', orders: 95 },
    { hour: '7 PM', orders: 130 },
    { hour: '8 PM', orders: 85 },
  ],
}
