import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MapPin, Navigation, Clock, ChevronRight, ChevronLeft } from 'lucide-react'
import { VEHICLE_TYPES, type VehicleType } from '@/types'
import { useRideStore } from '@/store'
import { useRequireAuth } from '@/hooks'
import { cn } from '@/utils/cn'
import { VehicleIcon } from '@/components/ui/VehicleIcon'

export default function RideHome() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialType = searchParams.get('type') as VehicleType | null
  const { checkAuthAndRedirect } = useRequireAuth()

  const {
    pickup,
    dropoff,
    vehicleType,
    setVehicleType,
  } = useRideStore()

  const [selectedType, setSelectedType] = useState<VehicleType>(
    initialType || vehicleType
  )

  const handleVehicleSelect = (type: VehicleType) => {
    setSelectedType(type)
    setVehicleType(type)
  }

  const handleLocationClick = (type: 'pickup' | 'dropoff') => {
    navigate(`/rides/location?type=${type}`)
  }

  const handleBookRide = () => {
    if (!pickup || !dropoff) return
    // Require authentication before proceeding to booking
    if (!checkAuthAndRedirect()) return
    navigate('/rides/confirm')
  }

  return (
    <div className="bg-white pb-32 lg:pb-8 page-content">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 lg:top-16">
        <div className="px-4 py-3 lg:px-8 lg:py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 lg:hidden"
            >
              <ChevronLeft className="h-6 w-6 text-gray-900" />
            </button>
            <h1 className="text-lg lg:text-2xl font-semibold lg:font-bold text-gray-900">Book a Ride</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
        {/* Location Inputs */}
        <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
          {/* Pickup */}
          <button
            onClick={() => handleLocationClick('pickup')}
            className="flex w-full items-center gap-3 p-4 transition-colors hover:bg-gray-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs text-gray-500">Pickup</p>
              <p className={cn(
                'font-medium',
                pickup ? 'text-gray-900' : 'text-gray-400'
              )}>
                {pickup?.address || 'Set pickup location'}
              </p>
            </div>
            <Navigation className="h-5 w-5 text-gray-400" />
          </button>

          {/* Dropoff */}
          <button
            onClick={() => handleLocationClick('dropoff')}
            className="flex w-full items-center gap-3 p-4 transition-colors hover:bg-gray-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <MapPin className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs text-gray-500">Drop-off</p>
              <p className={cn(
                'font-medium',
                dropoff ? 'text-gray-900' : 'text-gray-400'
              )}>
                {dropoff?.address || 'Where to?'}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Vehicle Types */}
        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            Choose your ride
          </h2>

          <div className="space-y-2">
            {VEHICLE_TYPES.map((vehicle) => (
              <button
                key={vehicle.type}
                onClick={() => handleVehicleSelect(vehicle.type)}
                className={cn(
                  'flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all',
                  selectedType === vehicle.type
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-100 hover:bg-gray-50'
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                  <VehicleIcon type={vehicle.icon as 'motorcycle' | 'car' | 'van' | 'truck' | 'plane'} size="lg" className="text-gray-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {vehicle.name}
                    </h3>
                    {vehicle.type === 'motorcycle' && (
                      <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                        Fastest
                      </span>
                    )}
                    {vehicle.type === 'airport' && (
                      <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">
                        Fixed Rate
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {vehicle.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Schedule Ride */}
        <button className="flex w-full items-center gap-3 rounded-xl border border-gray-100 p-4 text-left transition-colors hover:bg-gray-50">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Schedule for later</p>
            <p className="text-sm text-gray-500">
              Book a ride up to 7 days in advance
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>

        </div>
      </main>

      {/* Bottom CTA */}
      <div className="fixed bottom-20 left-0 right-0 border-t border-gray-100 bg-white p-4 lg:bottom-0 lg:left-52">
        <div className="max-w-3xl mx-auto">
        <button
          disabled={!pickup || !dropoff}
          onClick={handleBookRide}
          className={cn(
            'w-full rounded-xl py-4 text-base font-semibold transition-all',
            pickup && dropoff
              ? 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.99]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          {pickup && dropoff ? 'Confirm Booking' : 'Select locations'}
        </button>
        </div>
      </div>
    </div>
  )
}
