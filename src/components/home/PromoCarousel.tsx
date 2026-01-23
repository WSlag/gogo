import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Clock } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useActivePromos, type Promo } from '@/hooks/usePromos'
import type { Timestamp } from 'firebase/firestore'

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

function promoToFlashDeal(promo: Promo): FlashDeal {
  const now = new Date()
  const validUntil = promo.validUntil && typeof (promo.validUntil as Timestamp).toDate === 'function'
    ? (promo.validUntil as Timestamp).toDate()
    : new Date(promo.validUntil as unknown as string)
  const endsIn = Math.max(0, Math.floor((validUntil.getTime() - now.getTime()) / 1000))

  let discount = ''
  if (promo.type === 'percentage') discount = `${promo.value}%`
  else if (promo.type === 'fixed') discount = `₱${promo.value} off`
  else if (promo.type === 'freeDelivery') discount = 'Free Delivery'

  let tag: string | undefined
  if (endsIn < 3600) tag = 'Ending Soon'
  else if (promo.minOrderAmount) tag = `Min ₱${promo.minOrderAmount}`

  return {
    id: promo.id,
    restaurantId: promo.merchantId || '',
    restaurantName: promo.merchantName || promo.title || promo.description || promo.code,
    image: promo.image || '',
    discount,
    endsIn,
    tag,
  }
}

interface PromoCarouselProps {
  className?: string
  onSeeAll?: () => void
}

export function PromoCarousel({ className, onSeeAll }: PromoCarouselProps) {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { data: promos, isLoading } = useActivePromos(6)
  const [deals, setDeals] = useState<FlashDeal[]>([])

  // Convert promos to flash deals when data loads
  useEffect(() => {
    if (promos && promos.length > 0) {
      setDeals(promos.map(promoToFlashDeal))
    }
  }, [promos])

  // Update countdown every second
  useEffect(() => {
    if (deals.length === 0) return

    const interval = setInterval(() => {
      setDeals((prev) =>
        prev.map((deal) => ({
          ...deal,
          endsIn: Math.max(0, deal.endsIn - 1)
        }))
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [deals.length])

  const handleDealClick = (deal: FlashDeal) => {
    navigate(`/food/restaurant/${deal.restaurantId}`)
  }

  if (!isLoading && deals.length === 0) {
    return null
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
