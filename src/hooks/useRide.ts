import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRideStore, type PromoCodeInfo } from '@/store/rideStore'
import { useAuthStore } from '@/store/authStore'
import { useLocation } from './useLocation'
import { APP_CONFIG } from '@/config/app'
import {
  setDocument,
  getDocument,
  getDocuments,
  subscribeToDocument,
  collections,
  serverTimestamp,
  where,
  orderBy,
  limit,
  GeoPoint,
  Timestamp,
} from '@/services/firebase/firestore'
import type { Ride, RideStatus, VehicleType, VehicleTypeInfo, Driver, RideFare } from '@/types'

// Promo interface for Firestore promo documents
interface Promo {
  id: string
  code: string
  type: 'percentage' | 'fixed' | 'freeDelivery'
  value: number
  maxDiscount?: number
  minOrder?: number
  isActive: boolean
  validFrom: Timestamp | string
  validTo: Timestamp | string
  usageLimit?: number
  usedCount: number
  applicableServices: string[]
}

// Ultra-affordable pricing for Cotabato City market (25-30% lower than Manila rates)
export const VEHICLE_TYPES: Record<VehicleType, VehicleTypeInfo> = {
  motorcycle: {
    type: 'motorcycle',
    name: 'MC Taxi',
    description: 'Affordable motorcycle ride',
    icon: 'motorcycle',
    baseFare: 30,
    perKm: 7,
    perMinute: 1,
    minFare: 35,
    capacity: 1,
    estimatedArrival: '3-5 min',
  },
  car: {
    type: 'car',
    name: 'Car',
    description: 'Comfortable 4-seater',
    icon: 'car',
    baseFare: 45,
    perKm: 10,
    perMinute: 1.5,
    minFare: 55,
    capacity: 4,
    estimatedArrival: '5-8 min',
  },
  van: {
    type: 'van',
    name: 'Van',
    description: 'Spacious for groups',
    icon: 'van',
    baseFare: 60,
    perKm: 13,
    perMinute: 2,
    minFare: 70,
    capacity: 6,
    estimatedArrival: '8-12 min',
  },
  delivery: {
    type: 'delivery',
    name: 'Delivery',
    description: 'Send packages',
    icon: 'truck',
    baseFare: 35,
    perKm: 8,
    perMinute: 1,
    minFare: 40,
    capacity: 0,
    estimatedArrival: '5-10 min',
  },
  happy_move: {
    type: 'happy_move',
    name: 'Happy Move',
    description: 'Moving & hauling',
    icon: 'truck',
    baseFare: 200,
    perKm: 18,
    perMinute: 3,
    minFare: 350,
    capacity: 0,
    estimatedArrival: '15-25 min',
  },
  airport: {
    type: 'airport',
    name: 'Airport',
    description: 'Airport transfer',
    icon: 'plane',
    baseFare: 350,
    perKm: 0,
    perMinute: 0,
    minFare: 350,
    capacity: 4,
    estimatedArrival: '10-15 min',
  },
}

// Surge pricing configuration (lower multipliers for price-sensitive Cotabato market)
const SURGE_CONFIG = {
  // Peak hours (6-9 AM and 5-8 PM)
  peakHours: [
    { start: 6, end: 9 },
    { start: 17, end: 20 },
  ],
  peakMultiplier: 1.15,
  // Weekend bonus
  weekendMultiplier: 1.05,
  // Bad weather (would be fetched from API in production)
  badWeatherMultiplier: 1.3,
  // High demand (would be calculated from real-time data)
  highDemandMultiplier: 1.2,
}

interface LocationInfo {
  address: string
  coordinates: GeoPoint | null
  details?: string
}

interface RideFareInfo {
  base: number
  distance: number
  time: number
  surge?: number
  discount?: number
  total: number
}

interface RouteInfoLocal {
  distance: number
  duration: number
  polyline: string
}

