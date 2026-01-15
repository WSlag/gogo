import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, Clock, ArrowLeft, MapPin, RefreshCw, AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useMerchants } from '@/hooks/useMerchants'
import { Spinner } from '@/components/ui'
import type { Merchant } from '@/types'

// Category data - DoorDash style horizontal tabs
const categories = [
  { id: 'all', name: 'All', icon: '🍽️' },
  { id: 'fast-food', name: 'Fast Food', icon: '🍔' },
  { id: 'filipino', name: 'Filipino', icon: '🍖' },
  { id: 'chinese', name: 'Chinese', icon: '🥡' },
  { id: 'japanese', name: 'Japanese', icon: '🍱' },
  { id: 'korean', name: 'Korean', icon: '🥢' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' },
  { id: 'coffee', name: 'Coffee & Tea', icon: '☕' },
  { id: 'healthy', name: 'Healthy', icon: '🥗' },
]

// Sort options like DoorDash
const sortOptions = [
  { id: 'recommended', name: 'Recommended' },
  { id: 'rating', name: 'Rating' },
  { id: 'delivery-time', name: 'Delivery Time' },
  { id: 'distance', name: 'Distance' },
]

// Helper to get display values from merchant
const getRestaurantDisplay = (merchant: Merchant) => ({
  id: merchant.id,
  name: merchant.name,
  image: merchant.image || merchant.coverImage || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
  category: merchant.category || merchant.categories?.[0] || 'Restaurant',
  cuisine: merchant.cuisine || merchant.categories || [],
  rating: merchant.rating || 0,
  reviewCount: merchant.reviewCount || 0,
  deliveryTime: merchant.deliveryTime || merchant.estimatedDelivery || '25-35',
  deliveryFee: merchant.deliveryFee || 0,
  minOrder: merchant.minOrder || 0,
  promo: merchant.promo,
  isOpen: merchant.isOpen,
})

export default function FoodHome() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSort, setSelectedSort] = useState('recommended')

  // Fetch restaurants from Firebase
  const { merchants, isLoading, error, refetch } = useMerchants({ type: 'restaurant' })

  // Filter restaurants based on category and search
  const filteredRestaurants = merchants.filter((merchant) => {
    // Category filter
    if (selectedCategory !== 'all') {
      const categoryLower = (merchant.category || '').toLowerCase().replace(/\s+/g, '-')
      const categoriesLower = (merchant.categories || []).map(c => c.toLowerCase().replace(/\s+/g, '-'))
      const cuisineLower = (merchant.cuisine || []).map(c => c.toLowerCase().replace(/\s+/g, '-'))

      const categoryMatch =
        categoryLower === selectedCategory ||
        categoryLower.includes(selectedCategory) ||
        categoriesLower.some(c => c === selectedCategory || c.includes(selectedCategory)) ||
        cuisineLower.some(c => c === selectedCategory || c.includes(selectedCategory))

      if (!categoryMatch) return false
    }
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        merchant.name.toLowerCase().includes(query) ||
        (merchant.category || '').toLowerCase().includes(query) ||
        (merchant.categories || []).some(c => c.toLowerCase().includes(query)) ||
        (merchant.cuisine || []).some(c => c.toLowerCase().includes(query))
      )
    }
    return true
  }).map(getRestaurantDisplay)

  return (
    <div className="bg-gray-50 pb-16 lg:pb-0 page-content">
      {/* Mobile Header - Clean like DoorDash */}
      <header className="sticky top-0 z-40 bg-white lg:hidden shadow-sm">
        <div className="px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-900" />
            </button>

            {/* Search Input - Prominent rounded */}
            <div className="relative flex-1">
              {!searchQuery && (
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600" />
              )}
              <input
                type="text"
                placeholder="Search restaurants"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`h-12 w-full rounded-full bg-gray-100 ${searchQuery ? 'pl-4' : 'pl-12'} pr-4 text-sm text-gray-900 placeholder-gray-500 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-gray-300`}
              />
            </div>

            <button
              onClick={() => refetch()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className={cn("h-5 w-5 text-gray-700", isLoading && "animate-spin")} />
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Header - DoorDash style */}
      <header className="hidden lg:block bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Restaurants</h1>
              <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Delivering to Current Location
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Categories - Horizontal scroll with clean pills */}
      <div className="sticky top-[68px] lg:top-16 z-30 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto lg:mx-0">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar px-6 lg:px-8 py-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all active:scale-95',
                  selectedCategory === category.id
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                <span className="text-base">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sort Options - Desktop only, integrated with categories */}
      <div className="hidden lg:flex items-center gap-4 max-w-6xl mx-auto px-6 py-2 bg-gray-50">
        <span className="text-sm text-gray-500">Sort:</span>
        {sortOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedSort(option.id)}
            className={cn(
              'text-sm font-medium transition-colors',
              selectedSort === option.id
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {option.name}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="px-6 py-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Loading State */}
          {isLoading && merchants.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-500">Loading restaurants...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Failed to load restaurants</h3>
              <p className="mt-1 text-sm text-gray-500 text-center max-w-xs">
                {error.message || 'Please check your connection and try again'}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-4 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Results */}
          {!isLoading && !error && (
            <>
              {/* Results count */}
              <p className="mb-4 text-sm font-medium text-gray-600">
                {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} near you
              </p>

              {/* Restaurant Grid - DoorDash style cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRestaurants.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    onClick={() => navigate(`/food/restaurant/${restaurant.id}`)}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all active:scale-[0.99] text-left"
                  >
                    {/* Restaurant Image - Larger aspect ratio like DoorDash */}
                    <div className="relative aspect-[16/10] bg-gray-200 overflow-hidden">
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      {restaurant.deliveryFee === 0 && (
                        <span className="absolute left-3 top-3 rounded-md bg-green-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                          Free Delivery
                        </span>
                      )}
                      {restaurant.promo && restaurant.deliveryFee > 0 && (
                        <span className="absolute left-3 top-3 rounded-md bg-primary-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                          {restaurant.promo}
                        </span>
                      )}
                      {!restaurant.isOpen && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-900">
                            Currently Closed
                          </span>
                        </div>
                      )}
                      {/* Delivery time badge - DoorDash style bottom right */}
                      <span className="absolute right-3 bottom-3 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-md">
                        {restaurant.deliveryTime.replace(' min', '')} min
                      </span>
                    </div>

                    {/* Restaurant Info - Clean spacing */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {restaurant.name}
                        </h3>
                        {/* Rating badge - DoorDash style */}
                        <div className="flex items-center gap-1 shrink-0 bg-gray-100 rounded-md px-2 py-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold text-gray-900">{restaurant.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {restaurant.cuisine.slice(0, 2).join(' • ') || restaurant.category}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {restaurant.deliveryTime.replace(' min', '')} min
                        </span>
                        {restaurant.minOrder > 0 && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span>₱{restaurant.minOrder} min</span>
                          </>
                        )}
                        {restaurant.deliveryFee > 0 && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span>₱{restaurant.deliveryFee} fee</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Empty State - Clean and helpful */}
              {filteredRestaurants.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">No restaurants found</h3>
                  <p className="mt-1 text-sm text-gray-500 text-center max-w-xs">
                    {merchants.length === 0
                      ? 'No restaurants available yet. Please seed the database first.'
                      : 'Try adjusting your search or filters to find what you\'re looking for'
                    }
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all')
                      setSearchQuery('')
                    }}
                    className="mt-4 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
                  >
                    {merchants.length === 0 ? 'Refresh' : 'Clear filters'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
