import type { Timestamp, GeoPoint } from 'firebase/firestore'

export type OrderType = 'food' | 'grocery' | 'pharmacy'

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
  merchantName: string
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
  pending: 'bg-warning-light text-warning',
  confirmed: 'bg-info-light text-info',
  preparing: 'bg-secondary-100 text-secondary-700',
  ready: 'bg-primary-100 text-primary-700',
  picked_up: 'bg-primary-200 text-primary-800',
  on_the_way: 'bg-info-light text-info',
  delivered: 'bg-success-light text-success',
  completed: 'bg-success-light text-success',
  cancelled: 'bg-error-light text-error',
}
