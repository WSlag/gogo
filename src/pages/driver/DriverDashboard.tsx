import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Power,
  Car,
  Package,
  Star,
  Clock,
  TrendingUp,
  Bell,
  BellRing,
  User,
  Navigation,
  CheckCircle2,
  XCircle,
  MapPin,
  AlertCircle,
  Bike,
  ChevronRight,
  Store,
  Phone,
} from 'lucide-react'
import { PesoSign } from '@/components/icons'
import { Button, Card, Spinner, Modal } from '@/components/ui'
import { useDriver, usePushNotifications, useDriverDeliveries } from '@/hooks'
import { VehicleIcon } from '@/components/ui/VehicleIcon'
import type { Order } from '@/types'

export default function DriverDashboard() {
  const navigate = useNavigate()
  const {
    driver,
    isLoading,
    error,
    isOnline,
    pendingRide,
    activeRide,
    earnings,
    todayStats,
    goOnline,
    goOffline,
    acceptRide,
    declineRide,
  } = useDriver()

  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState<Order | null>(null)
  const [requestTimer, setRequestTimer] = useState(30)
  const [isToggling, setIsToggling] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isAcceptingDelivery, setIsAcceptingDelivery] = useState(false)

  // Food/Grocery deliveries
  const {
    availableDeliveries,
    activeDelivery,
    isLoading: isLoadingDeliveries,
    acceptDelivery,
  } = useDriverDeliveries()

  // Push notifications
  const {
    isSupported: pushSupported,
    permission: pushPermission,
    requestPermission,
    subscribe: subscribePush,
  } = usePushNotifications()

  // Show notification permission prompt when going online
  useEffect(() => {
    if (isOnline && pushSupported && pushPermission === 'default') {
      setShowNotificationPrompt(true)
    }
  }, [isOnline, pushSupported, pushPermission])

  // Send browser notification when new ride request comes in
  useEffect(() => {
    if (pendingRide && pushPermission === 'granted') {
      // Play notification sound
      const audio = new Audio('/sounds/notification.mp3')
      audio.play().catch(() => {}) // Ignore error if no sound file

      // Show browser notification
      new Notification('New Ride Request!', {
        body: `₱${pendingRide.fare?.total?.toFixed(2) || '0'} - ${pendingRide.pickup?.address?.substring(0, 50) || 'Pickup location'}`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'ride-request',
        requireInteraction: true,
      })
    }
  }, [pendingRide?.id, pushPermission])

  // Show modal when there's a pending ride
  useEffect(() => {
    if (pendingRide) {
      setShowRequestModal(true)
      setRequestTimer(30)
    } else {
      setShowRequestModal(false)
    }
  }, [pendingRide])

  // Navigate to active ride when one is accepted
  useEffect(() => {
    if (activeRide && (activeRide.status === 'accepted' || activeRide.status === 'arriving' || activeRide.status === 'arrived' || activeRide.status === 'in_progress')) {
      navigate('/driver/active')
    }
  }, [activeRide?.id, activeRide?.status, navigate])

  // Navigate to active delivery when one is accepted
  useEffect(() => {
    if (activeDelivery) {
      navigate('/driver/delivery')
    }
  }, [activeDelivery?.id, navigate])

  // Request countdown timer
  useEffect(() => {
    if (showRequestModal && requestTimer > 0) {
      const interval = setInterval(() => {
        setRequestTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else if (requestTimer === 0 && pendingRide) {
      handleDeclineRequest()
    }
  }, [showRequestModal, requestTimer, pendingRide])

  const toggleOnline = async () => {
    setIsToggling(true)
    try {
      if (isOnline) {
        await goOffline()
      } else {
        await goOnline()
      }
    } finally {
      setIsToggling(false)
    }
  }

  const handleAcceptRequest = async () => {
    if (!pendingRide) return
    setIsAccepting(true)
    try {
      const success = await acceptRide(pendingRide.id)
      if (success) {
        setShowRequestModal(false)
        navigate('/driver/active')
      }
    } finally {
      setIsAccepting(false)
    }
  }

  const handleDeclineRequest = async () => {
    if (!pendingRide) return
    await declineRide(pendingRide.id)
    setShowRequestModal(false)
    setRequestTimer(30)
  }

  const handleViewDelivery = (order: Order) => {
    setSelectedDelivery(order)
    setShowDeliveryModal(true)
  }

  const handleAcceptDelivery = async () => {
    if (!selectedDelivery) return
    setIsAcceptingDelivery(true)
    try {
      const success = await acceptDelivery(selectedDelivery.id)
      if (success) {
        setShowDeliveryModal(false)
        setSelectedDelivery(null)
        navigate('/driver/delivery')
      }
    } finally {
      setIsAcceptingDelivery(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  // No driver profile
  if (!driver) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Driver Profile Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            You need to register as a driver to access this dashboard.
          </p>
          <Button onClick={() => navigate('/driver/register')}>
            Register as Driver
          </Button>
        </Card>
      </div>
    )
  }

  const stats = [
    {
      label: "Today's Earnings",
      value: `₱${earnings.today.toLocaleString()}`,
      icon: PesoSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Completed Today',
      value: todayStats.completedRides.toString(),
      icon: CheckCircle2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Rating',
      value: driver.rating?.toFixed(1) || '0.0',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Total Rides',
      value: driver.totalRides?.toLocaleString() || '0',
      icon: Car,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-primary-600 px-4 py-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={driver.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.firstName}`}
              alt={driver.firstName}
              className="h-12 w-12 rounded-full border-2 border-white/30 object-cover"
            />
            <div>
              <h1 className="font-semibold">{driver.firstName} {driver.lastName}</h1>
              <div className="flex items-center gap-1 text-sm text-primary-100">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>{driver.rating?.toFixed(1) || '0.0'}</span>
                <span className="mx-1">•</span>
                <span>{driver.vehicle?.plateNumber || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/notifications')}
              className="rounded-full bg-white/10 p-2 hover:bg-white/20"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/driver/profile')}
              className="rounded-full bg-white/10 p-2 hover:bg-white/20"
            >
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Online Toggle */}
        <button
          onClick={toggleOnline}
          disabled={isToggling}
          className={`flex w-full items-center justify-center gap-3 rounded-xl py-4 font-semibold transition ${
            isOnline
              ? 'bg-green-500 text-white'
              : 'bg-white text-gray-900'
          }`}
        >
          {isToggling ? (
            <Spinner size="sm" />
          ) : (
            <>
              <Power className="h-5 w-5" />
              <span>{isOnline ? 'You are Online' : 'Go Online'}</span>
            </>
          )}
        </button>
      </div>

      {/* Status Banner */}
      {isOnline && !activeRide && (
        <div className="bg-green-50 px-4 py-3 flex items-center gap-2 border-b border-green-100">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-green-700">
            Waiting for ride requests...
          </span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-error-light px-4 py-3 flex items-center gap-2 border-b border-red-100">
          <AlertCircle className="h-5 w-5 text-error" />
          <span className="text-sm text-error">{error}</span>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="!p-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Available Deliveries */}
        {availableDeliveries.length > 0 && (
          <Card className="!border-orange-200 !bg-orange-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Available Deliveries</h3>
              </div>
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                {availableDeliveries.length} orders
              </span>
            </div>
            <div className="space-y-2">
              {availableDeliveries.slice(0, 3).map((order) => (
                <button
                  key={order.id}
                  onClick={() => handleViewDelivery(order)}
                  className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-orange-100 hover:border-orange-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <Store className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 text-sm">
                        {order.merchantName || `${order.type === 'grocery' ? 'Grocery' : order.type === 'pharmacy' ? 'Pharmacy' : 'Food'} Order`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.items?.length || 0} items • Ready for pickup
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-600">₱{order.deliveryFee || 0}</span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
              ))}
              {availableDeliveries.length > 3 && (
                <p className="text-center text-sm text-gray-500 pt-2">
                  +{availableDeliveries.length - 3} more deliveries available
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => navigate('/driver/earnings')}
              className="flex flex-col items-center gap-1 rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
            >
              <PesoSign className="h-6 w-6 text-green-600" />
              <span className="text-xs text-gray-600">Earnings</span>
            </button>
            <button
              onClick={() => navigate('/driver/history')}
              className="flex flex-col items-center gap-1 rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
            >
              <Clock className="h-6 w-6 text-blue-600" />
              <span className="text-xs text-gray-600">History</span>
            </button>
            <button
              onClick={() => navigate('/driver/stats')}
              className="flex flex-col items-center gap-1 rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
            >
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <span className="text-xs text-gray-600">Stats</span>
            </button>
            <button
              onClick={() => navigate('/help')}
              className="flex flex-col items-center gap-1 rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
            >
              <Navigation className="h-6 w-6 text-orange-600" />
              <span className="text-xs text-gray-600">Help</span>
            </button>
          </div>
        </Card>

        {/* Earnings Summary */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Earnings Summary</h3>
            <button
              onClick={() => navigate('/driver/earnings')}
              className="text-sm text-primary-600 font-medium"
            >
              See All
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">This Week</span>
              <span className="font-semibold text-gray-900">
                ₱{earnings.thisWeek.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold text-gray-900">
                ₱{earnings.thisMonth.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Pending Payout</span>
              <span className="font-semibold text-green-600">
                ₱{earnings.pendingPayout.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Vehicle Info */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Your Vehicle</h3>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50">
              <VehicleIcon type={driver.vehicleType as 'motorcycle' | 'car' | 'van'} size="md" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {driver.vehicle?.color} {driver.vehicle?.make} {driver.vehicle?.model}
              </p>
              <p className="text-sm text-primary-600 font-semibold">
                {driver.vehicle?.plateNumber}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Request Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={handleDeclineRequest}
        title="New Ride Request"
      >
        {pendingRide && (
          <div className="space-y-4">
            {/* Timer */}
            <div className="flex items-center justify-center">
              <div className="relative h-16 w-16">
                <svg className="h-16 w-16 -rotate-90 transform">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={176}
                    strokeDashoffset={176 - (176 * requestTimer) / 30}
                    className="text-primary-600 transition-all duration-1000"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                  {requestTimer}
                </span>
              </div>
            </div>

            {/* Request Details */}
            <Card className="!bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                  <Car className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    {pendingRide.vehicleType} Ride
                  </p>
                  <p className="text-xs text-gray-500">
                    Passenger request
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Pickup</p>
                    <p className="text-sm font-medium text-gray-900">
                      {pendingRide.pickup?.address || 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                  <div>
                    <p className="text-xs text-gray-500">Dropoff</p>
                    <p className="text-sm font-medium text-gray-900">
                      {pendingRide.dropoff?.address || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  {pendingRide.route?.distance
                    ? `${(pendingRide.route.distance / 1000).toFixed(1)} km`
                    : 'Calculating...'}
                </span>
                <span className="text-lg font-bold text-green-600">
                  ₱{pendingRide.fare?.total?.toFixed(2) || '0.00'}
                </span>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={handleDeclineRequest}
                leftIcon={<XCircle className="h-5 w-5" />}
              >
                Decline
              </Button>
              <Button
                fullWidth
                onClick={handleAcceptRequest}
                isLoading={isAccepting}
                leftIcon={<CheckCircle2 className="h-5 w-5" />}
              >
                Accept
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Notification Permission Modal */}
      <Modal
        isOpen={showNotificationPrompt}
        onClose={() => setShowNotificationPrompt(false)}
        title="Enable Notifications"
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
              <BellRing className="h-8 w-8 text-primary-600" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600">
              Enable notifications to get alerted when new ride requests come in, even when the app is in the background.
            </p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Important:</span> Without notifications, you may miss ride requests and lose potential earnings.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowNotificationPrompt(false)}
            >
              Not Now
            </Button>
            <Button
              fullWidth
              onClick={async () => {
                const granted = await requestPermission()
                if (granted) {
                  await subscribePush()
                }
                setShowNotificationPrompt(false)
              }}
              leftIcon={<Bell className="h-5 w-5" />}
            >
              Enable
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delivery Detail Modal */}
      <Modal
        isOpen={showDeliveryModal}
        onClose={() => {
          setShowDeliveryModal(false)
          setSelectedDelivery(null)
        }}
        title="Delivery Details"
      >
        {selectedDelivery && (
          <div className="space-y-4">
            {/* Order Type */}
            <div className="flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
                <Package className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <p className="text-center font-semibold text-gray-900">
              {selectedDelivery.type === 'grocery' ? 'Grocery' : selectedDelivery.type === 'pharmacy' ? 'Pharmacy' : 'Food'} Delivery
            </p>

            {/* Order Info */}
            <Card className="!bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Order ID</p>
              <p className="font-medium text-gray-900">#{selectedDelivery.id.slice(-8)}</p>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Items</p>
                <div className="space-y-1">
                  {selectedDelivery.items?.slice(0, 3).map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-700">
                      {item.quantity}x {item.name}
                    </p>
                  ))}
                  {(selectedDelivery.items?.length || 0) > 3 && (
                    <p className="text-xs text-gray-500">
                      +{(selectedDelivery.items?.length || 0) - 3} more items
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Pickup Location */}
            <div className="flex items-start gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-green-500" />
              <div>
                <p className="text-xs text-gray-500">Pickup from merchant</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedDelivery.merchantName || selectedDelivery.merchantId}
                </p>
              </div>
            </div>

            {/* Delivery Location */}
            <div className="flex items-start gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-red-500" />
              <div>
                <p className="text-xs text-gray-500">Deliver to</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedDelivery.deliveryAddress?.address || 'Address not available'}
                </p>
                {selectedDelivery.deliveryAddress?.contactName && (
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedDelivery.deliveryAddress.contactName}
                    {selectedDelivery.deliveryAddress.contactPhone && (
                      <> • {selectedDelivery.deliveryAddress.contactPhone}</>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Earnings */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Delivery Fee</span>
              <span className="text-xl font-bold text-green-600">
                ₱{selectedDelivery.deliveryFee || 0}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setShowDeliveryModal(false)
                  setSelectedDelivery(null)
                }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                onClick={handleAcceptDelivery}
                isLoading={isAcceptingDelivery}
                leftIcon={<CheckCircle2 className="h-5 w-5" />}
              >
                Accept Delivery
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
