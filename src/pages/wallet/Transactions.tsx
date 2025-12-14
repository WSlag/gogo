import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
} from 'lucide-react'
import { Card, Spinner, Badge } from '@/components/ui'
import { useWallet } from '@/hooks'

type TransactionType = 'all' | 'topup' | 'payment' | 'refund'

interface Transaction {
  id: string
  type: 'topup' | 'payment' | 'refund' | 'withdrawal' | 'transfer'
  amount: number
  balance: number
  description: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: Date
}

export default function Transactions() {
  const navigate = useNavigate()
  const { getTransactions, isLoading } = useWallet()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<TransactionType>('all')

  useEffect(() => {
    const loadTransactions = async () => {
      const txns = await getTransactions(50)
      setTransactions(txns)
    }
    loadTransactions()
  }, [getTransactions])

  const filteredTransactions = transactions.filter((txn) => {
    if (filter === 'all') return true
    return txn.type === filter
  })

  const formatDate = (date: Date | { toDate: () => Date }) => {
    const d = date instanceof Date ? date : date.toDate()
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (d.toDateString() === today.toDateString()) {
      return `Today, ${d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}`
    } else if (d.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}`
    } else {
      return d.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup':
        return <ArrowDownLeft className="h-5 w-5 text-green-600" />
      case 'refund':
        return <ArrowDownLeft className="h-5 w-5 text-green-600" />
      case 'payment':
      case 'withdrawal':
        return <ArrowUpRight className="h-5 w-5 text-red-600" />
      default:
        return <ArrowUpRight className="h-5 w-5 text-gray-600" />
    }
  }

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'topup':
      case 'refund':
        return 'text-green-600'
      case 'payment':
      case 'withdrawal':
        return 'text-red-600'
      default:
        return 'text-gray-900'
    }
  }

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case 'topup':
      case 'refund':
        return '+'
      case 'payment':
      case 'withdrawal':
        return '-'
      default:
        return ''
    }
  }

  const filters: { value: TransactionType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'topup', label: 'Top Up' },
    { value: 'payment', label: 'Payments' },
    { value: 'refund', label: 'Refunds' },
  ]

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, txn) => {
    const date = txn.createdAt instanceof Date ? txn.createdAt : (txn.createdAt as { toDate: () => Date }).toDate()
    const key = date.toDateString()
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(txn)
    return groups
  }, {} as Record<string, Transaction[]>)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Transaction History</h1>
        </div>

        {/* Filter Pills */}
        <div className="overflow-x-auto scrollbar-hide px-4 pb-3">
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === f.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-12 px-4">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No transactions found</p>
          <p className="text-sm text-gray-400 mt-1">
            {filter !== 'all' ? 'Try changing the filter' : 'Your transactions will appear here'}
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {Object.entries(groupedTransactions).map(([date, txns]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {new Date(date).toLocaleDateString('en-PH', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <Card>
                <div className="divide-y">
                  {txns.map((txn) => (
                    <div key={txn.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        {getTransactionIcon(txn.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{txn.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">
                            {formatDate(txn.createdAt)}
                          </span>
                          {txn.status !== 'completed' && (
                            <Badge
                              variant={txn.status === 'pending' ? 'warning' : 'error'}
                              size="sm"
                            >
                              {txn.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${getAmountColor(txn.type)}`}>
                          {getAmountPrefix(txn.type)}₱{txn.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Bal: ₱{txn.balance.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
