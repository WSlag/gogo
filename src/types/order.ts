import type { Timestamp, GeoPoint } from 'firebase/firestore'

export type OrderType = 'food' | 'grocery'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'on_the_way'
  | 'delivered'
  | 'completed'
  | 'cancelled'

export interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
  options?: {
    name: string
    choice: string
    price: number
  }[]
  addons?: {
    name: string
    price: number
  }[]
  specialInstructions?: string
  total: number
}

export interface DeliveryAddress {
  address: string
  coordinates: GeoPoint
  details?: string
  contactName: string
  contactPhone: string
}

export interface Order {
  id: string
  customerId: string
  merchantId: string
  driverId?: string
  type: OrderType
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  serviceFee: number
  discount?: number
  total: number
  deliveryAddress: DeliveryAddress
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  status: OrderStatus
  notes?: string
  promoCode?: string
  scheduledAt?: Timestamp
  confirmedAt?: Timestamp
  preparingAt?: Timestamp
  readyAt?: Timestamp
  pickedUpAt?: Timestamp
  deliveredAt?: Timestamp
  cancelledAt?: Timestamp
  cancellationReason?: string
  rating?: number
  review?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Order Placed',
  confirmed: 'Order Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  picked_up: 'Picked Up',
  on_the_way: 'On the Way',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-purple-100 text-purple-800',
  picked_up: 'bg-indigo-100 text-indigo-800',
  on_the_way: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}
