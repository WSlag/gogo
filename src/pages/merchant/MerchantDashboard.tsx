import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Bell,
  Settings,
  TrendingUp,
  ShoppingBag,
  Star,
  Clock,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Package,
  AlertCircle,
  Phone,
  Store,
} from 'lucide-react'
import { PesoSign } from '@/components/icons'
import { Button, Card, Spinner, Modal } from '@/components/ui'
import { useMerchantOrders } from '@/hooks/useMerchantOrders'
import { useMerchantDetail } from '@/hooks/useMerchants'
import { useMerchantApplication } from '@/hooks/useMerchantApplication'
import { setDocument, collections, serverTimestamp } from '@/services/firebase/firestore'
import type { Order } from '@/types'

// Placeholder image for merchants without logos (data URL SVG - works offline)
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23e5e7eb" width="100" height="100" rx="50"/%3E%3Ctext x="50" y="55" font-size="32" fill="%239ca3af" text-anchor="middle"%3E🏪%3C/text%3E%3C/svg%3E'

export default function MerchantDashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Get the user's actual merchant ID from their application
  const { merchantData, isLoading: applicationLoading } = useMerchantApplication()

  // Allow merchant ID override via URL param for testing/admin
  const urlMerchantId = searchParams.get('merchant')
  const merchantId = urlMerchantId || merchantData?.id || ''

  const [isToggling, setIsToggling] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Fetch merchant details
  const { merchant, isLoading: merchantLoading } = useMerchantDetail(merchantId)

  // Fetch orders with real-time updates
  // Use merchantUserId for querying to comply with Firestore security rules
  const {
    orders,
    pendingCount,
    isLoading: ordersLoading,
    acceptOrder,
    rejectOrder,
    startPreparing,
    markReady,
  } = useMerchantOrders({
    merchantId: merchantId,
    merchantUserId: merchantData?.userId,
    realtime: true,
  })

  // Calculate stats from orders
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayOrders = orders.filter(o => {
    const orderDate = o.createdAt?.toDate?.() || new Date(0)
    return orderDate >= todayStart
  })

  const todaySales = todayOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0)

  const completedOrders = orders.filter(o => o.status === 'delivered').length
  const pendingOrders = orders.filter(o => o.status === 'pending')
  const activeOrders = orders.filter(o => ['confirmed', 'preparing'].includes(o.status))

  const toggleAcceptingOrders = async () => {
    if (!merchant || !merchantId) return
    setIsToggling(true)
    try {
      await setDocument(collections.merchants, merchantId, {
        isOpen: !merchant.isOpen,
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('Failed to toggle store status:', err)
    }
    setIsToggling(false)
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
    return date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
  }

  const isLoading = applicationLoading || merchantLoading || ordersLoading

  // Show loading while fetching merchant application
  if (applicationLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Show message if user has no merchant
  if (!merchantId && !urlMerchantId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No Merchant Found</h2>
          <p className="text-gray-500 mb-4">You don't have a merchant account yet.</p>
          <Button onClick={() => navigate('/merchant/register')}>
            Register as Merchant
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading && !merchant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Use merchant data or defaults - handle both 'name' and 'businessName' fields
  const displayMerchant = merchant ? {
    ...merchant,
    name: merchant.name || merchant.businessName || 'Your Restaurant',
  } : {
    name: 'Your Restaurant',
    logo: PLACEHOLDER_IMAGE,
    rating: 0,
    totalOrders: 0,
    isOpen: false,
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-primary-600 px-4 py-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={displayMerchant.logo || displayMerchant.image || PLACEHOLDER_IMAGE}
              alt={displayMerchant.name}
              className="h-12 w-12 rounded-full bg-white object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE
              }}
            />
            <div>
              <h1 className="font-semibold">{displayMerchant.name}</h1>
              <div className="flex items-center gap-1 text-sm text-primary-100">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>{displayMerchant.rating?.toFixed(1) || '0.0'}</span>
                <span className="mx-1">*</span>
                <span>{orders.length} orders</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="rounded-full bg-white/10 p-2 hover:bg-white/20 relative">
              <Bell className="h-5 w-5" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
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
            displayMerchant.isOpen
              ? 'bg-green-500 text-white'
              : 'bg-white text-gray-900'
          }`}
        >
          {isToggling ? (
            <Spinner size="sm" />
          ) : (
            <>
              {displayMerchant.isOpen ? (
                <ToggleRight className="h-6 w-6" />
              ) : (
                <ToggleLeft className="h-6 w-6" />
              )}
              <span>{displayMerchant.isOpen ? 'Store is Open' : 'Store is Closed'}</span>
            </>
          )}
        </button>
      </div>

      {/* Pending Orders Alert */}
      {pendingCount > 0 && (
        <div className="bg-orange-50 px-4 py-3 flex items-center gap-2 border-b border-orange-100">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <span className="text-sm text-orange-700 font-medium">
            {pendingCount} new order(s) waiting for acceptance
          </span>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="!p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                <PesoSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">
                  P{todaySales.toLocaleString()}
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
                <p className="text-lg font-bold text-gray-900">{todayOrders.length}</p>
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
                <p className="text-lg font-bold text-gray-900">{displayMerchant.rating?.toFixed(1) || '0.0'}</p>
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
                <p className="text-lg font-bold text-gray-900">{completedOrders}</p>
                <p className="text-xs text-gray-500">Completed</p>
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
              className="flex flex-col items-center gap-1 rounded-lg bg-gray-50 p-3 hover:bg-gray-100 relative"
            >
              <ShoppingBag className="h-6 w-6 text-blue-600" />
              <span className="text-xs text-gray-600">Orders</span>
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
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
              <PesoSign className="h-6 w-6 text-green-600" />
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

          {ordersLoading && pendingOrders.length === 0 ? (
            <div className="text-center py-8">
              <Spinner size="md" />
              <p className="mt-2 text-gray-500">Loading orders...</p>
            </div>
          ) : pendingOrders.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No pending orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOrders.slice(0, 5).map((order) => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="w-full flex items-center gap-3 p-3 bg-orange-50 rounded-xl text-left hover:bg-orange-100 transition"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                    <ShoppingBag className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {order.deliveryAddress?.contactName || 'Customer'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {order.items?.length || 0} item(s) * P{order.total || 0}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-orange-600 font-medium">NEW</p>
                    <p className="text-xs text-gray-500">
                      {order.createdAt?.toDate ? formatTime(order.createdAt.toDate()) : 'Just now'}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Active Orders - Confirmed & Preparing */}
        {activeOrders.length > 0 && (
          <Card className="!border-blue-200 !bg-blue-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Active Orders</h3>
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                {activeOrders.length} in progress
              </span>
            </div>

            <div className="space-y-3">
              {activeOrders.slice(0, 5).map((order) => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition ${
                    order.status === 'confirmed'
                      ? 'bg-blue-100 hover:bg-blue-200'
                      : 'bg-yellow-100 hover:bg-yellow-200'
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    order.status === 'confirmed' ? 'bg-blue-200' : 'bg-yellow-200'
                  }`}>
                    <Package className={`h-5 w-5 ${
                      order.status === 'confirmed' ? 'text-blue-600' : 'text-yellow-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {order.deliveryAddress?.contactName || 'Customer'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {order.items?.length || 0} item(s) * P{order.total || 0}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-medium ${
                      order.status === 'confirmed' ? 'text-blue-600' : 'text-yellow-600'
                    }`}>
                      {order.status === 'confirmed' ? 'ACCEPTED' : 'PREPARING'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.createdAt?.toDate ? formatTime(order.createdAt.toDate()) : 'Just now'}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Orders Summary */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            <button
              onClick={() => navigate('/merchant/orders')}
              className="text-sm text-primary-600 font-medium"
            >
              See All
            </button>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Order #{order.id.slice(-6)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.items?.length || 0} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">P{order.total || 0}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-center text-gray-500 py-4">No orders yet</p>
            )}
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
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-600">
                    {(selectedOrder.deliveryAddress?.contactName || 'C').charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedOrder.deliveryAddress?.contactName || 'Customer'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedOrder.deliveryAddress?.contactPhone || 'No phone'}
                  </p>
                </div>
              </div>
              {selectedOrder.deliveryAddress?.contactPhone && (
                <a
                  href={`tel:${selectedOrder.deliveryAddress.contactPhone}`}
                  className="p-2 bg-green-50 rounded-full hover:bg-green-100"
                >
                  <Phone className="h-5 w-5 text-green-600" />
                </a>
              )}
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Items</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-900">
                        {item.quantity}x {item.name}
                      </p>
                      {item.options && item.options.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {item.options.map(o => `${o.name}: ${o.choice}`).join(', ')}
                        </p>
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
            <div className="flex items-center justify-between py-3 border-t">
              <div>
                <span className="font-semibold text-gray-900">Total</span>
                <p className="text-xs text-gray-500">
                  {selectedOrder.paymentMethod === 'cash' ? 'Cash on Delivery' :
                   selectedOrder.paymentMethod === 'wallet' ? 'GOGO Express Wallet' : 'GCash'}
                </p>
              </div>
              <span className="text-xl font-bold text-primary-600">
                P{selectedOrder.total}
              </span>
            </div>

            {/* Actions */}
            {selectedOrder.status === 'pending' && (
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
            )}

            {selectedOrder.status === 'confirmed' && (
              <Button fullWidth onClick={() => handleStartPreparing(selectedOrder.id)}>
                Start Preparing
              </Button>
            )}

            {selectedOrder.status === 'preparing' && (
              <Button fullWidth onClick={() => handleMarkReady(selectedOrder.id)}>
                Mark as Ready for Pickup
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