export interface UseRideReturn {
  // State
  pickup: LocationInfo | null
  dropoff: LocationInfo | null
  vehicleType: VehicleType
  vehicleInfo: VehicleTypeInfo
  route: RouteInfoLocal | null
  fare: RideFareInfo | null
  paymentMethod: 'cash' | 'gcash' | 'wallet'
  promoCode: PromoCodeInfo | null
  surgeMultiplier: number
  activeRideId: string | null
  rideStatus: RideStatus | null
  driver: Driver | null
  isBooking: boolean
  isFindingDriver: boolean
  error: string | null

  // Actions
  setPickupLocation: (address: string, lat: number, lng: number) => void
  setDropoffLocation: (address: string, lat: number, lng: number) => void
  selectVehicleType: (type: VehicleType) => void
  setPaymentMethod: (method: 'cash' | 'gcash' | 'wallet') => void
  applyPromoCode: (code: string) => Promise<boolean>
  removePromoCode: () => void
  calculateFare: () => Promise<void>
  bookRide: () => Promise<string | null>
  cancelRide: (reason?: string) => Promise<boolean>
  rateRide: (rating: number, review?: string) => Promise<boolean>
  getRideHistory: (limitCount?: number) => Promise<Ride[]>
  resetBooking: () => void
  resetRide: () => void
}

// Calculate current surge multiplier based on time and conditions
function calculateSurgeMultiplier(): number {
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay() // 0 = Sunday, 6 = Saturday
  let multiplier = 1

  // Check peak hours
  const isPeakHour = SURGE_CONFIG.peakHours.some(
    (period) => hour >= period.start && hour < period.end
  )
  if (isPeakHour) {
    multiplier *= SURGE_CONFIG.peakMultiplier
  }

  // Check weekend
  const isWeekend = day === 0 || day === 6
  if (isWeekend) {
    multiplier *= SURGE_CONFIG.weekendMultiplier
  }

  // Round to 2 decimal places
  return Math.round(multiplier * 100) / 100
}

// Calculate discount from promo code
function calculateDiscount(
  promo: PromoCodeInfo | null,
  subtotal: number
): number {
  if (!promo) return 0

  let discount = 0
  switch (promo.type) {
    case 'percentage':
      discount = subtotal * (promo.value / 100)
      if (promo.maxDiscount) {
        discount = Math.min(discount, promo.maxDiscount)
      }
      break
    case 'fixed':
      discount = promo.value
      break
    case 'freeDelivery':
      // Not applicable for rides
      break
  }

  return Math.round(discount)
}

// Rate limiting for promo code attempts
const PROMO_RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 60000, // 1 minute
}

