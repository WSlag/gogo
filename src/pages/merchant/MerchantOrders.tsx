import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  Phone,
  ChevronRight,
  Filter,
  Search,
  Package,
  Truck,
  RefreshCw,
} from 'lucide-react'
import { Button, Card, Modal, Spinner } from '@/components/ui'
import { useMerchantOrders } from '@/hooks/useMerchantOrders'
import type { Order, OrderStatus } from '@/types'
import { cn } from '@/utils/cn'

type OrderFilter = 'all' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'

// Default to 'all' to show all orders, can be filtered via URL param ?merchant=xxx
const DEFAULT_MERCHANT_ID = 'all'

export default function MerchantOrders() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Allow merchant ID override via URL param for testing
  const TEST_MERCHANT_ID = searchParams.get('merchant') || DEFAULT_MERCHANT_ID

  const [filter, setFilter] = useState<OrderFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showFilterModal, setShowFilterModal] = useState(false)

  // Fetch orders with real-time updates
  const {
    orders,
    isLoading,
    refetch,
    acceptOrder,
    rejectOrder,
    startPreparing,
    markReady,
  } = useMerchantOrders({
    merchantId: TEST_MERCHANT_ID,
    realtime: true,
  })

  const filteredOrders = orders.filter((order) => {
    if (filter !== 'all') {
      if (filter === 'completed' && order.status !== 'delivered') return false
      if (filter !== 'completed' && order.status !== filter) return false
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const customerName = order.deliveryAddress?.contactName || ''
      return (
        customerName.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query)
      )
    }
    return true
  })

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-700'
      case 'confirmed':
        return 'bg-blue-100 text-blue-700'
      case 'preparing':
        return 'bg-yellow-100 text-yellow-700'
      case 'ready':
        return 'bg-green-100 text-green-700'
      case 'picked_up':
        return 'bg-purple-100 text-purple-700'
      case 'on_the_way':
        return 'bg-purple-100 text-purple-700'
      case 'delivered':
        return 'bg-green-100 text-green-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'New Order'
      case 'confirmed':
        return 'Accepted'
      case 'preparing':
        return 'Preparing'
      case 'ready':
        return 'Ready for Pickup'
      case 'picked_up':
        return 'Picked Up'
      case 'on_the_way':
        return 'Out for Delivery'
      case 'delivered':
        return 'Delivered'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status
    }
  }

  const handleAcceptOrder = async (orderId: string) => {
    const success = await acceptOrder(orderId)
    if (success) {
      setSelectedOrder(null)
    }
  }

  const handleRejectOrder = async (orderId: string) => {
    const success = await rejectOrder(orderId, 'Rejected by merchant')
    if (success) {
      setSelectedOrder(null)
    }
  }

  const handleStartPreparing = async (orderId: string) => {
    const success = await startPreparing(orderId)
    if (success) {
      setSelectedOrder(null)
    }
  }

  const handleMarkReady = async (orderId: string) => {
    const success = await markReady(orderId)
    if (success) {
      setSelectedOrder(null)
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000)
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
  }

  const pendingCount = orders.filter((o) => o.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-primary-600 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-full p-2 hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">Orders</h1>
          </div>
          <button
            onClick={() => refetch()}
            className="rounded-full p-2 hover:bg-white/10"
          >
            <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-30 lg:top-16">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            {!searchQuery && (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            )}
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${searchQuery ? 'pl-4' : 'pl-10'} pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500`}
            />
          </div>
          <button
            onClick={() => setShowFilterModal(true)}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-sm ${
              filter !== 'all'
                ? 'border-primary-600 bg-primary-50 text-primary-600'
                : 'border-gray-300 text-gray-600'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {(['all', 'pending', 'confirmed', 'preparing', 'ready'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'pending' && pendingCount > 0 && (
                <span className="ml-1 px-1.5 bg-white/20 rounded-full text-xs">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Loading State */}
        {isLoading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-500">Loading orders...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredOrders.length === 0 && (
          <Card className="text-center py-8">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {orders.length === 0 ? 'No orders yet' : 'No orders found'}
            </p>
          </Card>
        )}

        {/* Orders List */}
        {filteredOrders.map((order) => (
          <Card
            key={order.id}
            className={`cursor-pointer hover:shadow-md transition ${
              order.status === 'pending' ? '!border-orange-300 !bg-orange-50' : ''
            }`}
            onClick={() => setSelectedOrder(order)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900">#{order.id.slice(-6)}</p>
                <p className="text-sm text-gray-500">
                  {order.deliveryAddress?.contactName || 'Customer'}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>

            <div className="space-y-1 mb-3">
              {order.items?.slice(0, 2).map((item, index) => (
                <p key={index} className="text-sm text-gray-600">
                  {item.quantity}x {item.name}
                </p>
              ))}
              {order.items && order.items.length > 2 && (
                <p className="text-sm text-gray-400">+{order.items.length - 2} more items</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                {order.createdAt?.toDate ? formatTime(order.createdAt.toDate()) : 'Just now'}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">P{order.total || 0}</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter Modal */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filter Orders"
      >
        <div className="space-y-2">
          {(['all', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f)
                setShowFilterModal(false)
              }}
              className={`w-full p-3 rounded-xl text-left flex items-center justify-between ${
                filter === f ? 'bg-primary-50 border-2 border-primary-600' : 'bg-gray-50'
              }`}
            >
              <span className={`font-medium capitalize ${filter === f ? 'text-primary-600' : 'text-gray-900'}`}>
                {f === 'all' ? 'All Orders' : getStatusLabel(f as OrderStatus)}
              </span>
              <span className="text-sm text-gray-500">
                {f === 'all'
                  ? orders.length
                  : f === 'completed'
                  ? orders.filter((o) => o.status === 'delivered').length
                  : orders.filter((o) => o.status === f).length}
              </span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order #${selectedOrder?.id.slice(-6)}`}
      >
        {selectedOrder && (
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-center">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                {getStatusLabel(selectedOrder.status)}
              </span>
            </div>

            {/* Customer Info */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                  {selectedOrder.deliveryAddress?.contactName || 'Customer'}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedOrder.deliveryAddress?.contactPhone || 'No phone'}
                </p>
              </div>
              {selectedOrder.deliveryAddress?.contactPhone && (
                <a
                  href={`tel:${selectedOrder.deliveryAddress.contactPhone}`}
                  className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center"
                >
                  <Phone className="h-5 w-5 text-green-600" />
                </a>
              )}
            </div>

            {/* Driver Info */}
            {selectedOrder.driverId && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Truck className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-700">Driver assigned</p>
                  <p className="font-medium text-blue-900">Driver ID: {selectedOrder.driverId}</p>
                </div>
              </div>
            )}

            {/* Items */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-gray-900">{item.quantity}x {item.name}</p>
                      {item.options && item.options.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {item.options.map(o => `${o.name}: ${o.choice}`).join(', ')}
                        </p>
                      )}
                      {item.specialInstructions && (
                        <p className="text-xs text-gray-500">Note: {item.specialInstructions}</p>
                      )}
                    </div>
                    <span className="font-medium">P{item.total || item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Note:</span> {selectedOrder.notes}
                </p>
              </div>
            )}

            {/* Delivery Address */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Delivery Address</p>
              <p className="text-gray-900">{selectedOrder.deliveryAddress?.address || 'No address'}</p>
            </div>

            {/* Total */}
            <div className="space-y-2 py-3 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>P{selectedOrder.subtotal || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span>P{selectedOrder.deliveryFee || 0}</span>
              </div>
              {selectedOrder.serviceFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Fee</span>
                  <span>P{selectedOrder.serviceFee}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary-600">P{selectedOrder.total || 0}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Payment</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                selectedOrder.paymentStatus === 'paid'
                  ? 'bg-green-100 text-green-700'
                  : selectedOrder.paymentStatus === 'refunded'
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {(selectedOrder.paymentMethod || 'cash').toUpperCase()} - {selectedOrder.paymentStatus || 'pending'}
              </span>
            </div>

            {/* Actions */}
            {selectedOrder.status === 'pending' && (
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => handleRejectOrder(selectedOrder.id)}
                >
                  Reject
                </Button>
                <Button
                  fullWidth
                  onClick={() => handleAcceptOrder(selectedOrder.id)}
                >
                  Accept Order
                </Button>
              </div>
            )}

            {selectedOrder.status === 'confirmed' && (
              <Button
                fullWidth
                onClick={() => handleStartPreparing(selectedOrder.id)}
              >
                Start Preparing
              </Button>
            )}

            {selectedOrder.status === 'preparing' && (
              <Button
                fullWidth
                onClick={() => handleMarkReady(selectedOrder.id)}
              >
                Mark as Ready
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
