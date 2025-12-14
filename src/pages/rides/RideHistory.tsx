import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, Star, ChevronRight } from 'lucide-react'
import { Card, Spinner, Button } from '@/components/ui'
import { VehicleIcon } from '@/components/ui/VehicleIcon'
import { useRide } from '@/hooks'
import type { Ride, VehicleType } from '@/types'

export default function RideHistory() {
  const navigate = useNavigate()
  const { getRideHistory } = useRide()
  const [rides, setRides] = useState<Ride[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true)
      const history = await getRideHistory(50)
      setRides(history)
      setIsLoading(false)
    }
    loadHistory()
  }, [getRideHistory])

  const formatDate = (date: Date | { toDate?: () => Date }) => {
    const d = date instanceof Date ? date : (date.toDate ? date.toDate() : new Date())
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (d.toDateString() === today.toDateString()) {
      return `Today, ${d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}`
    } else if (d.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}`
    } else {
      return d.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'cancelled':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getVehicleIcon = (type: VehicleType) => {
    switch (type) {
      case 'motorcycle':
        return 'motorcycle'
      case 'airport':
        return 'plane'
      case 'delivery':
      case 'happy_move':
        return 'truck'
      default:
        return 'car'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Ride History</h1>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-500">Loading ride history...</p>
          </div>
        ) : rides.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900">No rides yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your ride history will appear here
            </p>
            <Button
              className="mt-4"
              onClick={() => navigate('/rides')}
            >
              Book a Ride
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {rides.map((ride) => (
              <Card
                key={ride.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/rides/tracking/${ride.id}`)}
              >
                <div className="flex items-start gap-3">
                  {/* Vehicle Icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                    <VehicleIcon
                      type={getVehicleIcon(ride.vehicleType as VehicleType) as 'motorcycle' | 'car' | 'van' | 'truck' | 'plane'}
                      size="sm"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Date & Status */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">
                        {formatDate(ride.createdAt)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(ride.status)}`}>
                        {ride.status}
                      </span>
                    </div>

                    {/* Route */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <p className="text-sm text-gray-900 truncate">
                          {ride.pickup?.address || 'Pickup location'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-2 w-2 text-red-500" />
                        <p className="text-sm text-gray-900 truncate">
                          {ride.dropoff?.address || 'Dropoff location'}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">
                          ₱{ride.fare?.total?.toFixed(2) || '0.00'}
                        </span>
                        {ride.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm">{ride.rating}</span>
                          </div>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
