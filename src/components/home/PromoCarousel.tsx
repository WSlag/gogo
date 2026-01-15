import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Clock } from 'lucide-react'
import { cn } from '@/utils/cn'

interface FlashDeal {
  id: string
  restaurantId: string
  restaurantName: string
  image: string
  discount: string
  originalPrice?: number
  discountedPrice?: number
  endsIn: number // seconds
  tag?: string
}

// Mock flash deals data
const mockFlashDeals: FlashDeal[] = [
  {
    id: '1',
    restaurantId: '1',
    restaurantName: 'Jollibee',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop',
    discount: '30%',
    endsIn: 3600,
    tag: 'Best Seller'
  },
  {
    id: '2',
    restaurantId: '2',
    restaurantName: 'Mang Inasal',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop',
    discount: '25%',
    endsIn: 7200,
    tag: 'Popular'
  },
  {
    id: '3',
    restaurantId: '3',
    restaurantName: "McDonald's",
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    discount: 'Free Delivery',
    endsIn: 5400
  },
  {
    id: '4',
    restaurantId: '4',
    restaurantName: 'Chowking',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    discount: '₱50 off',
    endsIn: 1800,
    tag: 'Ending Soon'
  }
]

interface PromoCarouselProps {
  className?: string
  onSeeAll?: () => void
}

export function PromoCarousel({ className, onSeeAll }: PromoCarouselProps) {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [deals, setDeals] = useState(mockFlashDeals)

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setDeals((prev) =>
        prev.map((deal) => ({
          ...deal,
          endsIn: Math.max(0, deal.endsIn - 1)
        }))
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleDealClick = (deal: FlashDeal) => {
    navigate(`/food/restaurant/${deal.restaurantId}`)
  }

  return (
    <section className={cn('', className)}>
      {/* Header - Clean design */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-900">Flash Deals</h2>
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

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-1"
      >
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            onClick={() => handleDealClick(deal)}
          />
        ))}
      </div>
    </section>
  )
}

interface DealCardProps {
  deal: FlashDeal
  onClick: () => void
}

function DealCard({ deal, onClick }: DealCardProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const isEndingSoon = deal.endsIn < 1800 // Less than 30 minutes

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-[200px] snap-start rounded-xl overflow-hidden bg-white shadow-card border border-gray-100 hover:shadow-card-hover transition-shadow group"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={deal.image}
          alt={deal.restaurantName}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />

        {/* Discount badge - Clean subtle style */}
        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-primary-600 text-white">
          <span className="text-sm font-semibold">{deal.discount}</span>
        </div>

        {/* Gradient overlay - subtle */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Countdown timer - Clean design */}
        <div
          className={cn(
            'absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg',
            isEndingSoon ? 'bg-red-500/90' : 'bg-black/50'
          )}
        >
          <Clock className="h-3 w-3 text-white" />
          <span className="text-xs font-medium text-white">
            {formatTime(deal.endsIn)}
          </span>
        </div>
      </div>

      {/* Restaurant name */}
      <div className="p-4">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {deal.restaurantName}
        </p>
      </div>
    </button>
  )
}

// Simple promo banner for single promos
export function PromoBanner({
  title,
  description,
  gradient = 'from-primary-500 to-primary-600',
  onClick,
  className
}: {
  title: string
  description: string
  gradient?: string
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-xl bg-gradient-to-r p-4 text-left transition-all hover:opacity-95 active:scale-[0.99]',
        gradient,
        className
      )}
    >
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="text-sm text-white/90 mt-0.5">{description}</p>
    </button>
  )
}
