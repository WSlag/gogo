import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  Filter,
  ShoppingBag,
  Car,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Eye,
  MoreVertical,
  Package,
  Utensils,
  RefreshCw,
} from 'lucide-react'
import { Card, Badge, Button, Modal, Avatar } from '@/components/ui'
import { collection, query, where, orderBy, getDocs, limit, Timestamp } from 'firebase/firestore'
import { db } from '@/services/firebase/config'

interface Order {
  id: string
  orderNumber: string
  type: 'food' | 'grocery' | 'ride'
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled'
  customer: {
    name: string
    phone: string
    photoURL?: string
  }
  merchant?: {
    name: string
    address: string
  }
  driver?: {
    name: string
    phone: string
    vehiclePlate: string
  }
  pickup: string
  dropoff: string
  items?: Array<{ name: string; quantity: number; price: number }>
  subtotal: number
  deliveryFee: number
  total: number
  paymentMethod: 'cash' | 'wallet' | 'gcash' | 'card'
  createdAt: Date
  estimatedDelivery?: Date
}

type FilterStatus = 'all' | 'active' | 'completed' | 'cancelled'
type FilterType = 'all' | 'food' | 'grocery' | 'ride'

export default function AdminOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [filterStatus, filterType])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      let q = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc'),
        limit(100)
      )

      const snapshot = await getDocs(q)
      const orderData: Order[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          orderNumber: data.orderNumber || doc.id.slice(-6).toUpperCase(),
          type: data.type || 'food',
          status: data.status || 'pending',
          customer: {
            name: data.customerName || 'Unknown',
            phone: data.customerPhone || '',
            photoURL: data.customerPhoto,
          },
          merchant: data.merchant,
          driver: data.driver,
          pickup: data.pickupAddress || data.merchant?.address || '',
          dropoff: data.deliveryAddress || '',
          items: data.items,
          subtotal: data.subtotal || 0,
          deliveryFee: data.deliveryFee || 0,
          total: data.total || 0,
          paymentMethod: data.paymentMethod || 'cash',
          createdAt: data.createdAt?.toDate() || new Date(),
          estimatedDelivery: data.estimatedDelivery?.toDate(),
        }
      })

      // Apply filters
      let filtered = orderData
      if (filterStatus === 'active') {
        filtered = orderData.filter((o) =>
          ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way'].includes(o.status)
        )
      } else if (filterStatus === 'completed') {
        filtered = orderData.filter((o) => o.status === 'delivered')
      } else if (filterStatus === 'cancelled') {
        filtered = orderData.filter((o) => o.status === 'cancelled')
      }

      if (filterType !== 'all') {
        filtered = filtered.filter((o) => o.type === filterType)
      }

      setOrders(filtered)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders(MOCK_ORDERS)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchOrders()
    setRefreshing(false)
  }

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      order.orderNumber.toLowerCase().includes(search) ||
      order.customer.name.toLowerCase().includes(search) ||
      order.merchant?.name?.toLowerCase().includes(search) ||
      order.driver?.name?.toLowerCase().includes(search)
    )
  })

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      case 'confirmed':
        return <Badge variant="info">Confirmed</Badge>
      case 'preparing':
        return <Badge variant="info">Preparing</Badge>
      case 'ready':
        return <Badge variant="info">Ready</Badge>
      case 'picked_up':
        return <Badge variant="info">Picked Up</Badge>
      case 'on_the_way':
        return <Badge variant="primary">On The Way</Badge>
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>
      case 'cancelled':
        return <Badge variant="error">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTypeIcon = (type: Order['type']) => {
    switch (type) {
      case 'food':
        return <Utensils className="h-5 w-5 text-orange-600" />
      case 'grocery':
        return <ShoppingBag className="h-5 w-5 text-green-600" />
      case 'ride':
        return <Car className="h-5 w-5 text-blue-600" />
      default:
        return <Package className="h-5 w-5 text-gray-600" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000)
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return date.toLocaleDateString()
  }

  const stats = {
    total: orders.length,
    active: orders.filter((o) =>
      ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way'].includes(o.status)
    ).length,
    completed: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-900 text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="p-1">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-lg font-bold">Order Management</h1>
              <p className="text-gray-400 text-sm">{stats.active} active orders</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg hover:bg-gray-800 ${refreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 p-4">
        <div className="bg-white rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
          <p className="text-xs text-gray-500">Active</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          <p className="text-xs text-gray-500">Cancelled</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="px-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order #, customer, or merchant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border-0 focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'active', 'completed', 'cancelled'] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'food', 'grocery', 'ride'] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1 ${
                filterType === type
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              {type !== 'all' && getTypeIcon(type)}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Order List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No orders found</div>
        ) : (
          filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="!p-4 cursor-pointer hover:shadow-md transition"
              onClick={() => {
                setSelectedOrder(order)
                setShowOrderModal(true)
              }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  order.type === 'food' ? 'bg-orange-100' :
                  order.type === 'grocery' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {getTypeIcon(order.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-gray-900">#{order.orderNumber}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{order.customer.name}</p>
                  {order.merchant && (
                    <p className="text-sm text-gray-500">{order.merchant.name}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold text-gray-900">₱{order.total.toFixed(2)}</span>
                    <span className="text-xs text-gray-400">{formatTime(order.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          title={`Order #${selectedOrder.orderNumber}`}
        >
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Status</span>
              {getStatusBadge(selectedOrder.status)}
            </div>

            {/* Customer */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Customer</h4>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Avatar name={selectedOrder.customer.name} src={selectedOrder.customer.photoURL} />
                <div className="flex-1">
                  <p className="font-medium">{selectedOrder.customer.name}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.customer.phone}</p>
                </div>
                <button
                  onClick={() => window.open(`tel:${selectedOrder.customer.phone}`)}
                  className="p-2 bg-white rounded-lg hover:bg-gray-100"
                >
                  <Phone className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Merchant */}
            {selectedOrder.merchant && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Merchant</h4>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="font-medium">{selectedOrder.merchant.name}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.merchant.address}</p>
                </div>
              </div>
            )}

            {/* Driver */}
            {selectedOrder.driver && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Driver</h4>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Car className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{selectedOrder.driver.name}</p>
                    <p className="text-sm text-gray-500">{selectedOrder.driver.vehiclePlate}</p>
                  </div>
                  <button
                    onClick={() => window.open(`tel:${selectedOrder.driver?.phone}`)}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100"
                  >
                    <Phone className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            )}

            {/* Locations */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Delivery</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pickup</p>
                    <p className="text-sm">{selectedOrder.pickup}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                    <MapPin className="w-3 h-3 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Dropoff</p>
                    <p className="text-sm">{selectedOrder.dropoff}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Items</h4>
                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-medium">₱{(item.quantity * item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Payment</h4>
              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>₱{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span>₱{selectedOrder.deliveryFee.toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₱{selectedOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="capitalize">{selectedOrder.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="flex justify-between text-sm text-gray-500">
              <span>Created: {selectedOrder.createdAt.toLocaleString()}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// Mock data for demo
const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD001',
    type: 'food',
    status: 'on_the_way',
    customer: {
      name: 'Maria Santos',
      phone: '+639123456789',
    },
    merchant: {
      name: 'Jollibee - SM City',
      address: 'SM City Manila, Ground Floor',
    },
    driver: {
      name: 'Juan Dela Cruz',
      phone: '+639987654321',
      vehiclePlate: 'ABC 1234',
    },
    pickup: 'SM City Manila, Ground Floor',
    dropoff: '123 Taft Avenue, Manila',
    items: [
      { name: 'Chickenjoy 2pc', quantity: 2, price: 189 },
      { name: 'Jolly Spaghetti', quantity: 1, price: 75 },
    ],
    subtotal: 453,
    deliveryFee: 49,
    total: 502,
    paymentMethod: 'gcash',
    createdAt: new Date(Date.now() - 1800000),
  },
  {
    id: '2',
    orderNumber: 'ORD002',
    type: 'grocery',
    status: 'preparing',
    customer: {
      name: 'Pedro Reyes',
      phone: '+639555123456',
    },
    merchant: {
      name: 'Puregold Price Club',
      address: 'Shaw Blvd, Mandaluyong',
    },
    pickup: 'Shaw Blvd, Mandaluyong',
    dropoff: '456 Ortigas Ave, Pasig',
    items: [
      { name: 'Rice 5kg', quantity: 1, price: 350 },
      { name: 'Cooking Oil 1L', quantity: 2, price: 120 },
      { name: 'Eggs 12pcs', quantity: 1, price: 180 },
    ],
    subtotal: 770,
    deliveryFee: 59,
    total: 829,
    paymentMethod: 'cash',
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: '3',
    orderNumber: 'ORD003',
    type: 'food',
    status: 'delivered',
    customer: {
      name: 'Ana Garcia',
      phone: '+639777888999',
    },
    merchant: {
      name: 'McDonald\'s Makati',
      address: 'Ayala Ave, Makati',
    },
    driver: {
      name: 'Mark Gonzales',
      phone: '+639111222333',
      vehiclePlate: 'XYZ 5678',
    },
    pickup: 'Ayala Ave, Makati',
    dropoff: '789 Gil Puyat, Makati',
    items: [
      { name: 'Big Mac Meal', quantity: 1, price: 225 },
      { name: 'McFlurry Oreo', quantity: 1, price: 65 },
    ],
    subtotal: 290,
    deliveryFee: 39,
    total: 329,
    paymentMethod: 'wallet',
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    id: '4',
    orderNumber: 'RID001',
    type: 'ride',
    status: 'completed',
    customer: {
      name: 'Carlos Tan',
      phone: '+639333444555',
    },
    driver: {
      name: 'Roberto Cruz',
      phone: '+639666777888',
      vehiclePlate: 'DEF 9012',
    },
    pickup: 'SM Megamall, EDSA',
    dropoff: 'Bonifacio Global City',
    subtotal: 185,
    deliveryFee: 0,
    total: 185,
    paymentMethod: 'cash',
    createdAt: new Date(Date.now() - 14400000),
  },
]
