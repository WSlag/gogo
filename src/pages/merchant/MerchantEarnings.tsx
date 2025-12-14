import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  ShoppingBag,
  Clock,
  CreditCard,
  Wallet,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Card, Badge, Button, Modal } from '@/components/ui'

interface EarningsData {
  today: {
    revenue: number
    orders: number
    avgOrderValue: number
    commission: number
    netEarnings: number
  }
  weekly: {
    revenue: number
    orders: number
    trend: number
    dailyData: Array<{ date: string; revenue: number; orders: number }>
  }
  monthly: {
    revenue: number
    orders: number
    trend: number
    commission: number
    netEarnings: number
  }
  pending: {
    amount: number
    nextPayout: Date
  }
  transactions: Array<{
    id: string
    type: 'order' | 'payout' | 'refund' | 'commission'
    description: string
    amount: number
    date: Date
    status: 'completed' | 'pending' | 'failed'
  }>
}

type TimeRange = 'today' | 'week' | 'month'

export default function MerchantEarnings() {
  const navigate = useNavigate()
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRange, setSelectedRange] = useState<TimeRange>('today')
  const [showPayoutModal, setShowPayoutModal] = useState(false)

  useEffect(() => {
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    setLoading(true)
    try {
      // In real app, fetch from Firestore
      setEarnings(MOCK_EARNINGS)
    } catch (error) {
      console.error('Error fetching earnings:', error)
      setEarnings(MOCK_EARNINGS)
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

  if (!earnings) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Earnings data not available</p>
      </div>
    )
  }

  const currentData =
    selectedRange === 'today'
      ? earnings.today
      : selectedRange === 'week'
      ? earnings.weekly
      : earnings.monthly

  return (
    <div className="min-h-screen bg-gray-100 pb-6">
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/merchant')} className="p-1">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold">Earnings</h1>
          </div>
          <button className="p-2 rounded-lg hover:bg-orange-600">
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="px-4 py-4">
        <div className="flex gap-2 bg-white rounded-xl p-1">
          {(['today', 'week', 'month'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                selectedRange === range
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Earnings Card */}
      <div className="px-4">
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white !border-0">
          <div className="text-center">
            <p className="text-orange-100 text-sm mb-1">
              {selectedRange === 'today' ? "Today's" : selectedRange === 'week' ? "This Week's" : "This Month's"} Revenue
            </p>
            <p className="text-4xl font-bold">
              ₱{('revenue' in currentData ? currentData.revenue : 0).toLocaleString()}
            </p>
            {'trend' in currentData && (
              <div className={`flex items-center justify-center gap-1 mt-2 ${currentData.trend >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                {currentData.trend >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-sm">{Math.abs(currentData.trend)}% vs last {selectedRange}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{currentData.orders}</p>
              <p className="text-sm text-orange-100">Orders</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">
                ₱{selectedRange === 'today' ? (earnings.today.avgOrderValue).toFixed(0) : (currentData.revenue / currentData.orders || 0).toFixed(0)}
              </p>
              <p className="text-sm text-orange-100">Avg Order</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Payout */}
      <div className="px-4 mt-4">
        <Card className="!p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Payout</p>
              <p className="text-2xl font-bold text-gray-900">₱{earnings.pending.amount.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Next payout: {earnings.pending.nextPayout.toLocaleDateString()}</p>
            </div>
            <Button size="sm" onClick={() => setShowPayoutModal(true)}>
              <Wallet className="h-4 w-4 mr-1" />
              Withdraw
            </Button>
          </div>
        </Card>
      </div>

      {/* Breakdown */}
      {selectedRange === 'today' && (
        <div className="px-4 mt-4">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Today's Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Gross Revenue</span>
                <span className="font-medium">₱{earnings.today.revenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b text-red-600">
                <span>Platform Commission (15%)</span>
                <span className="font-medium">-₱{earnings.today.commission.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-semibold text-gray-900">Net Earnings</span>
                <span className="font-bold text-green-600">₱{earnings.today.netEarnings.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Weekly Chart */}
      {selectedRange === 'week' && (
        <div className="px-4 mt-4">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Daily Revenue</h3>
            <div className="flex items-end justify-between h-32 gap-1">
              {earnings.weekly.dailyData.map((day, index) => {
                const maxRevenue = Math.max(...earnings.weekly.dailyData.map((d) => d.revenue), 1)
                const height = (day.revenue / maxRevenue) * 100
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-orange-500 rounded-t-md transition-all"
                      style={{ height: `${height}%`, minHeight: day.revenue > 0 ? '8px' : '2px' }}
                    />
                    <span className="text-xs text-gray-500 mt-1">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}
                    </span>
                    <span className="text-xs text-gray-400">
                      {day.orders}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Monthly Summary */}
      {selectedRange === 'month' && (
        <div className="px-4 mt-4">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Monthly Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm text-gray-500">Gross Revenue</p>
                <p className="text-xl font-bold">₱{earnings.monthly.revenue.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-xl font-bold">{earnings.monthly.orders}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-sm text-gray-500">Commission</p>
                <p className="text-xl font-bold text-red-600">-₱{earnings.monthly.commission.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-sm text-gray-500">Net Earnings</p>
                <p className="text-xl font-bold text-green-600">₱{earnings.monthly.netEarnings.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="px-4 mt-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
            <button className="text-sm text-orange-500 font-medium">View All</button>
          </div>
          <div className="space-y-3">
            {earnings.transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 py-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'order' ? 'bg-green-100' :
                  tx.type === 'payout' ? 'bg-blue-100' :
                  tx.type === 'refund' ? 'bg-red-100' : 'bg-orange-100'
                }`}>
                  {tx.type === 'order' ? (
                    <ArrowDownRight className={`h-5 w-5 text-green-600`} />
                  ) : tx.type === 'payout' ? (
                    <ArrowUpRight className="h-5 w-5 text-blue-600" />
                  ) : tx.type === 'refund' ? (
                    <ArrowUpRight className="h-5 w-5 text-red-600" />
                  ) : (
                    <DollarSign className="h-5 w-5 text-orange-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{tx.description}</p>
                  <p className="text-xs text-gray-500">{tx.date.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    tx.type === 'order' ? 'text-green-600' :
                    tx.type === 'commission' || tx.type === 'refund' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {tx.type === 'order' ? '+' : '-'}₱{Math.abs(tx.amount).toLocaleString()}
                  </p>
                  <Badge
                    variant={tx.status === 'completed' ? 'success' : tx.status === 'pending' ? 'warning' : 'error'}
                    className="text-xs"
                  >
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Payout Modal */}
      <Modal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        title="Withdraw Earnings"
      >
        <div className="space-y-4">
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <p className="text-sm text-gray-500">Available for Withdrawal</p>
            <p className="text-3xl font-bold text-gray-900">₱{earnings.pending.amount.toLocaleString()}</p>
          </div>

          <div className="space-y-3">
            <p className="font-medium text-gray-900">Withdraw to:</p>
            <button className="w-full flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Bank Account</p>
                  <p className="text-sm text-gray-500">BDO •••• 1234</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">G</span>
                </div>
                <div className="text-left">
                  <p className="font-medium">GCash</p>
                  <p className="text-sm text-gray-500">0912 •••• 789</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <Button fullWidth size="lg">
            Withdraw ₱{earnings.pending.amount.toLocaleString()}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Withdrawals are processed within 1-3 business days
          </p>
        </div>
      </Modal>
    </div>
  )
}

// Mock data
const MOCK_EARNINGS: EarningsData = {
  today: {
    revenue: 15420,
    orders: 42,
    avgOrderValue: 367,
    commission: 2313,
    netEarnings: 13107,
  },
  weekly: {
    revenue: 98500,
    orders: 285,
    trend: 12,
    dailyData: [
      { date: '2024-01-07', revenue: 12500, orders: 35 },
      { date: '2024-01-08', revenue: 14200, orders: 42 },
      { date: '2024-01-09', revenue: 13800, orders: 38 },
      { date: '2024-01-10', revenue: 16500, orders: 48 },
      { date: '2024-01-11', revenue: 15200, orders: 44 },
      { date: '2024-01-12', revenue: 11800, orders: 36 },
      { date: '2024-01-13', revenue: 14500, orders: 42 },
    ],
  },
  monthly: {
    revenue: 425000,
    orders: 1250,
    trend: 8,
    commission: 63750,
    netEarnings: 361250,
  },
  pending: {
    amount: 45000,
    nextPayout: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
  transactions: [
    { id: '1', type: 'order', description: 'Order #ORD-1234', amount: 452, date: new Date(), status: 'completed' },
    { id: '2', type: 'order', description: 'Order #ORD-1233', amount: 289, date: new Date(Date.now() - 3600000), status: 'completed' },
    { id: '3', type: 'commission', description: 'Platform Commission', amount: 68, date: new Date(Date.now() - 7200000), status: 'completed' },
    { id: '4', type: 'payout', description: 'Bank Transfer', amount: 25000, date: new Date(Date.now() - 86400000), status: 'completed' },
    { id: '5', type: 'refund', description: 'Refund #ORD-1200', amount: 150, date: new Date(Date.now() - 172800000), status: 'completed' },
  ],
}