export function useRide(): UseRideReturn {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { getDirections } = useLocation()
  const {
    pickup,
    dropoff,
    vehicleType,
    route,
    fare,
    paymentMethod,
    isScheduled,
    scheduledTime,
    promoCode,
    surgeMultiplier,
    activeRideId,
    rideStatus,
    driver,
    isBooking,
    isFindingDriver,
    error,
    setPickup,
    setDropoff,
    setVehicleType,
    setRoute,
    setFare,
    setPaymentMethod,
    setScheduledRide,
    setPromoCode,
    setSurgeMultiplier,
    setActiveRide,
    setDriver,
    setBooking,
    setFindingDriver,
    setError,
    resetBooking: storeResetBooking,
    resetRide,
  } = useRideStore()

  // Rate limiting state for promo code attempts
  const [promoAttempts, setPromoAttempts] = useState<number[]>([])

  // Update surge multiplier on mount and periodically
  useEffect(() => {
    const updateSurge = () => {
      const newMultiplier = calculateSurgeMultiplier()
      setSurgeMultiplier(newMultiplier)
    }

    updateSurge()
    // Update every 5 minutes
    const interval = setInterval(updateSurge, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [setSurgeMultiplier])

  // Subscribe to active ride updates
  // Using ref to avoid stale closure issue with cleanup
  useEffect(() => {
    if (!activeRideId) {
      return
    }

    let isMounted = true
    const unsub = subscribeToDocument<Ride>(
      collections.rides,
      activeRideId,
      (rideData) => {
        if (!isMounted) return

        if (rideData) {
          setActiveRide(rideData.id, rideData.status)

          // Update driver info when assigned
          if (rideData.driverId && !driver) {
            loadDriver(rideData.driverId)
          }

          // Handle ride completion
          if (rideData.status === 'completed' || rideData.status === 'cancelled') {
            // Cleanup after delay
            setTimeout(() => {
              if (isMounted) {
                resetRide()
              }
            }, 5000)
          }
        }
      }
    )

    // Cleanup: unsubscribe when activeRideId changes or component unmounts
    return () => {
      isMounted = false
      unsub()
    }
  }, [activeRideId, driver, setActiveRide, resetRide])

  const loadDriver = async (driverId: string) => {
    const driverData = await getDocument<Driver>(collections.drivers, driverId)
    if (driverData) {
      setDriver(driverData)
    }
  }

  const setPickupLocation = useCallback((address: string, lat: number, lng: number) => {
    setPickup({
      address,
      coordinates: new GeoPoint(lat, lng),
    })
  }, [setPickup])

  const setDropoffLocation = useCallback((address: string, lat: number, lng: number) => {
    setDropoff({
      address,
      coordinates: new GeoPoint(lat, lng),
    })
  }, [setDropoff])

  const selectVehicleType = useCallback((type: VehicleType) => {
    setVehicleType(type)
    // Recalculate fare when vehicle type changes
    if (pickup && dropoff) {
      calculateFare()
    }
  }, [setVehicleType, pickup, dropoff])

  const applyPromoCode = useCallback(async (code: string): Promise<boolean> => {
    if (!code.trim()) {
      setError('Please enter a promo code')
      return false
    }

    // Rate limiting check
    const now = Date.now()
    const recentAttempts = promoAttempts.filter(
      (timestamp) => now - timestamp < PROMO_RATE_LIMIT.windowMs
    )

    if (recentAttempts.length >= PROMO_RATE_LIMIT.maxAttempts) {
      const waitTime = Math.ceil((PROMO_RATE_LIMIT.windowMs - (now - recentAttempts[0])) / 1000)
      setError(`Too many attempts. Please wait ${waitTime} seconds.`)
      return false
    }

    // Record this attempt
    setPromoAttempts([...recentAttempts, now])

    try {
      // Fetch promo from Firestore
      const promos = await getDocuments<Promo>(
        collections.promos,
        [where('code', '==', code.toUpperCase())]
      )

      if (promos.length === 0) {
        setError('Invalid promo code')
        return false
      }

      const promo = promos[0]

      // Check if promo is active
      if (!promo.isActive) {
        setError('This promo code is no longer active')
        return false
      }

      // Check validity period
      const now = new Date()
      const validFrom = promo.validFrom instanceof Timestamp
        ? promo.validFrom.toDate()
        : new Date(promo.validFrom)
      const validTo = promo.validTo instanceof Timestamp
        ? promo.validTo.toDate()
        : new Date(promo.validTo)

      if (now < validFrom || now > validTo) {
        setError('This promo code has expired')
        return false
      }

      // Check usage limit
      if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
        setError('This promo code has reached its usage limit')
        return false
      }

      // Check if applicable to rides
      if (!promo.applicableServices.includes('rides')) {
        setError('This promo code is not valid for rides')
        return false
      }

      // Check minimum order (fare) if applicable
      if (promo.minOrder && fare && fare.total < promo.minOrder) {
        setError(`Minimum fare of ₱${promo.minOrder} required`)
        return false
      }

      // Apply promo
      setPromoCode({
        code: promo.code,
        type: promo.type,
        value: promo.value,
        maxDiscount: promo.maxDiscount,
      })

      // Recalculate fare with discount
      if (fare) {
        const discount = calculateDiscount(
          { code: promo.code, type: promo.type, value: promo.value, maxDiscount: promo.maxDiscount },
          fare.total
        )
        setFare({
          ...fare,
          discount,
          total: fare.total - discount,
        })
      }

      setError(null)
      return true
    } catch (err) {
      console.error('Failed to apply promo code:', err)
      setError('Failed to apply promo code')
      return false
    }
  }, [fare, promoAttempts, setPromoCode, setFare, setError])

  const removePromoCode = useCallback(() => {
    setPromoCode(null)
    // Recalculate fare without discount
    if (fare && fare.discount) {
      setFare({
        ...fare,
        discount: undefined,
        total: fare.total + fare.discount,
      })
    }
  }, [fare, setPromoCode, setFare])

  const calculateFare = useCallback(async (): Promise<void> => {
    if (!pickup || !dropoff) {
      setError('Please set pickup and dropoff locations')
      return
    }

    try {
      if (!pickup.coordinates || !dropoff.coordinates) {
        setError('Missing coordinates')
        return
      }

      // Get directions from Google Maps
      const directions = await getDirections(
        { address: pickup.address, coordinates: { lat: pickup.coordinates.latitude, lng: pickup.coordinates.longitude } },
        { address: dropoff.address, coordinates: { lat: dropoff.coordinates.latitude, lng: dropoff.coordinates.longitude } }
      )

      if (directions) {
        setRoute({
          distance: directions.distance,
          duration: directions.duration,
          polyline: directions.polyline,
        })

        // Calculate fare based on vehicle type
        const vehicleInfo = VEHICLE_TYPES[vehicleType]
        const distanceKm = directions.distance / 1000
        const durationMin = directions.duration / 60

        const baseFare = vehicleInfo.baseFare
        const distanceFare = distanceKm * vehicleInfo.perKm
        const timeFare = durationMin * vehicleInfo.perMinute
        let subtotal = Math.max(baseFare + distanceFare + timeFare, vehicleInfo.minFare)

        // Apply surge pricing
        const currentSurge = calculateSurgeMultiplier()
        setSurgeMultiplier(currentSurge)
        const surgeAmount = currentSurge > 1 ? Math.round(subtotal * (currentSurge - 1)) : 0
        subtotal = Math.round(subtotal * currentSurge)

        // Apply promo discount
        const discount = calculateDiscount(promoCode, subtotal)

        setFare({
          base: baseFare,
          distance: distanceFare,
          time: timeFare,
          surge: surgeAmount > 0 ? surgeAmount : undefined,
          discount: discount > 0 ? discount : undefined,
          total: Math.round(subtotal - discount),
        })
      }
    } catch (err) {
      console.error('Fare calculation error:', err)
      setError('Failed to calculate fare')
    }
  }, [pickup, dropoff, vehicleType, promoCode, getDirections, setRoute, setFare, setSurgeMultiplier, setError])

  const bookRide = useCallback(async (): Promise<string | null> => {
    // Skip auth check if SKIP_AUTH is enabled (for testing)
    if (!APP_CONFIG.SKIP_AUTH && !user) {
      setError('Please login to book a ride')
      navigate('/auth/login')
      return null
    }

    if (!pickup || !dropoff || !fare) {
      setError('Please complete all booking details')
      return null
    }

    // Validate coordinates exist - don't create rides with invalid locations
    if (!pickup.coordinates || !dropoff.coordinates) {
      setError('Invalid pickup or dropoff location. Please select valid locations.')
      return null
    }

    // Validate coordinates are in valid range
    const isValidCoordinate = (lat: number, lng: number): boolean => {
      return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && !(lat === 0 && lng === 0)
    }

    if (!isValidCoordinate(pickup.coordinates.latitude, pickup.coordinates.longitude)) {
      setError('Invalid pickup coordinates. Please select a valid location.')
      return null
    }

    if (!isValidCoordinate(dropoff.coordinates.latitude, dropoff.coordinates.longitude)) {
      setError('Invalid dropoff coordinates. Please select a valid location.')
      return null
    }

    try {
      setBooking(true)
      setError(null)

      // Generate secure ride ID using crypto API with fallback
      const generateSecureId = (): string => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          return `ride_${crypto.randomUUID()}`
        }
        // Fallback for older browsers
        const array = new Uint32Array(4)
        crypto.getRandomValues(array)
        return `ride_${Array.from(array, n => n.toString(16).padStart(8, '0')).join('')}`
      }
      const rideId = generateSecureId()

      // Create ride document
      // Build fare object without undefined values (Firestore doesn't accept undefined)
      const fareData: RideFare = {
        base: fare.base,
        distance: fare.distance,
        time: fare.time,
        total: fare.total,
        ...(fare.surge !== undefined && fare.surge > 0 && { surge: fare.surge }),
        ...(fare.discount !== undefined && fare.discount > 0 && { discount: fare.discount }),
      }

      const rideData: Partial<Ride> = {
        id: rideId,
        passengerId: user?.uid || 'test-customer',
        vehicleType,
        pickup: {
          address: pickup.address,
          coordinates: pickup.coordinates,
        },
        dropoff: {
          address: dropoff.address,
          coordinates: dropoff.coordinates,
        },
        ...(route && { route }),
        fare: fareData,
        paymentMethod,
        paymentStatus: 'pending',
        status: isScheduled ? 'scheduled' : 'pending',
      }

      await setDocument(collections.rides, rideId, {
        ...rideData,
        ...(promoCode?.code && { promoCode: promoCode.code }),
        ...(isScheduled && scheduledTime && { scheduledAt: Timestamp.fromDate(scheduledTime) }),
        surgeMultiplier,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      setActiveRide(rideId, isScheduled ? 'scheduled' : 'pending')
      setBooking(false)

      // For scheduled rides, don't search for driver immediately
      if (!isScheduled) {
        setFindingDriver(true)
      }

      // Clear scheduled ride state after booking
      if (isScheduled) {
        setScheduledRide(false, null)
      }

      // Navigate to tracking page
      navigate(`/rides/tracking/${rideId}`)

      return rideId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to book ride'
      setError(errorMessage)
      setBooking(false)
      return null
    }
  }, [user, pickup, dropoff, fare, route, vehicleType, paymentMethod, isScheduled, scheduledTime, promoCode, surgeMultiplier, navigate, setBooking, setFindingDriver, setActiveRide, setScheduledRide, setError])

  const cancelRide = useCallback(async (reason?: string): Promise<boolean> => {
    if (!activeRideId) {
      setError('No active ride to cancel')
      return false
    }

    try {
      await setDocument(collections.rides, activeRideId, {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        cancellationReason: reason || 'Cancelled by passenger',
        cancelledBy: 'passenger',
        updatedAt: serverTimestamp(),
      })

      resetRide()
      navigate('/rides')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel ride'
      setError(errorMessage)
      return false
    }
  }, [activeRideId, navigate, resetRide, setError])

  const rateRide = useCallback(async (rating: number, review?: string): Promise<boolean> => {
    if (!activeRideId) {
      setError('No ride to rate')
      return false
    }

    try {
      await setDocument(collections.rides, activeRideId, {
        rating,
        review,
      })

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit rating'
      setError(errorMessage)
      return false
    }
  }, [activeRideId, setError])

  const getRideHistory = useCallback(async (limitCount: number = 20): Promise<Ride[]> => {
    if (!user) return []

    try {
      const rides = await getDocuments<Ride>(
        collections.rides,
        [
          where('passengerId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(limitCount),
        ]
      )

      return rides
    } catch (err) {
      console.error('Failed to fetch ride history:', err)
      return []
    }
  }, [user])

  const resetBooking = useCallback(() => {
    storeResetBooking()
  }, [storeResetBooking])

  return {
    // State
    pickup,
    dropoff,
    vehicleType,
    vehicleInfo: VEHICLE_TYPES[vehicleType],
    route,
    fare,
    paymentMethod,
    promoCode,
    surgeMultiplier,
    activeRideId,
    rideStatus,
    driver,
    isBooking,
    isFindingDriver,
    error,

    // Actions
    setPickupLocation,
    setDropoffLocation,
    selectVehicleType,
    setPaymentMethod,
    applyPromoCode,
    removePromoCode,
    calculateFare,
    bookRide,
    cancelRide,
    rateRide,
    getRideHistory,
    resetBooking,
    resetRide,
  }
}
