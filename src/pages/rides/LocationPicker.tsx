import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ChevronLeft,
  MapPin,
  Star,
  ArrowUpDown,
  Home,
  Briefcase,
  Navigation,
  Search,
  X
} from 'lucide-react'
import { useRideStore } from '@/store'
import { cn } from '@/utils/cn'
import { GeoPoint } from 'firebase/firestore'
import { MapView } from '@/components/maps/MapView'
import { CenterPin } from '@/components/rides/LocationPin'

interface SavedLocation {
  id: string
  label: string
  address: string
  coordinates: GeoPoint
  type?: 'home' | 'work' | 'other'
  isFavorite: boolean
}

// Mock data for recent locations - Cotabato City
const recentLocations: SavedLocation[] = [
  {
    id: '1',
    label: 'KCC Mall of Cotabato',
    address: '66CX+37P, Cotabato City',
    coordinates: new GeoPoint(7.2236, 124.2519),
    isFavorite: false
  },
  {
    id: '2',
    label: 'CityMall Cotabato',
    address: 'Unit 157, Gov. Gutierrez Ave, Cotabato City',
    coordinates: new GeoPoint(7.2197, 124.2486),
    isFavorite: true
  },
  {
    id: '3',
    label: 'Mall of Alnor Cotabato',
    address: 'Sinsuat Ave, Cotabato City',
    coordinates: new GeoPoint(7.2180, 124.2460),
    isFavorite: false
  },
  {
    id: '4',
    label: 'Cotabato State University',
    address: 'Sinsuat Ave, Cotabato City',
    coordinates: new GeoPoint(7.2150, 124.2470),
    isFavorite: false
  },
  {
    id: '5',
    label: 'South Seas Complex',
    address: 'Bagua, Cotabato City',
    coordinates: new GeoPoint(7.2280, 124.2530),
    isFavorite: false
  },
  {
    id: '6',
    label: 'Awang Airport',
    address: 'Awang, Datu Odin Sinsuat',
    coordinates: new GeoPoint(7.1644, 124.2094),
    isFavorite: false
  }
]

// Mock data for favorite locations - Cotabato City
const favoriteLocations: SavedLocation[] = [
  {
    id: 'home',
    label: 'Home',
    address: 'Rosary Heights, Cotabato City',
    coordinates: new GeoPoint(7.2156, 124.2512),
    type: 'home',
    isFavorite: true
  },
  {
    id: 'work',
    label: 'Work',
    address: 'Poblacion VIII, Cotabato City',
    coordinates: new GeoPoint(7.2180, 124.2450),
    type: 'work',
    isFavorite: true
  }
]

