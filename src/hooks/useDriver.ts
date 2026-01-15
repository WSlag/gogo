// Driver hook for Firestore integration
import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  getDocument,
  setDocument,
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
import { APP_CONFIG } from '@/config/app'
import type { Driver, Ride, RideStatus } from '@/types'

interface DriverEarnings {
  today: number
  thisWeek: number
  thisMonth: number
  total: number
  pendingPayout: number
}

interface UseDriverReturn {
  driver: Driver | null
  isLoading: boolean
  error: string | null
  isOnline: boolean
  pendingRide: Ride | null
  activeRide: Ride | null
  earnings: DriverEarnings
  todayStats: {
    completedRides: number
    onlineHours: number
  }
  // Actions
  goOnline: () => Promise<void>
  goOffline: () => Promise<void>
  acceptRide: (rideId: string) => Promise<boolean>
  declineRide: (rideId: string) => Promise<boolean>
  updateLocation: (lat: number, lng: number) => Promise<void>
  updateRideStatus: (rideId: string, status: RideStatus) => Promise<boolean>
  startRide: (rideId: string) => Promise<boolean>
  completeRide: (rideId: string) => Promise<boolean>
  cancelRide: (rideId: string, reason: string) => Promise<boolean>
  refreshDriver: () => Promise<void>
}

