import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Car,
  Store,
  Calendar,
} from 'lucide-react'
import { Card } from '@/components/ui'

type TimeRange = 'today' | 'week' | 'month' | 'year'

interface AnalyticsData {
  revenue: { value: number; change: number }
  orders: { value: number; change: number }
  users: { value: number; change: number }
  avgOrderValue: { value: number; change: number }
}

interface ChartData {
  label: string
  value: number
}

const ANALYTICS_DATA: Record<TimeRange, AnalyticsData> = {
  today: {
    revenue: { value: 425000, change: 12 },
    orders: { value: 1250, change: 8 },
    users: { value: 85, change: 15 },
    avgOrderValue: { value: 340, change: 4 },
  },
  week: {
    revenue: { value: 2850000, change: 8 },
    orders: { value: 8500, change: 5 },
    users: { value: 520, change: 12 },
    avgOrderValue: { value: 335, change: 2 },
  },
  month: {
    revenue: { value: 12500000, change: 15 },
    orders: { value: 35000, change: 10 },
    users: { value: 2100, change: 18 },
    avgOrderValue: { value: 357, change: 5 },
  },
  year: {
    revenue: { value: 145000000, change: 25 },
    orders: { value: 420000, change: 20 },
    users: { value: 15420, change: 35 },
    avgOrderValue: { value: 345, change: 3 },
  },
}

const WEEKLY_DATA: ChartData[] = [
  { label: 'Mon', value: 380000 },
  { label: 'Tue', value: 420000 },
  { label: 'Wed', value: 350000 },
  { label: 'Thu', value: 480000 },
  { label: 'Fri', value: 520000 },
  { label: 'Sat', value: 450000 },
  { label: 'Sun', value: 250000 },
]

const TOP_MERCHANTS = [
  { name: 'Jollibee Awang', orders: 245, revenue: 85000 },
  { name: 'McDonalds Cotabato', orders: 198, revenue: 72000 },
  { name: 'Savemore Cotabato', orders: 156, revenue: 125000 },
  { name: 'Mang Inasal', orders: 142, revenue: 48000 },
  { name: 'Chowking', orders: 128, revenue: 42000 },
]

const ORDER_BREAKDOWN = [
  { type: 'Food Delivery', count: 680, percentage: 54 },
  { type: 'Grocery', count: 320, percentage: 26 },
  { type: 'Rides', count: 250, percentage: 20 },
]

export default function AdminAnalytics() {
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState<TimeRange>('today')

  const data = ANALYTICS_DATA[timeRange]
  const maxChartValue = Math.max(...WEEKLY_DATA.map((d) => d.value))

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `P${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `P${(value / 1000).toFixed(0)}K`
    }
    return `P${value}`
  }

  const stats = [
    {
      label: 'Total Revenue',
      value: formatCurrency(data.revenue.value),
      change: data.revenue.change,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Total Orders',
      value: data.orders.value.toLocaleString(),
      change: data.orders.change,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'New Users',
      value: data.users.value.toLocaleString(),
      change: data.users.change,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Avg Order Value',
      value: `P${data.avgOrderValue.value}`,
      change: data.avgOrderValue.change,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      {/* Header */}
      <div className="bg-gray-900 text-white px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 rounded-lg hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Analytics</h1>
            <p className="text-gray-400 text-sm">Business insights and reports</p>
          </div>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="bg-white border-b px-6 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div className="flex gap-2">
            {(['today', 'week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                  timeRange === range
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            const isPositive = stat.change >= 0

            return (
              <Card key={index} className="!p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {isPositive ? '+' : ''}{stat.change}%
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </Card>
            )
          })}
        </div>

        {/* Revenue Chart */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Weekly Revenue</h3>
          <div className="space-y-3">
            {WEEKLY_DATA.map((item) => {
              const percentage = (item.value / maxChartValue) * 100

              return (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="w-10 text-sm text-gray-500">{item.label}</span>
                  <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-20 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Breakdown */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Order Breakdown</h3>
            <div className="space-y-4">
              {ORDER_BREAKDOWN.map((item) => (
                <div key={item.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{item.type}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.type === 'Food Delivery'
                          ? 'bg-orange-500'
                          : item.type === 'Grocery'
                          ? 'bg-green-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Total Orders</span>
                <span className="text-lg font-bold text-gray-900">
                  {ORDER_BREAKDOWN.reduce((sum, item) => sum + item.count, 0)}
                </span>
              </div>
            </div>
          </Card>

          {/* Top Merchants */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Top Merchants</h3>
            <div className="space-y-3">
              {TOP_MERCHANTS.map((merchant, index) => (
                <div
                  key={merchant.name}
                  className="flex items-center gap-3 py-2"
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0
                      ? 'bg-yellow-100 text-yellow-700'
                      : index === 1
                      ? 'bg-gray-200 text-gray-700'
                      : index === 2
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{merchant.name}</p>
                    <p className="text-xs text-gray-500">{merchant.orders} orders</p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    P{merchant.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Platform Performance</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <Car className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">89</p>
              <p className="text-sm text-gray-500">Active Drivers</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <Store className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">142</p>
              <p className="text-sm text-gray-500">Active Merchants</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <ShoppingBag className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">94%</p>
              <p className="text-sm text-gray-500">Completion Rate</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">4.7</p>
              <p className="text-sm text-gray-500">Avg Rating</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
