import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Power,
  MapPin,
  Car,
  Package,
  DollarSign,
  Star,
  Clock,
  TrendingUp,
  ChevronRight,
  Bell,
  User,
  Navigation,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Button, Card, Spinner, Modal } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import type { Driver, DriverStatus } from '@/types'

// Mock driver data
const MOCK_DRIVER: Driver = {
  id: 'driver_001',
  userId: 'user_001',
  firstName: 'Juan',
  lastName: 'Dela Cruz',
  phone: '+639123456789',
  profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
  vehicleType: 'motorcycle',
  vehicle: {
    type: 'motorcycle',
    make: 'Honda',
    model: 'Click 125i',
    year: 2022,
    color: 'Black',
    plateNumber: 'ABC 1234',
    registrationExpiry: { toDate: () => new Date('2025-12-31') } as any,
  },
  license: {
    number: 'N01-23-456789',
    expiry: { toDate: () => new Date('2025-06-30') } as any,
    type: 'Professional',
  },
  documents: {},
  rating: 4.8,
  totalRides: 1250,
  totalDeliveries: 380,
  status: 'offline',
  earnings: {
    today: 1250,
    thisWeek: 8500,
    thisMonth: 35000,
    total: 425000,
    pendingPayout: 8500,
  },
  acceptanceRate: 92,
  cancellationRate: 3,
  verified: true,
  createdAt: { toDate: () => new Date() } as any,
  updatedAt: { toDate: () => new Date() } as any,
}

interface PendingRequest {
  id: string
  type: 'ride' | 'delivery'
  pickup: string
  dropoff: string
  distance: string
  estimatedEarnings: number
  customerName: string
  expiresIn: number
}

const MOCK_REQUEST: PendingRequest = {
  id: 'req_001',
  type: 'ride',
  pickup: 'SM City Cotabato',
  dropoff: 'Notre Dame University',
  distance: '3.2 km',
  estimatedEarnings: 85,
  customerName: 'Maria S.',
  expiresIn: 30,
}

export default function DriverDashboard() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()

  const [driver, setDriver] = useState<Driver>(MOCK_DRIVER)
  const [isOnline, setIsOnline] = useState(false)
  const [pendingRequest, setPendingRequest] = useState<PendingRequest | null>(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestTimer, setRequestTimer] = useState(30)
  const [isLoading, setIsLoading] = useState(false)

  // Simulate incoming request when online
  useEffect(() => {
    if (isOnline && !pendingRequest) {
      const timer = setTimeout(() => {
        setPendingRequest(MOCK_REQUEST)
        setShowRequestModal(true)
        setRequestTimer(30)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, pendingRequest])

  // Request countdown timer
  useEffect(() => {
    if (showRequestModal && requestTimer > 0) {
      const interval = setInterval(() => {
        setRequestTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else if (requestTimer === 0) {
      handleDeclineRequest()
    }
  }, [showRequestModal, requestTimer])

  const toggleOnline = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsOnline(!isOnline)
      setDriver((prev) => ({
        ...prev,
        status: !isOnline ? 'online' : 'offline',
      }))
      setIsLoading(false)
    }, 1000)
  }

  const handleAcceptRequest = () => {
    setShowRequestModal(false)
    // Navigate to active ride/delivery screen
    navigate('/driver/active')
  }

  const handleDeclineRequest = () => {
    setPendingRequest(null)
    setShowRequestModal(false)
    setRequestTimer(30)
  }

  const stats = [
    {
      label: "Today's Earnings",
      value: `₱${driver.earnings.today.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Completed Today',
      value: '8',
      icon: CheckCircle2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Rating',
      value: driver.rating.toFixed(1),
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Online Hours',
      value: '6.5h',
      icon: Clock,
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
              src={driver.profileImage}
              alt={driver.firstName}
              className="h-12 w-12 rounded-full border-2 border-white/30 object-cover"
            />
            <div>
              <h1 className="font-semibold">{driver.firstName} {driver.lastName}</h1>
              <div className="flex items-center gap-1 text-sm text-primary-100">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{driver.rating}</span>
                <span className="mx-1">•</span>
                <span>{driver.vehicle.plateNumber}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="rounded-full bg-white/10 p-2 hover:bg-white/20">
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
          disabled={isLoading}
          className={`flex w-full items-center justify-center gap-3 rounded-xl py-4 font-semibold transition ${
            isOnline
              ? 'bg-green-500 text-white'
              : 'bg-white text-gray-900'
          }`}
        >
          {isLoading ? (
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
      {isOnline && (
        <div className="bg-green-50 px-4 py-3 flex items-center gap-2 border-b border-green-100">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-green-700">
            Waiting for ride requests...
          </span>
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

        {/* Quick Actions */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => navigate('/driver/earnings')}
              className="flex flex-col items-center gap-1 rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
            >
              <DollarSign className="h-6 w-6 text-green-600" />
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
                ₱{driver.earnings.thisWeek.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold text-gray-900">
                ₱{driver.earnings.thisMonth.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Pending Payout</span>
              <span className="font-semibold text-green-600">
                ₱{driver.earnings.pendingPayout.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Performance */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Your Performance</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Acceptance Rate</span>
                <span className="text-sm font-medium text-gray-900">{driver.acceptanceRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${driver.acceptanceRate}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Cancellation Rate</span>
                <span className="text-sm font-medium text-gray-900">{driver.cancellationRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-red-500"
                  style={{ width: `${driver.cancellationRate}%` }}
                />
              </div>
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
        {pendingRequest && (
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
                  {pendingRequest.type === 'ride' ? (
                    <Car className="h-4 w-4 text-primary-600" />
                  ) : (
                    <Package className="h-4 w-4 text-primary-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 capitalize">{pendingRequest.type} Request</p>
                  <p className="text-xs text-gray-500">{pendingRequest.customerName}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Pickup</p>
                    <p className="text-sm font-medium text-gray-900">{pendingRequest.pickup}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                  <div>
                    <p className="text-xs text-gray-500">Dropoff</p>
                    <p className="text-sm font-medium text-gray-900">{pendingRequest.dropoff}</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">{pendingRequest.distance}</span>
                <span className="text-lg font-bold text-green-600">
                  ₱{pendingRequest.estimatedEarnings}
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
                leftIcon={<CheckCircle2 className="h-5 w-5" />}
              >
                Accept
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
