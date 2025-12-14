import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Car,
  Package,
  Star,
  Calendar,
  Filter,
  ChevronRight,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { Button, Card, Modal } from '@/components/ui'

type TripType = 'all' | 'ride' | 'delivery'
type DateFilter = 'today' | 'week' | 'month' | 'all'

interface TripHistory {
  id: string
  type: 'ride' | 'delivery'
  status: 'completed' | 'cancelled'
  pickup: string
  dropoff: string
  customerName: string
  fare: number
  tip?: number
  rating?: number
  distance: string
  duration: string
  date: Date
  paymentMethod: 'cash' | 'wallet' | 'card'
}

const MOCK_TRIPS: TripHistory[] = [
  {
    id: '1',
    type: 'ride',
    status: 'completed',
    pickup: 'SM City Cotabato',
    dropoff: 'Notre Dame University',
    customerName: 'Maria S.',
    fare: 85,
    tip: 15,
    rating: 5,
    distance: '3.2 km',
    duration: '12 min',
    date: new Date(),
    paymentMethod: 'cash',
  },
  {
    id: '2',
    type: 'delivery',
    status: 'completed',
    pickup: 'Jollibee Awang',
    dropoff: 'RH3 Subdivision',
    customerName: 'Juan D.',
    fare: 65,
    rating: 4,
    distance: '2.5 km',
    duration: '15 min',
    date: new Date(),
    paymentMethod: 'wallet',
  },
  {
    id: '3',
    type: 'ride',
    status: 'cancelled',
    pickup: 'KCC Mall',
    dropoff: 'Rosary Heights',
    customerName: 'Ana L.',
    fare: 0,
    distance: '1.8 km',
    duration: '-',
    date: new Date(),
    paymentMethod: 'cash',
  },
  {
    id: '4',
    type: 'ride',
    status: 'completed',
    pickup: 'Cotabato Airport',
    dropoff: 'Imperial Hotel',
    customerName: 'Carlos M.',
    fare: 350,
    tip: 50,
    rating: 5,
    distance: '8.5 km',
    duration: '25 min',
    date: new Date(Date.now() - 86400000),
    paymentMethod: 'card',
  },
  {
    id: '5',
    type: 'delivery',
    status: 'completed',
    pickup: 'Savemore Market',
    dropoff: 'PC Hill',
    customerName: 'Lisa R.',
    fare: 95,
    rating: 5,
    distance: '4.2 km',
    duration: '18 min',
    date: new Date(Date.now() - 86400000),
    paymentMethod: 'wallet',
  },
  {
    id: '6',
    type: 'ride',
    status: 'completed',
    pickup: 'City Hall',
    dropoff: 'Provincial Capitol',
    customerName: 'Pedro G.',
    fare: 55,
    rating: 4,
    distance: '1.5 km',
    duration: '8 min',
    date: new Date(Date.now() - 172800000),
    paymentMethod: 'cash',
  },
]

