import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  MessageCircle,
  Navigation,
  CheckCircle2,
  Store,
  User,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { Button, Card, Spinner, Modal } from '@/components/ui'
import { useDriverDeliveries } from '@/hooks'

type DeliveryStep = 'pickup' | 'delivering'

export default function DriverActiveDelivery() {
  const navigate = useNavigate()
  const {
    activeDelivery,
    isLoading,
    error,
    pickupOrder,
    completeDelivery,
    cancelDelivery,
  } = useDriverDeliveries()

  const [currentStep, setCurrentStep] = useState<DeliveryStep>('pickup')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Determine step based on order status
  useEffect(() => {
    if (activeDelivery) {
      if (activeDelivery.status === 'on_the_way') {
        setCurrentStep('delivering')
      } else {
        setCurrentStep('pickup')
      }
    }
  }, [activeDelivery?.status])

  // Redirect back if no active delivery
  useEffect(() => {
    if (!isLoading && !activeDelivery) {
      navigate('/driver')
    }
  }, [isLoading, activeDelivery, navigate])

  const handlePickedUp = async () => {
    if (!activeDelivery) return
    setIsUpdating(true)
    try {
      const success = await pickupOrder(activeDelivery.id)
      if (success) {
        setCurrentStep('delivering')
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelivered = async () => {
    if (!activeDelivery) return
    setIsUpdating(true)
    try {
      const success = await completeDelivery(activeDelivery.id)
      if (success) {
        setShowCompleteModal(false)
        navigate('/driver')
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = async () => {
    if (!activeDelivery) return
    setIsUpdating(true)
    try {
      const success = await cancelDelivery(activeDelivery.id, cancelReason)
      if (success) {
        setShowCancelModal(false)
        navigate('/driver')
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const openNavigation = (address: string) => {
    const encoded = encodeURIComponent(address)
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!activeDelivery) {
    return null
  }

  const deliveryAddress = activeDelivery.deliveryAddress

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-primary-600 text-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/driver')}
            className="rounded-full p-2 hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-semibold">Active Delivery</h1>
            <p className="text-sm text-primary-100">
              Order #{activeDelivery.id.slice(-8)}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              currentStep === 'pickup' ? 'bg-primary-600 text-white' : 'bg-green-500 text-white'
            }`}>
              {currentStep === 'pickup' ? '1' : <CheckCircle2 className="h-5 w-5" />}
            </div>
            <span className={`text-sm font-medium ${
              currentStep === 'pickup' ? 'text-primary-600' : 'text-green-600'
            }`}>
              Pickup
            </span>
          </div>
          <div className={`flex-1 h-1 mx-3 rounded ${
            currentStep === 'delivering' ? 'bg-green-500' : 'bg-gray-200'
          }`} />
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              currentStep === 'delivering' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <span className={`text-sm font-medium ${
              currentStep === 'delivering' ? 'text-primary-600' : 'text-gray-500'
            }`}>
              Deliver
            </span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-error-light px-4 py-3 flex items-center gap-2 border-b border-red-100">
          <AlertCircle className="h-5 w-5 text-error" />
          <span className="text-sm text-error">{error}</span>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Current Task Card */}
        <Card className={currentStep === 'pickup' ? '!border-orange-200 !bg-orange-50' : '!border-green-200 !bg-green-50'}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
              currentStep === 'pickup' ? 'bg-orange-100' : 'bg-green-100'
            }`}>
              {currentStep === 'pickup' ? (
                <Store className={`h-6 w-6 text-orange-600`} />
              ) : (
                <MapPin className={`h-6 w-6 text-green-600`} />
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {currentStep === 'pickup' ? 'Pick up order from merchant' : 'Deliver to customer'}
              </p>
              <p className="text-sm text-gray-500">
                {currentStep === 'pickup'
                  ? `Head to the ${activeDelivery.type === 'pharmacy' ? 'pharmacy' : activeDelivery.type === 'grocery' ? 'store' : 'restaurant'} and collect the order`
                  : 'Deliver the order to the customer\'s location'}
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="p-3 bg-white rounded-lg">
            <p className="text-xs text-gray-500 mb-1">
              {currentStep === 'pickup' ? 'Pickup Location' : 'Delivery Address'}
            </p>
            <p className="font-medium text-gray-900">
              {currentStep === 'pickup'
                ? `Merchant: ${activeDelivery.merchantId}`
                : deliveryAddress?.address || 'No address'}
            </p>
            {currentStep === 'delivering' && deliveryAddress?.details && (
              <p className="text-sm text-gray-500 mt-1">{deliveryAddress.details}</p>
            )}
          </div>

          {/* Navigation Button */}
          <Button
            fullWidth
            variant="outline"
            className="mt-3"
            leftIcon={<Navigation className="h-5 w-5" />}
            onClick={() => openNavigation(
              currentStep === 'pickup'
                ? 'McDonald\'s' // In real app, get merchant address
                : deliveryAddress?.address || ''
            )}
          >
            Open in Maps
          </Button>
        </Card>

        {/* Customer Info (when delivering) */}
        {currentStep === 'delivering' && deliveryAddress && (
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {deliveryAddress.contactName || 'Customer'}
                  </p>
                  <p className="text-sm text-gray-500">Customer</p>
                </div>
              </div>
              <div className="flex gap-2">
                {deliveryAddress.contactPhone && (
                  <a
                    href={`tel:${deliveryAddress.contactPhone}`}
                    className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center"
                  >
                    <Phone className="h-5 w-5 text-green-600" />
                  </a>
                )}
                <button className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Order Items */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Order Items</h3>
          </div>
          <div className="space-y-2">
            {activeDelivery.items?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-gray-900">{item.quantity}x {item.name}</p>
                  {item.specialInstructions && (
                    <p className="text-xs text-gray-500">Note: {item.specialInstructions}</p>
                  )}
                </div>
                <span className="text-gray-600">₱{item.total || item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          {activeDelivery.notes && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Customer Note:</span> {activeDelivery.notes}
              </p>
            </div>
          )}
        </Card>

        {/* Earnings */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Your Earnings</span>
            <span className="text-xl font-bold text-green-600">
              ₱{activeDelivery.deliveryFee || 0}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Payment: {(activeDelivery.paymentMethod || 'cash').toUpperCase()}
          </p>
        </Card>

        {/* Cancel Button */}
        <button
          onClick={() => setShowCancelModal(true)}
          className="w-full text-center text-sm text-red-600 py-2"
        >
          Cancel Delivery
        </button>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-safe">
        <Button
          fullWidth
          size="lg"
          onClick={currentStep === 'pickup' ? handlePickedUp : () => setShowCompleteModal(true)}
          isLoading={isUpdating}
        >
          {currentStep === 'pickup' ? 'Confirm Pickup' : 'Complete Delivery'}
        </Button>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Delivery"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to cancel this delivery? The order will be returned to the available queue.
          </p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation (optional)"
            className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            rows={3}
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowCancelModal(false)}
            >
              Keep Delivery
            </Button>
            <Button
              fullWidth
              variant="outline"
              className="!border-red-500 !text-red-600 hover:!bg-red-50"
              onClick={handleCancel}
              isLoading={isUpdating}
            >
              Cancel Delivery
            </Button>
          </div>
        </div>
      </Modal>

      {/* Complete Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Complete Delivery"
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <p className="text-center text-gray-600">
            Confirm that you have delivered the order to the customer.
          </p>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Earnings</span>
              <span className="text-xl font-bold text-green-600">
                ₱{activeDelivery.deliveryFee || 0}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowCompleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={handleDelivered}
              isLoading={isUpdating}
              leftIcon={<CheckCircle2 className="h-5 w-5" />}
            >
              Confirm Delivery
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
