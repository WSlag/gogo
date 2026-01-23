import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, RotateCcw } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useRideStore } from '@/store'
import { GeoPoint, Timestamp } from 'firebase/firestore'
import type { VehicleType, Ride } from '@/types'
import { useRide } from '@/hooks/useRide'
import { useAuthStore } from '@/store/authStore'

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

function formatRelativeDate(timestamp: Timestamp | undefined): string {
  if (!timestamp) return ''
  const date = timestamp.toDate()
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

function rideToRecentRide(ride: Ride): RecentRide {
  return {
    id: ride.id,
    pickup: {
      label: ride.pickup.details || ride.pickup.address.split(',')[0],
      address: ride.pickup.address,
      coordinates: ride.pickup.coordinates,
    },
    dropoff: {
      label: ride.dropoff.details || ride.dropoff.address.split(',')[0],
      address: ride.dropoff.address,
      coordinates: ride.dropoff.coordinates,
    },
    vehicleType: ride.vehicleType,
    fare: ride.fare.total,
    date: formatRelativeDate(ride.completedAt || ride.createdAt),
  }
}

interface RecentRidesProps {
  className?: string
  onSeeAll?: () => void
}

export function RecentRides({ className, onSeeAll }: RecentRidesProps) {
  const navigate = useNavigate()
  const { setPickup, setDropoff, setVehicleType } = useRideStore()
  const { user } = useAuthStore()
  const { getRideHistory } = useRide()
  const [recentRides, setRecentRides] = useState<RecentRide[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchRides = async () => {
      try {
        const rides = await getRideHistory(5)
        const completed = rides
          .filter(r => r.status === 'completed')
          .slice(0, 3)
          .map(rideToRecentRide)
        setRecentRides(completed)
      } catch (error) {
        console.error('Error fetching recent rides:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRides()
  }, [user])

  const handleRebook = (ride: RecentRide) => {
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
    navigate('/rides')
  }

  if (loading || recentRides.length === 0) {
    return null
  }

  return (
    <section className={cn('', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
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
      <div className="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-2">
        {recentRides.map((ride) => (
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
