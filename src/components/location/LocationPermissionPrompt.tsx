import { useState, useEffect } from 'react'
import { MapPin, Navigation, X } from 'lucide-react'
import { Button, Modal } from '@/components/ui'
import { useLocation } from '@/hooks'
import { useUIStore } from '@/store/uiStore'

interface LocationPermissionPromptProps {
  onLocationGranted?: (location: { lat: number; lng: number; address: string }) => void
  onDismiss?: () => void
}

export function LocationPermissionPrompt({
  onLocationGranted,
  onDismiss,
}: LocationPermissionPromptProps) {
  const { getCurrentLocation, requestLocationPermission, isLocationLoading, error } = useLocation()
  const { locationPermission, setLocationPermission } = useUIStore()
  const [showPrompt, setShowPrompt] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)

  // Check permission status on mount
  useEffect(() => {
    const checkPermission = async () => {
      if (hasChecked) return
      setHasChecked(true)

      // Check if we already have permission
      if (locationPermission === 'granted') {
        // Silently get location
        const location = await getCurrentLocation()
        if (location && onLocationGranted) {
          onLocationGranted({
            lat: location.coordinates.lat,
            lng: location.coordinates.lng,
            address: location.address,
          })
        }
        return
      }

      // Check current browser permission
      const hasPermission = await requestLocationPermission()

      if (hasPermission) {
        const location = await getCurrentLocation()
        if (location && onLocationGranted) {
          onLocationGranted({
            lat: location.coordinates.lat,
            lng: location.coordinates.lng,
            address: location.address,
          })
        }
      } else if (locationPermission !== 'denied') {
        // Show prompt for first-time users
        setShowPrompt(true)
      }
    }

    checkPermission()
  }, [hasChecked, locationPermission, requestLocationPermission, getCurrentLocation, onLocationGranted])

  const handleEnableLocation = async () => {
    const location = await getCurrentLocation()

    if (location) {
      setShowPrompt(false)
      if (onLocationGranted) {
        onLocationGranted({
          lat: location.coordinates.lat,
          lng: location.coordinates.lng,
          address: location.address,
        })
      }
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    if (onDismiss) {
      onDismiss()
    }
  }

  if (!showPrompt) return null

  return (
    <Modal isOpen={showPrompt} onClose={handleDismiss} title="">
      <div className="text-center py-4">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
          <Navigation className="h-8 w-8 text-primary-600" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Enable Location Services
        </h2>

        <p className="text-gray-600 mb-6">
          Allow GOGO to access your location for a better experience. We'll use it to:
        </p>

        <div className="space-y-3 text-left mb-6">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <MapPin className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-gray-700">Find nearby restaurants and stores</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <Navigation className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-gray-700">Set your pickup location automatically</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
              <MapPin className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-gray-700">Get accurate delivery estimates</span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        <div className="space-y-3">
          <Button
            fullWidth
            size="lg"
            onClick={handleEnableLocation}
            isLoading={isLocationLoading}
          >
            Enable Location
          </Button>
          <Button
            fullWidth
            size="lg"
            variant="outline"
            onClick={handleDismiss}
          >
            Not Now
          </Button>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          You can change this anytime in your browser settings
        </p>
      </div>
    </Modal>
  )
}

// Inline banner version for less intrusive prompts
export function LocationBanner({
  onEnableClick,
  onDismiss,
}: {
  onEnableClick: () => void
  onDismiss: () => void
}) {
  return (
    <div className="bg-primary-50 rounded-lg p-4 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
        <Navigation className="h-5 w-5 text-primary-600" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900 text-sm">Enable location</p>
        <p className="text-xs text-gray-500">For better pickup suggestions</p>
      </div>
      <button
        onClick={onEnableClick}
        className="text-sm font-medium text-primary-600"
      >
        Enable
      </button>
      <button
        onClick={onDismiss}
        className="p-1 text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
