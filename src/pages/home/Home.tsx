import { useState, useEffect, useMemo } from 'react'
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
import { useAuthStore } from '@/store/authStore'
import { OnboardingDialog } from '@/components/onboarding/OnboardingDialog'
import { useMerchants } from '@/hooks/useMerchants'
import type { Merchant } from '@/types'

function merchantToCard(merchant: Merchant) {
  return {
    id: merchant.id,
    name: merchant.name,
    image: merchant.image || merchant.coverImage || merchant.logo || '',
    rating: merchant.rating || 0,
    deliveryTime: (merchant.deliveryTime || merchant.estimatedDelivery || '25-35').replace(' min', ''),
    deliveryFee: merchant.deliveryFee || 0,
    tags: merchant.categories || [],
    priceRange: merchant.priceRange ? merchant.priceRange.length : 1,
    orderCount: merchant.totalOrders || 0,
    trending: merchant.isFeatured,
  }
}

export default function Home() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { profile, isAuthenticated } = useAuthStore()

  const { merchants: featuredMerchants, isLoading: featuredLoading } = useMerchants({ isFeatured: true, limitCount: 4 })
  const { merchants: allMerchants, isLoading: allLoading } = useMerchants({ type: 'restaurant', limitCount: 20 })

  const featuredRestaurants = useMemo(() => featuredMerchants.map(merchantToCard), [featuredMerchants])
  const allRestaurants = useMemo(() => allMerchants.map(merchantToCard), [allMerchants])

  // Show onboarding dialog for new users
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('gogo-onboarding-seen')
    if (isAuthenticated && profile && !hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }, [isAuthenticated, profile])

  const handleOnboardingClose = () => {
    localStorage.setItem('gogo-onboarding-seen', 'true')
    setShowOnboarding(false)
  }

  // Get user's first name from profile, or use generic greeting when not authenticated
  const userName = isAuthenticated && profile?.firstName ? profile.firstName : 'there'

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
    <div className="bg-gray-50 min-h-screen pb-16 lg:pb-0 page-content">
      {/* Mobile Header - Compact 48px */}
      <MobileHeader />

      {/* Sticky Search Bar - Shows/hides on scroll */}
      <StickySearchBar onSearch={setSearchQuery} />

      {/* Main Content */}
      <main>
        <div className="px-6 lg:px-8 pt-6 pb-8 max-w-7xl lg:mx-0">
          {/* Greeting Section */}
          <section className="mb-6">
            <RideGreeting userName={userName} />
          </section>

          {/* === RIDE-FIRST HERO === */}
          {/* Ride Booking Card - Hero Section (60-70% viewport on mobile) */}
          <section className="mb-10">
            <RideBookingCard />
          </section>

          {/* Recent Rides - Quick Rebook */}
          <section className="mb-10">
            <RecentRides onSeeAll={() => navigate('/orders')} />
          </section>

          {/* Quick Services Grid - Secondary to Rides */}
          <section className="mb-10">
            <QuickServicesGrid />
          </section>

          {/* === FOOD & DISCOVERY SECTIONS === */}

          {/* Flash Deals Carousel */}
          <section className="mb-8">
            <PromoCarousel onSeeAll={() => navigate('/food?filter=promos')} />
          </section>

          {/* Category Pills - Dynamic Filtering */}
          <section className="mb-8">
            <CategoryPills
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </section>

          {/* Trending Section - Social Proof */}
          <section className="mb-8">
            <TrendingSection
              location="Cotabato City"
              onSeeAll={() => navigate('/food?filter=trending')}
            />
          </section>

          {/* Featured Restaurants Section */}
          <section className="mb-8">
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
              {featuredLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[180px] lg:w-auto animate-pulse">
                    <div className="aspect-[4/3] rounded-xl bg-gray-200" />
                    <div className="mt-2 h-4 bg-gray-200 rounded w-3/4" />
                    <div className="mt-1 h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                ))
              ) : featuredRestaurants.length > 0 ? (
                featuredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onClick={() => navigate(`/food/restaurant/${restaurant.id}`)}
                    featured
                    showMerienda={isMeriendaTime}
                  />
                ))
              ) : null}
            </div>
          </section>

          {/* All Restaurants - Filtered */}
          <section className="pb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {selectedCategory === 'all'
                ? 'All Restaurants'
                : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).replace('-', ' ')} Restaurants`}
            </h2>

            {allLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl overflow-hidden">
                    <div className="aspect-[16/9] bg-gray-200" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredRestaurants.length > 0 ? (
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

          {/* End of Feed Footer */}
          <section className="pt-8 pb-4 border-t border-gray-200 mt-8">
            <div className="text-center">
              {/* End of feed indicator */}
              <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
                <div className="h-px w-12 bg-gray-200" />
                <span className="text-sm">You're all caught up</span>
                <div className="h-px w-12 bg-gray-200" />
              </div>

              {/* CTA Button */}
              <button
                onClick={() => navigate('/food')}
                className="text-primary-600 font-semibold text-sm hover:text-primary-700"
              >
                Browse all restaurants
              </button>

              {/* Quick links */}
              <div className="flex justify-center gap-6 mt-6 text-xs text-gray-400">
                <button onClick={() => navigate('/account')} className="hover:text-gray-600">Help</button>
                <a href="#" className="hover:text-gray-600">Terms</a>
                <a href="#" className="hover:text-gray-600">Privacy</a>
              </div>

              {/* Branding */}
              <p className="mt-4 text-xs text-gray-300">
                GOGO Express
              </p>
            </div>
          </section>

        </div>
      </main>

      {/* Onboarding Dialog for new users */}
      <OnboardingDialog
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
      />
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
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
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
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
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
