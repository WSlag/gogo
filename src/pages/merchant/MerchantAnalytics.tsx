import { useState, useMemo } from 'react'
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
import { useMerchantApplication } from '@/hooks/useMerchantApplication'
import { useMerchantOrders } from '@/hooks/useMerchantOrders'
import type { Order } from '@/types'

type TimeRange = 'week' | 'month' | 'year'

function getOrderDate(order: Order): Date {
  if (order.createdAt && typeof order.createdAt.toDate === 'function') {
    return order.createdAt.toDate()
  }
  return new Date(0)
}

export default function MerchantAnalytics() {
  const navigate = useNavigate()
  const [selectedRange, setSelectedRange] = useState<TimeRange>('week')

  const { merchantData, isLoading: appLoading } = useMerchantApplication()
  const merchantId = merchantData?.id || ''
  const { orders, isLoading: ordersLoading } = useMerchantOrders({
    merchantId,
    merchantUserId: merchantData?.userId,
    limitCount: 500,
  })

  const loading = appLoading || ordersLoading

  const analytics = useMemo(() => {
    const now = new Date()
    let rangeStart: Date

    if (selectedRange === 'week') {
      rangeStart = new Date(now)
      rangeStart.setDate(rangeStart.getDate() - 7)
      rangeStart.setHours(0, 0, 0, 0)
    } else if (selectedRange === 'month') {
      rangeStart = new Date(now.getFullYear(), now.getMonth(), 1)
    } else {
      rangeStart = new Date(now.getFullYear(), 0, 1)
    }

    const completedOrders = orders.filter(o => o.status !== 'cancelled')
    const filteredOrders = completedOrders.filter(o => getOrderDate(o) >= rangeStart)

    // Overview
    const totalRevenue = filteredOrders.reduce((s, o) => s + (o.total || 0), 0)
    const totalOrders = filteredOrders.length
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

    const customerIds = new Set(filteredOrders.map(o => o.customerId).filter(Boolean))
    const totalCustomers = customerIds.size

    const ratedOrders = filteredOrders.filter(o => o.rating && o.rating > 0)
    const avgRating = ratedOrders.length > 0
      ? ratedOrders.reduce((s, o) => s + (o.rating || 0), 0) / ratedOrders.length
      : 0

    const avgOrdersPerCustomer = totalCustomers > 0 ? totalOrders / totalCustomers : 0

    // Top Items - aggregate from order items
    const itemMap = new Map<string, { orders: number; revenue: number; ratings: number[]; id: string }>()
    filteredOrders.forEach((order, idx) => {
      order.items?.forEach(item => {
        const key = item.name || item.productId || `item-${idx}`
        const existing = itemMap.get(key) || { orders: 0, revenue: 0, ratings: [], id: item.productId || key }
        existing.orders += item.quantity || 1
        existing.revenue += (item.price || 0) * (item.quantity || 1)
        if (order.rating) existing.ratings.push(order.rating)
        itemMap.set(key, existing)
      })
    })
    const topItems = [...itemMap.entries()]
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([name, data]) => ({
        id: data.id,
        name,
        orders: data.orders,
        revenue: data.revenue,
        rating: data.ratings.length > 0 ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length : 0,
      }))

    // Hourly Orders (6AM to 11PM)
    const hourlyMap = new Map<number, number>()
    for (let h = 6; h <= 23; h++) hourlyMap.set(h, 0)
    filteredOrders.forEach(o => {
      const hour = getOrderDate(o).getHours()
      if (hour >= 6 && hour <= 23) {
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1)
      }
    })
    const hourlyOrders = [...hourlyMap.entries()].map(([hour, count]) => ({ hour, orders: count }))

    // Orders by Day of week
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayMap = new Map<string, { orders: number; revenue: number }>()
    dayNames.forEach(d => dayMap.set(d, { orders: 0, revenue: 0 }))
    filteredOrders.forEach(o => {
      const day = dayNames[getOrderDate(o).getDay()]
      const existing = dayMap.get(day)!
      existing.orders += 1
      existing.revenue += o.total || 0
    })
    const ordersByDay = dayNames.map(day => ({ day, ...dayMap.get(day)! }))

    // Customer Insights - approximate new vs returning
    const allCustomerIds = new Set(completedOrders.map(o => o.customerId).filter(Boolean))
    const priorOrders = completedOrders.filter(o => getOrderDate(o) < rangeStart)
    const priorCustomerIds = new Set(priorOrders.map(o => o.customerId).filter(Boolean))
    const currentCustomerIds = new Set(filteredOrders.map(o => o.customerId).filter(Boolean))
    let newCustomers = 0
    let returningCustomers = 0
    currentCustomerIds.forEach(id => {
      if (priorCustomerIds.has(id)) returningCustomers++
      else newCustomers++
    })

    // Rating Distribution
    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratedOrders.forEach(o => {
      const star = Math.round(o.rating || 0)
      if (star >= 1 && star <= 5) distribution[star]++
    })
    const totalReviews = ratedOrders.length

    // Peak Hours (top 4)
    const peakHours = [...hourlyOrders]
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 4)
      .map(h => ({
        hour: `${h.hour > 12 ? h.hour - 12 : h.hour} ${h.hour >= 12 ? 'PM' : 'AM'}`,
        orders: h.orders,
      }))

    return {
      overview: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        totalCustomers,
        avgRating,
        avgPrepTime: 0,
        revenueGrowth: 0,
        ordersGrowth: 0,
      },
      topItems,
      hourlyOrders,
      ordersByDay,
      customerInsights: {
        newCustomers,
        returningCustomers,
        avgOrdersPerCustomer: Math.round(avgOrdersPerCustomer * 10) / 10,
      },
      ratings: {
        average: avgRating,
        distribution,
        totalReviews,
      },
      peakHours,
    }
  }, [orders, selectedRange])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
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
                  width: `${(analytics.customerInsights.newCustomers + analytics.customerInsights.returningCustomers) > 0 ? (analytics.customerInsights.newCustomers / (analytics.customerInsights.newCustomers + analytics.customerInsights.returningCustomers)) * 100 : 50}%`,
                }}
              />
              <div className="bg-blue-500 h-full flex-1" />
            </div>
            <div className="flex justify-between mt-1 text-xs">
              <span className="text-green-600">New {(analytics.customerInsights.newCustomers + analytics.customerInsights.returningCustomers) > 0 ? Math.round((analytics.customerInsights.newCustomers / (analytics.customerInsights.newCustomers + analytics.customerInsights.returningCustomers)) * 100) : 0}%</span>
              <span className="text-blue-600">Returning {(analytics.customerInsights.newCustomers + analytics.customerInsights.returningCustomers) > 0 ? Math.round((analytics.customerInsights.returningCustomers / (analytics.customerInsights.newCustomers + analytics.customerInsights.returningCustomers)) * 100) : 0}%</span>
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
                const percentage = analytics.ratings.totalReviews > 0 ? (count / analytics.ratings.totalReviews) * 100 : 0
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

