import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  Clock,
  Heart,
  Share2,
  Search,
  Plus,
  Minus,
  ShoppingBag,
} from 'lucide-react'
import { Button, Card, Spinner, Badge } from '@/components/ui'
import { useCartStore } from '@/store/cartStore'

// Mock store data
const MOCK_STORE = {
  id: 'store1',
  name: 'SM Supermarket',
  type: 'grocery',
  description: 'Your one-stop shop for groceries, fresh produce, and household items',
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
}

// Mock products
const MOCK_PRODUCTS = [
  // Fruits & Vegetables
  { id: 'p1', name: 'Banana (1kg)', description: 'Fresh local bananas', price: 60, category: 'Fruits & Vegetables', image: '' },
  { id: 'p2', name: 'Apple Red (1kg)', description: 'Imported red apples', price: 180, category: 'Fruits & Vegetables', image: '' },
  { id: 'p3', name: 'Tomatoes (500g)', description: 'Fresh local tomatoes', price: 45, category: 'Fruits & Vegetables', image: '' },
  { id: 'p4', name: 'Carrots (500g)', description: 'Fresh carrots', price: 35, category: 'Fruits & Vegetables', image: '' },
  // Meat & Seafood
  { id: 'p5', name: 'Chicken Breast (1kg)', description: 'Fresh chicken breast', price: 220, category: 'Meat & Seafood', image: '' },
  { id: 'p6', name: 'Pork Belly (1kg)', description: 'Fresh pork belly', price: 350, category: 'Meat & Seafood', image: '' },
  { id: 'p7', name: 'Tilapia (1kg)', description: 'Fresh tilapia', price: 140, category: 'Meat & Seafood', image: '' },
  // Dairy & Eggs
  { id: 'p8', name: 'Fresh Milk 1L', description: 'Alaska Fresh Milk', price: 95, category: 'Dairy & Eggs', image: '' },
  { id: 'p9', name: 'Eggs (12pcs)', description: 'Fresh eggs', price: 120, category: 'Dairy & Eggs', image: '' },
  { id: 'p10', name: 'Cheese Slices', description: 'Eden cheese slices', price: 85, category: 'Dairy & Eggs', image: '' },
  // Beverages
  { id: 'p11', name: 'Coca-Cola 1.5L', description: 'Coca-Cola Original', price: 65, category: 'Beverages', image: '' },
  { id: 'p12', name: 'Nestle Pure Life 1L', description: 'Mineral water', price: 25, category: 'Beverages', image: '' },
  { id: 'p13', name: 'Nescafe 3in1 (10pcs)', description: 'Instant coffee', price: 120, category: 'Beverages', image: '' },
  // Snacks
  { id: 'p14', name: 'Piattos Cheese', description: 'Potato chips', price: 35, category: 'Snacks', image: '' },
  { id: 'p15', name: 'Oreo Original', description: 'Chocolate cookies', price: 45, category: 'Snacks', image: '' },
  // Household
  { id: 'p16', name: 'Tide Powder 1kg', description: 'Laundry detergent', price: 180, category: 'Household', image: '' },
  { id: 'p17', name: 'Joy Dishwashing 500ml', description: 'Dishwashing liquid', price: 95, category: 'Household', image: '' },
]

export default function StoreDetail() {
  const navigate = useNavigate()
  const { cart, addItem, updateQuantity } = useCartStore()

  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  // In production, fetch from Firebase
  const store = MOCK_STORE
  const products = MOCK_PRODUCTS
  const isLoading = false

  const categories = [...new Set(products.map((p) => p.category))]

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [products, selectedCategory, searchQuery])

  const productsByCategory = useMemo(() => {
    const grouped: Record<string, typeof products> = {}
    filteredProducts.forEach((product) => {
      const category = product.category || 'Other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(product)
    })
    return grouped
  }, [filteredProducts])

  const getCartQuantity = (productId: string) => {
    const item = cart?.items.find((i) => i.productId === productId)
    return item?.quantity || 0
  }

  const handleAddToCart = (product: typeof MOCK_PRODUCTS[0]) => {
    addItem(
      {
        productId: product.id,
        merchantId: store.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        total: product.price,
        image: product.image,
      },
      store.id,
      store.name,
      'grocery'
    )
  }

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const currentQty = getCartQuantity(productId)
    updateQuantity(productId, currentQty + delta)
  }

  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0
  const cartTotal = cart?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="relative h-40 bg-gradient-to-br from-green-500 to-green-700">
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
              <Heart className="h-5 w-5" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Store Info */}
      <div className="bg-white px-4 py-4 -mt-6 rounded-t-3xl relative">
        <div className="flex items-start gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-green-100">
            <ShoppingBag className="h-8 w-8 text-green-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
            <p className="text-sm text-gray-500 line-clamp-1">{store.description}</p>
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
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Badge variant="secondary">Min. ₱{store.minOrder}</Badge>
          {store.categories.map((cat) => (
            <Badge key={cat} variant="secondary">{cat}</Badge>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-gray-100 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-4 py-3">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedCategory === 'All'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedCategory === category
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="px-4 py-4 space-y-6">
        {Object.entries(productsByCategory).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-lg font-bold text-gray-900 mb-3">{category}</h2>
            <div className="grid grid-cols-2 gap-3">
              {items.map((product) => {
                const cartQty = getCartQuantity(product.id)
                return (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="h-24 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center -mx-4 -mt-4 mb-3">
                      <span className="text-3xl">🛒</span>
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{product.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-semibold text-gray-900">₱{product.price}</span>
                      {cartQty > 0 ? (
                        <div className="flex items-center gap-1 rounded-full bg-green-600 px-2 py-1">
                          <button
                            onClick={() => handleUpdateQuantity(product.id, -1)}
                            className="p-0.5"
                          >
                            <Minus className="h-3 w-3 text-white" />
                          </button>
                          <span className="text-xs font-medium text-white min-w-[1rem] text-center">
                            {cartQty}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(product.id, 1)}
                            className="p-0.5"
                          >
                            <Plus className="h-3 w-3 text-white" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-white"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No products found</p>
          </div>
        )}
      </div>

      {/* Cart Footer */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-safe">
          <Button
            fullWidth
            size="lg"
            onClick={() => navigate('/cart')}
            className="bg-green-600 hover:bg-green-700 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <span>{cartItemCount} items</span>
            </div>
            <span>₱{cartTotal.toFixed(2)}</span>
          </Button>
        </div>
      )}
    </div>
  )
}
