import { useNavigate } from 'react-router-dom'
import { ChevronRight, Star } from 'lucide-react'
import { cn } from '@/utils/cn'

interface TrendingRestaurant {
  id: string
  name: string
  image: string
  rating: number
  deliveryTime: string
  orderCount: number
  tags: string[]
  trending: boolean
}

// Mock trending data
const mockTrending: TrendingRestaurant[] = [
  {
    id: '1',
    name: 'Jollibee',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop',
    rating: 4.8,
    deliveryTime: '15-25',
    orderCount: 1234,
    tags: ['Fast Food', 'Chicken'],
    trending: true
  },
  {
    id: '2',
    name: 'Mang Inasal',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop',
    rating: 4.6,
    deliveryTime: '20-30',
    orderCount: 892,
    tags: ['Filipino', 'Chicken'],
    trending: true
  },
  {
    id: '3',
    name: "McDonald's",
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    rating: 4.7,
    deliveryTime: '15-25',
    orderCount: 756,
    tags: ['Fast Food', 'Burgers'],
    trending: true
  }
]

interface TrendingSectionProps {
  className?: string
  location?: string
  onSeeAll?: () => void
}

export function TrendingSection({
  className,
  location = 'Cotabato City',
  onSeeAll
}: TrendingSectionProps) {
  const navigate = useNavigate()

  const handleRestaurantClick = (id: string) => {
    navigate(`/food/restaurant/${id}`)
  }

  return (
    <section className={cn('', className)}>
      {/* Header - Clean design */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Trending in {location}</h2>
          <p className="text-xs text-gray-500">Popular right now</p>
        </div>
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

      {/* Trending list */}
      <div className="space-y-3">
        {mockTrending.map((restaurant, index) => (
          <TrendingCard
            key={restaurant.id}
            restaurant={restaurant}
            rank={index + 1}
            onClick={() => handleRestaurantClick(restaurant.id)}
          />
        ))}
      </div>
    </section>
  )
}

interface TrendingCardProps {
  restaurant: TrendingRestaurant
  rank: number
  onClick: () => void
}

function TrendingCard({ restaurant, rank, onClick }: TrendingCardProps) {
  const formatOrderCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-card hover:shadow-card-hover transition-all active:scale-[0.99]"
    >
      {/* Rank - Clean unified design */}
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 font-semibold text-xs text-gray-600">
        #{rank}
      </div>

      {/* Image - Clean without overlay icon */}
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-200">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 text-left">
        <h3 className="font-semibold text-gray-900 truncate">{restaurant.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            {restaurant.rating}
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-sm text-gray-500">
            {restaurant.deliveryTime} min
          </span>
        </div>
      </div>

      {/* Order count - Clean text only */}
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-gray-700">
          {formatOrderCount(restaurant.orderCount)}
        </p>
        <p className="text-[10px] text-gray-400">orders</p>
      </div>
    </button>
  )
}

// Compact horizontal scroll version - Clean design
export function TrendingHorizontal({
  className,
  location = 'Cotabato City'
}: {
  className?: string
  location?: string
}) {
  const navigate = useNavigate()

  return (
    <section className={cn('', className)}>
      <h2 className="text-base font-bold text-gray-900 mb-3">Trending in {location}</h2>

      <div className="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-1">
        {mockTrending.map((restaurant, index) => (
          <button
            key={restaurant.id}
            onClick={() => navigate(`/food/restaurant/${restaurant.id}`)}
            className="flex-shrink-0 w-[160px] snap-start"
          >
            <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-200">
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="h-full w-full object-cover"
              />
              {/* Rank badge - Clean */}
              <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm">
                <span className="text-xs font-semibold text-gray-700">#{index + 1}</span>
              </div>
            </div>
            <p className="mt-2 text-sm font-semibold text-gray-900 truncate">
              {restaurant.name}
            </p>
          </button>
        ))}
      </div>
    </section>
  )
}
