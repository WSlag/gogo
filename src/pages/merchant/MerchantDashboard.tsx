import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Settings,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Star,
  Clock,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Package,
  AlertCircle,
} from 'lucide-react'
import { Button, Card, Spinner, Modal } from '@/components/ui'
import type { Merchant, MerchantOrder, MerchantEarnings, MerchantStats } from '@/types'

const MOCK_MERCHANT: Merchant = {
  id: 'merchant_001',
  name: 'Jollibee Awang',
  type: 'restaurant',
  description: 'Home of the famous Chickenjoy',
  logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/84/Jollibee_2011_logo.svg/1200px-Jollibee_2011_logo.svg.png',
  coverImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
  categories: ['fast-food', 'filipino'],
  address: 'Awang, Datu Odin Sinsuat, Maguindanao',
  coordinates: { latitude: 7.1917, longitude: 124.2246 } as any,
  phone: '+639123456789',
  email: 'awang@jollibee.com',
  operatingHours: [],
  rating: 4.5,
  totalOrders: 1250,
  reviewCount: 380,
  deliveryFee: 39,
  minOrder: 99,
  estimatedDelivery: '25-35 min',
  isOpen: true,
  isFeatured: true,
  status: 'active',
  createdAt: { toDate: () => new Date() } as any,
  updatedAt: { toDate: () => new Date() } as any,
}

const MOCK_EARNINGS: MerchantEarnings = {
  today: 12500,
  thisWeek: 85000,
  thisMonth: 320000,
  total: 2500000,
  pendingPayout: 85000,
}

const MOCK_STATS: MerchantStats = {
  totalOrders: 1250,
  completedOrders: 1180,
  cancelledOrders: 70,
  averageOrderValue: 285,
  averageRating: 4.5,
  totalRevenue: 2500000,
}

const MOCK_PENDING_ORDERS: MerchantOrder[] = [
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
    status: 'pending',
    paymentMethod: 'wallet',
    paymentStatus: 'paid',
    deliveryAddress: 'PC Hill, Cotabato City',
    createdAt: { toDate: () => new Date(Date.now() - 300000) } as any,
    updatedAt: { toDate: () => new Date() } as any,
  },
]

