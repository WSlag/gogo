/// <reference types="@types/google.maps" />
import { useState, useCallback, useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'
import { GeoPoint } from '@/services/firebase/firestore'

interface LocationResult {
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  placeId?: string
}

interface DirectionsResult {
  distance: number // in meters
  duration: number // in seconds
  polyline: string
  steps: {
    instruction: string
    distance: number
    duration: number
  }[]
}

interface UseLocationReturn {
  currentLocation: GeoPoint | null
  locationPermission: 'granted' | 'denied' | 'prompt' | null
  isLocationLoading: boolean
  error: string | null
  getCurrentLocation: () => Promise<LocationResult | null>
  requestLocationPermission: () => Promise<boolean>
  searchPlaces: (query: string) => Promise<LocationResult[]>
  getPlaceDetails: (placeId: string) => Promise<LocationResult | null>
  reverseGeocode: (lat: number, lng: number) => Promise<string>
  calculateDistance: (origin: LocationResult, destination: LocationResult) => Promise<number>
  getDirections: (origin: LocationResult, destination: LocationResult) => Promise<DirectionsResult | null>
}

export function useLocation(): UseLocationReturn {
  const {
    currentLocation,
    locationPermission,
    isLocationLoading,
    setCurrentLocation,
    setLocationPermission,
    setLocationLoading,
  } = useUIStore()

  const [error, setError] = useState<string | null>(null)
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null)
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null)
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null)
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null)

  // Initialize Google Maps services when available
  useEffect(() => {
    let mapDiv: HTMLDivElement | null = null
    let intervalId: ReturnType<typeof setInterval> | null = null

    const initServices = () => {
      if (window.google?.maps?.places) {
        // Create a hidden div for the map (required by PlacesService)
        mapDiv = document.createElement('div')
        mapDiv.style.display = 'none'
        document.body.appendChild(mapDiv)

        const map = new google.maps.Map(mapDiv)
        setPlacesService(new google.maps.places.PlacesService(map))
        setAutocompleteService(new google.maps.places.AutocompleteService())
        setDirectionsService(new google.maps.DirectionsService())
        setGeocoder(new google.maps.Geocoder())
      }
    }

    // Check if already loaded
    if (window.google?.maps) {
      initServices()
    } else {
      // Wait for Google Maps to load
      intervalId = setInterval(() => {
        if (window.google?.maps) {
          initServices()
          if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
          }
        }
      }, 100)
    }

    // Cleanup: remove hidden div and clear interval
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
      if (mapDiv && mapDiv.parentNode) {
        mapDiv.parentNode.removeChild(mapDiv)
      }
    }
  }, [])

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' })
      setLocationPermission(result.state as 'granted' | 'denied' | 'prompt')

      result.addEventListener('change', () => {
        setLocationPermission(result.state as 'granted' | 'denied' | 'prompt')
      })

      return result.state === 'granted'
    } catch (err) {
      console.error('Permission query error:', err)
      return false
    }
  }, [setLocationPermission])

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    if (!geocoder) {
      // Fallback if geocoder not ready
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }

    return new Promise((resolve) => {
      geocoder.geocode(
        { location: { lat, lng } },
        (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
          if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
            resolve(results[0].formatted_address)
          } else {
            resolve(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
          }
        }
      )
    })
  }, [geocoder])

  const getCurrentLocation = useCallback(async (): Promise<LocationResult | null> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return null
    }

    setLocationLoading(true)
    setError(null)

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation(new GeoPoint(latitude, longitude))
          setLocationPermission('granted')

          // Reverse geocode to get address
          const address = await reverseGeocode(latitude, longitude)

          setLocationLoading(false)
          resolve({
            address,
            coordinates: { lat: latitude, lng: longitude },
          })
        },
        (err) => {
          setLocationLoading(false)
          switch (err.code) {
            case err.PERMISSION_DENIED:
              setError('Location permission denied')
              setLocationPermission('denied')
              break
            case err.POSITION_UNAVAILABLE:
              setError('Location information unavailable')
              break
            case err.TIMEOUT:
              setError('Location request timed out')
              break
            default:
              setError('An unknown error occurred')
          }
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
        }
      )
    })
  }, [setCurrentLocation, setLocationPermission, setLocationLoading, reverseGeocode])

  const searchPlaces = useCallback(async (query: string): Promise<LocationResult[]> => {
    if (!autocompleteService || !query.trim()) {
      return []
    }

    return new Promise((resolve) => {
      autocompleteService.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'ph' }, // Philippines only
          types: ['geocode', 'establishment'],
        },
        (predictions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
            resolve([])
            return
          }

          const results: LocationResult[] = predictions.map((prediction) => ({
            address: prediction.description,
            coordinates: { lat: 0, lng: 0 }, // Will be populated when selected
            placeId: prediction.place_id,
          }))

          resolve(results)
        }
      )
    })
  }, [autocompleteService])

  const getPlaceDetails = useCallback(async (placeId: string): Promise<LocationResult | null> => {
    if (!placesService) {
      return null
    }

    return new Promise((resolve) => {
      placesService.getDetails(
        {
          placeId,
          fields: ['formatted_address', 'geometry', 'name'],
        },
        (place: google.maps.places.PlaceResult | null, status: google.maps.places.PlacesServiceStatus) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !place?.geometry?.location) {
            resolve(null)
            return
          }

          resolve({
            address: place.formatted_address || place.name || '',
            coordinates: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            },
            placeId,
          })
        }
      )
    })
  }, [placesService])

  const calculateDistance = useCallback(async (
    origin: LocationResult,
    destination: LocationResult
  ): Promise<number> => {
    // Haversine formula for straight-line distance
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (origin.coordinates.lat * Math.PI) / 180
    const φ2 = (destination.coordinates.lat * Math.PI) / 180
    const Δφ = ((destination.coordinates.lat - origin.coordinates.lat) * Math.PI) / 180
    const Δλ = ((destination.coordinates.lng - origin.coordinates.lng) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
  }, [])

  const getDirections = useCallback(async (
    origin: LocationResult,
    destination: LocationResult
  ): Promise<DirectionsResult | null> => {
    if (!directionsService) {
      // Fallback with estimated values
      const distance = await calculateDistance(origin, destination)
      return {
        distance,
        duration: Math.round(distance / 8.33), // Assume ~30 km/h average
        polyline: '',
        steps: [],
      }
    }

    return new Promise((resolve) => {
      directionsService.route(
        {
          origin: origin.coordinates,
          destination: destination.coordinates,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
          if (status !== google.maps.DirectionsStatus.OK || !result?.routes?.[0]?.legs?.[0]) {
            resolve(null)
            return
          }

          const leg = result.routes[0].legs[0]
          const route = result.routes[0]

          resolve({
            distance: leg.distance?.value || 0,
            duration: leg.duration?.value || 0,
            polyline: route.overview_polyline || '',
            steps: leg.steps?.map((step) => ({
              instruction: step.instructions || '',
              distance: step.distance?.value || 0,
              duration: step.duration?.value || 0,
            })) || [],
          })
        }
      )
    })
  }, [directionsService, calculateDistance])

  return {
    currentLocation,
    locationPermission,
    isLocationLoading,
    error,
    getCurrentLocation,
    requestLocationPermission,
    searchPlaces,
    getPlaceDetails,
    reverseGeocode,
    calculateDistance,
    getDirections,
  }
}
