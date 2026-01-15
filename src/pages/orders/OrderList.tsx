import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package,
  UtensilsCrossed,
  ShoppingCart,
  Car,
  ChevronRight,
  RefreshCw,
  Star,
  Clock,
  Pill,
} from 'lucide-react'
import { Card, Spinner, Button } from '@/components/ui'
import { useOrders } from '@/hooks'
import { cn } from '@/utils/cn'
import type { Order, OrderStatus } from '@/types'

type OrderFilter = 'all' | 'active' | 'completed'

const orderIcons: Record<string, typeof UtensilsCrossed> = {
  food: UtensilsCrossed,
  grocery: ShoppingCart,
  pharmacy: Pill,
  ride: Car,
}

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  picked_up: 'Picked Up',
  on_the_way: 'On the Way',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const activeStatuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way']
const completedStatuses: OrderStatus[] = ['delivered', 'completed']

export default function OrderList() {
  const navigate = useNavigate()
  const { getOrders, reorder, subscribeToActiveOrders, isLoading } = useOrders()
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<OrderFilter>('all')
  const [reorderingId, setReorderingId] = useState<string | null>(null)

  // Load orders
  useEffect(() => {
    const loadOrders = async () => {
      const fetchedOrders = await getOrders(undefined, 50)
      setOrders(fetchedOrders)
    }
    loadOrders()
  }, [getOrders])

  // Subscribe to active orders for real-time updates
  useEffect(() => {
    const unsub = subscribeToActiveOrders()
    return () => unsub()
  }, [subscribeToActiveOrders])

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true
    if (filter === 'active') return activeStatuses.includes(order.status)
    return completedStatuses.includes(order.status)
  })

  const formatTime = (timestamp: { toDate?: () => Date } | Date) => {
    const date = timestamp instanceof Date
      ? timestamp
      : timestamp.toDate
        ? timestamp.toDate()
        : new Date()

    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 1000 / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 60) return `${minutes} min ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
  }

  const handleReorder = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation()
    setReorderingId(orderId)
    const success = await reorder(orderId)
    setReorderingId(null)
    if (success) {
      navigate('/cart')
    }
  }

  return (
    <div className="bg-white pb-20 lg:pb-0 page-content">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="px-4 py-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Orders</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(['all', 'active', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors',
                  filter === tab
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading && orders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-500">Loading orders...</p>
            </div>
          )}

          {/* Orders List */}
          {!isLoading && filteredOrders.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOrders.map((order) => {
                const Icon = orderIcons[order.type]
                const isActive = activeStatuses.includes(order.status)
                const isReordering = reorderingId === order.id

                return (
                  <Card
                    key={order.id}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      isActive && 'border-primary-200 bg-primary-50/30'
                    )}
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'flex h-11 w-11 items-center justify-center rounded-xl',
                          order.type === 'food' && 'bg-orange-50',
                          order.type === 'grocery' && 'bg-green-50',
                          order.type === 'pharmacy' && 'bg-red-50'
                        )}
                      >
                        {Icon ? (
                          <Icon
                            className={cn(
                              'h-5 w-5',
                              order.type === 'food' && 'text-orange-600',
                              order.type === 'grocery' && 'text-green-600',
                              order.type === 'pharmacy' && 'text-red-600'
                            )}
                          />
                        ) : (
                          <Package className="h-5 w-5 text-gray-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {order.merchantName || order.merchantId}
                          </h3>
                          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        </div>

                        <p className="mt-0.5 text-sm text-gray-500">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-xs font-medium',
                              isActive
                                ? 'bg-primary-100 text-primary-700'
                                : order.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-600'
                            )}
                          >
                            {statusLabels[order.status]}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            {formatTime(order.createdAt)}
                          </span>
                        </div>

                        {/* Rating (if delivered and rated) */}
                        {order.rating && (
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">{order.rating}</span>
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                          <span className="font-semibold text-gray-900">
                            ₱{order.total.toLocaleString()}
                          </span>
                          {isActive ? (
                            <span className="rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white">
                              Track Order
                            </span>
                          ) : order.status !== 'cancelled' ? (
                            <button
                              onClick={(e) => handleReorder(e, order.id)}
                              disabled={isReordering}
                              className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                              {isReordering ? (
                                <Spinner size="sm" />
                              ) : (
                                <RefreshCw className="h-3.5 w-3.5" />
                              )}
                              Reorder
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900">No orders yet</h3>
              <p className="mt-1 text-sm text-gray-500 text-center">
                {filter === 'active'
                  ? "You don't have any active orders"
                  : filter === 'completed'
                  ? "You haven't completed any orders yet"
                  : 'Start ordering from your favorite places'}
              </p>
              <Button className="mt-4" onClick={() => navigate('/')}>
                Browse Services
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