export default function DriverHistory() {
  const navigate = useNavigate()
  const [typeFilter, setTypeFilter] = useState<TripType>('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<TripHistory | null>(null)

  const filteredTrips = MOCK_TRIPS.filter((trip) => {
    if (typeFilter !== 'all' && trip.type !== typeFilter) return false

    const now = new Date()
    const tripDate = new Date(trip.date)

    switch (dateFilter) {
      case 'today':
        return tripDate.toDateString() === now.toDateString()
      case 'week': {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return tripDate >= weekAgo
      }
      case 'month': {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return tripDate >= monthAgo
      }
      default:
        return true
    }
  })

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
  }

  // Group trips by date
  const groupedTrips = filteredTrips.reduce((acc, trip) => {
    const dateKey = formatDate(trip.date)
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(trip)
    return acc
  }, {} as Record<string, TripHistory[]>)

  // Calculate stats
  const completedTrips = filteredTrips.filter((t) => t.status === 'completed')
  const totalEarnings = completedTrips.reduce((sum, t) => sum + t.fare + (t.tip || 0), 0)
  const avgRating = completedTrips.filter((t) => t.rating).reduce((sum, t, _, arr) => sum + (t.rating || 0) / arr.length, 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-primary-600 text-white">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-2 hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Trip History</h1>
        </div>

        {/* Stats */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{completedTrips.length}</p>
              <p className="text-xs text-primary-100">Trips</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">₱{totalEarnings.toLocaleString()}</p>
              <p className="text-xs text-primary-100">Earnings</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold">{avgRating.toFixed(1)}</span>
              </div>
              <p className="text-xs text-primary-100">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex gap-2">
            {(['all', 'ride', 'delivery'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition ${
                  typeFilter === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {type === 'all' ? 'All' : type}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm"
          >
            <Filter className="h-4 w-4" />
            {dateFilter !== 'all' && (
              <span className="capitalize">{dateFilter}</span>
            )}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {Object.keys(groupedTrips).length === 0 ? (
          <Card className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No trips found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </Card>
        ) : (
          Object.entries(groupedTrips).map(([date, trips]) => (
            <div key={date}>
              <p className="text-xs font-medium text-gray-500 mb-2 px-1">{date}</p>
              <Card className="divide-y divide-gray-100">
                {trips.map((trip) => (
                  <button
                    key={trip.id}
                    onClick={() => setSelectedTrip(trip)}
                    className="w-full flex items-center gap-3 py-3 first:pt-0 last:pb-0 text-left"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      trip.type === 'ride' ? 'bg-blue-50' : 'bg-orange-50'
                    }`}>
                      {trip.type === 'ride' ? (
                        <Car className={`h-5 w-5 ${trip.type === 'ride' ? 'text-blue-600' : 'text-orange-600'}`} />
                      ) : (
                        <Package className="h-5 w-5 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {trip.pickup} → {trip.dropoff}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{trip.customerName}</span>
                        <span>•</span>
                        <span>{trip.distance}</span>
                        {trip.rating && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{trip.rating}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {trip.status === 'completed' ? (
                        <p className="font-semibold text-green-600">
                          +₱{trip.fare + (trip.tip || 0)}
                        </p>
                      ) : (
                        <p className="text-sm text-red-500">Cancelled</p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-300" />
                  </button>
                ))}
              </Card>
            </div>
          ))
        )}
      </div>

      {/* Date Filter Modal */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filter by Date"
      >
        <div className="space-y-2">
          {(['all', 'today', 'week', 'month'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setDateFilter(filter)
                setShowFilterModal(false)
              }}
              className={`w-full p-3 rounded-xl text-left flex items-center justify-between ${
                dateFilter === filter ? 'bg-primary-50 border-2 border-primary-600' : 'bg-gray-50'
              }`}
            >
              <span className={`font-medium ${dateFilter === filter ? 'text-primary-600' : 'text-gray-900'}`}>
                {filter === 'all' ? 'All Time' : filter === 'today' ? 'Today' : filter === 'week' ? 'This Week' : 'This Month'}
              </span>
              {dateFilter === filter && (
                <div className="h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center">
                  <Calendar className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </Modal>

      {/* Trip Detail Modal */}
      <Modal
        isOpen={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
        title="Trip Details"
      >
        {selectedTrip && (
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center justify-center">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedTrip.status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {selectedTrip.status === 'completed' ? 'Completed' : 'Cancelled'}
              </span>
            </div>

            {/* Route */}
            <Card className="!bg-gray-50">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-3 w-3 rounded-full bg-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Pickup</p>
                    <p className="font-medium text-gray-900">{selectedTrip.pickup}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-3 w-3 rounded-full bg-red-500" />
                  <div>
                    <p className="text-xs text-gray-500">Dropoff</p>
                    <p className="font-medium text-gray-900">{selectedTrip.dropoff}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Customer</p>
                <p className="font-medium text-gray-900">{selectedTrip.customerName}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Type</p>
                <p className="font-medium text-gray-900 capitalize">{selectedTrip.type}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Distance</p>
                <p className="font-medium text-gray-900">{selectedTrip.distance}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Duration</p>
                <p className="font-medium text-gray-900">{selectedTrip.duration}</p>
              </div>
            </div>

            {/* Earnings Breakdown */}
            {selectedTrip.status === 'completed' && (
              <Card>
                <h4 className="font-medium text-gray-900 mb-3">Earnings</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Base Fare</span>
                    <span className="font-medium">₱{selectedTrip.fare}</span>
                  </div>
                  {selectedTrip.tip && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tip</span>
                      <span className="font-medium text-green-600">+₱{selectedTrip.tip}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="font-bold text-green-600">
                      ₱{selectedTrip.fare + (selectedTrip.tip || 0)}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Rating */}
            {selectedTrip.rating && (
              <div className="flex items-center justify-center gap-2 py-2">
                <span className="text-sm text-gray-600">Customer Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= selectedTrip.rating!
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <Button fullWidth variant="outline" onClick={() => setSelectedTrip(null)}>
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