export default function MerchantDashboard() {
  const navigate = useNavigate()
  const [merchant, setMerchant] = useState<Merchant>(MOCK_MERCHANT)
  const [earnings] = useState<MerchantEarnings>(MOCK_EARNINGS)
  const [stats] = useState<MerchantStats>(MOCK_STATS)
  const [pendingOrders, setPendingOrders] = useState<MerchantOrder[]>(MOCK_PENDING_ORDERS)
  const [isToggling, setIsToggling] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<MerchantOrder | null>(null)

  const toggleAcceptingOrders = async () => {
    setIsToggling(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setMerchant((prev) => ({ ...prev, isOpen: !prev.isOpen }))
    setIsToggling(false)
  }

  const handleAcceptOrder = (orderId: string) => {
    setPendingOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: 'accepted' as const } : order
      )
    )
    setSelectedOrder(null)
  }

  const handleRejectOrder = (orderId: string) => {
    setPendingOrders((prev) => prev.filter((order) => order.id !== orderId))
    setSelectedOrder(null)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000)
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff}m ago`
    return date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-primary-600 px-4 py-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={merchant.logo}
              alt={merchant.name}
              className="h-12 w-12 rounded-full bg-white object-contain p-1"
            />
            <div>
              <h1 className="font-semibold">{merchant.name}</h1>
              <div className="flex items-center gap-1 text-sm text-primary-100">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{merchant.rating}</span>
                <span className="mx-1">*</span>
                <span>{merchant.totalOrders} orders</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="rounded-full bg-white/10 p-2 hover:bg-white/20">
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/merchant/settings')}
              className="rounded-full bg-white/10 p-2 hover:bg-white/20"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Store Status Toggle */}
        <button
          onClick={toggleAcceptingOrders}
          disabled={isToggling}
          className={`flex w-full items-center justify-center gap-3 rounded-xl py-4 font-semibold transition ${
            merchant.isOpen
              ? 'bg-green-500 text-white'
              : 'bg-white text-gray-900'
          }`}
        >
          {isToggling ? (
            <Spinner size="sm" />
          ) : (
            <>
              {merchant.isOpen ? (
                <ToggleRight className="h-6 w-6" />
              ) : (
                <ToggleLeft className="h-6 w-6" />
              )}
              <span>{merchant.isOpen ? 'Store is Open' : 'Store is Closed'}</span>
            </>
          )}
        </button>
      </div>

      {/* Pending Orders Alert */}
      {pendingOrders.filter((o) => o.status === 'pending').length > 0 && (
        <div className="bg-orange-50 px-4 py-3 flex items-center gap-2 border-b border-orange-100">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <span className="text-sm text-orange-700 font-medium">
            {pendingOrders.filter((o) => o.status === 'pending').length} new order(s) waiting for acceptance
          </span>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="!p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">
                  P{earnings.today.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Today's Sales</p>
              </div>
            </div>
          </Card>
          <Card className="!p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">42</p>
                <p className="text-xs text-gray-500">Orders Today</p>
              </div>
            </div>
          </Card>
          <Card className="!p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stats.averageRating}</p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
            </div>
          </Card>
          <Card className="!p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">+12%</p>
                <p className="text-xs text-gray-500">vs Yesterday</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => navigate('/merchant/orders')}
              className="flex flex-col items-center gap-1 rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
            >
              <ShoppingBag className="h-6 w-6 text-blue-600" />
              <span className="text-xs text-gray-600">Orders</span>
            </button>
            <button
              onClick={() => navigate('/merchant/menu')}
              className="flex flex-col items-center gap-1 rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
            >
              <Package className="h-6 w-6 text-orange-600" />
              <span className="text-xs text-gray-600">Menu</span>
            </button>
            <button
              onClick={() => navigate('/merchant/earnings')}
              className="flex flex-col items-center gap-1 rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
            >
              <DollarSign className="h-6 w-6 text-green-600" />
              <span className="text-xs text-gray-600">Earnings</span>
            </button>
            <button
              onClick={() => navigate('/merchant/analytics')}
              className="flex flex-col items-center gap-1 rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
            >
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <span className="text-xs text-gray-600">Analytics</span>
            </button>
          </div>
        </Card>

        {/* Pending Orders */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Pending Orders</h3>
            <button
              onClick={() => navigate('/merchant/orders')}
              className="text-sm text-primary-600 font-medium"
            >
              View All
            </button>
          </div>

          {pendingOrders.filter((o) => o.status === 'pending').length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No pending orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOrders
                .filter((o) => o.status === 'pending')
                .map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="w-full flex items-center gap-3 p-3 bg-orange-50 rounded-xl text-left hover:bg-orange-100 transition"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                      <ShoppingBag className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {order.items.length} item(s) * P{order.total}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-orange-600 font-medium">NEW</p>
                      <p className="text-xs text-gray-500">
                        {formatTime(order.createdAt.toDate())}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                ))}
            </div>
          )}
        </Card>

        {/* Earnings Summary */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Earnings Summary</h3>
            <button
              onClick={() => navigate('/merchant/earnings')}
              className="text-sm text-primary-600 font-medium"
            >
              Details
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">This Week</span>
              <span className="font-semibold text-gray-900">
                P{earnings.thisWeek.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold text-gray-900">
                P{earnings.thisMonth.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Pending Payout</span>
              <span className="font-semibold text-green-600">
                P{earnings.pendingPayout.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Order Details"
      >
        {selectedOrder && (
          <div className="space-y-4">
            {/* Customer Info */}
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-lg font-medium text-gray-600">
                  {selectedOrder.customerName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedOrder.customerName}</p>
                <p className="text-sm text-gray-500">{selectedOrder.customerPhone}</p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Items</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-900">
                        {item.quantity}x {item.name}
                      </p>
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
            <div className="flex items-center justify-between py-3 border-t">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-primary-600">
                P{selectedOrder.total}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => handleRejectOrder(selectedOrder.id)}
              >
                Reject
              </Button>
              <Button fullWidth onClick={() => handleAcceptOrder(selectedOrder.id)}>
                Accept Order
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
