// Real-time ride tracking hook with Firestore listeners
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useRideStore } from '@/store/rideStore'
import {
  subscribeToDocument,
  subscribeToCollection,
  getDocument,
  collections,
  where,
  orderBy,
  limit,
} from '@/services/firebase/firestore'
import type { Ride, Driver, RideStatus } from '@/types'

interface UseRealtimeRideReturn {
  ride: Ride | null
  driver: Driver | null
  status: RideStatus | null
  estimatedArrival: number | null
  driverLocation: { lat: number; lng: number } | null
  isLoading: boolean
  error: string | null
  refreshRide: () => void
}

export function useRealtimeRide(rideId: string | undefined): UseRealtimeRideReturn {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { setActiveRide, setDriver, setFindingDriver } = useRideStore()

  const [ride, setRide] = useState<Ride | null>(null)
  const [driver, setDriverState] = useState<Driver | null>(null)
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Subscribe to ride updates
  useEffect(() => {
    if (!rideId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const unsubscribe = subscribeToDocument<Ride>(
      collections.rides,
      rideId,
      async (rideData) => {
        if (!rideData) {
          setError('Ride not found')
          setIsLoading(false)
          return
        }

        setRide(rideData)
        setActiveRide(rideData.id, rideData.status)
        setIsLoading(false)

        // Update finding driver state
        if (rideData.status === 'pending') {
          setFindingDriver(true)
        } else {
          setFindingDriver(false)
        }

        // Load driver info when assigned
        if (rideData.driverId && !driver) {
          try {
            const driverData = await getDocument<Driver>(collections.drivers, rideData.driverId)
            if (driverData) {
              setDriverState(driverData)
              setDriver(driverData)
            }
          } catch (err) {
            console.error('Failed to load driver:', err)
          }
        }

        // Handle ride completion/cancellation
        if (rideData.status === 'completed' || rideData.status === 'cancelled') {
          // Stay on tracking page to show final status
        }
      }
    )

    return () => {
      unsubscribe()
    }
  }, [rideId, setActiveRide, setDriver, setFindingDriver])

  // Subscribe to driver location updates
  useEffect(() => {
    if (!ride?.driverId) return

    const unsubscribe = subscribeToDocument<Driver>(
      collections.drivers,
      ride.driverId,
      (driverData) => {
        if (driverData) {
          setDriverState(driverData)
          if (driverData.currentLocation) {
            setDriverLocation({
              lat: driverData.currentLocation.latitude,
              lng: driverData.currentLocation.longitude,
            })
          }
        }
      }
    )

    return () => {
      unsubscribe()
    }
  }, [ride?.driverId])

  const refreshRide = useCallback(async () => {
    if (!rideId) return

    try {
      const rideData = await getDocument<Ride>(collections.rides, rideId)
      if (rideData) {
        setRide(rideData)
      }
    } catch (err) {
      console.error('Failed to refresh ride:', err)
    }
  }, [rideId])

  // Calculate estimated arrival based on status and driver location
  const estimatedArrival = ride?.estimatedArrival || null

  return {
    ride,
    driver: driver || driverState,
    status: ride?.status || null,
    estimatedArrival,
    driverLocation,
    isLoading,
    error,
    refreshRide,
  }
}

// Hook to get active ride for current user
export function useActiveRide(): {
  activeRide: Ride | null
  isLoading: boolean
} {
  const { user } = useAuthStore()
  const [activeRide, setActiveRide] = useState<Ride | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    const unsubscribe = subscribeToCollection<Ride>(
      collections.rides,
      [
        where('passengerId', '==', user.uid),
        where('status', 'in', ['pending', 'accepted', 'arriving', 'arrived', 'in_progress']),
        orderBy('createdAt', 'desc'),
        limit(1),
      ],
      (rides) => {
        setActiveRide(rides.length > 0 ? rides[0] : null)
        setIsLoading(false)
      }
    )

    return () => {
      unsubscribe()
    }
  }, [user])

  return { activeRide, isLoading }
}
