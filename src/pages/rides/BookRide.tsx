import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Clock,
  Wallet,
  CreditCard,
  Banknote,
  ChevronRight,
  AlertCircle,
  Tag,
  X,
  Zap,
} from 'lucide-react'
import { Button, Card, Spinner } from '@/components/ui'
import { VehicleIcon } from '@/components/ui/VehicleIcon'
import { useRide, useRequireAuth } from '@/hooks'

export default function BookRide() {
  const navigate = useNavigate()
  const { checkAuthAndRedirect } = useRequireAuth()
  const {
    pickup,
    dropoff,
    vehicleType,
    vehicleInfo,
    route,
    fare,
    paymentMethod,
    promoCode,
    surgeMultiplier,
    isBooking,
    error,
    setPaymentMethod,
    applyPromoCode,
    removePromoCode,
    calculateFare,
    bookRide,
  } = useRide()

  const [isCalculating, setIsCalculating] = useState(false)
  const [showPaymentMethods, setShowPaymentMethods] = useState(false)
  const [showPromoInput, setShowPromoInput] = useState(false)
  const [promoInput, setPromoInput] = useState('')
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)

  // Redirect if locations not set
  useEffect(() => {
    if (!pickup || !dropoff) {
      navigate('/rides')
    }
  }, [pickup, dropoff, navigate])

  // Calculate fare on mount
  useEffect(() => {
    const calculate = async () => {
      setIsCalculating(true)
      await calculateFare()
      setIsCalculating(false)
    }
    if (pickup && dropoff) {
      calculate()
    }
  }, [pickup, dropoff, vehicleType, calculateFare])

  const handleBook = async () => {
    // Require authentication before booking
    if (!checkAuthAndRedirect()) return

    const rideId = await bookRide()
    if (rideId) {
      navigate(`/rides/tracking/${rideId}`)
    }
  }

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return

    setIsApplyingPromo(true)
    const success = await applyPromoCode(promoInput.trim())
    setIsApplyingPromo(false)

    if (success) {
      setShowPromoInput(false)
      setPromoInput('')
    }
  }

  const handleRemovePromo = () => {
    removePromoCode()
    setPromoInput('')
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60)
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const formatDistance = (meters: number) => {
    const km = meters / 1000
    return km < 1 ? `${Math.round(meters)} m` : `${km.toFixed(1)} km`
  }

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: Banknote, description: 'Pay with cash' },
    { id: 'gcash', label: 'GCash', icon: CreditCard, description: 'Pay via GCash' },
    { id: 'wallet', label: 'GOGO Wallet', icon: Wallet, description: 'Pay from wallet balance' },
  ]

  if (!pickup || !dropoff) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Confirm Booking</h1>
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

        {/* Route Summary */}
        <Card>
          <div className="space-y-3">
            {/* Pickup */}
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                <div className="h-2 w-2 rounded-full bg-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Pickup</p>
                <p className="font-medium text-gray-900 line-clamp-1">{pickup.address}</p>
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
                <p className="font-medium text-gray-900 line-clamp-1">{dropoff.address}</p>
              </div>
            </div>
          </div>

          {/* Route Info */}
          {isCalculating ? (
            <div className="mt-4 flex items-center justify-center py-4">
              <Spinner size="sm" />
              <span className="ml-2 text-sm text-gray-500">Calculating route...</span>
            </div>
          ) : route ? (
            <div className="mt-4 flex items-center gap-4 border-t pt-4">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{formatDistance(route.distance)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(route.duration)}</span>
              </div>
            </div>
          ) : null}
        </Card>

        {/* Vehicle Type */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50">
              <VehicleIcon type={vehicleInfo.icon as 'motorcycle' | 'car' | 'van' | 'truck' | 'plane'} size="md" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{vehicleInfo.name}</h3>
              <p className="text-sm text-gray-500">{vehicleInfo.description}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {vehicleInfo.estimatedArrival} arrival
              </p>
            </div>
            <button
              onClick={() => navigate('/rides')}
              className="text-primary-600 text-sm font-medium"
            >
              Change
            </button>
          </div>
        </Card>

        {/* Payment Method */}
        <Card>
          <button
            onClick={() => setShowPaymentMethods(!showPaymentMethods)}
            className="flex w-full items-center gap-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              {paymentMethod === 'cash' && <Banknote className="h-5 w-5 text-gray-600" />}
              {paymentMethod === 'gcash' && <CreditCard className="h-5 w-5 text-blue-600" />}
              {paymentMethod === 'wallet' && <Wallet className="h-5 w-5 text-primary-600" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="font-medium text-gray-900 capitalize">{paymentMethod}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          {/* Payment Options */}
          {showPaymentMethods && (
            <div className="mt-4 space-y-2 border-t pt-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => {
                    setPaymentMethod(method.id as 'cash' | 'gcash' | 'wallet')
                    setShowPaymentMethods(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg p-3 transition ${
                    paymentMethod === method.id
                      ? 'bg-primary-50 ring-2 ring-primary-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <method.icon className={`h-5 w-5 ${
                    paymentMethod === method.id ? 'text-primary-600' : 'text-gray-500'
                  }`} />
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${
                      paymentMethod === method.id ? 'text-primary-600' : 'text-gray-900'
                    }`}>
                      {method.label}
                    </p>
                    <p className="text-xs text-gray-500">{method.description}</p>
                  </div>
                  {paymentMethod === method.id && (
                    <div className="h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Surge Pricing Alert */}
        {surgeMultiplier > 1 && (
          <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 text-sm">
            <Zap className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-700">High Demand</p>
              <p className="text-yellow-600">
                {surgeMultiplier}x surge pricing is currently in effect
              </p>
            </div>
          </div>
        )}

        {/* Promo Code */}
        <Card>
          {promoCode ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                  <Tag className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{promoCode.code}</p>
                  <p className="text-sm text-green-600">
                    {promoCode.type === 'percentage'
                      ? `${promoCode.value}% off`
                      : promoCode.type === 'fixed'
                      ? `₱${promoCode.value} off`
                      : 'Free delivery'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemovePromo}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : showPromoInput ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="Enter promo code"
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm uppercase focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <Button
                  onClick={handleApplyPromo}
                  isLoading={isApplyingPromo}
                  disabled={!promoInput.trim()}
                >
                  Apply
                </Button>
              </div>
              <button
                onClick={() => setShowPromoInput(false)}
                className="text-sm text-gray-500"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowPromoInput(true)}
              className="flex w-full items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <Tag className="h-5 w-5 text-gray-600" />
              </div>
              <span className="flex-1 text-left font-medium text-primary-600">
                Add Promo Code
              </span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          )}
        </Card>

        {/* Fare Breakdown */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Fare Breakdown</h3>
          {isCalculating ? (
            <div className="flex items-center justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : fare ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Base Fare</span>
                <span className="text-gray-900">₱{fare.base.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Distance</span>
                <span className="text-gray-900">₱{fare.distance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Time</span>
                <span className="text-gray-900">₱{fare.time.toFixed(2)}</span>
              </div>
              {fare.surge && fare.surge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-600 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Surge ({surgeMultiplier}x)
                  </span>
                  <span className="text-yellow-600">+₱{fare.surge.toFixed(2)}</span>
                </div>
              )}
              {fare.discount && fare.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Discount</span>
                  <span className="text-green-600">-₱{fare.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                <span className="text-gray-900">Total</span>
                <span className="text-primary-600">₱{fare.total.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Unable to calculate fare</p>
          )}
        </Card>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-safe">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500">Total Fare</span>
            <span className="text-2xl font-bold text-gray-900">
              {fare ? `₱${fare.total.toFixed(2)}` : '---'}
            </span>
          </div>
          <Button
            size="lg"
            fullWidth
            onClick={handleBook}
            isLoading={isBooking}
            disabled={isBooking || isCalculating || !fare}
          >
            Confirm Booking
          </Button>
        </div>
      </div>
    </div>
  )
}
