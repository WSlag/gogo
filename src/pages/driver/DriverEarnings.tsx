import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  ChevronRight,
  Car,
  Package,
  CreditCard,
} from 'lucide-react'
import { Button, Card } from '@/components/ui'

type TimeFilter = 'today' | 'week' | 'month' | 'year'

interface EarningEntry {
  id: string
  type: 'ride' | 'delivery' | 'tip' | 'bonus'
  description: string
  amount: number
  date: Date
}

const MOCK_EARNINGS: EarningEntry[] = [
  { id: '1', type: 'ride', description: 'Ride - SM City to NDU', amount: 85, date: new Date() },
  { id: '2', type: 'delivery', description: 'Food Delivery - Jollibee', amount: 65, date: new Date() },
  { id: '3', type: 'tip', description: 'Customer Tip', amount: 20, date: new Date() },
  { id: '4', type: 'ride', description: 'Ride - Airport Transfer', amount: 350, date: new Date() },
  { id: '5', type: 'bonus', description: 'Peak Hour Bonus', amount: 100, date: new Date() },
  { id: '6', type: 'delivery', description: 'Grocery Delivery', amount: 95, date: new Date() },
  { id: '7', type: 'ride', description: 'Ride - Downtown', amount: 55, date: new Date(Date.now() - 86400000) },
  { id: '8', type: 'ride', description: 'Ride - Mall to Residence', amount: 70, date: new Date(Date.now() - 86400000) },
]

const EARNINGS_SUMMARY = {
  today: { total: 715, trips: 6, change: 12 },
  week: { total: 8500, trips: 42, change: 8 },
  month: { total: 35000, trips: 168, change: -3 },
  year: { total: 425000, trips: 2100, change: 15 },
}

export default function DriverEarnings() {
  const navigate = useNavigate()
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today')

  const summary = EARNINGS_SUMMARY[timeFilter]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ride':
        return Car
      case 'delivery':
        return Package
      case 'tip':
        return DollarSign
      case 'bonus':
        return TrendingUp
      default:
        return DollarSign
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ride':
        return 'bg-blue-50 text-blue-600'
      case 'delivery':
        return 'bg-orange-50 text-orange-600'
      case 'tip':
        return 'bg-green-50 text-green-600'
      case 'bonus':
        return 'bg-purple-50 text-purple-600'
      default:
        return 'bg-gray-50 text-gray-600'
    }
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
  }

  // Group earnings by date
  const groupedEarnings = MOCK_EARNINGS.reduce((acc, entry) => {
    const dateKey = formatDate(entry.date)
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(entry)
    return acc
  }, {} as Record<string, EarningEntry[]>)

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-primary-600 text-white">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-2 hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Earnings</h1>
        </div>

        {/* Summary */}
        <div className="px-4 pb-6">
          <div className="text-center">
            <p className="text-primary-100 text-sm mb-1">
              {timeFilter === 'today' ? "Today's" : timeFilter === 'week' ? 'This Week' : timeFilter === 'month' ? 'This Month' : 'This Year'} Earnings
            </p>
            <p className="text-4xl font-bold">₱{summary.total.toLocaleString()}</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {summary.change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-300" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-300" />
              )}
              <span className={`text-sm ${summary.change >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {summary.change >= 0 ? '+' : ''}{summary.change}% vs last {timeFilter}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-xl bg-white/10 p-3 text-center">
              <p className="text-2xl font-bold">{summary.trips}</p>
              <p className="text-xs text-primary-100">Completed Trips</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 text-center">
              <p className="text-2xl font-bold">₱{Math.round(summary.total / summary.trips)}</p>
              <p className="text-xs text-primary-100">Avg per Trip</p>
            </div>
          </div>
        </div>
      </div>

      {/* Time Filter */}
      <div className="px-4 py-3 bg-white border-b sticky top-0 z-10">
        <div className="flex gap-2">
          {(['today', 'week', 'month', 'year'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition ${
                timeFilter === filter
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Payout Card */}
        <Card className="!bg-green-50 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Available for Payout</p>
              <p className="text-2xl font-bold text-green-700">₱8,500.00</p>
            </div>
            <Button size="sm" leftIcon={<CreditCard className="h-4 w-4" />}>
              Cash Out
            </Button>
          </div>
        </Card>

        {/* Earnings List */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Transaction History</h3>
            <button className="flex items-center gap-1 text-sm text-primary-600 font-medium">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          <div className="space-y-4">
            {Object.entries(groupedEarnings).map(([date, entries]) => (
              <div key={date}>
                <p className="text-xs font-medium text-gray-500 mb-2">{date}</p>
                <div className="space-y-2">
                  {entries.map((entry) => {
                    const Icon = getTypeIcon(entry.type)
                    const colorClass = getTypeColor(entry.type)

                    return (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{entry.description}</p>
                          <p className="text-xs text-gray-500 capitalize">{entry.type}</p>
                        </div>
                        <span className="font-semibold text-green-600">
                          +₱{entry.amount}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly Summary */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Weekly Breakdown</h3>
          <div className="space-y-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
              const amount = Math.floor(Math.random() * 1500) + 500
              const maxAmount = 2000
              const percentage = (amount / maxAmount) * 100

              return (
                <div key={day} className="flex items-center gap-3">
                  <span className="w-8 text-xs text-gray-500">{day}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-sm font-medium text-gray-900">
                    ₱{amount.toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
