import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  ChevronRight,
  Filter,
  Search,
  Package,
  Truck,
} from 'lucide-react'
import { Button, Card, Modal, Input } from '@/components/ui'
import type { MerchantOrder } from '@/types'

type OrderFilter = 'all' | 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled'

const MOCK_ORDERS: MerchantOrder[] = [
  {
    id: 'order_001',
    merchantId: 'merchant_001',
    customerId: 'user_001',
    customerName: 'Maria Santos',
    customerPhone: '+639123456789',
    items: [
      { menuItemId: '1', name: '1pc Chickenjoy w/ Rice', price: 99, quantity: 2 },
      { menuItemId: '2', name: 'Jolly Spaghetti', price: 55, quantity: 1 },
    ],
    subtotal: 253,
    deliveryFee: 39,
    total: 292,
    status: 'pending',
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    deliveryAddress: 'RH3 Subdivision, Cotabato City',
    notes: 'Extra gravy please',
    createdAt: { toDate: () => new Date() } as any,
    updatedAt: { toDate: () => new Date() } as any,
  },
  {
    id: 'order_002',
    merchantId: 'merchant_001',
    customerId: 'user_002',
    customerName: 'Juan Dela Cruz',
    customerPhone: '+639987654321',
    items: [
      { menuItemId: '3', name: 'Burger Steak', price: 79, quantity: 1 },
      { menuItemId: '4', name: 'Peach Mango Pie', price: 39, quantity: 2 },
    ],
    subtotal: 157,
    deliveryFee: 39,
    total: 196,
    status: 'preparing',
    paymentMethod: 'wallet',
    paymentStatus: 'paid',
    deliveryAddress: 'PC Hill, Cotabato City',
    driverId: 'driver_001',
    driverName: 'Pedro G.',
    createdAt: { toDate: () => new Date(Date.now() - 600000) } as any,
    updatedAt: { toDate: () => new Date() } as any,
  },
  {
    id: 'order_003',
    merchantId: 'merchant_001',
    customerId: 'user_003',
    customerName: 'Ana Lopez',
    customerPhone: '+639555666777',
    items: [
      { menuItemId: '5', name: '6pc Chicken Bucket', price: 499, quantity: 1 },
      { menuItemId: '6', name: 'Large Fries', price: 75, quantity: 2 },
    ],
    subtotal: 649,
    deliveryFee: 39,
    total: 688,
    status: 'ready',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    deliveryAddress: 'Rosary Heights, Cotabato City',
    driverId: 'driver_002',
    driverName: 'Ramon S.',
    createdAt: { toDate: () => new Date(Date.now() - 1200000) } as any,
    updatedAt: { toDate: () => new Date() } as any,
  },
  {
    id: 'order_004',
    merchantId: 'merchant_001',
    customerId: 'user_004',
    customerName: 'Carlos Martinez',
    customerPhone: '+639111222333',
    items: [
      { menuItemId: '1', name: '1pc Chickenjoy w/ Rice', price: 99, quantity: 3 },
    ],
    subtotal: 297,
    deliveryFee: 39,
    total: 336,
    status: 'delivered',
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    deliveryAddress: 'Downtown, Cotabato City',
    driverId: 'driver_003',
    driverName: 'Jose M.',
    createdAt: { toDate: () => new Date(Date.now() - 3600000) } as any,
    updatedAt: { toDate: () => new Date() } as any,
  },
  {
    id: 'order_005',
    merchantId: 'merchant_001',
    customerId: 'user_005',
    customerName: 'Lisa Reyes',
    customerPhone: '+639444555666',
    items: [
      { menuItemId: '7', name: 'Palabok Fiesta', price: 89, quantity: 1 },
    ],
    subtotal: 89,
    deliveryFee: 39,
    total: 128,
    status: 'cancelled',
    paymentMethod: 'wallet',
    paymentStatus: 'refunded',
    deliveryAddress: 'Notre Dame Village, Cotabato City',
    createdAt: { toDate: () => new Date(Date.now() - 7200000) } as any,
    updatedAt: { toDate: () => new Date() } as any,
  },
]

