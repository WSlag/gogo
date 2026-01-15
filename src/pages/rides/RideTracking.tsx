import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  X,
  Star,
  MapPin,
  Clock,
  AlertCircle,
  Share2,
} from 'lucide-react'
import { Button, Card, Avatar, Spinner, Modal } from '@/components/ui'
import { VehicleIcon } from '@/components/ui/VehicleIcon'
import { MapView } from '@/components/maps'
import { useRide, useRealtimeRide } from '@/hooks'
import type { RideStatus } from '@/types'

const STATUS_CONFIG: Record<RideStatus, { label: string; color: string; description: string }> = {
  pending: { label: 'Finding Driver', color: 'yellow', description: 'Looking for a nearby driver...' },
  scheduled: { label: 'Scheduled', color: 'blue', description: 'Your ride is scheduled' },
  accepted: { label: 'Driver Accepted', color: 'blue', description: 'Your driver is on the way!' },
  arriving: { label: 'Driver Arriving', color: 'blue', description: 'Driver is heading to pickup' },
  arrived: { label: 'Driver Arrived', color: 'green', description: 'Your driver is waiting at pickup' },
  in_progress: { label: 'In Transit', color: 'primary', description: 'Enjoy your ride!' },
  completed: { label: 'Completed', color: 'green', description: 'You have arrived at your destination' },
  cancelled: { label: 'Cancelled', color: 'red', description: 'This ride has been cancelled' },
}

