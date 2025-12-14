import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Clock } from 'lucide-react'
import RideBookingCard from '@/components/rides/RideBookingCard'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { StickySearchBar } from '@/components/layout/StickySearchBar'
import { RideGreeting } from '@/components/home/TimeBasedGreeting'
import { QuickServicesGrid } from '@/components/home/QuickServicesGrid'
import { CategoryPills, filterByCategory } from '@/components/home/CategoryPills'
import { PromoCarousel } from '@/components/home/PromoCarousel'
import { TrendingSection } from '@/components/home/TrendingSection'
import { RecentRides } from '@/components/rides/RecentRides'

// Restaurant data with enhanced fields
const featuredRestaurants = [
  {
    id: '1',
    name: 'Jollibee',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop',
    rating: 4.8,
    deliveryTime: '15-25',
    deliveryFee: 0,
    tags: ['Fast Food', 'Chicken'],
    priceRange: 1,
    orderCount: 1234,
    trending: true
  },
  {
    id: '2',
    name: 'Mang Inasal',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop',
    rating: 4.6,
    deliveryTime: '20-30',
    deliveryFee: 29,
    tags: ['Filipino', 'Chicken'],
    priceRange: 1,
    orderCount: 892,
    trending: true
  },
  {
    id: '3',
    name: "McDonald's",
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    rating: 4.7,
    deliveryTime: '15-25',
    deliveryFee: 0,
    tags: ['Fast Food', 'Burgers'],
    priceRange: 1,
    orderCount: 756,
    trending: false
  },
  {
    id: '4',
    name: 'Chowking',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    rating: 4.5,
    deliveryTime: '20-30',
    deliveryFee: 39,
    tags: ['Chinese', 'Asian'],
    priceRange: 1,
    orderCount: 543,
    trending: false
  }
]

const allRestaurants = [
  ...featuredRestaurants,
  {
    id: '5',
    name: 'Tokyo Tokyo',
    image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&h=300&fit=crop',
    rating: 4.4,
    deliveryTime: '25-35',
    deliveryFee: 49,
    tags: ['Japanese', 'Asian'],
    priceRange: 2,
    orderCount: 321,
    trending: false
  },
  {
    id: '6',
    name: 'KFC',
    image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop',
    rating: 4.5,
    deliveryTime: '20-30',
    deliveryFee: 39,
    tags: ['Fast Food', 'Chicken'],
    priceRange: 1,
    orderCount: 678,
    trending: false
  },
  {
    id: '8',
    name: 'Goldilocks',
    image: 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=400&h=300&fit=crop',
    rating: 4.3,
    deliveryTime: '25-35',
    deliveryFee: 29,
    tags: ['Bakery', 'Snacks', 'Filipino'],
    priceRange: 1,
    orderCount: 289,
    trending: false
  }
]

