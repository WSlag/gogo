// Real-time GPS location tracking hook
import { useState, useEffect, useCallback, useRef } from 'react'
import { GeoPoint } from '@/services/firebase/firestore'

interface LocationCoords {
  lat: number
  lng: number
  accuracy: number
  heading: number | null
  speed: number | null
  timestamp: number
}

interface UseRealtimeLocationReturn {
  location: LocationCoords | null
  isTracking: boolean
  error: string | null
  startTracking: () => void
  stopTracking: () => void
  getGeoPoint: () => GeoPoint | null
}

interface UseRealtimeLocationOptions {
  enableHighAccuracy?: boolean
  updateInterval?: number // minimum time between updates in ms
  distanceFilter?: number // minimum distance change in meters
  onLocationUpdate?: (location: LocationCoords) => void
}

export function useRealtimeLocation(options: UseRealtimeLocationOptions = {}): UseRealtimeLocationReturn {
  const {
    enableHighAccuracy = true,
    updateInterval = 3000, // 3 seconds
    distanceFilter = 10, // 10 meters
    onLocationUpdate,
  } = options

  const [location, setLocation] = useState<LocationCoords | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const watchIdRef = useRef<number | null>(null)
  const lastUpdateRef = useRef<number>(0)
  const lastLocationRef = useRef<LocationCoords | null>(null)

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lng2 - lng1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
  }, [])

  const handlePositionUpdate = useCallback((position: GeolocationPosition) => {
    const now = Date.now()
    const { latitude, longitude, accuracy, heading, speed } = position.coords

    const newLocation: LocationCoords = {
      lat: latitude,
      lng: longitude,
      accuracy,
      heading,
      speed,
      timestamp: position.timestamp,
    }

    // Check if we should update based on time and distance
    const timeSinceLastUpdate = now - lastUpdateRef.current
    const lastLoc = lastLocationRef.current

    let shouldUpdate = false

    if (!lastLoc) {
      // First location update
      shouldUpdate = true
    } else if (timeSinceLastUpdate >= updateInterval) {
      // Time threshold met
      const distance = calculateDistance(lastLoc.lat, lastLoc.lng, latitude, longitude)
      if (distance >= distanceFilter) {
        // Distance threshold also met
        shouldUpdate = true
      }
    }

    if (shouldUpdate) {
      lastUpdateRef.current = now
      lastLocationRef.current = newLocation
      setLocation(newLocation)
      setError(null)

      // Call the callback if provided
      if (onLocationUpdate) {
        onLocationUpdate(newLocation)
      }
    }
  }, [updateInterval, distanceFilter, calculateDistance, onLocationUpdate])

  const handleError = useCallback((err: GeolocationPositionError) => {
    let errorMessage: string

    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = 'Location permission denied. Please enable location access in your device settings.'
        break
      case err.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable. Please check your GPS settings.'
        break
      case err.TIMEOUT:
        errorMessage = 'Location request timed out. Please try again.'
        break
      default:
        errorMessage = 'An unknown error occurred while getting location.'
    }

    setError(errorMessage)
    console.error('Geolocation error:', errorMessage)
  }, [])

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      return
    }

    if (watchIdRef.current !== null) {
      // Already tracking
      return
    }

    setIsTracking(true)
    setError(null)

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      handlePositionUpdate,
      handleError,
      {
        enableHighAccuracy,
        timeout: 15000,
        maximumAge: 0,
      }
    )

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handleError,
      {
        enableHighAccuracy,
        timeout: 15000,
        maximumAge: 0,
      }
    )
  }, [enableHighAccuracy, handlePositionUpdate, handleError])

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsTracking(false)
  }, [])

  const getGeoPoint = useCallback((): GeoPoint | null => {
    if (!location) return null
    return new GeoPoint(location.lat, location.lng)
  }, [location])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  return {
    location,
    isTracking,
    error,
    startTracking,
    stopTracking,
    getGeoPoint,
  }
}

// Navigation utility functions
export const NavigationUtils = {
  // Open location in Google Maps
  openInGoogleMaps: (lat: number, lng: number, label?: string) => {
    const url = label
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(label)}`
      : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    window.open(url, '_blank')
  },

  // Open directions in Google Maps
  openDirectionsInGoogleMaps: (
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    travelMode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=${travelMode}`
    window.open(url, '_blank')
  },

  // Open in Waze (mobile only)
  openInWaze: (lat: number, lng: number) => {
    const url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
    window.open(url, '_blank')
  },

  // Open directions in Waze
  openDirectionsInWaze: (destLat: number, destLng: number) => {
    const url = `https://waze.com/ul?ll=${destLat},${destLng}&navigate=yes`
    window.open(url, '_blank')
  },

  // Check if running on mobile
  isMobile: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  },

  // Open native maps app (works best on mobile)
  openNativeMaps: (lat: number, lng: number, label?: string) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isAndroid = /Android/.test(navigator.userAgent)

    if (isIOS) {
      // Apple Maps
      const url = label
        ? `maps://maps.apple.com/?q=${encodeURIComponent(label)}&ll=${lat},${lng}`
        : `maps://maps.apple.com/?ll=${lat},${lng}`
      window.location.href = url
    } else if (isAndroid) {
      // Google Maps app
      const url = `geo:${lat},${lng}?q=${lat},${lng}${label ? `(${encodeURIComponent(label)})` : ''}`
      window.location.href = url
    } else {
      // Fallback to Google Maps web
      NavigationUtils.openInGoogleMaps(lat, lng, label)
    }
  },

  // Open native navigation
  openNativeNavigation: (destLat: number, destLng: number, destLabel?: string) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isAndroid = /Android/.test(navigator.userAgent)

    if (isIOS) {
      // Apple Maps with directions
      const url = `maps://maps.apple.com/?daddr=${destLat},${destLng}&dirflg=d`
      window.location.href = url
    } else if (isAndroid) {
      // Google Maps with navigation
      const url = `google.navigation:q=${destLat},${destLng}`
      window.location.href = url
    } else {
      // Fallback to Google Maps web directions
      navigator.geolocation.getCurrentPosition(
        (position) => {
          NavigationUtils.openDirectionsInGoogleMaps(
            position.coords.latitude,
            position.coords.longitude,
            destLat,
            destLng
          )
        },
        () => {
          // If can't get current location, just open destination
          NavigationUtils.openInGoogleMaps(destLat, destLng, destLabel)
        }
      )
    }
  },
}
