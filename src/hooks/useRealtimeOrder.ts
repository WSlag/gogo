// Real-time order tracking hook with Firestore listeners
import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  subscribeToDocument,
  subscribeToCollection,
  getDocument,
  collections,
  where,
  orderBy,
  limit,
} from '@/services/firebase/firestore'
import type { Order, OrderStatus, Driver } from '@/types'

interface UseRealtimeOrderReturn {
  order: Order | null
  rider: Driver | null
  status: OrderStatus | null
  estimatedDelivery: number | null
  riderLocation: { lat: number; lng: number } | null
  isLoading: boolean
  error: string | null
  refreshOrder: () => void
}

export function useRealtimeOrder(orderId: string | undefined): UseRealtimeOrderReturn {
  const { user } = useAuthStore()

  const [order, setOrder] = useState<Order | null>(null)
  const [rider, setRider] = useState<Driver | null>(null)
  const [riderLocation, setRiderLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Subscribe to order updates
  useEffect(() => {
    if (!orderId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const unsubscribe = subscribeToDocument<Order>(
      collections.orders,
      orderId,
      async (orderData) => {
        if (!orderData) {
          setError('Order not found')
          setIsLoading(false)
          return
        }

        setOrder(orderData)
        setIsLoading(false)

        // Load rider info when assigned
        if (orderData.driverId && !rider) {
          try {
            const riderData = await getDocument<Driver>(collections.drivers, orderData.driverId)
            if (riderData) {
              setRider(riderData)
            }
          } catch (err) {
            console.error('Failed to load rider:', err)
          }
        }
      }
    )

    return () => {
      unsubscribe()
    }
  }, [orderId])

  // Subscribe to rider location updates
  useEffect(() => {
    if (!order?.driverId) return

    const unsubscribe = subscribeToDocument<Driver>(
      collections.drivers,
      order.driverId,
      (riderData) => {
        if (riderData) {
          setRider(riderData)
          if (riderData.currentLocation) {
            setRiderLocation({
              lat: riderData.currentLocation.latitude,
              lng: riderData.currentLocation.longitude,
            })
          }
        }
      }
    )

    return () => {
      unsubscribe()
    }
  }, [order?.driverId])

  const refreshOrder = useCallback(async () => {
    if (!orderId) return

    try {
      const orderData = await getDocument<Order>(collections.orders, orderId)
      if (orderData) {
        setOrder(orderData)
      }
    } catch (err) {
      console.error('Failed to refresh order:', err)
    }
  }, [orderId])

  return {
    order,
    rider,
    status: order?.status || null,
    estimatedDelivery: order?.estimatedDelivery || null,
    riderLocation,
    isLoading,
    error,
    refreshOrder,
  }
}

// Hook to get active orders for current user
export function useActiveOrders(): {
  activeOrders: Order[]
  isLoading: boolean
} {
  const { user } = useAuthStore()
  const [activeOrders, setActiveOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    const unsubscribe = subscribeToCollection<Order>(
      collections.orders,
      [
        where('customerId', '==', user.uid),
        where('status', 'in', ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way']),
        orderBy('createdAt', 'desc'),
      ],
      (orders) => {
        setActiveOrders(orders)
        setIsLoading(false)
      }
    )

    return () => {
      unsubscribe()
    }
  }, [user])

  return { activeOrders, isLoading }
}

// Hook to get order history
export function useOrderHistory(limitCount: number = 20): {
  orders: Order[]
  isLoading: boolean
  loadMore: () => void
  hasMore: boolean
} {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    const unsubscribe = subscribeToCollection<Order>(
      collections.orders,
      [
        where('customerId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(limitCount),
      ],
      (ordersList) => {
        setOrders(ordersList)
        setHasMore(ordersList.length >= limitCount)
        setIsLoading(false)
      }
    )

    return () => {
      unsubscribe()
    }
  }, [user, limitCount])

  const loadMore = useCallback(() => {
    // Would implement pagination here
    console.log('Load more orders')
  }, [])

  return { orders, isLoading, loadMore, hasMore }
}
