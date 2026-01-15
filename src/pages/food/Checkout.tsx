import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Clock,
  CreditCard,
  Wallet,
  Banknote,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Home,
  Briefcase,
  Plus,
  Calendar,
} from 'lucide-react'
import { Button, Card, Modal, Spinner } from '@/components/ui'
import { useCartStore } from '@/store/cartStore'
import { useOrders, useAuth, useWallet, useAddresses } from '@/hooks'
import type { SavedLocation } from '@/types'

type PaymentMethod = 'cash' | 'gcash' | 'wallet'

export default function Checkout() {
  const navigate = useNavigate()
  const { cart } = useCartStore()
  const { profile } = useAuth()
  const { balance } = useWallet()
  const { placeOrder, isLoading, error } = useOrders()
  const { addresses, isLoading: isLoadingAddresses } = useAddresses()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [showPaymentMethods, setShowPaymentMethods] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [showAddressSelector, setShowAddressSelector] = useState(false)
  const [selectedSavedAddress, setSelectedSavedAddress] = useState<SavedLocation | null>(null)
  const [deliveryAddress, setDeliveryAddress] = useState({
    address: '',
    details: '',
    contactName: profile ? `${profile.firstName} ${profile.lastName}` : '',
    contactPhone: profile?.phone || '',
    coordinates: { lat: 7.2047, lng: 124.2530 },
  })
  const [notes, setNotes] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [showScheduleModal, setShowScheduleModal] = useState(false)

  // Generate time slots for the next 7 days
  const getTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour < 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }

  const getDateOptions = () => {
    const options = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      options.push({
        value: date.toISOString().split('T')[0],
        label: i === 0
          ? 'Today'
          : i === 1
          ? 'Tomorrow'
          : date.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' }),
      })
    }
    return options
  }

  const formatScheduledTime = () => {
    if (!scheduledDate || !scheduledTime) return null
    const date = new Date(`${scheduledDate}T${scheduledTime}`)
    const dateLabel = getDateOptions().find(d => d.value === scheduledDate)?.label
    return `${dateLabel} at ${date.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}`
  }

  // Set default address on load or open address modal if no addresses
  useEffect(() => {
    if (isLoadingAddresses) return

    if (addresses.length > 0 && !deliveryAddress.address) {
      const defaultAddr = addresses[0]
      const coords = defaultAddr.coordinates as any
      setSelectedSavedAddress(defaultAddr)
      setDeliveryAddress({
        address: defaultAddr.address,
        details: defaultAddr.details || '',
        contactName: profile ? `${profile.firstName} ${profile.lastName}` : '',
        contactPhone: profile?.phone || '',
        coordinates: coords ? { lat: coords.latitude, lng: coords.longitude } : { lat: 7.2047, lng: 124.2530 },
      })
    } else if (addresses.length === 0 && !deliveryAddress.address) {
      // Auto-open address modal if user has no saved addresses
      setShowAddressModal(true)
    }
  }, [addresses, profile, isLoadingAddresses])

  const handleSelectSavedAddress = (addr: SavedLocation) => {
    const coords = addr.coordinates as any
    setSelectedSavedAddress(addr)
    setDeliveryAddress({
      address: addr.address,
      details: addr.details || '',
      contactName: profile ? `${profile.firstName} ${profile.lastName}` : '',
      contactPhone: profile?.phone || '',
      coordinates: coords ? { lat: coords.latitude, lng: coords.longitude } : { lat: 7.2047, lng: 124.2530 },
    })
    setShowAddressSelector(false)
  }

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home':
        return Home
      case 'work':
        return Briefcase
      default:
        return MapPin
    }
  }

  // Redirect to cart if empty (but not if order was just placed)
  useEffect(() => {
    if ((!cart || cart.items.length === 0) && !orderPlaced) {
      navigate('/cart')
    }
  }, [cart, navigate, orderPlaced])

  // Show success screen if order was placed
  if (orderPlaced && orderId) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-6">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Order Placed!</h1>
        <p className="mt-2 text-center text-gray-500">
          Your order has been confirmed and is being prepared
        </p>
        <p className="mt-4 text-sm text-gray-400">Order ID: {orderId}</p>
        <div className="mt-8 space-y-3 w-full max-w-sm">
          <Button
            fullWidth
            size="lg"
            onClick={() => navigate(`/orders/${orderId}`)}
          >
            Track Order
          </Button>
          <Button
            fullWidth
            size="lg"
            variant="outline"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return null
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const serviceFee = Math.round(subtotal * 0.05)
  const total = subtotal + cart.deliveryFee + serviceFee

  const paymentMethods = [
    { id: 'cash', label: 'Cash on Delivery', icon: Banknote, description: 'Pay when your order arrives' },
    { id: 'gcash', label: 'GCash', icon: CreditCard, description: 'Pay via GCash' },
    { id: 'wallet', label: 'GOGO Express Wallet', icon: Wallet, description: `Balance: ₱${balance.toFixed(2)}` },
  ]

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.address) {
      setShowAddressSelector(true)
      return
    }

    const result = await placeOrder(
      {
        address: deliveryAddress.address,
        coordinates: deliveryAddress.coordinates,
        details: deliveryAddress.details,
        contactName: deliveryAddress.contactName,
        contactPhone: deliveryAddress.contactPhone,
      },
      notes
    )

    if (result) {
      setOrderId(result)
      setOrderPlaced(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 lg:top-16 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Checkout</h1>
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

        {/* Delivery Address */}
        <Card>
          <button
            onClick={() => setShowAddressSelector(true)}
            className="flex w-full items-center gap-3"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              selectedSavedAddress
                ? selectedSavedAddress.type === 'home'
                  ? 'bg-blue-50'
                  : selectedSavedAddress.type === 'work'
                  ? 'bg-purple-50'
                  : 'bg-primary-50'
                : 'bg-primary-50'
            }`}>
              {selectedSavedAddress ? (
                (() => {
                  const Icon = getAddressIcon(selectedSavedAddress.type)
                  return <Icon className={`h-5 w-5 ${
                    selectedSavedAddress.type === 'home'
                      ? 'text-blue-600'
                      : selectedSavedAddress.type === 'work'
                      ? 'text-purple-600'
                      : 'text-primary-600'
                  }`} />
                })()
              ) : (
                <MapPin className="h-5 w-5 text-primary-600" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm text-gray-500">Deliver to</p>
              {deliveryAddress.address ? (
                <div>
                  {selectedSavedAddress && (
                    <p className="text-xs font-medium text-gray-400">{selectedSavedAddress.label}</p>
                  )}
                  <p className="font-medium text-gray-900 line-clamp-1">
                    {deliveryAddress.address}
                  </p>
                </div>
              ) : (
                <p className="text-primary-600 font-medium">Add delivery address</p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </Card>

        {/* Delivery Time */}
        <Card>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex w-full items-center gap-3"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              isScheduled ? 'bg-purple-50' : 'bg-green-50'
            }`}>
              {isScheduled ? (
                <Calendar className="h-5 w-5 text-purple-600" />
              ) : (
                <Clock className="h-5 w-5 text-green-600" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm text-gray-500">
                {isScheduled ? 'Scheduled Delivery' : 'Estimated Delivery'}
              </p>
              <p className="font-medium text-gray-900">
                {isScheduled && formatScheduledTime()
                  ? formatScheduledTime()
                  : '30-45 minutes'
                }
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </Card>

        {/* Payment Method */}
        <Card>
          <button
            onClick={() => setShowPaymentMethods(!showPaymentMethods)}
            className="flex w-full items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              {paymentMethod === 'cash' && <Banknote className="h-5 w-5 text-gray-600" />}
              {paymentMethod === 'gcash' && <CreditCard className="h-5 w-5 text-blue-600" />}
              {paymentMethod === 'wallet' && <Wallet className="h-5 w-5 text-primary-600" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="font-medium text-gray-900">
                {paymentMethods.find((m) => m.id === paymentMethod)?.label}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          {showPaymentMethods && (
            <div className="mt-4 space-y-2 border-t pt-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => {
                    setPaymentMethod(method.id as PaymentMethod)
                    setShowPaymentMethods(false)
                  }}
                  disabled={method.id === 'wallet' && balance < total}
                  className={`flex w-full items-center gap-3 rounded-lg p-3 transition ${
                    paymentMethod === method.id
                      ? 'bg-primary-50 ring-2 ring-primary-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  } ${method.id === 'wallet' && balance < total ? 'opacity-50' : ''}`}
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

        {/* Order Summary */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal ({cart.items.length} items)</span>
              <span className="text-gray-900">₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Fee</span>
              <span className="text-gray-900">₱{cart.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Service Fee</span>
              <span className="text-gray-900">₱{serviceFee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-base">
              <span className="text-gray-900">Total</span>
              <span className="text-primary-600">₱{total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-2">Delivery Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add instructions for the rider (e.g., gate code, landmark)"
            className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            rows={2}
          />
        </Card>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 lg:bottom-0 lg:left-[240px] bg-white border-t p-4 pb-safe z-50">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500">Total Payment</span>
            <span className="text-2xl font-bold text-gray-900">₱{total.toFixed(2)}</span>
          </div>
          <Button
            size="lg"
            fullWidth
            onClick={handlePlaceOrder}
            isLoading={isLoading}
            disabled={isLoading || !deliveryAddress.address}
          >
            Place Order
          </Button>
        </div>
      </div>

      {/* Address Modal */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title="Delivery Address"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={deliveryAddress.address}
              onChange={(e) => setDeliveryAddress({ ...deliveryAddress, address: e.target.value })}
              placeholder="Enter your full address"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Details (Optional)
            </label>
            <input
              type="text"
              value={deliveryAddress.details}
              onChange={(e) => setDeliveryAddress({ ...deliveryAddress, details: e.target.value })}
              placeholder="Apartment, floor, landmark, etc."
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name
            </label>
            <input
              type="text"
              value={deliveryAddress.contactName}
              onChange={(e) => setDeliveryAddress({ ...deliveryAddress, contactName: e.target.value })}
              placeholder="Name for the order"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone
            </label>
            <input
              type="tel"
              value={deliveryAddress.contactPhone}
              onChange={(e) => setDeliveryAddress({ ...deliveryAddress, contactPhone: e.target.value })}
              placeholder="Phone number"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <Button
            fullWidth
            onClick={() => {
              setSelectedSavedAddress(null)
              setShowAddressModal(false)
            }}
            disabled={!deliveryAddress.address}
          >
            Use This Address
          </Button>
        </div>
      </Modal>

      {/* Address Selector Modal */}
      <Modal
        isOpen={showAddressSelector}
        onClose={() => setShowAddressSelector(false)}
        title="Select Delivery Address"
      >
        <div className="space-y-3">
          {isLoadingAddresses ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : addresses.length > 0 ? (
            <>
              {addresses.map((addr) => {
                const Icon = getAddressIcon(addr.type)
                const isSelected = selectedSavedAddress?.id === addr.id
                return (
                  <button
                    key={addr.id}
                    onClick={() => handleSelectSavedAddress(addr)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 transition ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      addr.type === 'home'
                        ? 'bg-blue-50'
                        : addr.type === 'work'
                        ? 'bg-purple-50'
                        : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        addr.type === 'home'
                          ? 'text-blue-600'
                          : addr.type === 'work'
                          ? 'text-purple-600'
                          : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900">{addr.label}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{addr.address}</p>
                    </div>
                    {isSelected && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                )
              })}

              <div className="border-t pt-3 mt-3">
                <button
                  onClick={() => {
                    setShowAddressSelector(false)
                    setShowAddressModal(true)
                  }}
                  className="flex w-full items-center gap-3 rounded-lg border border-dashed border-gray-300 p-3 text-primary-600 hover:bg-gray-50"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Use a different address</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No saved addresses</p>
              <Button
                onClick={() => {
                  setShowAddressSelector(false)
                  setShowAddressModal(true)
                }}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Address
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Schedule Order Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Delivery Time"
      >
        <div className="space-y-4">
          {/* Delivery Options */}
          <div className="space-y-2">
            <button
              onClick={() => {
                setIsScheduled(false)
                setScheduledDate('')
                setScheduledTime('')
                setShowScheduleModal(false)
              }}
              className={`flex w-full items-center gap-3 rounded-lg border p-3 transition ${
                !isScheduled
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                !isScheduled ? 'bg-primary-100' : 'bg-gray-100'
              }`}>
                <Clock className={`h-5 w-5 ${
                  !isScheduled ? 'text-primary-600' : 'text-gray-500'
                }`} />
              </div>
              <div className="flex-1 text-left">
                <p className={`font-medium ${
                  !isScheduled ? 'text-primary-600' : 'text-gray-900'
                }`}>
                  Deliver Now
                </p>
                <p className="text-xs text-gray-500">30-45 minutes</p>
              </div>
              {!isScheduled && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              )}
            </button>

            <button
              onClick={() => setIsScheduled(true)}
              className={`flex w-full items-center gap-3 rounded-lg border p-3 transition ${
                isScheduled
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                isScheduled ? 'bg-primary-100' : 'bg-gray-100'
              }`}>
                <Calendar className={`h-5 w-5 ${
                  isScheduled ? 'text-primary-600' : 'text-gray-500'
                }`} />
              </div>
              <div className="flex-1 text-left">
                <p className={`font-medium ${
                  isScheduled ? 'text-primary-600' : 'text-gray-900'
                }`}>
                  Schedule for Later
                </p>
                <p className="text-xs text-gray-500">Choose a date and time</p>
              </div>
              {isScheduled && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              )}
            </button>
          </div>

          {/* Schedule Picker */}
          {isScheduled && (
            <div className="space-y-3 pt-3 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {getDateOptions().map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setScheduledDate(option.value)}
                      className={`rounded-lg border p-2 text-sm transition ${
                        scheduledDate === option.value
                          ? 'border-primary-500 bg-primary-50 text-primary-600 font-medium'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                  {getTimeSlots().map((time) => (
                    <button
                      key={time}
                      onClick={() => setScheduledTime(time)}
                      className={`rounded-lg border p-2 text-sm transition ${
                        scheduledTime === time
                          ? 'border-primary-500 bg-primary-50 text-primary-600 font-medium'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Button
            fullWidth
            onClick={() => setShowScheduleModal(false)}
            disabled={isScheduled && (!scheduledDate || !scheduledTime)}
          >
            {isScheduled ? 'Confirm Schedule' : 'Deliver Now'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
