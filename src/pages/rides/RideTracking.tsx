import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  X,
  Star,
  MapPin,
  Navigation,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { Button, Card, Avatar, Spinner, Modal } from '@/components/ui'
import { VehicleIcon } from '@/components/ui/VehicleIcon'
import { useRide } from '@/hooks'
import type { RideStatus } from '@/types'

const STATUS_CONFIG: Record<RideStatus, { label: string; color: string; description: string }> = {
  pending: { label: 'Finding Driver', color: 'yellow', description: 'Looking for a nearby driver...' },
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
    driver,
    isFindingDriver,
    error,
    cancelRide,
    rateRide,
    resetRide,
  } = useRide()

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)

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

  const currentStatus = rideStatus || 'pending'
  const statusConfig = STATUS_CONFIG[currentStatus]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
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

      {/* Map Placeholder */}
      <div className="relative h-64 bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Map view</p>
          </div>
        </div>

        {/* Status Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className={`rounded-lg bg-${statusConfig.color}-50 p-3 shadow-lg`}>
            <div className="flex items-center gap-3">
              {isFindingDriver || currentStatus === 'pending' ? (
                <Spinner size="sm" />
              ) : (
                <div className={`h-3 w-3 rounded-full bg-${statusConfig.color}-500`} />
              )}
              <div>
                <p className={`font-semibold text-${statusConfig.color}-700`}>
                  {statusConfig.label}
                </p>
                <p className="text-sm text-gray-600">{statusConfig.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
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
                    <span className="text-sm font-medium">{driver.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">{driver.totalRides} rides</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                  <MessageCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Vehicle Info */}
            {driver.vehicle && (
              <div className="mt-4 pt-4 border-t flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                  <VehicleIcon type={vehicleType === 'motorcycle' ? 'motorcycle' : 'car'} size="sm" />
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
        {fare && (
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">Estimated Fare</span>
              </div>
              <span className="text-xl font-bold text-gray-900">₱{fare.total.toFixed(2)}</span>
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
            Please select a reason for cancellation. A cancellation fee may apply.
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
        onClose={() => {}}
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

          <Button
            fullWidth
            onClick={handleSubmitRating}
            isLoading={isSubmittingRating}
          >
            Submit Rating
          </Button>
        </div>
      </Modal>
    </div>
  )
}
