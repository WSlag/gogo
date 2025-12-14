import { useCallback, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import {
  setDocument,
  getDocument,
  getDocuments,
  subscribeToDocument,
  subscribeToCollection,
  collections,
  serverTimestamp,
  where,
  orderBy,
  limit,
  GeoPoint,
} from '@/services/firebase/firestore'
import type { Order, OrderStatus, OrderItem, Merchant } from '@/types'

interface DeliveryAddress {
  address: string
  coordinates: { lat: number; lng: number }
  details?: string
  contactName: string
  contactPhone: string
}

interface UseOrdersReturn {
  // State
  orders: Order[]
  activeOrder: Order | null
  isLoading: boolean
  error: string | null

  // Actions
  placeOrder: (deliveryAddress: DeliveryAddress, notes?: string) => Promise<string | null>
  getOrder: (orderId: string) => Promise<Order | null>
  getOrders: (status?: OrderStatus, limitCount?: number) => Promise<Order[]>
  cancelOrder: (orderId: string, reason?: string) => Promise<boolean>
  rateOrder: (orderId: string, rating: number, review?: string) => Promise<boolean>
  reorder: (orderId: string) => Promise<boolean>
  subscribeToOrder: (orderId: string) => () => void
  subscribeToActiveOrders: () => () => void
}

export function useOrders(): UseOrdersReturn {
  const { user, profile } = useAuthStore()
  const { cart, clearCart } = useCartStore()

  const [orders, setOrders] = useState<Order[]>([])
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const placeOrder = useCallback(async (
    deliveryAddress: DeliveryAddress,
    notes?: string
  ): Promise<string | null> => {
    if (!user || !profile) {
      setError('Please login to place an order')
      return null
    }

    if (!cart || cart.items.length === 0) {
      setError('Your cart is empty')
      return null
    }

    try {
      setIsLoading(true)
      setError(null)

      // Generate order ID
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Calculate totals
      const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const serviceFee = Math.round(subtotal * 0.05) // 5% service fee
      const total = subtotal + cart.deliveryFee + serviceFee

      // Create order items
      const orderItems: OrderItem[] = cart.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        options: item.options,
        addons: item.addons,
        specialInstructions: item.specialInstructions,
        total: item.price * item.quantity,
      }))

      // Create order document
      const orderData: Partial<Order> = {
        id: orderId,
        customerId: user.uid,
        merchantId: cart.merchantId,
        type: cart.merchantType === 'grocery' ? 'grocery' : 'food',
        items: orderItems,
        subtotal,
        deliveryFee: cart.deliveryFee,
        serviceFee,
        total,
        deliveryAddress: {
          address: deliveryAddress.address,
          coordinates: new GeoPoint(deliveryAddress.coordinates.lat, deliveryAddress.coordinates.lng),
          details: deliveryAddress.details,
          contactName: deliveryAddress.contactName || `${profile.firstName} ${profile.lastName}`,
          contactPhone: deliveryAddress.contactPhone || profile.phone,
        },
        paymentMethod: 'cash', // Default to cash, can be changed
        paymentStatus: 'pending',
        status: 'pending',
        notes,
      }

      await setDocument(collections.orders, orderId, {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Clear cart after successful order
      clearCart()

      setActiveOrder(orderData as Order)
      setIsLoading(false)

      return orderId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to place order'
      setError(errorMessage)
      setIsLoading(false)
      return null
    }
  }, [user, profile, cart, clearCart])

  const getOrder = useCallback(async (orderId: string): Promise<Order | null> => {
    try {
      setIsLoading(true)
      const order = await getDocument<Order>(collections.orders, orderId)
      setIsLoading(false)
      return order
    } catch (err) {
      console.error('Failed to fetch order:', err)
      setIsLoading(false)
      return null
    }
  }, [])

  const getOrders = useCallback(async (
    status?: OrderStatus,
    limitCount: number = 20
  ): Promise<Order[]> => {
    if (!user) return []

    try {
      setIsLoading(true)

      const constraints = [
        where('customerId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(limitCount),
      ]

      if (status) {
        constraints.unshift(where('status', '==', status))
      }

      const ordersList = await getDocuments<Order>(collections.orders, constraints)

      setOrders(ordersList)
      setIsLoading(false)
      return ordersList
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setIsLoading(false)
      return []
    }
  }, [user])

  const cancelOrder = useCallback(async (orderId: string, reason?: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      // Check if order can be cancelled
      const order = await getDocument<Order>(collections.orders, orderId)
      if (!order) {
        setError('Order not found')
        setIsLoading(false)
        return false
      }

      // Only allow cancellation for pending or confirmed orders
      if (!['pending', 'confirmed'].includes(order.status)) {
        setError('This order cannot be cancelled')
        setIsLoading(false)
        return false
      }

      await setDocument(collections.orders, orderId, {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        cancellationReason: reason || 'Cancelled by customer',
      })

      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
      )

      setIsLoading(false)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel order'
      setError(errorMessage)
      setIsLoading(false)
      return false
    }
  }, [])

  const rateOrder = useCallback(async (
    orderId: string,
    rating: number,
    review?: string
  ): Promise<boolean> => {
    try {
      await setDocument(collections.orders, orderId, {
        rating,
        review,
      })

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit rating'
      setError(errorMessage)
      return false
    }
  }, [])

  const reorder = useCallback(async (orderId: string): Promise<boolean> => {
    try {
      const order = await getDocument<Order>(collections.orders, orderId)
      if (!order) {
        setError('Order not found')
        return false
      }

      // Get merchant info
      const merchant = await getDocument<Merchant>(collections.merchants, order.merchantId)
      if (!merchant) {
        setError('Restaurant not found')
        return false
      }

      // Clear current cart and add items from previous order
      clearCart()

      // This would need cart store modification to support batch adding
      // For now, return true to indicate success
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder'
      setError(errorMessage)
      return false
    }
  }, [clearCart])

  const subscribeToOrder = useCallback((orderId: string) => {
    const unsub = subscribeToDocument<Order>(
      collections.orders,
      orderId,
      (order) => {
        setActiveOrder(order)
      }
    )
    return unsub
  }, [])

  const subscribeToActiveOrders = useCallback(() => {
    if (!user) return () => {}

    const unsub = subscribeToCollection<Order>(
      collections.orders,
      [
        where('customerId', '==', user.uid),
        where('status', 'in', ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way']),
        orderBy('createdAt', 'desc'),
      ],
      (activeOrders) => {
        setOrders(activeOrders)
      }
    )
    return unsub
  }, [user])

  return {
    orders,
    activeOrder,
    isLoading,
    error,
    placeOrder,
    getOrder,
    getOrders,
    cancelOrder,
    rateOrder,
    reorder,
    subscribeToOrder,
    subscribeToActiveOrders,
  }
}
