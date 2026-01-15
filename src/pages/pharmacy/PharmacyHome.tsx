import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, Clock, Pill, Heart, Shield, Truck, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react'
import { Card, Badge, Spinner } from '@/components/ui'
import { useMerchants } from '@/hooks'

const PHARMACY_CATEGORIES = [
  { id: 'medicines', name: 'Medicines', icon: '💊' },
  { id: 'vitamins', name: 'Vitamins', icon: '🌟' },
  { id: 'personal-care', name: 'Personal Care', icon: '🧴' },
  { id: 'baby-care', name: 'Baby Care', icon: '👶' },
  { id: 'medical-supplies', name: 'Medical Supplies', icon: '🩹' },
  { id: 'wellness', name: 'Wellness', icon: '🧘' },
]

export default function PharmacyHome() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'delivery' | 'distance'>('recommended')

  // Fetch pharmacies from Firebase
  const { merchants, isLoading, error, refetch } = useMerchants({ type: 'pharmacy' })

  // Transform merchants to match display format
  const pharmacies = merchants.map((m) => ({
    id: m.id,
    name: m.name,
    type: 'pharmacy',
    description: m.description || '',
    logo: m.logo || '',
    coverImage: m.coverImage || m.image || '',
    categories: m.categories || ['Pharmacy'],
    rating: m.rating || 0,
    totalOrders: m.reviewCount || 0,
    deliveryFee: m.deliveryFee || 0,
    minOrder: m.minOrder || 0,
    estimatedDelivery: m.estimatedDelivery || m.deliveryTime || '30-45 min',
    isOpen: m.isOpen ?? true,
    isFeatured: m.isFeatured ?? false,
    address: m.address || '',
    is24Hours: false,
  }))

  const filteredPharmacies = useMemo(() => {
    let result = [...pharmacies]

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (pharmacy) =>
          pharmacy.name.toLowerCase().includes(query) ||
          pharmacy.description.toLowerCase().includes(query) ||
          pharmacy.categories.some((c) => c.toLowerCase().includes(query))
      )
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter((pharmacy) =>
        pharmacy.categories.some((c) => c.toLowerCase() === selectedCategory.toLowerCase())
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
  }, [pharmacies, searchQuery, selectedCategory, sortBy])

  const featuredPharmacies = pharmacies.filter((p) => p.isFeatured)

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
              {!searchQuery && (
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              )}
              <input
                type="text"
                placeholder="Search medicines, vitamins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`h-12 w-full rounded-full bg-gray-100 ${searchQuery ? 'pl-4' : 'pl-12'} pr-4 text-sm text-gray-900 placeholder-gray-500 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary-300`}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Pill className="h-6 w-6 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pharmacy</h1>
                <p className="text-sm text-gray-500">Medicines & health essentials delivered</p>
              </div>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
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
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {PHARMACY_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all active:scale-95 ${
                  selectedCategory === category.name
                    ? 'bg-primary-600 text-white shadow-sm'
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

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="p-4">
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Failed to load pharmacies</h3>
            <p className="mt-1 text-sm text-gray-500 text-center max-w-xs">
              Please check your connection and try again
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 flex items-center gap-2 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          {/* Info Banner */}
          {!searchQuery && !selectedCategory && (
            <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-100">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary-100 p-2">
                  <Shield className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Safe & Secure Delivery</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    All medicines are sourced from licensed pharmacies and delivered with care.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Quick Actions */}
          {!searchQuery && !selectedCategory && (
            <div className="grid grid-cols-3 gap-3">
              <Card className="text-center cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="rounded-full bg-red-100 p-3">
                    <Heart className="h-5 w-5 text-red-500" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Prescription</span>
                </div>
              </Card>
              <Card className="text-center cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="rounded-full bg-green-100 p-3">
                    <Pill className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">OTC Meds</span>
                </div>
              </Card>
              <Card className="text-center cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="rounded-full bg-blue-100 p-3">
                    <Truck className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Express</span>
                </div>
              </Card>
            </div>
          )}

          {/* Featured Pharmacies */}
          {!searchQuery && !selectedCategory && featuredPharmacies.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Featured Pharmacies</h2>
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-3" style={{ width: 'max-content' }}>
                  {featuredPharmacies.map((pharmacy) => (
                    <button
                      key={pharmacy.id}
                      onClick={() => navigate(`/pharmacy/store/${pharmacy.id}`)}
                      className="w-64 text-left"
                    >
                      <Card className="hover:shadow-lg active:scale-[0.99] transition-all">
                        <div className="h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg mb-3 flex items-center justify-center">
                          <Pill className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 truncate">{pharmacy.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium">{pharmacy.rating}</span>
                          </div>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-500">{pharmacy.estimatedDelivery}</span>
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
            <h2 className="text-lg font-bold text-gray-900">
              {selectedCategory || 'All Pharmacies'}
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

          {/* Pharmacy List */}
          <div className="space-y-3">
            {filteredPharmacies.map((pharmacy) => (
              <Card
                key={pharmacy.id}
                className="group cursor-pointer hover:shadow-lg active:scale-[0.99] transition-all"
                onClick={() => navigate(`/pharmacy/store/${pharmacy.id}`)}
              >
                <div className="flex gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-200">
                    <Pill className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{pharmacy.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1">{pharmacy.description}</p>
                      </div>
                      {!pharmacy.isOpen && (
                        <Badge variant="secondary">Closed</Badge>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{pharmacy.rating}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{pharmacy.estimatedDelivery}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-500">₱{pharmacy.deliveryFee} delivery</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {pharmacy.categories.map((category) => (
                        <Badge key={category} variant="secondary" size="sm">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {filteredPharmacies.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-4">
                  <Pill className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No pharmacies found</h3>
                <p className="mt-1 text-sm text-gray-500 text-center max-w-xs">
                  Try adjusting your search or filters to find what you're looking for
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory(null)
                    setSearchQuery('')
                  }}
                  className="mt-4 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
