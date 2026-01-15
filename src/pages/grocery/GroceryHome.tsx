import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, Clock, ShoppingBag, ArrowLeft, RefreshCw, AlertCircle, Truck } from 'lucide-react'
import { Card, Badge, Spinner } from '@/components/ui'
import { GROCERY_CATEGORIES } from '@/types'
import { useMerchants } from '@/hooks/useMerchants'
import { cn } from '@/utils/cn'
import type { Merchant } from '@/types'

// Helper to get display values from merchant
const getStoreDisplay = (merchant: Merchant) => ({
  id: merchant.id,
  name: merchant.name,
  type: merchant.type || 'grocery',
  description: merchant.description || '',
  logo: merchant.logo || '',
  coverImage: merchant.coverImage || merchant.image || '',
  categories: merchant.categories || [merchant.category || 'Grocery'],
  rating: merchant.rating || 0,
  totalOrders: merchant.totalOrders || 0,
  deliveryFee: merchant.deliveryFee || 0,
  minOrder: merchant.minOrder || 0,
  estimatedDelivery: merchant.estimatedDelivery || merchant.deliveryTime || '30-45 min',
  isOpen: merchant.isOpen ?? true,
  isFeatured: merchant.isFeatured ?? false,
  address: merchant.address || '',
})

export default function GroceryHome() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'delivery' | 'distance'>('recommended')

  // Fetch grocery stores from Firebase
  const { merchants, isLoading, error, refetch } = useMerchants({ type: 'grocery' })
  const stores = merchants.map(getStoreDisplay)

  const filteredStores = useMemo(() => {
    let result = [...stores]

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (store) =>
          store.name.toLowerCase().includes(query) ||
          store.description.toLowerCase().includes(query) ||
          store.categories.some((c) => c.toLowerCase().includes(query))
      )
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter((store) =>
        store.categories.some((c) => c.toLowerCase() === selectedCategory.toLowerCase())
      )
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'delivery':
        result.sort((a, b) => a.deliveryFee - b.deliveryFee)
        break
      default:
        // Recommended: featured first, then by orders
        result.sort((a, b) => {
          if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1
          return b.totalOrders - a.totalOrders
        })
    }

    return result
  }, [stores, searchQuery, selectedCategory, sortBy])

  const featuredStores = stores.filter((s) => s.isFeatured)

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      {/* Mobile Header - DoorDash style */}
      <header className="sticky top-0 z-40 bg-white lg:hidden shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-900" />
            </button>

            {/* Search Input - Pill style */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search stores or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 w-full rounded-full bg-gray-100 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-500 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-green-300"
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

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Grocery</h1>
                <p className="text-sm text-gray-500">Get groceries delivered to you</p>
              </div>
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

      {/* Category Pills - Sticky below header */}
      <div className="sticky top-[68px] lg:top-16 z-30 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto lg:mx-0">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 lg:px-6 py-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all active:scale-95 ${
                !selectedCategory
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {GROCERY_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all active:scale-95 ${
                  selectedCategory === category.name
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-base">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && merchants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-500">Loading grocery stores...</p>
        </div>
      ) : error ? (
        /* Error State */
        <div className="p-4">
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Failed to load stores</h3>
            <p className="mt-1 text-sm text-gray-500 text-center max-w-xs">
              {error.message || 'Please check your connection and try again'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 rounded-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          {/* Info Banner */}
          {!searchQuery && !selectedCategory && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <Truck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Fresh Grocery Delivery</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Get fresh groceries delivered from local supermarkets and stores.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Featured Stores */}
          {!searchQuery && !selectedCategory && featuredStores.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Featured Stores</h2>
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-3" style={{ width: 'max-content' }}>
                  {featuredStores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => navigate(`/grocery/store/${store.id}`)}
                      className="w-64 text-left"
                    >
                      <Card className="hover:shadow-lg active:scale-[0.99] transition-all">
                        <div className="h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-lg mb-3 flex items-center justify-center">
                          <ShoppingBag className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 truncate">{store.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium">{store.rating}</span>
                          </div>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-500">{store.estimatedDelivery}</span>
                        </div>
                      </Card>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Sort Options */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {selectedCategory || 'All Stores'}
              </h2>
              <p className="text-sm text-gray-500">
                {filteredStores.length} store{filteredStores.length !== 1 ? 's' : ''} available
              </p>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Top Rated</option>
              <option value="delivery">Lowest Delivery Fee</option>
            </select>
          </div>

          {/* Store List */}
          <div className="space-y-3">
            {filteredStores.map((store) => (
              <Card
                key={store.id}
                className="group cursor-pointer hover:shadow-lg active:scale-[0.99] transition-all"
                onClick={() => navigate(`/grocery/store/${store.id}`)}
              >
                <div className="flex gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200">
                    <ShoppingBag className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">{store.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1">{store.description}</p>
                      </div>
                      {!store.isOpen && (
                        <Badge variant="secondary">Closed</Badge>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{store.rating}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{store.estimatedDelivery}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-500">₱{store.deliveryFee} delivery</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {store.categories.map((category) => (
                        <Badge key={category} variant="secondary" size="sm">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {filteredStores.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-4">
                  <ShoppingBag className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No stores found</h3>
                <p className="mt-1 text-sm text-gray-500 text-center max-w-xs">
                  {merchants.length === 0
                    ? 'No grocery stores available yet. Please seed the database first.'
                    : 'Try adjusting your search or filters to find what you\'re looking for'
                  }
                </p>
                <button
                  onClick={() => {
                    if (merchants.length === 0) {
                      refetch()
                    } else {
                      setSelectedCategory(null)
                      setSearchQuery('')
                    }
                  }}
                  className="mt-4 rounded-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                >
                  {merchants.length === 0 ? 'Refresh' : 'Clear filters'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
