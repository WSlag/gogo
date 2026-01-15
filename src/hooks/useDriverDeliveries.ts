import { useCallback, useState, useEffect } from 'react'
import {
  getDocuments,
  setDocument,
  subscribeToCollection,
  collections,
  serverTimestamp,
  where,
  orderBy,
} from '@/services/firebase/firestore'
import type { Order } from '@/types'
import { APP_CONFIG } from '@/config/app'

interface UseDriverDeliveriesOptions {
  driverId?: string
  realtime?: boolean
}

interface UseDriverDeliveriesReturn {
  // Available deliveries (ready for pickup)
  availableDeliveries: Order[]
  // Driver's active delivery
  activeDelivery: Order | null
  // Loading state
  isLoading: boolean
  // Error state
  error: string | null
  // Actions
  acceptDelivery: (orderId: string) => Promise<boolean>
  pickupOrder: (orderId: string) => Promise<boolean>
  completeDelivery: (orderId: string) => Promise<boolean>
  cancelDelivery: (orderId: string, reason?: string) => Promise<boolean>
  refetch: () => Promise<void>
}

export function useDriverDeliveries(options: UseDriverDeliveriesOptions = {}): UseDriverDeliveriesReturn {
  const { driverId = APP_CONFIG.TEST_DRIVER_ID, realtime = true } = options

  const [availableDeliveries, setAvailableDeliveries] = useState<Order[]>([])
  const [activeDelivery, setActiveDelivery] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch available deliveries (orders that are ready for pickup)
  const fetchAvailableDeliveries = useCallback(async () => {
    try {
      setIsLoading(true)
      const orders = await getDocuments<Order>(collections.orders, [
        where('status', '==', 'ready'),
        orderBy('createdAt', 'desc'),
      ])
      setAvailableDeliveries(orders)
    } catch (err) {
      console.error('Failed to fetch available deliveries:', err)
      setError('Failed to load deliveries')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch driver's active delivery
  const fetchActiveDelivery = useCallback(async () => {
    if (!driverId) return
    try {
      const orders = await getDocuments<Order>(collections.orders, [
        where('driverId', '==', driverId),
        where('status', 'in', ['picked_up', 'on_the_way']),
      ])
      setActiveDelivery(orders[0] || null)
    } catch (err) {
      console.error('Failed to fetch active delivery:', err)
    }
  }, [driverId])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!realtime) {
      fetchAvailableDeliveries()
      fetchActiveDelivery()
      return
    }

    // Subscribe to available deliveries (ready status)
    const unsubAvailable = subscribeToCollection<Order>(
      collections.orders,
      [
        where('status', '==', 'ready'),
        orderBy('createdAt', 'desc'),
      ],
      (orders) => {
        setAvailableDeliveries(orders)
        setIsLoading(false)
      }
    )

    // Subscribe to driver's active delivery
    let unsubActive = () => {}
    if (driverId) {
      unsubActive = subscribeToCollection<Order>(
        collections.orders,
        [
          where('driverId', '==', driverId),
          where('status', 'in', ['picked_up', 'on_the_way']),
        ],
        (orders) => {
          setActiveDelivery(orders[0] || null)
        }
      )
    }

    return () => {
      unsubAvailable()
      unsubActive()
    }
  }, [driverId, realtime, fetchAvailableDeliveries, fetchActiveDelivery])

  // Accept a delivery
  const acceptDelivery = useCallback(async (orderId: string): Promise<boolean> => {
    if (!driverId) {
      setError('Driver ID required')
      return false
    }

    try {
      setError(null)
      await setDocument(collections.orders, orderId, {
        driverId,
        status: 'picked_up',
        pickedUpAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept delivery'
      setError(errorMessage)
      return false
    }
  }, [driverId])

  // Mark order as picked up from merchant
  const pickupOrder = useCallback(async (orderId: string): Promise<boolean> => {
    try {
      setError(null)
      await setDocument(collections.orders, orderId, {
        status: 'on_the_way',
        updatedAt: serverTimestamp(),
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order'
      setError(errorMessage)
      return false
    }
  }, [])

  // Complete the delivery
  const completeDelivery = useCallback(async (orderId: string): Promise<boolean> => {
    try {
      setError(null)
      await setDocument(collections.orders, orderId, {
        status: 'delivered',
        deliveredAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      setActiveDelivery(null)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete delivery'
      setError(errorMessage)
      return false
    }
  }, [])

  // Cancel a delivery
  const cancelDelivery = useCallback(async (orderId: string, reason?: string): Promise<boolean> => {
    try {
      setError(null)
      // Return order to ready status so another driver can pick it up
      await setDocument(collections.orders, orderId, {
        driverId: null,
        status: 'ready',
        driverCancelReason: reason || 'Cancelled by driver',
        updatedAt: serverTimestamp(),
      })
      setActiveDelivery(null)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel delivery'
      setError(errorMessage)
      return false
    }
  }, [])

  const refetch = useCallback(async () => {
    await Promise.all([fetchAvailableDeliveries(), fetchActiveDelivery()])
  }, [fetchAvailableDeliveries, fetchActiveDelivery])

  return {
    availableDeliveries,
    activeDelivery,
    isLoading,
    error,
    acceptDelivery,
    pickupOrder,
    completeDelivery,
    cancelDelivery,
    refetch,
  }
}
