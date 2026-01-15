import { useNavigate } from 'react-router-dom'
import {
  Wallet as WalletIcon,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone,
  Banknote,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/utils/cn'

// Mock transaction data
const mockTransactions = [
  {
    id: '1',
    type: 'payment' as const,
    description: 'Jollibee Order',
    amount: -299,
    date: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '2',
    type: 'topup' as const,
    description: 'GCash Top Up',
    amount: 500,
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '3',
    type: 'payment' as const,
    description: 'MC Taxi Ride',
    amount: -85,
    date: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: '4',
    type: 'refund' as const,
    description: 'Order Refund',
    amount: 150,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
]

const paymentMethods = [
  {
    id: 'gcash',
    name: 'GCash',
    icon: Smartphone,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Pay with GCash e-wallet',
  },
  {
    id: 'cash',
    name: 'Cash on Delivery',
    icon: Banknote,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Pay cash on delivery',
  },
]

export default function Wallet() {
  const navigate = useNavigate()
  const walletBalance = 750.50

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-white pb-20 lg:pb-0 page-content">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 lg:top-16">
        <div className="px-6 py-3 lg:px-8 lg:py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 lg:hidden"
            >
              <ChevronLeft className="h-6 w-6 text-gray-900" />
            </button>
            <h1 className="text-lg lg:text-2xl font-semibold lg:font-bold text-gray-900">Wallet</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-4 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
        {/* Balance Card */}
        <div className="rounded-2xl bg-gray-900 p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Available Balance</p>
              <h2 className="mt-1 text-3xl font-bold">
                ₱{walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <WalletIcon className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => navigate('/wallet/topup')}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-gray-900 transition-transform hover:scale-[1.02] active:scale-100"
            >
              <Plus className="h-4 w-4" />
              Top Up
            </button>
            <button
              onClick={() => navigate('/wallet/transactions')}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              History
            </button>
          </div>
        </div>

        {/* Payment Methods */}
        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            Payment Methods
          </h2>

          <div className="space-y-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon

              return (
                <button
                  key={method.id}
                  className="flex w-full items-center gap-3 rounded-xl border border-gray-100 p-4 text-left transition-colors hover:bg-gray-50"
                >
                  <div className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-xl',
                    method.bgColor
                  )}>
                    <Icon className={cn('h-5 w-5', method.color)} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
                    Active
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Promos */}
        <section>
          <button
            onClick={() => navigate('/promos')}
            className="flex w-full items-center gap-3 rounded-xl border border-gray-100 p-4 text-left transition-colors hover:bg-gray-50"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
              <span className="text-xl">🎁</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Promo Codes</h3>
              <p className="text-sm text-gray-500">
                You have 2 available promos
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </section>

        {/* Recent Transactions */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              Recent Transactions
            </h2>
            <button
              onClick={() => navigate('/wallet/transactions')}
              className="text-sm font-medium text-primary-600"
            >
              See all
            </button>
          </div>

          <div className="space-y-1">
            {mockTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50"
              >
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  transaction.amount > 0 ? 'bg-green-50' : 'bg-gray-100'
                )}>
                  {transaction.amount > 0 ? (
                    <ArrowDownLeft className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {transaction.description}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {formatDate(transaction.date)}
                  </p>
                </div>
                <span className={cn(
                  'font-semibold',
                  transaction.amount > 0 ? 'text-green-600' : 'text-gray-900'
                )}>
                  {transaction.amount > 0 ? '+' : ''}₱{Math.abs(transaction.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>
        </div>
      </main>
    </div>
  )
}