export default function MerchantOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<MerchantOrder[]>(MOCK_ORDERS)
  const [filter, setFilter] = useState<OrderFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<MerchantOrder | null>(null)
  const [showFilterModal, setShowFilterModal] = useState(false)

  const filteredOrders = orders.filter((order) => {
    if (filter !== 'all') {
      if (filter === 'completed' && order.status !== 'delivered') return false
      if (filter !== 'completed' && order.status !== filter) return false
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        order.customerName.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query)
      )
    }
    return true
  })

  const getStatusColor = (status: MerchantOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-700'
      case 'accepted':
        return 'bg-blue-100 text-blue-700'
      case 'preparing':
        return 'bg-yellow-100 text-yellow-700'
      case 'ready':
        return 'bg-green-100 text-green-700'
      case 'picked_up':
        return 'bg-purple-100 text-purple-700'
      case 'delivered':
        return 'bg-green-100 text-green-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: MerchantOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'New Order'
      case 'accepted':
        return 'Accepted'
      case 'preparing':
        return 'Preparing'
      case 'ready':
        return 'Ready for Pickup'
      case 'picked_up':
        return 'Out for Delivery'
      case 'delivered':
        return 'Delivered'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status
    }
  }

  const handleUpdateStatus = (orderId: string, newStatus: MerchantOrder['status']) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    )
    setSelectedOrder(null)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000)
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
  }

  const getNextStatus = (currentStatus: MerchantOrder['status']): MerchantOrder['status'] | null => {
    const flow: Record<string, MerchantOrder['status']> = {
      pending: 'accepted',
      accepted: 'preparing',
      preparing: 'ready',
    }
    return flow[currentStatus] || null
  }

  const getNextStatusLabel = (currentStatus: MerchantOrder['status']): string => {
    const labels: Record<string, string> = {
      pending: 'Accept Order',
      accepted: 'Start Preparing',
      preparing: 'Mark as Ready',
    }
    return labels[currentStatus] || ''
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-primary-600 text-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-2 hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Orders</h1>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
          {(['all', 'pending', 'preparing', 'ready'] as const).map((f) => (
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
              {f === 'pending' && (
                <span className="ml-1 px-1.5 bg-white/20 rounded-full text-xs">
                  {orders.filter((o) => o.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filteredOrders.length === 0 ? (
          <Card className="text-center py-8">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No orders found</p>
          </Card>
        ) : (
          filteredOrders.map((order) => (
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
                  <p className="text-sm text-gray-500">{order.customerName}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className="space-y-1 mb-3">
                {order.items.slice(0, 2).map((item, index) => (
                  <p key={index} className="text-sm text-gray-600">
                    {item.quantity}x {item.name}
                  </p>
                ))}
                {order.items.length > 2 && (
                  <p className="text-sm text-gray-400">+{order.items.length - 2} more items</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  {formatTime(order.createdAt.toDate())}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">P{order.total}</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Filter Modal */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filter Orders"
      >
        <div className="space-y-2">
          {(['all', 'pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'] as const).map((f) => (
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
                {f === 'all' ? 'All Orders' : getStatusLabel(f as MerchantOrder['status'])}
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
                <p className="font-medium text-gray-900">{selectedOrder.customerName}</p>
                <p className="text-sm text-gray-500">{selectedOrder.customerPhone}</p>
              </div>
              <a
                href={`tel:${selectedOrder.customerPhone}`}
                className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center"
              >
                <Phone className="h-5 w-5 text-green-600" />
              </a>
            </div>

            {/* Driver Info */}
            {selectedOrder.driverName && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Truck className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-700">Driver assigned</p>
                  <p className="font-medium text-blue-900">{selectedOrder.driverName}</p>
                </div>
              </div>
            )}

            {/* Items */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-gray-900">{item.quantity}x {item.name}</p>
                      {item.notes && (
                        <p className="text-xs text-gray-500">Note: {item.notes}</p>
                      )}
                    </div>
                    <span className="font-medium">P{item.price * item.quantity}</span>
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
              <p className="text-gray-900">{selectedOrder.deliveryAddress}</p>
            </div>

            {/* Total */}
            <div className="space-y-2 py-3 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>P{selectedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span>P{selectedOrder.deliveryFee}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary-600">P{selectedOrder.total}</span>
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
                {selectedOrder.paymentMethod.toUpperCase()} - {selectedOrder.paymentStatus}
              </span>
            </div>

            {/* Actions */}
            {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
              <div className="flex gap-3 pt-2">
                {selectedOrder.status === 'pending' && (
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                  >
                    Reject
                  </Button>
                )}
                {getNextStatus(selectedOrder.status) && (
                  <Button
                    fullWidth
                    onClick={() => handleUpdateStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!)}
                  >
                    {getNextStatusLabel(selectedOrder.status)}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
