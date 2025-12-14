import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, Clock, ShoppingBag } from 'lucide-react'
import { Card, Badge, Spinner } from '@/components/ui'
import { GROCERY_CATEGORIES } from '@/types'

// Mock grocery stores for demo
const MOCK_STORES = [
  {
    id: 'store1',
    name: 'SM Supermarket',
    type: 'grocery',
    description: 'Your one-stop shop for groceries',
    logo: '',
    coverImage: '',
    categories: ['Supermarket'],
    rating: 4.5,
    totalOrders: 12500,
    deliveryFee: 69,
    minOrder: 500,
    estimatedDelivery: '45-60 min',
    isOpen: true,
    isFeatured: true,
    address: 'SM City Cotabato',
  },
  {
    id: 'store2',
    name: 'Puregold',
    type: 'grocery',
    description: 'Always fresh, always affordable',
    logo: '',
    coverImage: '',
    categories: ['Supermarket', 'Convenience'],
    rating: 4.3,
    totalOrders: 8500,
    deliveryFee: 59,
    minOrder: 300,
    estimatedDelivery: '30-45 min',
    isOpen: true,
    isFeatured: true,
    address: 'Puregold Cotabato',
  },
  {
    id: 'store3',
    name: 'Mercury Drug',
    type: 'pharmacy',
    description: 'Your trusted health partner',
    logo: '',
    coverImage: '',
    categories: ['Pharmacy', 'Personal Care'],
    rating: 4.7,
    totalOrders: 15000,
    deliveryFee: 49,
    minOrder: 200,
    estimatedDelivery: '20-30 min',
    isOpen: true,
    isFeatured: true,
    address: 'Mercury Drug Cotabato',
  },
  {
    id: 'store4',
    name: '7-Eleven',
    type: 'convenience',
    description: 'Open 24/7 for your convenience',
    logo: '',
    coverImage: '',
    categories: ['Convenience', 'Snacks'],
    rating: 4.1,
    totalOrders: 5000,
    deliveryFee: 39,
    minOrder: 100,
    estimatedDelivery: '15-25 min',
    isOpen: true,
    isFeatured: false,
    address: '7-Eleven Cotabato',
  },
  {
    id: 'store5',
    name: 'Pet Express',
    type: 'grocery',
    description: 'Everything for your furry friends',
    logo: '',
    coverImage: '',
    categories: ['Pet Supplies'],
    rating: 4.4,
    totalOrders: 2000,
    deliveryFee: 79,
    minOrder: 500,
    estimatedDelivery: '45-60 min',
    isOpen: true,
    isFeatured: false,
    address: 'Pet Express Cotabato',
  },
]

export default function GroceryHome() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'delivery' | 'distance'>('recommended')

  // In production, use the actual hook
  // const { merchants, isLoading } = useMerchants({ type: 'grocery' })
  const isLoading = false
  const stores = MOCK_STORES

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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Grocery</h1>
          <p className="text-sm text-gray-500">Get groceries delivered to you</p>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search stores or products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-gray-100 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="overflow-x-auto scrollbar-hide border-b">
          <div className="flex gap-2 px-4 pb-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                !selectedCategory
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {GROCERY_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedCategory === category.name
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="p-4 space-y-6">
          {/* Featured Stores */}
          {!searchQuery && !selectedCategory && featuredStores.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Featured Stores</h2>
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-3" style={{ width: 'max-content' }}>
                  {featuredStores.map((store) => (
                    <div
                      key={store.id}
                      onClick={() => navigate(`/grocery/store/${store.id}`)}
                      className="w-64 cursor-pointer"
                    >
                      <Card className="hover:shadow-md transition-shadow">
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
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Sort Options */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              {selectedCategory || 'All Stores'}
            </h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/grocery/store/${store.id}`)}
              >
                <div className="flex gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200">
                    <ShoppingBag className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{store.name}</h3>
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
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No stores found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