export function useDriver(): UseDriverReturn {
  const { user } = useAuthStore()

  const [driver, setDriver] = useState<Driver | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingRide, setPendingRide] = useState<Ride | null>(null)
  const [activeRide, setActiveRide] = useState<Ride | null>(null)
  const [earnings, setEarnings] = useState<DriverEarnings>({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0,
    pendingPayout: 0,
  })
  const [todayStats, setTodayStats] = useState({
    completedRides: 0,
    onlineHours: 0,
  })

  // Load driver profile
  useEffect(() => {
    // Get the driver ID - use test driver ID when SKIP_AUTH is enabled
    const driverId = APP_CONFIG.SKIP_AUTH
      ? APP_CONFIG.TEST_DRIVER_ID
      : user?.uid

    if (!driverId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    // Subscribe to driver document
    const unsubscribe = subscribeToCollection<Driver>(
      collections.drivers,
      [where('userId', '==', driverId), limit(1)],
      (drivers) => {
        if (drivers.length > 0) {
          setDriver(drivers[0])

          // Load earnings if available
          if (drivers[0].earnings) {
            setEarnings(drivers[0].earnings as DriverEarnings)
          }
        } else {
          setDriver(null)
        }
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  // Subscribe to pending ride requests (only when driver is online)
  useEffect(() => {
    if (!driver || driver.status !== 'online') {
      setPendingRide(null)
      return
    }

    // Listen for ALL pending rides (for testing - driver can pick up any unassigned ride)
    // Also check for rides in other statuses that don't have a driver assigned yet
    const unsubscribe = subscribeToCollection<Ride>(
      collections.rides,
      [
        where('status', 'in', ['pending', 'accepted', 'arriving', 'arrived']),
        limit(20),
      ],
      (rides) => {
        // Find pending rides - either assigned to this driver or unassigned
        // For testing: also show rides that are in progress but have no driver (edge case)
        const availableRides = rides.filter(r =>
          r.status === 'pending' && (!r.driverId || r.driverId === driver.id)
        )

        if (availableRides.length > 0) {
          // Sort by createdAt descending
          availableRides.sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() || 0
            const bTime = b.createdAt?.toMillis?.() || 0
            return bTime - aTime
          })
          setPendingRide(availableRides[0])
        } else {
          setPendingRide(null)
        }
      }
    )

    return () => unsubscribe()
  }, [driver?.id, driver?.status])

  // Subscribe to active rides (when driver is busy or has accepted a ride)
  useEffect(() => {
    if (!driver) {
      setActiveRide(null)
      return
    }

    // Listen for rides assigned to this driver
    const unsubscribe = subscribeToCollection<Ride>(
      collections.rides,
      [
        where('driverId', '==', driver.id),
        limit(5),
      ],
      (rides) => {
        // Find active rides (accepted, in_progress, arriving, arrived)
        const activeRides = rides.filter(r =>
          r.status === 'accepted' || r.status === 'in_progress' ||
          r.status === 'arriving' || r.status === 'arrived'
        )
        if (activeRides.length > 0) {
          setActiveRide(activeRides[0])
        } else {
          setActiveRide(null)
        }
      }
    )

    return () => unsubscribe()
  }, [driver?.id])

  // Also check for rides assigned via currentRideId on driver document
  useEffect(() => {
    if (!driver?.currentRideId || activeRide) return

    // If driver has currentRideId but we don't have activeRide, fetch it directly
    const fetchCurrentRide = async () => {
      try {
        const ride = await getDocument<Ride>(collections.rides, driver.currentRideId!)
        if (ride && ride.status !== 'completed' && ride.status !== 'cancelled') {
          setActiveRide(ride)
        }
      } catch (err) {
        console.error('Failed to fetch current ride:', err)
      }
    }

    fetchCurrentRide()
  }, [driver?.currentRideId, activeRide])

  // Calculate today's stats
  useEffect(() => {
    if (!driver) return

    const loadTodayStats = async () => {
      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Simplified query to avoid composite index requirement
        const rides = await getDocuments<Ride>(
          collections.rides,
          [
            where('driverId', '==', driver.id),
            limit(100),
          ]
        )

        // Filter completed rides client-side
        const completedRides = rides.filter(r => r.status === 'completed')

        // Filter rides completed today
        const todayRides = completedRides.filter((ride) => {
          const completedAt = ride.completedAt?.toDate?.() || new Date(0)
          return completedAt >= today
        })

        setTodayStats({
          completedRides: todayRides.length,
          onlineHours: 0, // Would need to track online sessions
        })
      } catch (err) {
        console.error('Failed to load today stats:', err)
      }
    }

    loadTodayStats()
  }, [driver?.id])

  const goOnline = useCallback(async () => {
    if (!driver) return

    try {
      await setDocument(collections.drivers, driver.id, {
        status: 'online',
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('Failed to go online:', err)
      setError('Failed to go online')
    }
  }, [driver])

  const goOffline = useCallback(async () => {
    if (!driver) return

    try {
      await setDocument(collections.drivers, driver.id, {
        status: 'offline',
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('Failed to go offline:', err)
      setError('Failed to go offline')
    }
  }, [driver])

  const acceptRide = useCallback(async (rideId: string): Promise<boolean> => {
    if (!driver) return false

    try {
      // Update ride status and assign driver
      await setDocument(collections.rides, rideId, {
        status: 'accepted',
        driverId: driver.id,
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Update driver status
      await setDocument(collections.drivers, driver.id, {
        status: 'busy',
        currentRideId: rideId,
        updatedAt: serverTimestamp(),
      })

      setPendingRide(null)
      return true
    } catch (err) {
      console.error('Failed to accept ride:', err)
      setError('Failed to accept ride')
      return false
    }
  }, [driver])

  const declineRide = useCallback(async (rideId: string): Promise<boolean> => {
    if (!driver) return false

    try {
      // Update ride - remove driver assignment so it can be reassigned
      await setDocument(collections.rides, rideId, {
        driverId: null,
        status: 'pending',
        updatedAt: serverTimestamp(),
      })

      setPendingRide(null)
      return true
    } catch (err) {
      console.error('Failed to decline ride:', err)
      setError('Failed to decline ride')
      return false
    }
  }, [driver])

  const updateLocation = useCallback(async (lat: number, lng: number) => {
    if (!driver) return

    try {
      await setDocument(collections.drivers, driver.id, {
        currentLocation: new GeoPoint(lat, lng),
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('Failed to update location:', err)
    }
  }, [driver])

  const updateRideStatus = useCallback(async (rideId: string, status: RideStatus): Promise<boolean> => {
    if (!driver) return false

    try {
      const updateData: Record<string, unknown> = {
        status,
        updatedAt: serverTimestamp(),
      }

      // Add timestamp for specific status changes
      if (status === 'arriving') {
        updateData.arrivingAt = serverTimestamp()
      } else if (status === 'arrived') {
        updateData.arrivedAt = serverTimestamp()
      }

      await setDocument(collections.rides, rideId, updateData)
      return true
    } catch (err) {
      console.error('Failed to update ride status:', err)
      setError('Failed to update ride status')
      return false
    }
  }, [driver])

  const startRide = useCallback(async (rideId: string): Promise<boolean> => {
    if (!driver) return false

    try {
      await setDocument(collections.rides, rideId, {
        status: 'in_progress',
        startedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return true
    } catch (err) {
      console.error('Failed to start ride:', err)
      setError('Failed to start ride')
      return false
    }
  }, [driver])

  const completeRide = useCallback(async (rideId: string): Promise<boolean> => {
    if (!driver) return false

    try {
      // Update ride status
      await setDocument(collections.rides, rideId, {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Update driver - back to online
      await setDocument(collections.drivers, driver.id, {
        status: 'online',
        currentRideId: null,
        totalRides: (driver.totalRides || 0) + 1,
        updatedAt: serverTimestamp(),
      })

      setActiveRide(null)
      return true
    } catch (err) {
      console.error('Failed to complete ride:', err)
      setError('Failed to complete ride')
      return false
    }
  }, [driver])

  const cancelRide = useCallback(async (rideId: string, reason: string): Promise<boolean> => {
    if (!driver) return false

    try {
      // Update ride status
      await setDocument(collections.rides, rideId, {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        cancellationReason: reason || 'Driver cancelled',
        cancelledBy: 'driver',
        updatedAt: serverTimestamp(),
      })

      // Update driver - back to online
      await setDocument(collections.drivers, driver.id, {
        status: 'online',
        currentRideId: null,
        updatedAt: serverTimestamp(),
      })

      setActiveRide(null)
      return true
    } catch (err) {
      console.error('Failed to cancel ride:', err)
      setError('Failed to cancel ride')
      return false
    }
  }, [driver])

  const refreshDriver = useCallback(async () => {
    if (!driver) return

    try {
      const driverData = await getDocument<Driver>(collections.drivers, driver.id)
      if (driverData) {
        setDriver(driverData)
      }
    } catch (err) {
      console.error('Failed to refresh driver:', err)
    }
  }, [driver])

  return {
    driver,
    isLoading,
    error,
    isOnline: driver?.status === 'online' || driver?.status === 'busy',
    pendingRide,
    activeRide,
    earnings,
    todayStats,
    goOnline,
    goOffline,
    acceptRide,
    declineRide,
    updateLocation,
    updateRideStatus,
    startRide,
    completeRide,
    cancelRide,
    refreshDriver,
  }
}