export default function LocationPicker() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const locationType = searchParams.get('type') as 'pickup' | 'dropoff' | null

  const { pickup, dropoff, setPickup, setDropoff } = useRideStore()

  const [activeTab, setActiveTab] = useState<'map' | 'recent' | 'favorites'>('map')
  const [searchQuery, setSearchQuery] = useState('')
  const [pickupQuery, setPickupQuery] = useState(pickup?.address || '')
  const [dropoffQuery, setDropoffQuery] = useState(dropoff?.address || '')
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(recentLocations.filter((l) => l.isFavorite).map((l) => l.id))
  )
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 7.2236, lng: 124.2464 })
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false)

  // Sync query states with store values
  useEffect(() => {
    if (pickup?.address && !pickupQuery) {
      setPickupQuery(pickup.address)
    }
  }, [pickup?.address])

  useEffect(() => {
    if (dropoff?.address && !dropoffQuery) {
      setDropoffQuery(dropoff.address)
    }
  }, [dropoff?.address])

  const handleSelectLocation = (location: SavedLocation) => {
    const locationInfo = {
      address: location.address,
      coordinates: location.coordinates,
      details: location.label
    }

    if (locationType === 'pickup') {
      setPickup(locationInfo)
      setPickupQuery(location.address)
    } else if (locationType === 'dropoff') {
      setDropoff(locationInfo)
      setDropoffQuery(location.address)
    }

    navigate(-1)
  }

  const handleSwapLocations = () => {
    if (pickup && dropoff) {
      const tempPickup = pickup
      setPickup(dropoff)
      setDropoff(tempPickup)
    }
  }

  const handleUseCurrentLocation = () => {
    // Mock current location (would use Geolocation API) - Cotabato City
    const currentLocation = {
      address: 'Your Current Location',
      coordinates: new GeoPoint(7.2236, 124.2464),
      details: 'Current Location'
    }

    if (locationType === 'pickup') {
      setPickup(currentLocation)
    } else if (locationType === 'dropoff') {
      setDropoff(currentLocation)
    }

    navigate(-1)
  }

  // Reverse geocode to get address from coordinates
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    if (typeof google === 'undefined' || !google.maps) {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }

    try {
      const geocoder = new google.maps.Geocoder()
      const response = await geocoder.geocode({ location: { lat, lng } })

      if (response.results && response.results.length > 0) {
        // Return the most detailed address (first result)
        return response.results[0].formatted_address
      }
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }, [])

  // Forward geocode to get coordinates from address
  const forwardGeocode = useCallback(async (address: string): Promise<{ lat: number; lng: number } | null> => {
    if (typeof google === 'undefined' || !google.maps) {
      return null
    }

    try {
      const geocoder = new google.maps.Geocoder()
      // Bias results toward Cotabato City area
      const response = await geocoder.geocode({
        address: address,
        region: 'PH',
        bounds: new google.maps.LatLngBounds(
          { lat: 7.1, lng: 124.1 }, // SW corner
          { lat: 7.4, lng: 124.4 }  // NE corner
        )
      })

      if (response.results && response.results.length > 0) {
        const location = response.results[0].geometry.location
        return { lat: location.lat(), lng: location.lng() }
      }
      return null
    } catch (error) {
      console.error('Forward geocoding failed:', error)
      return null
    }
  }, [])

  // Handle map center change
  const handleMapCenterChanged = useCallback((center: { lat: number; lng: number }) => {
    setMapCenter(center)
  }, [])

  // Handle using typed address with geocoding
  const handleUseTypedAddress = useCallback(async (address: string) => {
    setIsReverseGeocoding(true)

    try {
      // Try to geocode the typed address
      const coords = await forwardGeocode(address)

      const locationInfo = {
        address: address,
        // Use geocoded coordinates if available, otherwise use current map center
        coordinates: coords
          ? new GeoPoint(coords.lat, coords.lng)
          : new GeoPoint(mapCenter.lat, mapCenter.lng),
        details: address
      }

      if (locationType === 'pickup') {
        setPickup(locationInfo)
      } else if (locationType === 'dropoff') {
        setDropoff(locationInfo)
      }

      navigate(-1)
    } finally {
      setIsReverseGeocoding(false)
    }
  }, [forwardGeocode, locationType, mapCenter, navigate, setPickup, setDropoff])

  const handleConfirmMapLocation = async () => {
    setIsReverseGeocoding(true)

    try {
      // Get address from map center coordinates using reverse geocoding
      const address = await reverseGeocode(mapCenter.lat, mapCenter.lng)

      const mapLocation = {
        address: address,
        coordinates: new GeoPoint(mapCenter.lat, mapCenter.lng),
        details: 'Map Selection'
      }

      if (locationType === 'pickup') {
        setPickup(mapLocation)
      } else if (locationType === 'dropoff') {
        setDropoff(mapLocation)
      }

      navigate(-1)
    } finally {
      setIsReverseGeocoding(false)
    }
  }

  const toggleFavorite = (e: React.MouseEvent, locationId: string) => {
    e.stopPropagation()
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(locationId)) {
        next.delete(locationId)
      } else {
        next.add(locationId)
      }
      return next
    })
  }

  // Use the active query (pickup or dropoff) for filtering
  const activeQuery = locationType === 'pickup' ? pickupQuery : dropoffQuery

  const filteredLocations =
    activeTab === 'favorites'
      ? favoriteLocations.filter((l) =>
          activeQuery
            ? l.label.toLowerCase().includes(activeQuery.toLowerCase()) ||
              l.address.toLowerCase().includes(activeQuery.toLowerCase())
            : true
        )
      : recentLocations.filter((l) =>
          activeQuery || searchQuery
            ? l.label.toLowerCase().includes((activeQuery || searchQuery).toLowerCase()) ||
              l.address.toLowerCase().includes((activeQuery || searchQuery).toLowerCase())
            : true
        )

  const getLocationIcon = (location: SavedLocation) => {
    if (location.type === 'home') {
      return <Home className="h-5 w-5 text-blue-600" />
    }
    if (location.type === 'work') {
      return <Briefcase className="h-5 w-5 text-purple-600" />
    }
    return <MapPin className="h-5 w-5 text-gray-400" />
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 lg:top-16">
        <div className="px-4 py-3 lg:px-8 lg:py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="h-6 w-6 text-gray-900" />
            </button>
            <h1 className="text-lg lg:text-xl font-semibold text-gray-900">
              {locationType === 'pickup' ? 'Select Pickup' : 'Select Drop-off'}
            </h1>
          </div>
        </div>
      </header>

      {/* Location Inputs */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 lg:px-8">
        <div className="max-w-3xl mx-auto relative">
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-2">
              {/* Pickup Input */}
              <div
                onClick={() =>
                  navigate('/rides/location?type=pickup', { replace: true })
                }
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all cursor-pointer',
                  locationType === 'pickup'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:bg-gray-50'
                )}
              >
                <div className="flex h-6 w-6 items-center justify-center">
                  <div
                    className={cn(
                      'h-3 w-3 rounded-full',
                      locationType === 'pickup' ? 'bg-primary-500' : 'bg-green-500'
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Pickup</p>
                  {locationType === 'pickup' ? (
                    <input
                      type="text"
                      value={pickupQuery}
                      onChange={(e) => setPickupQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Set pickup location"
                      autoFocus
                      className="w-full text-sm font-medium text-gray-900 placeholder-gray-400 bg-transparent outline-none"
                    />
                  ) : (
                    <p
                      className={cn(
                        'text-sm font-medium truncate',
                        pickup ? 'text-gray-900' : 'text-gray-400'
                      )}
                    >
                      {pickup?.address || 'Set pickup location'}
                    </p>
                  )}
                </div>
              </div>

              {/* Dropoff Input */}
              <div
                onClick={() =>
                  navigate('/rides/location?type=dropoff', { replace: true })
                }
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all cursor-pointer',
                  locationType === 'dropoff'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:bg-gray-50'
                )}
              >
                <div className="flex h-6 w-6 items-center justify-center">
                  <MapPin
                    className={cn(
                      'h-5 w-5',
                      locationType === 'dropoff'
                        ? 'text-primary-500'
                        : 'text-red-500'
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Drop-off</p>
                  {locationType === 'dropoff' ? (
                    <input
                      type="text"
                      value={dropoffQuery}
                      onChange={(e) => setDropoffQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Where to?"
                      autoFocus
                      className="w-full text-sm font-medium text-gray-900 placeholder-gray-400 bg-transparent outline-none"
                    />
                  ) : (
                    <p
                      className={cn(
                        'text-sm font-medium truncate',
                        dropoff ? 'text-gray-900' : 'text-gray-400'
                      )}
                    >
                      {dropoff?.address || 'Where to?'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <button
              onClick={handleSwapLocations}
              disabled={!pickup || !dropoff}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full transition-all',
                pickup && dropoff
                  ? 'bg-gray-100 hover:bg-gray-200 active:scale-95'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              )}
            >
              <ArrowUpDown className="h-5 w-5" />
            </button>
          </div>

          {/* Search Results Dropdown */}
          {activeQuery && activeQuery.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
              {/* Use typed address option */}
              <button
                onClick={() => handleUseTypedAddress(activeQuery)}
                disabled={isReverseGeocoding}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 disabled:opacity-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                  <Search className="h-4 w-4 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary-600">
                    {isReverseGeocoding ? 'Searching...' : `Search "${activeQuery}"`}
                  </p>
                </div>
              </button>

              {/* Filtered locations */}
              {filteredLocations.slice(0, 5).map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleSelectLocation(location)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                    {getLocationIcon(location)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{location.label}</p>
                    <p className="text-xs text-gray-500 truncate">{location.address}</p>
                  </div>
                </button>
              ))}

              {filteredLocations.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No matching locations found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-4 lg:px-8">
        <div className="max-w-3xl mx-auto flex">
          {(['map', 'recent', 'favorites'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-3 text-sm font-medium transition-all border-b-2',
                activeTab === tab
                  ? 'text-gray-900 border-gray-900'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              )}
            >
              {tab === 'map' ? 'Map' : tab === 'recent' ? 'Recent' : 'Saved'}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'map' ? (
          /* Map View */
          <div className="flex-1 flex flex-col">
            {/* Map Container */}
            <div className="relative flex-1 min-h-[400px] h-[50vh]">
              <MapView
                center={
                  pickup?.coordinates
                    ? { lat: pickup.coordinates.latitude, lng: pickup.coordinates.longitude }
                    : { lat: 7.2236, lng: 124.2464 }
                }
                className="h-full w-full"
                showCurrentLocation
                interactive
                onCenterChanged={handleMapCenterChanged}
              />

              {/* Center Pin */}
              <CenterPin type={locationType === 'pickup' ? 'pickup' : 'dropoff'} />

              {/* Use Current Location Button */}
              <button
                onClick={handleUseCurrentLocation}
                className="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white shadow-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
              >
                <Navigation className="h-4 w-4 text-primary-600" />
                Use Current Location
              </button>
            </div>

            {/* Confirm Button */}
            <div className="p-4 bg-white border-t border-gray-100">
              <button
                onClick={handleConfirmMapLocation}
                disabled={isReverseGeocoding}
                className="w-full h-12 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReverseGeocoding ? 'Getting Address...' : 'Confirm Location'}
              </button>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="flex-1 flex flex-col">
            {/* Search Bar (only for recent tab) */}
            {activeTab === 'recent' && (
              <div className="px-4 py-3 bg-white border-b border-gray-100">
                <div className="max-w-3xl mx-auto relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search locations..."
                    className="h-11 w-full rounded-full bg-gray-100 pl-12 pr-10 text-sm text-gray-900 placeholder-gray-500 outline-none focus:bg-white focus:ring-2 focus:ring-primary-100 border border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Location List */}
            <div className="flex-1 overflow-y-auto px-4 lg:px-8">
              <div className="max-w-3xl mx-auto divide-y divide-gray-100">
                {/* Use Current Location - Quick Action */}
                <button
                  onClick={handleUseCurrentLocation}
                  className="flex w-full items-center gap-4 py-4 text-left hover:bg-gray-50 -mx-4 px-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                    <Navigation className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-primary-600">
                      Use Current Location
                    </p>
                    <p className="text-sm text-gray-500">
                      Allow location access
                    </p>
                  </div>
                </button>

                {/* Location Items */}
                {filteredLocations.map((location) => (
                  <div
                    key={location.id}
                    className="flex w-full items-center gap-4 py-4 text-left transition-colors hover:bg-gray-50 -mx-4 px-4"
                  >
                    <button
                      onClick={() => handleSelectLocation(location)}
                      className="flex flex-1 items-center gap-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        {getLocationIcon(location)}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-medium text-gray-900">
                          {location.label}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {location.address}
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={(e) => toggleFavorite(e, location.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Star
                        className={cn(
                          'h-5 w-5 transition-colors',
                          favorites.has(location.id) || location.isFavorite
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        )}
                      />
                    </button>
                  </div>
                ))}

                {filteredLocations.length === 0 && (
                  <div className="py-12 text-center">
                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {searchQuery
                        ? 'No matching locations found'
                        : `No ${activeTab} locations`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
