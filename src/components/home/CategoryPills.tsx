import { useRef, useEffect } from 'react'
import {
  Coffee,
  Truck,
  Clock,
  Percent,
  Flag,
  Zap,
  CupSoda,
  Coins
} from 'lucide-react'
import { cn } from '@/utils/cn'

export interface Category {
  id: string
  label: string
  icon: typeof Coffee
  iconColor: string
}

const categories: Category[] = [
  { id: 'all', label: 'All', icon: Zap, iconColor: 'text-primary-600' },
  { id: 'merienda', label: 'Merienda', icon: Coffee, iconColor: 'text-amber-600' },
  { id: 'free-delivery', label: 'Free Delivery', icon: Truck, iconColor: 'text-green-600' },
  { id: 'under-30', label: 'Under 30 min', icon: Clock, iconColor: 'text-blue-600' },
  { id: 'promos', label: 'Promos', icon: Percent, iconColor: 'text-red-600' },
  { id: 'filipino', label: 'Filipino', icon: Flag, iconColor: 'text-yellow-600' },
  { id: 'fast-food', label: 'Fast Food', icon: Zap, iconColor: 'text-orange-600' },
  { id: 'coffee', label: 'Coffee & Tea', icon: CupSoda, iconColor: 'text-brown-600' },
  { id: 'budget', label: 'Budget Meals', icon: Coins, iconColor: 'text-emerald-600' }
]

interface CategoryPillsProps {
  selected: string
  onSelect: (categoryId: string) => void
  className?: string
}

export function CategoryPills({ selected, onSelect, className }: CategoryPillsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLButtonElement>(null)

  // Scroll selected pill into view
  useEffect(() => {
    if (selectedRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const pill = selectedRef.current
      const containerRect = container.getBoundingClientRect()
      const pillRect = pill.getBoundingClientRect()

      // Check if pill is not fully visible
      if (pillRect.left < containerRect.left || pillRect.right > containerRect.right) {
        pill.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    }
  }, [selected])

  return (
    <div
      ref={scrollContainerRef}
      className={cn(
        'flex gap-2 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-1',
        className
      )}
    >
      {categories.map((category) => {
        const isSelected = selected === category.id
        const Icon = category.icon

        return (
          <button
            key={category.id}
            ref={isSelected ? selectedRef : undefined}
            onClick={() => onSelect(category.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full transition-all snap-start shrink-0 whitespace-nowrap',
              isSelected
                ? 'border-2 border-primary-600 bg-primary-50/50 text-primary-600'
                : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4',
                isSelected ? 'text-primary-600' : 'text-gray-400'
              )}
            />
            <span className="text-sm font-medium">{category.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// Filter function to be used with restaurant data
export function filterByCategory<T extends {
  deliveryFee: number
  deliveryTime: string
  tags: string[]
}>(
  restaurants: T[],
  categoryId: string
): T[] {
  if (categoryId === 'all') return restaurants

  return restaurants.filter((restaurant) => {
    switch (categoryId) {
      case 'merienda':
        return restaurant.tags.some((tag) =>
          ['Snacks', 'Coffee', 'Dessert', 'Bakery'].includes(tag)
        )
      case 'free-delivery':
        return restaurant.deliveryFee === 0
      case 'under-30':
        return parseInt(restaurant.deliveryTime.split('-')[0]) <= 30
      case 'promos':
        return restaurant.deliveryFee === 0 // Simplified - would check promo field
      case 'filipino':
        return restaurant.tags.some((tag) =>
          ['Filipino', 'Local', 'Pinoy'].includes(tag)
        )
      case 'fast-food':
        return restaurant.tags.includes('Fast Food')
      case 'coffee':
        return restaurant.tags.some((tag) =>
          ['Coffee', 'Tea', 'Cafe'].includes(tag)
        )
      case 'budget':
        return true // Would filter by price range
      default:
        return true
    }
  })
}

export { categories }
