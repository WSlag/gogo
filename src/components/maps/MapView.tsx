import { useEffect, useRef, useState, useCallback } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

interface MarkerConfig {
  position: { lat: number; lng: number }
  title?: string
  icon?: 'pickup' | 'dropoff' | 'driver' | 'restaurant' | 'custom'
  customIcon?: string
  label?: string
}

interface MapViewProps {
  center?: { lat: number; lng: number }
  zoom?: number
  markers?: MarkerConfig[]
  polyline?: string // Encoded polyline
  showRoute?: boolean
  origin?: { lat: number; lng: number }
  destination?: { lat: number; lng: number }
  onMapClick?: (lat: number, lng: number) => void
  onMarkerClick?: (index: number) => void
  onMapReady?: (map: google.maps.Map) => void
  onCenterChanged?: (center: { lat: number; lng: number }) => void
  className?: string
  interactive?: boolean
  showCurrentLocation?: boolean
}

// Default center (Cotabato City, Philippines)
const DEFAULT_CENTER = { lat: 7.2047, lng: 124.2310 }
const DEFAULT_ZOOM = 15

// Icon configurations
const MARKER_ICONS: Record<string, { url: string; scaledSize: { width: number; height: number } }> = {
  pickup: {
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2">
        <circle cx="12" cy="12" r="10" fill="#dcfce7"/>
        <circle cx="12" cy="12" r="4" fill="#16a34a"/>
      </svg>
    `),
    scaledSize: { width: 32, height: 32 },
  },
  dropoff: {
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#dc2626"/>
        <circle cx="12" cy="10" r="3" fill="white"/>
      </svg>
    `),
    scaledSize: { width: 32, height: 32 },
  },
  driver: {
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="12" fill="#FF6B35"/>
        <path d="M7 14l5-8 5 8H7z" fill="white"/>
      </svg>
    `),
    scaledSize: { width: 40, height: 40 },
  },
  restaurant: {
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#f97316"/>
        <path d="M11 9H13V15H11zM8 9H10V13H8zM14 9H16V13H14z" fill="white"/>
      </svg>
    `),
    scaledSize: { width: 32, height: 32 },
  },
  custom: {
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#6366f1"/>
        <circle cx="12" cy="12" r="4" fill="white"/>
      </svg>
    `),
    scaledSize: { width: 32, height: 32 },
  },
}

export function MapView({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  markers = [],
  polyline,
  showRoute,
  origin,
  destination,
  onMapClick,
  onMarkerClick,
  onMapReady,
  onCenterChanged,
  className = 'w-full h-64',
  interactive = true,
  showCurrentLocation = false,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const mapMarkersRef = useRef<google.maps.Marker[]>([])
  const [routeRenderer, setRouteRenderer] = useState<google.maps.DirectionsRenderer | null>(null)
  const [polylineOverlay, setPolylineOverlay] = useState<google.maps.Polyline | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize Google Maps
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      setError('Google Maps API key is not configured')
      return
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    })

    loader
      .load()
      .then(() => {
        console.log('Google Maps API loaded successfully')
        setIsLoaded(true)
      })
      .catch((err) => {
        console.error('Failed to load Google Maps:', err)
        setError(`Failed to load Google Maps: ${err.message || err}`)
      })
  }, [])

  // Create map instance
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return

    console.log('Creating map instance with center:', center, 'container size:', mapRef.current.offsetWidth, 'x', mapRef.current.offsetHeight)

    const mapInstance = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      disableDefaultUI: !interactive,
      gestureHandling: interactive ? 'greedy' : 'none',
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    })

    console.log('Map instance created:', mapInstance)

    // Click handler
    if (onMapClick) {
      mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          onMapClick(e.latLng.lat(), e.latLng.lng())
        }
      })
    }

    // Center changed handler (for dragging the map)
    // Only call onCenterChanged when user drags the map, not on every idle
    if (onCenterChanged) {
      let lastCenter = { lat: center.lat, lng: center.lng }
      mapInstance.addListener('dragend', () => {
        const newCenter = mapInstance.getCenter()
        if (newCenter) {
          const newLat = newCenter.lat()
          const newLng = newCenter.lng()
          // Only update if center actually changed significantly
          if (Math.abs(newLat - lastCenter.lat) > 0.0001 || Math.abs(newLng - lastCenter.lng) > 0.0001) {
            lastCenter = { lat: newLat, lng: newLng }
            onCenterChanged({ lat: newLat, lng: newLng })
          }
        }
      })
    }

    setMap(mapInstance)

    // Trigger resize after map is created to ensure tiles load
    setTimeout(() => {
      google.maps.event.trigger(mapInstance, 'resize')
      mapInstance.setCenter(center)
    }, 100)

    // Notify when map is ready
    if (onMapReady) {
      onMapReady(mapInstance)
    }

    // Show current location
    if (showCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          mapInstance.setCenter(currentPos)

          new google.maps.Marker({
            position: currentPos,
            map: mapInstance,
            title: 'Your Location',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 2,
            },
          })
        },
        (error) => {
          console.error('Geolocation error:', error)
        }
      )
    }
  }, [isLoaded])

  // Update center when prop changes - use lat/lng values, not object reference
  useEffect(() => {
    if (map && center) {
      const currentCenter = map.getCenter()
      if (currentCenter) {
        const currentLat = currentCenter.lat()
        const currentLng = currentCenter.lng()
        // Only update if significantly different to avoid loops
        if (Math.abs(currentLat - center.lat) > 0.0001 || Math.abs(currentLng - center.lng) > 0.0001) {
          map.setCenter(center)
        }
      }
    }
  }, [map, center.lat, center.lng])

  // Handle markers
  useEffect(() => {
    if (!map) return

    // Clear existing markers
    mapMarkersRef.current.forEach((marker: google.maps.Marker) => marker.setMap(null))

    // Create new markers
    const newMarkers = markers.map((config, index) => {
      const iconConfig = config.icon && MARKER_ICONS[config.icon]

      const marker = new google.maps.Marker({
        position: config.position,
        map,
        title: config.title,
        label: config.label,
        icon: iconConfig
          ? {
              url: iconConfig.url,
              scaledSize: new google.maps.Size(
                iconConfig.scaledSize.width,
                iconConfig.scaledSize.height
              ),
            }
          : undefined,
      })

      if (onMarkerClick) {
        marker.addListener('click', () => {
          onMarkerClick(index)
        })
      }

      return marker
    })

    mapMarkersRef.current = newMarkers

    // Fit bounds to show all markers
    if (newMarkers.length > 1) {
      const bounds = new google.maps.LatLngBounds()
      newMarkers.forEach((marker) => {
        const pos = marker.getPosition()
        if (pos) bounds.extend(pos)
      })
      map.fitBounds(bounds, 50)
    }

    return () => {
      newMarkers.forEach((marker) => marker.setMap(null))
    }
  }, [map, markers, onMarkerClick])

  // Handle polyline
  useEffect(() => {
    if (!map) return

    // Clear existing polyline
    if (polylineOverlay) {
      polylineOverlay.setMap(null)
    }

    if (polyline) {
      const path = google.maps.geometry.encoding.decodePath(polyline)
      const newPolyline = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#FF6B35',
        strokeOpacity: 1.0,
        strokeWeight: 4,
      })
      newPolyline.setMap(map)
      setPolylineOverlay(newPolyline)
    }

    return () => {
      if (polylineOverlay) {
        polylineOverlay.setMap(null)
      }
    }
  }, [map, polyline])

  // Handle route display
  useEffect(() => {
    if (!map || !showRoute || !origin || !destination) return

    // Clear existing route
    if (routeRenderer) {
      routeRenderer.setMap(null)
    }

    const directionsService = new google.maps.DirectionsService()
    const newRenderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#FF6B35',
        strokeWeight: 5,
      },
    })

    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          newRenderer.setDirections(result)
        }
      }
    )

    setRouteRenderer(newRenderer)

    return () => {
      newRenderer.setMap(null)
    }
  }, [map, showRoute, origin, destination])

  // Error state
  if (error) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <div className="text-center text-gray-500">
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <div className="text-center text-gray-500">
          <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    )
  }

  return <div ref={mapRef} className={className} style={{ minHeight: '400px' }} />
}

export default MapView