export default function RideTracking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    pickup,
    dropoff,
    vehicleType,
    fare,
    rideStatus,
    isFindingDriver,
    error,
    cancelRide,
    rateRide,
    resetRide,
  } = useRide()

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(null)
  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; text: string; sender: 'user' | 'driver'; timestamp: Date }>>([])

  // Use real-time ride tracking if we have a ride ID - get driver and status from here
  const { driverLocation, estimatedArrival, driver, status: realtimeStatus, ride } = useRealtimeRide(id || '')

  // Call driver function
  const handleCallDriver = () => {
    if (driver?.phone) {
      window.location.href = `tel:${driver.phone}`
    }
  }

  // Send chat message
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return

    const newMessage = {
      id: `msg_${Date.now()}`,
      text: chatMessage.trim(),
      sender: 'user' as const,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, newMessage])
    setChatMessage('')

    // Simulate driver response after a delay (in production, this would be real-time from Firestore)
    setTimeout(() => {
      const responses = [
        "I'm on my way!",
        "I'll be there shortly.",
        "Got it, thank you!",
        "Okay, see you soon!",
      ]
      const driverResponse = {
        id: `msg_${Date.now()}`,
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'driver' as const,
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, driverResponse])
    }, 2000)
  }

  // Current status - prefer real-time status from Firestore over local state
  const currentStatus = realtimeStatus || rideStatus || 'pending'
  const statusConfig = STATUS_CONFIG[currentStatus]

  // Use pickup/dropoff from real-time ride data as fallback
  const effectivePickup = pickup || ride?.pickup
  const effectiveDropoff = dropoff || ride?.dropoff
  const effectiveFare = fare || ride?.fare
  const effectiveVehicleType = vehicleType || ride?.vehicleType

  // Calculate ETA based on driver location
  useEffect(() => {
    const pickupCoords = effectivePickup?.coordinates
    if (driverLocation && pickupCoords && currentStatus !== 'in_progress' && currentStatus !== 'completed') {
      // Simple distance-based ETA calculation (assuming 30 km/h average speed)
      const R = 6371 // Earth's radius in km
      const dLat = ((pickupCoords.latitude - driverLocation.lat) * Math.PI) / 180
      const dLon = ((pickupCoords.longitude - driverLocation.lng) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((driverLocation.lat * Math.PI) / 180) *
          Math.cos((pickupCoords.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c // Distance in km
      const minutes = Math.ceil((distance / 30) * 60) // Time at 30 km/h
      setEstimatedMinutes(Math.max(1, minutes))
    } else if (currentStatus === 'in_progress' && estimatedArrival) {
      setEstimatedMinutes(estimatedArrival)
    }
  }, [driverLocation, effectivePickup, currentStatus, estimatedArrival])

  const [shareMessage, setShareMessage] = useState<string | null>(null)

  // Share trip function
  const handleShareTrip = async () => {
    const shareData = {
      title: 'My GOGO Express Ride',
      text: `I'm on a ride from ${effectivePickup?.address || 'pickup'} to ${effectiveDropoff?.address || 'destination'}. Track my trip!`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // User cancelled or share failed - this is expected behavior
        console.log('Share cancelled or failed')
      }
    } else {
      // Fallback: copy to clipboard with proper error handling
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
        setShareMessage('Trip link copied to clipboard!')
        setTimeout(() => setShareMessage(null), 3000)
      } catch (err) {
        // Clipboard API failed - show user-friendly message
        setShareMessage('Unable to copy link. Please copy the URL manually.')
        setTimeout(() => setShareMessage(null), 3000)
      }
    }
  }

  // Build map markers based on current state
  const mapMarkers = useMemo(() => {
    const markers: Array<{ position: { lat: number; lng: number }; icon: 'pickup' | 'dropoff' | 'driver'; title?: string }> = []

    // pickup from useRide has coordinates as GeoPoint with latitude/longitude
    if (effectivePickup?.coordinates) {
      markers.push({
        position: { lat: effectivePickup.coordinates.latitude, lng: effectivePickup.coordinates.longitude },
        icon: 'pickup',
        title: 'Pickup',
      })
    }

    if (effectiveDropoff?.coordinates) {
      markers.push({
        position: { lat: effectiveDropoff.coordinates.latitude, lng: effectiveDropoff.coordinates.longitude },
        icon: 'dropoff',
        title: 'Dropoff',
      })
    }

    // driverLocation from useRealtimeRide has lat/lng
    if (driverLocation) {
      markers.push({
        position: { lat: driverLocation.lat, lng: driverLocation.lng },
        icon: 'driver',
        title: driver?.firstName || 'Driver',
      })
    }

    return markers
  }, [effectivePickup, effectiveDropoff, driverLocation, driver])

  // Calculate map center
  const mapCenter = useMemo(() => {
    if (driverLocation && currentStatus !== 'pending') {
      return { lat: driverLocation.lat, lng: driverLocation.lng }
    }
    if (effectivePickup?.coordinates) {
      return { lat: effectivePickup.coordinates.latitude, lng: effectivePickup.coordinates.longitude }
    }
    // Default to Cotabato City
    return { lat: 7.2047, lng: 124.2530 }
  }, [effectivePickup, driverLocation, currentStatus])

  // Calculate origin and destination for route display
  const routeOrigin = useMemo(() => {
    if (effectivePickup?.coordinates) {
      return { lat: effectivePickup.coordinates.latitude, lng: effectivePickup.coordinates.longitude }
    }
    return undefined
  }, [effectivePickup])

  const routeDestination = useMemo(() => {
    if (effectiveDropoff?.coordinates) {
      return { lat: effectiveDropoff.coordinates.latitude, lng: effectiveDropoff.coordinates.longitude }
    }
    return undefined
  }, [effectiveDropoff])

  const CANCEL_REASONS = [
    'Changed my mind',
    'Driver is taking too long',
    'Found another ride',
    'Wrong pickup/dropoff location',
    'Emergency',
    'Other',
  ]

  // Show rating modal when ride is completed
  useEffect(() => {
    if (rideStatus === 'completed') {
      setShowRatingModal(true)
    }
  }, [rideStatus])

  const handleCancel = async () => {
    if (!cancelReason) {
      return
    }
    setIsCancelling(true)
    const success = await cancelRide(cancelReason)
    setIsCancelling(false)
    if (success) {
      setShowCancelModal(false)
      navigate('/rides')
    }
  }

  const handleSubmitRating = async () => {
    setIsSubmittingRating(true)
    await rateRide(rating, review)
    setIsSubmittingRating(false)
    setShowRatingModal(false)
    resetRide()
    navigate('/rides')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 lg:top-16 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/rides')}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Ride Status</h1>
          {currentStatus !== 'completed' && currentStatus !== 'cancelled' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="rounded-full p-2 text-red-500 hover:bg-red-50"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Map View */}
      <div className="relative h-64">
        <MapView
          center={mapCenter}
          zoom={15}
          markers={mapMarkers}
          showRoute={!!(routeOrigin && routeDestination)}
          origin={routeOrigin}
          destination={routeDestination}
          className="h-full w-full"
        />

        {/* Status Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className={`rounded-lg bg-white p-3 shadow-lg border ${
            statusConfig.color === 'yellow' ? 'border-yellow-200' :
            statusConfig.color === 'blue' ? 'border-blue-200' :
            statusConfig.color === 'green' ? 'border-green-200' :
            statusConfig.color === 'red' ? 'border-red-200' : 'border-primary-200'
          }`}>
            <div className="flex items-center gap-3">
              {isFindingDriver || currentStatus === 'pending' ? (
                <Spinner size="sm" />
              ) : (
                <div className={`h-3 w-3 rounded-full ${
                  statusConfig.color === 'yellow' ? 'bg-yellow-500' :
                  statusConfig.color === 'blue' ? 'bg-blue-500' :
                  statusConfig.color === 'green' ? 'bg-green-500' :
                  statusConfig.color === 'red' ? 'bg-red-500' : 'bg-primary-500'
                } ${currentStatus === 'in_progress' ? 'animate-pulse' : ''}`} />
              )}
              <div className="flex-1">
                <p className={`font-semibold ${
                  statusConfig.color === 'yellow' ? 'text-yellow-700' :
                  statusConfig.color === 'blue' ? 'text-blue-700' :
                  statusConfig.color === 'green' ? 'text-green-700' :
                  statusConfig.color === 'red' ? 'text-red-700' : 'text-primary-700'
                }`}>
                  {statusConfig.label}
                </p>
                <p className="text-sm text-gray-600">{statusConfig.description}</p>
              </div>
              {/* ETA Display */}
              {estimatedMinutes && currentStatus !== 'pending' && currentStatus !== 'completed' && currentStatus !== 'cancelled' && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">{estimatedMinutes}</p>
                  <p className="text-xs text-gray-500">min</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Share Trip Button */}
        {currentStatus !== 'pending' && currentStatus !== 'completed' && currentStatus !== 'cancelled' && (
          <button
            onClick={handleShareTrip}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md z-10"
            title="Share trip"
          >
            <Share2 className="h-5 w-5 text-gray-600" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Share Message Toast */}
        {shareMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-info-light p-3 text-sm text-info">
            <Share2 className="h-5 w-5 flex-shrink-0" />
            <span>{shareMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-error-light p-3 text-sm text-error">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Driver Card */}
        {driver ? (
          <Card>
            <div className="flex items-center gap-4">
              <Avatar size="lg" name={`${driver.firstName} ${driver.lastName}`} />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {driver.firstName} {driver.lastName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{(driver.rating ?? 0).toFixed(1)}</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">{driver.totalRides ?? 0} rides</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCallDriver}
                  disabled={!driver?.phone}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={driver?.phone ? `Call ${driver.firstName}` : 'Phone not available'}
                >
                  <Phone className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowChatModal(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                  title={`Message ${driver?.firstName || 'driver'}`}
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Vehicle Info */}
            {driver.vehicle && (
              <div className="mt-4 pt-4 border-t flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                  <VehicleIcon type={effectiveVehicleType === 'motorcycle' ? 'motorcycle' : 'car'} size="sm" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {driver.vehicle.color} {driver.vehicle.make} {driver.vehicle.model}
                  </p>
                  <p className="text-lg font-bold text-primary-600">{driver.vehicle.plateNumber}</p>
                </div>
              </div>
            )}
          </Card>
        ) : currentStatus === 'pending' ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-8">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-600">Finding your driver...</p>
              <p className="text-sm text-gray-500 mt-1">This usually takes 1-3 minutes</p>
            </div>
          </Card>
        ) : null}

        {/* Route Info */}
        <Card>
          <div className="space-y-3">
            {/* Pickup */}
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                <div className="h-2 w-2 rounded-full bg-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Pickup</p>
                <p className="font-medium text-gray-900 line-clamp-1">
                  {pickup?.address || 'Loading...'}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="ml-3 border-l-2 border-dashed border-gray-200 h-4" />

            {/* Dropoff */}
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
                <MapPin className="h-3 w-3 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Dropoff</p>
                <p className="font-medium text-gray-900 line-clamp-1">
                  {dropoff?.address || 'Loading...'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Fare Card */}
        {effectiveFare && (
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">Estimated Fare</span>
              </div>
              <span className="text-xl font-bold text-gray-900">₱{effectiveFare.total.toFixed(2)}</span>
            </div>
          </Card>
        )}

        {/* Ride ID */}
        <p className="text-center text-xs text-gray-400">Ride ID: {id}</p>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Ride?"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please select a reason for cancellation.
          </p>

          {/* Cancellation Reasons */}
          <div className="space-y-2">
            {CANCEL_REASONS.map((reason) => (
              <button
                key={reason}
                onClick={() => setCancelReason(reason)}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                  cancelReason === reason
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    cancelReason === reason
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300'
                  }`}
                >
                  {cancelReason === reason && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">{reason}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setShowCancelModal(false)
                setCancelReason('')
              }}
            >
              Keep Ride
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleCancel}
              isLoading={isCancelling}
              disabled={!cancelReason}
            >
              Cancel Ride
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rating Modal */}
      <Modal
        isOpen={showRatingModal}
        onClose={() => {
          // Allow user to skip rating
          setShowRatingModal(false)
          resetRide()
          navigate('/rides')
        }}
        title="Rate Your Ride"
      >
        <div className="space-y-4">
          <div className="text-center">
            {driver && (
              <>
                <Avatar size="xl" name={`${driver.firstName} ${driver.lastName}`} className="mx-auto" />
                <p className="mt-2 font-semibold">{driver.firstName} {driver.lastName}</p>
              </>
            )}
          </div>

          {/* Star Rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= rating
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Review */}
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience (optional)"
            className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            rows={3}
          />

          <div className="space-y-2">
            <Button
              fullWidth
              onClick={handleSubmitRating}
              isLoading={isSubmittingRating}
            >
              Submit Rating
            </Button>
            <button
              onClick={() => {
                setShowRatingModal(false)
                resetRide()
                navigate('/rides')
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
            >
              Skip for now
            </button>
          </div>
        </div>
      </Modal>

      {/* Chat Modal */}
      <Modal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        title={`Chat with ${driver?.firstName || 'Driver'}`}
      >
        <div className="flex flex-col h-80">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageCircle className="h-12 w-12 mb-2" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Send a message to your driver</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      msg.sender === 'user'
                        ? 'bg-primary-600 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-900 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-primary-200' : 'text-gray-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Messages */}
          <div className="flex flex-wrap gap-2 mb-3">
            {['On my way', 'Please wait', 'I\'m here', 'Thank you'].map((quickMsg) => (
              <button
                key={quickMsg}
                onClick={() => setChatMessage(quickMsg)}
                className="px-3 py-1 text-xs rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {quickMsg}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!chatMessage.trim()}
              className="rounded-full px-4"
            >
              Send
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
