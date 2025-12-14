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
  DollarSign,
} from 'lucide-react'
import { Button, Card, Modal } from '@/components/ui'

type RideStatus = 'going_pickup' | 'arrived_pickup' | 'in_progress' | 'arrived_destination' | 'completed'

interface ActiveRide {
  id: string
  type: 'ride' | 'delivery'
  status: RideStatus
  pickup: {
    address: string
    lat: number
    lng: number
  }
  dropoff: {
    address: string
    lat: number
    lng: number
  }
  customer: {
    name: string
    phone: string
    avatar?: string
  }
  fare: number
  distance: string
  estimatedTime: number
  paymentMethod: 'cash' | 'wallet' | 'card'
  notes?: string
}

const MOCK_RIDE: ActiveRide = {
  id: 'ride_001',
  type: 'ride',
  status: 'going_pickup',
  pickup: {
    address: 'SM City Cotabato, Awang',
    lat: 7.1917,
    lng: 124.2246,
  },
  dropoff: {
    address: 'Notre Dame University, Cotabato City',
    lat: 7.2234,
    lng: 124.2467,
  },
  customer: {
    name: 'Maria Santos',
    phone: '+639123456789',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  fare: 85,
  distance: '3.2 km',
  estimatedTime: 12,
  paymentMethod: 'cash',
  notes: 'Please wait at the main entrance',
}

const STATUS_STEPS: { status: RideStatus; label: string; action: string }[] = [
  { status: 'going_pickup', label: 'Going to Pickup', action: "I've Arrived" },
  { status: 'arrived_pickup', label: 'Waiting for Passenger', action: 'Start Ride' },
  { status: 'in_progress', label: 'Ride in Progress', action: "I've Arrived" },
  { status: 'arrived_destination', label: 'At Destination', action: 'Complete Ride' },
  { status: 'completed', label: 'Completed', action: '' },
]

export default function DriverActiveRide() {
  const navigate = useNavigate()
  const [ride, setRide] = useState<ActiveRide>(MOCK_RIDE)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)

  // Timer for ride duration
  useEffect(() => {
    if (ride.status === 'in_progress') {
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [ride.status])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getCurrentStatusIndex = () => {
    return STATUS_STEPS.findIndex((s) => s.status === ride.status)
  }

  const handleStatusAdvance = () => {
    const currentIndex = getCurrentStatusIndex()
    if (currentIndex < STATUS_STEPS.length - 2) {
      const nextStatus = STATUS_STEPS[currentIndex + 1].status
      setRide((prev) => ({ ...prev, status: nextStatus }))
    } else if (ride.status === 'arrived_destination') {
      setShowCompleteModal(true)
    }
  }

  const handleCompleteRide = () => {
    setShowCompleteModal(false)
    setRide((prev) => ({ ...prev, status: 'completed' }))
  }

  const handleCall = () => {
    window.location.href = `tel:${ride.customer.phone}`
  }

  const handleMessage = () => {
    window.location.href = `sms:${ride.customer.phone}`
  }

  const handleNavigate = () => {
    const destination = ride.status === 'going_pickup' || ride.status === 'arrived_pickup'
      ? ride.pickup
      : ride.dropoff
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`, '_blank')
  }

  const currentStep = STATUS_STEPS[getCurrentStatusIndex()]

  if (ride.status === 'completed') {
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
              <span className="font-bold text-xl text-green-600">₱{ride.fare}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Payment Method</span>
              <span className="capitalize text-gray-700">{ride.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Trip Duration</span>
              <span className="text-gray-700">{formatTime(elapsedTime)}</span>
            </div>
          </div>

          <Button fullWidth onClick={() => navigate('/driver')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Map Placeholder */}
      <div className="h-64 bg-gradient-to-b from-primary-100 to-primary-50 relative">
        <button
          onClick={() => setShowCancelModal(true)}
          className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-md"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>

        {/* Navigate Button */}
        <button
          onClick={handleNavigate}
          className="absolute top-4 right-4 bg-primary-600 text-white rounded-xl px-4 py-2 shadow-md flex items-center gap-2"
        >
          <Navigation className="h-5 w-5" />
          Navigate
        </button>

        {/* Status Badge */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white rounded-xl shadow-lg p-3 flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${
              ride.status === 'in_progress' ? 'bg-green-500 animate-pulse' : 'bg-primary-500'
            }`} />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{currentStep.label}</p>
              {ride.status === 'in_progress' && (
                <p className="text-sm text-gray-500">Duration: {formatTime(elapsedTime)}</p>
              )}
            </div>
            {ride.status !== 'completed' && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Est. Time</p>
                <p className="font-medium text-gray-900">{ride.estimatedTime} min</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Customer Info */}
        <Card>
          <div className="flex items-center gap-3">
            {ride.customer.avatar ? (
              <img
                src={ride.customer.avatar}
                alt={ride.customer.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{ride.customer.name}</p>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                {ride.type === 'ride' ? (
                  <Car className="h-4 w-4" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
                <span className="capitalize">{ride.type}</span>
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

          {ride.notes && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Note:</span> {ride.notes}
              </p>
            </div>
          )}
        </Card>

        {/* Route Details */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-green-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Pickup</p>
                <p className="font-medium text-gray-900">{ride.pickup.address}</p>
              </div>
              {(ride.status === 'going_pickup' || ride.status === 'arrived_pickup') && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Current</span>
              )}
            </div>

            <div className="ml-1.5 h-6 border-l-2 border-dashed border-gray-300" />

            <div className="flex items-start gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-red-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Dropoff</p>
                <p className="font-medium text-gray-900">{ride.dropoff.address}</p>
              </div>
              {(ride.status === 'in_progress' || ride.status === 'arrived_destination') && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Destination</span>
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
              <p className="font-semibold text-gray-900">{ride.distance}</p>
              <p className="text-xs text-gray-500">Distance</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                <Clock className="h-4 w-4" />
              </div>
              <p className="font-semibold text-gray-900">{ride.estimatedTime} min</p>
              <p className="text-xs text-gray-500">Est. Time</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                <DollarSign className="h-4 w-4" />
              </div>
              <p className="font-semibold text-green-600">₱{ride.fare}</p>
              <p className="text-xs text-gray-500">{ride.paymentMethod}</p>
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-area-inset-bottom">
        <Button fullWidth size="lg" onClick={handleStatusAdvance}>
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
              onClick={() => navigate('/driver')}
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
            <p className="text-3xl font-bold text-green-600 mb-2">₱{ride.fare}</p>
            <p className="text-gray-600">
              Payment: <span className="capitalize font-medium">{ride.paymentMethod}</span>
            </p>
          </div>

          {ride.paymentMethod === 'cash' && (
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Cash Payment:</span> Please collect ₱{ride.fare} from the passenger.
              </p>
            </div>
          )}

          <Button fullWidth onClick={handleCompleteRide}>
            Confirm & Complete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
