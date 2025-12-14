import { useNavigate } from 'react-router-dom'
import { ChevronRight, RotateCcw } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useRideStore } from '@/store'
import { GeoPoint } from 'firebase/firestore'
import type { VehicleType } from '@/types'

interface RecentRide {
  id: string
  pickup: {
    label: string
    address: string
    coordinates: GeoPoint
  }
  dropoff: {
    label: string
    address: string
    coordinates: GeoPoint
  }
  vehicleType: VehicleType
  fare: number
  date: string
}

// Mock data for recent rides - Cotabato City locations
const mockRecentRides: RecentRide[] = [
  {
    id: '1',
    pickup: {
      label: 'KCC Mall of Cotabato',
      address: '66CX+37P, Cotabato City',
      coordinates: new GeoPoint(7.2236, 124.2519)
    },
    dropoff: {
      label: 'Rosary Heights',
      address: 'Rosary Heights, Cotabato City',
      coordinates: new GeoPoint(7.2156, 124.2512)
    },
    vehicleType: 'car',
    fare: 85,
    date: 'Yesterday'
  },
  {
    id: '2',
    pickup: {
      label: 'CityMall Cotabato',
      address: 'Unit 157, Gov. Gutierrez Ave, Cotabato City',
      coordinates: new GeoPoint(7.2197, 124.2486)
    },
    dropoff: {
      label: 'Home',
      address: 'Poblacion VIII, Cotabato City',
      coordinates: new GeoPoint(7.2156, 124.2450)
    },
    vehicleType: 'motorcycle',
    fare: 50,
    date: '2 days ago'
  },
  {
    id: '3',
    pickup: {
      label: 'Awang Airport',
      address: 'Awang, Datu Odin Sinsuat',
      coordinates: new GeoPoint(7.1644, 124.2094)
    },
    dropoff: {
      label: 'Mall of Alnor Cotabato',
      address: 'Sinsuat Ave, Cotabato City',
      coordinates: new GeoPoint(7.2180, 124.2460)
    },
    vehicleType: 'airport',
    fare: 350,
    date: '3 days ago'
  }
]

interface RecentRidesProps {
  className?: string
  onSeeAll?: () => void
}

export function RecentRides({ className, onSeeAll }: RecentRidesProps) {
  const navigate = useNavigate()
  const { setPickup, setDropoff, setVehicleType } = useRideStore()

  const handleRebook = (ride: RecentRide) => {
    // Set pickup and dropoff from recent ride
    setPickup({
      address: ride.pickup.address,
      coordinates: ride.pickup.coordinates,
      details: ride.pickup.label
    })
    setDropoff({
      address: ride.dropoff.address,
      coordinates: ride.dropoff.coordinates,
      details: ride.dropoff.label
    })
    setVehicleType(ride.vehicleType)

    // Navigate to rides page
    navigate('/rides')
  }

  if (mockRecentRides.length === 0) {
    return null
  }

  return (
    <section className={cn('', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-900">Recent Rides</h2>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            See all
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Horizontal scroll container */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-1">
        {mockRecentRides.map((ride) => (
          <RecentRideCard
            key={ride.id}
            ride={ride}
            onRebook={() => handleRebook(ride)}
          />
        ))}
      </div>
    </section>
  )
}

interface RecentRideCardProps {
  ride: RecentRide
  onRebook: () => void
}

function RecentRideCard({ ride, onRebook }: RecentRideCardProps) {
  return (
    <div className="flex-shrink-0 w-[260px] snap-start rounded-xl border border-gray-100 bg-white p-3 shadow-card hover:shadow-card-hover transition-shadow">
      {/* Route */}
      <div className="flex items-start gap-2 mb-3">
        {/* Route dots - Simplified */}
        <div className="flex flex-col items-center pt-1">
          <div className="h-2 w-2 rounded-full bg-gray-400" />
          <div className="w-px h-5 bg-gray-200 my-1" />
          <div className="h-2 w-2 rounded-full bg-gray-600" />
        </div>

        {/* Addresses */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {ride.pickup.label}
          </p>
          <div className="h-3" />
          <p className="text-sm font-medium text-gray-900 truncate">
            {ride.dropoff.label}
          </p>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>{ride.date}</span>
        <span className="font-medium text-gray-700">₱{ride.fare}</span>
      </div>

      {/* Rebook button - Clean design */}
      <button
        onClick={onRebook}
        className="w-full flex items-center justify-center gap-2 h-9 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 active:scale-[0.98] transition-all"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Rebook
      </button>
    </div>
  )
}
