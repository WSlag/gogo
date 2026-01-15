import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Navigation,
  Phone,
  MessageCircle,
  MapPin,
  User,
  Package,
  Car,
  CheckCircle2,
  AlertTriangle,
  Clock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { PesoSign } from '@/components/icons'
import { Button, Card, Modal, Spinner } from '@/components/ui'
import { useDriver, useRealtimeLocation, NavigationUtils } from '@/hooks'
import { MapView } from '@/components/maps'

type DriverRideStatus = 'accepted' | 'arriving' | 'arrived' | 'in_progress' | 'completed'

const STATUS_STEPS: { status: DriverRideStatus; label: string; action: string }[] = [
  { status: 'accepted', label: 'Going to Pickup', action: 'Arriving at Pickup' },
  { status: 'arriving', label: 'Almost There', action: "I've Arrived" },
  { status: 'arrived', label: 'Waiting for Passenger', action: 'Start Ride' },
  { status: 'in_progress', label: 'Ride in Progress', action: 'Complete Ride' },
  { status: 'completed', label: 'Completed', action: '' },
]

export default function DriverActiveRide() {
  const navigate = useNavigate()
  const {
    driver,
    activeRide,
    isLoading,
    updateRideStatus,
    startRide,
    completeRide,
    cancelRide,
    updateLocation,
  } = useDriver()

  const [elapsedTime, setElapsedTime] = useState(0)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showNavOptions, setShowNavOptions] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // Real-time location tracking
  const { location: driverLocation, startTracking, stopTracking, isTracking } = useRealtimeLocation({
    enableHighAccuracy: true,
    updateInterval: 5000, // Update every 5 seconds
    distanceFilter: 10, // Minimum 10 meters movement
    onLocationUpdate: (loc) => {
      // Update driver location in Firestore
      if (activeRide && activeRide.status !== 'completed') {
        updateLocation(loc.lat, loc.lng)
      }
    },
  })

  // Redirect if no active ride (with a small delay to allow state to sync)
  useEffect(() => {
    if (!isLoading && !activeRide) {
      // Small delay to prevent race condition during state updates
      const timeout = setTimeout(() => {
        navigate('/driver')
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [isLoading, activeRide, navigate])

  // Timer for ride duration
  useEffect(() => {
    if (activeRide?.status === 'in_progress') {
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [activeRide?.status])

  // Start/stop location tracking based on active ride
  useEffect(() => {
    if (activeRide && activeRide.status !== 'completed' && !isTracking) {
      startTracking()
    } else if ((!activeRide || activeRide.status === 'completed') && isTracking) {
      stopTracking()
    }

    return () => {
      if (isTracking) {
        stopTracking()
      }
    }
  }, [activeRide?.id, activeRide?.status, isTracking, startTracking, stopTracking])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getCurrentStatusIndex = () => {
    if (!activeRide) return 0
    return STATUS_STEPS.findIndex((s) => s.status === activeRide.status)
  }

  const handleStatusAdvance = async () => {
    if (!activeRide) {
      console.error('handleStatusAdvance: No active ride')
      return
    }

    console.log('handleStatusAdvance called, current status:', activeRide.status)
    setIsUpdating(true)
    try {
      const currentStatus = activeRide.status

      if (currentStatus === 'accepted') {
        // Move to arriving - driver is on their way to pickup
        console.log('Updating to arriving...')
        const result = await updateRideStatus(activeRide.id, 'arriving')
        console.log('Update result:', result)
      } else if (currentStatus === 'arriving') {
        // Move to arrived - driver has arrived at pickup location
        console.log('Updating to arrived...')
        const result = await updateRideStatus(activeRide.id, 'arrived')
        console.log('Update result:', result)
      } else if (currentStatus === 'arrived') {
        // Start the ride - passenger is in the vehicle
        console.log('Starting ride...')
        const result = await startRide(activeRide.id)
        console.log('Start ride result:', result)
      } else if (currentStatus === 'in_progress') {
        // Show complete modal
        console.log('Showing complete modal')
        setShowCompleteModal(true)
      }
    } catch (err) {
      console.error('handleStatusAdvance error:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCompleteRide = async () => {
    if (!activeRide) return

    setIsUpdating(true)
    try {
      const success = await completeRide(activeRide.id)
      if (success) {
        setShowCompleteModal(false)
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelRide = async () => {
    if (!activeRide) return

    setIsUpdating(true)
    try {
      const success = await cancelRide(activeRide.id, cancelReason || 'Driver cancelled')
      if (success) {
        setShowCancelModal(false)
        navigate('/driver')
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCall = () => {
    // In production, fetch passenger phone from users collection
    window.location.href = `tel:+639000000000`
  }

  const handleMessage = () => {
    window.location.href = `sms:+639000000000`
  }

  const handleNavigate = () => {
    setShowNavOptions(true)
  }

  const getNavigationDestination = () => {
    if (!activeRide) return null

    const isGoingToPickup = activeRide.status === 'accepted' || activeRide.status === 'arriving' || activeRide.status === 'arrived'
    const destination = isGoingToPickup ? activeRide.pickup?.coordinates : activeRide.dropoff?.coordinates

    if (!destination) return null

    return {
      lat: destination.latitude,
      lng: destination.longitude,
      label: isGoingToPickup ? 'Pickup Location' : 'Drop-off Location',
    }
  }

  const handleOpenGoogleMaps = () => {
    const dest = getNavigationDestination()
    if (!dest) return
    NavigationUtils.openDirectionsInGoogleMaps(
      driverLocation?.lat || 0,
      driverLocation?.lng || 0,
      dest.lat,
      dest.lng
    )
    setShowNavOptions(false)
  }

  const handleOpenWaze = () => {
    const dest = getNavigationDestination()
    if (!dest) return
    NavigationUtils.openDirectionsInWaze(dest.lat, dest.lng)
    setShowNavOptions(false)
  }

  const handleOpenNativeNav = () => {
    const dest = getNavigationDestination()
    if (!dest) return
    NavigationUtils.openNativeNavigation(dest.lat, dest.lng, dest.label)
    setShowNavOptions(false)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  // No active ride
  if (!activeRide) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Active Ride
          </h2>
          <p className="text-gray-600 mb-4">
            You don't have an active ride at the moment.
          </p>
          <Button onClick={() => navigate('/driver')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  const currentStep = STATUS_STEPS[getCurrentStatusIndex()] || STATUS_STEPS[0]

  // Completed state
  if (activeRide.status === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="text-center max-w-md w-full">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ride Completed!</h2>
          <p className="text-gray-600 mb-4">
            Great job! You've completed the ride successfully.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Fare</span>
              <span className="font-bold text-xl text-green-600">
                ₱{activeRide.fare?.total?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Payment Method</span>
              <span className="capitalize text-gray-700">{activeRide.paymentMethod}</span>
            </div>
            {elapsedTime > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Trip Duration</span>
                <span className="text-gray-700">{formatTime(elapsedTime)}</span>
              </div>
            )}
          </div>

          <Button fullWidth onClick={() => navigate('/driver')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  // Build map markers
  const mapMarkers = []
  if (activeRide.pickup?.coordinates) {
    mapMarkers.push({
      position: {
        lat: activeRide.pickup.coordinates.latitude,
        lng: activeRide.pickup.coordinates.longitude,
      },
      type: 'pickup' as const,
      label: 'Pickup',
    })
  }
  if (activeRide.dropoff?.coordinates) {
    mapMarkers.push({
      position: {
        lat: activeRide.dropoff.coordinates.latitude,
        lng: activeRide.dropoff.coordinates.longitude,
      },
      type: 'dropoff' as const,
      label: 'Dropoff',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Map */}
      <div className="h-64 relative">
        <MapView
          markers={mapMarkers}
          className="h-full w-full"
          zoom={14}
        />

        <button
          onClick={() => setShowCancelModal(true)}
          className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-md z-10"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>

        {/* Navigate Button */}
        <button
          onClick={handleNavigate}
          className="absolute top-4 right-4 bg-primary-600 text-white rounded-xl px-4 py-2 shadow-md flex items-center gap-2 z-10"
        >
          <Navigation className="h-5 w-5" />
          Navigate
        </button>

        {/* Status Badge */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-white rounded-xl shadow-lg p-3 flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${
              activeRide.status === 'in_progress' ? 'bg-green-500 animate-pulse' : 'bg-primary-500'
            }`} />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{currentStep.label}</p>
              {activeRide.status === 'in_progress' && (
                <p className="text-sm text-gray-500">Duration: {formatTime(elapsedTime)}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Fare</p>
              <p className="font-medium text-green-600">
                ₱{activeRide.fare?.total?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Customer Info */}
        <Card>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="h-6 w-6 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Passenger</p>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Car className="h-4 w-4" />
                <span className="capitalize">{activeRide.vehicleType}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleMessage}
                className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <MessageCircle className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={handleCall}
                className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200"
              >
                <Phone className="h-5 w-5 text-green-600" />
              </button>
            </div>
          </div>
        </Card>

        {/* Route Details */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-green-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Pickup</p>
                <p className="font-medium text-gray-900">{activeRide.pickup?.address || 'Unknown'}</p>
              </div>
              {(activeRide.status === 'accepted' || activeRide.status === 'arriving' || activeRide.status === 'arrived') && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Current</span>
              )}
            </div>

            <div className="ml-1.5 h-6 border-l-2 border-dashed border-gray-300" />

            <div className="flex items-start gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-red-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Dropoff</p>
                <p className="font-medium text-gray-900">{activeRide.dropoff?.address || 'Unknown'}</p>
              </div>
              {activeRide.status === 'in_progress' && (
                <span className="text-xs bg-error-light text-error px-2 py-1 rounded">Destination</span>
              )}
            </div>
          </div>
        </Card>

        {/* Trip Info */}
        <Card>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                <MapPin className="h-4 w-4" />
              </div>
              <p className="font-semibold text-gray-900">
                {activeRide.route?.distance
                  ? `${(activeRide.route.distance / 1000).toFixed(1)} km`
                  : 'N/A'}
              </p>
              <p className="text-xs text-gray-500">Distance</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                <Clock className="h-4 w-4" />
              </div>
              <p className="font-semibold text-gray-900">
                {activeRide.route?.duration
                  ? `${Math.round(activeRide.route.duration / 60)} min`
                  : 'N/A'}
              </p>
              <p className="text-xs text-gray-500">Est. Time</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                <PesoSign className="h-4 w-4" />
              </div>
              <p className="font-semibold text-green-600">
                ₱{activeRide.fare?.total?.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-gray-500 capitalize">{activeRide.paymentMethod}</p>
            </div>
          </div>
        </Card>

        {/* Progress Steps */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Trip Progress</h3>
          <div className="space-y-3">
            {STATUS_STEPS.slice(0, -1).map((step, index) => {
              const currentIndex = getCurrentStatusIndex()
              const isCompleted = index < currentIndex
              const isCurrent = index === currentIndex

              return (
                <div key={step.status} className="flex items-center gap-3">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-sm ${
                    isCompleted || isCurrent ? 'text-gray-900 font-medium' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-16 left-0 right-0 lg:bottom-0 lg:left-[240px] bg-white border-t p-4 z-50">
        <Button
          fullWidth
          size="lg"
          onClick={handleStatusAdvance}
          isLoading={isUpdating}
        >
          {currentStep.action}
        </Button>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Ride?"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">This may affect your rating</p>
              <p className="text-sm text-yellow-700 mt-1">
                Frequent cancellations may lower your acceptance rate and affect your standing.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for cancellation
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
            >
              <option value="">Select a reason</option>
              <option value="passenger_not_found">Passenger not found</option>
              <option value="passenger_requested">Passenger requested</option>
              <option value="vehicle_issue">Vehicle issue</option>
              <option value="emergency">Emergency</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowCancelModal(false)}
            >
              Keep Ride
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleCancelRide}
              isLoading={isUpdating}
            >
              Cancel Ride
            </Button>
          </div>
        </div>
      </Modal>

      {/* Complete Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Complete Ride"
      >
        <div className="space-y-4">
          <div className="text-center py-4">
            <p className="text-3xl font-bold text-green-600 mb-2">
              ₱{activeRide.fare?.total?.toFixed(2) || '0.00'}
            </p>
            <p className="text-gray-600">
              Payment: <span className="capitalize font-medium">{activeRide.paymentMethod}</span>
            </p>
          </div>

          {activeRide.paymentMethod === 'cash' && (
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Cash Payment:</span> Please collect ₱{activeRide.fare?.total?.toFixed(2)} from the passenger.
              </p>
            </div>
          )}

          <Button
            fullWidth
            onClick={handleCompleteRide}
            isLoading={isUpdating}
          >
            Confirm & Complete
          </Button>
        </div>
      </Modal>

      {/* Navigation Options Modal */}
      <Modal
        isOpen={showNavOptions}
        onClose={() => setShowNavOptions(false)}
        title="Open Navigation"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            Navigate to: <span className="font-medium">{getNavigationDestination()?.label}</span>
          </p>

          <button
            onClick={handleOpenGoogleMaps}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
          >
            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#4285F4"/>
                <circle cx="12" cy="9" r="2.5" fill="#fff"/>
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900">Google Maps</p>
              <p className="text-sm text-gray-500">Open directions in Google Maps</p>
            </div>
            <ExternalLink className="h-5 w-5 text-gray-400" />
          </button>

          <button
            onClick={handleOpenWaze}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
          >
            <div className="h-12 w-12 rounded-xl bg-sky-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
                <circle cx="12" cy="12" r="10" fill="#33CCFF"/>
                <circle cx="9" cy="10" r="1.5" fill="#000"/>
                <circle cx="15" cy="10" r="1.5" fill="#000"/>
                <path d="M8 14c0 0 2 3 4 3s4-3 4-3" stroke="#000" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900">Waze</p>
              <p className="text-sm text-gray-500">Open directions in Waze</p>
            </div>
            <ExternalLink className="h-5 w-5 text-gray-400" />
          </button>

          {NavigationUtils.isMobile() && (
            <button
              onClick={handleOpenNativeNav}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
            >
              <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <Navigation className="h-7 w-7 text-gray-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900">Default Navigation</p>
                <p className="text-sm text-gray-500">Open in device's default app</p>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </button>
          )}

          <Button
            variant="outline"
            fullWidth
            onClick={() => setShowNavOptions(false)}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  )
}
