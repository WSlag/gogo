import { useNavigate } from 'react-router-dom'
import { MapPin, ArrowUpDown, Calendar } from 'lucide-react'
import { useRideStore } from '@/store'
import { cn } from '@/utils/cn'
import { MapView } from './MapView'
import { VehicleTypeSelector } from './VehicleTypeSelector'

interface RideBookingCardProps {
  className?: string
  compact?: boolean
}

export default function RideBookingCard({ className, compact = false }: RideBookingCardProps) {
  const navigate = useNavigate()
  const { pickup, dropoff, vehicleType, setVehicleType, setPickup, setDropoff } = useRideStore()

  const handleLocationClick = (type: 'pickup' | 'dropoff') => {
    navigate(`/rides/location?type=${type}`)
  }

  const handleSwapLocations = () => {
    if (pickup && dropoff) {
      const tempPickup = pickup
      setPickup(dropoff)
      setDropoff(tempPickup)
    }
  }

  const handleBookNow = () => {
    navigate('/rides')
  }

  const handleSchedule = () => {
    navigate('/rides?schedule=true')
  }

  if (compact) {
    return (
      <div className={cn('rounded-2xl shadow-md border border-gray-200 overflow-hidden bg-white', className)}>
        {/* Compact header */}
        <div className="p-4 pb-3">
          <h3 className="text-primary-600 font-bold text-sm tracking-wide mb-3">
            BOOK RIDE
          </h3>

          {/* Location inputs */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1 py-1">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <div className="w-0.5 h-6 bg-gray-300" />
              <MapPin className="h-4 w-4 text-red-500" />
            </div>

            <div className="flex-1 space-y-2">
              <button
                onClick={() => handleLocationClick('pickup')}
                className="w-full text-left"
              >
                <span
                  className={cn(
                    'text-sm',
                    pickup ? 'text-gray-900 font-medium' : 'text-blue-600'
                  )}
                >
                  {pickup?.address || 'Pick up location'}
                </span>
              </button>

              <button
                onClick={() => handleLocationClick('dropoff')}
                className="w-full text-left"
              >
                <span
                  className={cn(
                    'text-sm',
                    dropoff ? 'text-gray-900 font-medium' : 'text-blue-600'
                  )}
                >
                  {dropoff?.address || 'Drop off location'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Map */}
        <MapView
          pickup={pickup}
          dropoff={dropoff}
          className="h-[200px]"
          interactive
          onMapClick={() => navigate('/rides')}
        />
      </div>
    )
  }

  return (
    <div className={cn('rounded-b-xl shadow-md border border-gray-200 overflow-hidden bg-white', className)}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h3 className="text-primary-600 font-bold text-sm tracking-wide">
          BOOK A RIDE
        </h3>
      </div>

      {/* Location inputs */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3">
          {/* Route dots */}
          <div className="flex flex-col items-center py-1">
            <div className="h-3.5 w-3.5 rounded-full bg-green-500 ring-4 ring-green-100" />
            <div className="w-0.5 h-8 bg-gray-200 my-1" />
            <MapPin className="h-5 w-5 text-red-500" />
          </div>

          {/* Input fields */}
          <div className="flex-1 space-y-2">
            {/* Pickup */}
            <button
              onClick={() => handleLocationClick('pickup')}
              className={cn(
                'w-full flex items-center px-4 py-3 rounded-lg border transition-all text-left',
                pickup
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-primary-200 bg-primary-50'
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">Pick up</p>
                <p
                  className={cn(
                    'text-sm font-medium truncate',
                    pickup ? 'text-gray-900' : 'text-primary-600'
                  )}
                >
                  {pickup?.details || pickup?.address || 'Use current location'}
                </p>
              </div>
            </button>

            {/* Dropoff */}
            <button
              onClick={() => handleLocationClick('dropoff')}
              className={cn(
                'w-full flex items-center px-4 py-3 rounded-lg border transition-all text-left',
                dropoff
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">Drop off</p>
                <p
                  className={cn(
                    'text-sm font-medium truncate',
                    dropoff ? 'text-gray-900' : 'text-gray-400'
                  )}
                >
                  {dropoff?.details || dropoff?.address || 'Where to?'}
                </p>
              </div>
            </button>
          </div>

          {/* Swap button */}
          <button
            onClick={handleSwapLocations}
            disabled={!pickup || !dropoff}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full transition-all',
              pickup && dropoff
                ? 'bg-gray-100 hover:bg-gray-200 active:scale-95'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
            )}
          >
            <ArrowUpDown className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Vehicle Type Selector */}
      <div className="px-4 pb-4">
        <p className="text-xs font-medium text-gray-500 mb-2">Vehicle Type</p>
        <VehicleTypeSelector
          selected={vehicleType}
          onSelect={setVehicleType}
        />
      </div>

      {/* Map Section */}
      <div className="relative h-[220px] lg:h-[260px]">
        <MapView
          pickup={pickup}
          dropoff={dropoff}
          showRoute={!!pickup && !!dropoff}
          interactive
          onMapClick={() => navigate('/rides')}
          className="h-full"
        />

      </div>

      {/* Action Buttons */}
      <div className="p-4 flex gap-3">
        <button
          onClick={handleSchedule}
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all"
        >
          <Calendar className="h-5 w-5" />
          Schedule
        </button>
        <button
          onClick={handleBookNow}
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 active:scale-[0.98] transition-all shadow-sm"
        >
          Book Now
        </button>
      </div>
    </div>
  )
}
