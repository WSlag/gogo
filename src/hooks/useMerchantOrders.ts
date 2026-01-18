import { useCallback, useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  getDocuments,
  setDocument,
  subscribeToCollection,
  collections,
  serverTimestamp,
  where,
  orderBy,
  limit,
} from '@/services/firebase/firestore'
import type { Order, OrderStatus } from '@/types'

interface UseMerchantOrdersOptions {
  merchantId?: string
  merchantUserId?: string // The merchant's userId (phone number or UID) for querying orders
  status?: OrderStatus | OrderStatus[]
  limitCount?: number
  realtime?: boolean
}

interface UseMerchantOrdersReturn {
  orders: Order[]
  pendingCount: number
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  acceptOrder: (orderId: string) => Promise<boolean>
  rejectOrder: (orderId: string, reason?: string) => Promise<boolean>
  startPreparing: (orderId: string) => Promise<boolean>
  markReady: (orderId: string) => Promise<boolean>
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>
}

export function useMerchantOrders(options: UseMerchantOrdersOptions = {}): UseMerchantOrdersReturn {
  const { user, profile } = useAuthStore()
  const {
    merchantId: propMerchantId,
    merchantUserId: propMerchantUserId,
    status,
    limitCount = 50,
    realtime = true,
  } = options

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use provided merchantUserId for queries (required for Firestore security rules)
  // Fall back to merchantId for backwards compatibility
  const merchantId = propMerchantId || profile?.merchantId
  const merchantUserId = propMerchantUserId

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const constraints = [
        orderBy('createdAt', 'desc'),
        limit(limitCount),
      ]

      // Query by merchantUserId for Firestore security rule compliance
      // The security rules check merchantUserId field, so query must match
      if (merchantUserId && merchantUserId !== 'all') {
        constraints.unshift(where('merchantUserId', '==', merchantUserId))
      } else if (merchantId && merchantId !== 'all') {
        // Fallback to merchantId (may fail for non-admin users due to security rules)
        constraints.unshift(where('merchantId', '==', merchantId))
      }

      // Add status filter if provided
      if (status) {
        if (Array.isArray(status)) {
          constraints.unshift(where('status', 'in', status))
        } else {
          constraints.unshift(where('status', '==', status))
        }
      }

      const ordersList = await getDocuments<Order>(collections.orders, constraints)
      setOrders(ordersList)
    } catch (err) {
      console.error('Failed to fetch merchant orders:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setIsLoading(false)
    }
  }, [merchantId, merchantUserId, status, limitCount])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!realtime) {
      fetchOrders()
      return
    }

    setIsLoading(true)

    const constraints = [
      orderBy('createdAt', 'desc'),
      limit(limitCount),
    ]

    // Query by merchantUserId for Firestore security rule compliance
    if (merchantUserId && merchantUserId !== 'all') {
      constraints.unshift(where('merchantUserId', '==', merchantUserId))
    } else if (merchantId && merchantId !== 'all') {
      // Fallback to merchantId (may fail for non-admin users due to security rules)
      constraints.unshift(where('merchantId', '==', merchantId))
    }

    if (status) {
      if (Array.isArray(status)) {
        constraints.unshift(where('status', 'in', status))
      } else {
        constraints.unshift(where('status', '==', status))
      }
    }

    const unsubscribe = subscribeToCollection<Order>(
      collections.orders,
      constraints,
      (updatedOrders) => {
        setOrders(updatedOrders)
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [merchantId, merchantUserId, status, limitCount, realtime, fetchOrders])

  // Count pending orders
  const pendingCount = orders.filter(o => o.status === 'pending').length

  // Accept order
  const acceptOrder = useCallback(async (orderId: string): Promise<boolean> => {
    try {
      await setDocument(collections.orders, orderId, {
        status: 'confirmed',
        confirmedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return true
    } catch (err) {
      console.error('Failed to accept order:', err)
      setError(err instanceof Error ? err.message : 'Failed to accept order')
      return false
    }
  }, [])

  // Reject order
  const rejectOrder = useCallback(async (orderId: string, reason?: string): Promise<boolean> => {
    try {
      await setDocument(collections.orders, orderId, {
        status: 'cancelled',
        cancellationReason: reason || 'Rejected by merchant',
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return true
    } catch (err) {
      console.error('Failed to reject order:', err)
      setError(err instanceof Error ? err.message : 'Failed to reject order')
      return false
    }
  }, [])

  // Start preparing order
  const startPreparing = useCallback(async (orderId: string): Promise<boolean> => {
    try {
      await setDocument(collections.orders, orderId, {
        status: 'preparing',
        preparingAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return true
    } catch (err) {
      console.error('Failed to start preparing order:', err)
      setError(err instanceof Error ? err.message : 'Failed to update order')
      return false
    }
  }, [])

  // Mark order as ready
  const markReady = useCallback(async (orderId: string): Promise<boolean> => {
    try {
      await setDocument(collections.orders, orderId, {
        status: 'ready',
        readyAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return true
    } catch (err) {
      console.error('Failed to mark order ready:', err)
      setError(err instanceof Error ? err.message : 'Failed to update order')
      return false
    }
  }, [])

  // Generic status update
  const updateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus): Promise<boolean> => {
    try {
      const statusTimestampMap: Record<string, string> = {
        confirmed: 'confirmedAt',
        preparing: 'preparingAt',
        ready: 'readyAt',
        picked_up: 'pickedUpAt',
        on_the_way: 'onTheWayAt',
        delivered: 'deliveredAt',
        cancelled: 'cancelledAt',
      }

      const updateData: Record<string, unknown> = {
        status: newStatus,
        updatedAt: serverTimestamp(),
      }

      const timestampField = statusTimestampMap[newStatus]
      if (timestampField) {
        updateData[timestampField] = serverTimestamp()
      }

      await setDocument(collections.orders, orderId, updateData)
      return true
    } catch (err) {
      console.error('Failed to update order status:', err)
      setError(err instanceof Error ? err.message : 'Failed to update order')
      return false
    }
  }, [])

  return {
    orders,
    pendingCount,
    isLoading,
    error,
    refetch: fetchOrders,
    acceptOrder,
    rejectOrder,
    startPreparing,
    markReady,
    updateOrderStatus,
  }
}

// Hook for a single merchant to get their profile/info
export function useMerchantProfile(merchantId?: string) {
  const { profile } = useAuthStore()
  const [merchant, setMerchant] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const id = merchantId || profile?.merchantId

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      return
    }

    const fetchMerchant = async () => {
      try {
        const merchants = await getDocuments(collections.merchants, [
          where('id', '==', id),
          limit(1),
        ])
        if (merchants.length > 0) {
          setMerchant(merchants[0])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch merchant')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMerchant()
  }, [id])

  return { merchant, isLoading, error }
}