export default function Home() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter restaurants based on category and search
  const filteredRestaurants = filterByCategory(allRestaurants, selectedCategory)
    .filter((r) =>
      searchQuery
        ? r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
        : true
    )

  // Check if it's merienda time (3pm - 6pm)
  const hour = new Date().getHours()
  const isMeriendaTime = hour >= 15 && hour < 18

  return (
    <div className="bg-gray-50 min-h-screen pb-20 lg:pb-0 page-content">
      {/* Mobile Header - Compact 48px */}
      <MobileHeader />

      {/* Sticky Search Bar - Shows/hides on scroll */}
      <StickySearchBar onSearch={setSearchQuery} />

      {/* Main Content */}
      <main>
        <div className="px-4 lg:px-6 pt-4 pb-4 max-w-7xl lg:mx-0">
          {/* Greeting Section */}
          <section className="mb-6">
            <RideGreeting userName="Juan" />
          </section>

          {/* === RIDE-FIRST HERO === */}
          {/* Ride Booking Card - Hero Section (60-70% viewport on mobile) */}
          <section className="mb-6">
            <RideBookingCard />
          </section>

          {/* Recent Rides - Quick Rebook */}
          <section className="mb-6">
            <RecentRides onSeeAll={() => navigate('/orders')} />
          </section>

          {/* Quick Services Grid - Secondary to Rides */}
          <section className="mb-6">
            <QuickServicesGrid />
          </section>

          {/* === FOOD & DISCOVERY SECTIONS === */}

          {/* Flash Deals Carousel */}
          <section className="mb-6">
            <PromoCarousel onSeeAll={() => navigate('/food?filter=promos')} />
          </section>

          {/* Category Pills - Dynamic Filtering */}
          <section className="mb-6">
            <CategoryPills
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </section>

          {/* Trending Section - Social Proof */}
          <section className="mb-6">
            <TrendingSection
              location="Cotabato City"
              onSeeAll={() => navigate('/food?filter=trending')}
            />
          </section>

          {/* Featured Restaurants Section */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Featured Near You</h2>
              <button
                onClick={() => navigate('/food')}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                See all
              </button>
            </div>

            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="flex lg:grid lg:grid-cols-4 gap-4 overflow-x-auto lg:overflow-visible hide-scrollbar snap-x snap-mandatory lg:snap-none pb-1 lg:pb-0">
              {featuredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onClick={() => navigate(`/food/restaurant/${restaurant.id}`)}
                  featured
                  showMerienda={isMeriendaTime}
                />
              ))}
            </div>
          </section>

          {/* All Restaurants - Filtered */}
          <section className="pb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {selectedCategory === 'all'
                ? 'All Restaurants'
                : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).replace('-', ' ')} Restaurants`}
            </h2>

            {filteredRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onClick={() => navigate(`/food/restaurant/${restaurant.id}`)}
                    showMerienda={isMeriendaTime}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No restaurants found for this category</p>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="mt-2 text-primary-600 font-semibold"
                >
                  View all restaurants
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

// Enhanced Restaurant Card with promo badges
interface RestaurantCardProps {
  restaurant: {
    id: string
    name: string
    image: string
    rating: number
    deliveryTime: string
    deliveryFee: number
    tags: string[]
    priceRange?: number
    orderCount?: number
    trending?: boolean
  }
  onClick: () => void
  featured?: boolean
  showMerienda?: boolean
}

function RestaurantCard({
  restaurant,
  onClick,
  featured,
  showMerienda
}: RestaurantCardProps) {
  const isMeriendaItem = restaurant.tags.some((tag) =>
    ['Snacks', 'Coffee', 'Dessert', 'Bakery', 'Cafe'].includes(tag)
  )

  if (featured) {
    return (
      <button
        onClick={onClick}
        className="group text-left transition-all active:scale-[0.98] flex-shrink-0 w-[180px] lg:w-auto snap-start"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-200 shadow-sm">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Single Badge - Priority: Free Delivery > Trending > Merienda */}
          <div className="absolute top-2 left-2">
            {restaurant.deliveryFee === 0 ? (
              <span className="badge-subtle badge-subtle-success">
                Free Delivery
              </span>
            ) : restaurant.trending ? (
              <span className="badge-subtle">
                Trending
              </span>
            ) : showMerienda && isMeriendaItem ? (
              <span className="badge-subtle badge-subtle-warning">
                Merienda
              </span>
            ) : null}
          </div>
        </div>

        {/* Info */}
        <div className="mt-2.5 px-0.5">
          <h3 className="font-bold text-sm text-gray-900 group-hover:text-primary-600 truncate">
            {restaurant.name}
          </h3>
          <p className="mt-0.5 text-sm text-gray-500 truncate">
            {restaurant.tags.slice(0, 2).join(' · ')}
          </p>
          <div className="mt-1.5 flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1 font-semibold text-gray-900">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {restaurant.rating}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {restaurant.deliveryTime} min
            </span>
          </div>
        </div>
      </button>
    )
  }

  // List card style - Clean variant
  return (
    <button
      onClick={onClick}
      className="flex w-full gap-4 rounded-2xl bg-white p-4 text-left shadow-card transition-all hover:shadow-card-hover active:scale-[0.99] border border-gray-100"
    >
      {/* Image */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-200">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="h-full w-full object-cover"
        />
        {/* Single badge - Priority: Free Delivery > Merienda */}
        {restaurant.deliveryFee === 0 ? (
          <span className="absolute left-1.5 top-1.5 badge-subtle badge-subtle-success">
            Free
          </span>
        ) : showMerienda && isMeriendaItem ? (
          <span className="absolute left-1.5 top-1.5 badge-subtle badge-subtle-warning">
            Merienda
          </span>
        ) : null}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-center min-w-0">
        <h3 className="font-bold text-gray-900 truncate">{restaurant.name}</h3>
        <p className="mt-1 text-sm text-gray-500 truncate">
          {restaurant.tags.join(' · ')}
        </p>
        <div className="mt-2 flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1 font-semibold text-gray-900">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {restaurant.rating}
          </span>
          <span className="flex items-center gap-1 text-gray-500">
            <Clock className="h-4 w-4" />
            {restaurant.deliveryTime} min
          </span>
        </div>
      </div>
    </button>
  )
}

// Skeleton loading component for restaurant cards
export function RestaurantCardSkeleton({ featured }: { featured?: boolean }) {
  if (featured) {
    return (
      <div className="animate-pulse flex-shrink-0 w-[180px] lg:w-auto">
        <div className="aspect-[4/3] rounded-xl bg-gray-200" />
        <div className="mt-2.5 px-0.5 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="flex gap-3">
            <div className="h-3 bg-gray-200 rounded w-12" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100 animate-pulse">
      <div className="h-24 w-24 shrink-0 rounded-xl bg-gray-200" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="flex gap-3">
          <div className="h-3 bg-gray-200 rounded w-12" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  )
}
