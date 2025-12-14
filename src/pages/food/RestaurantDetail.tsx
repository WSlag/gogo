import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  Check,
} from 'lucide-react'
import { Button, Card, Spinner, Badge, Modal } from '@/components/ui'
import { useMerchantDetail } from '@/hooks'
import { useCartStore } from '@/store/cartStore'
import type { Product, ProductOption, ProductAddon } from '@/types'

// Selected options and addons state
interface SelectedOptions {
  [optionName: string]: {
    choice: string
    price: number
  }
}

interface SelectedAddons {
  [addonName: string]: {
    selected: boolean
    price: number
  }
}

export default function RestaurantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { merchant, products, categories, isLoading, error } = useMerchantDetail(id || '')
  const { cart, addItem, updateQuantity } = useCartStore()

  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({})
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddons>({})
  const [specialInstructions, setSpecialInstructions] = useState('')

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [products, selectedCategory, searchQuery])

  // Group products by category
  const productsByCategory = useMemo(() => {
    const grouped: Record<string, Product[]> = {}
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

  const handleAddToCart = (product: Product) => {
    if (!merchant) return

    addItem(
      {
        productId: product.id,
        merchantId: merchant.id,
        name: product.name,
        price: product.salePrice || product.price,
        quantity: 1,
        image: product.image,
        total: product.salePrice || product.price,
      },
      merchant.id,
      merchant.name,
      merchant.type
    )
  }

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const currentQty = getCartQuantity(productId)
    updateQuantity(productId, currentQty + delta)
  }

  const openProductModal = (product: Product) => {
    setSelectedProduct(product)
    setQuantity(getCartQuantity(product.id) || 1)
    setSelectedOptions({})
    setSelectedAddons({})
    setSpecialInstructions('')

    // Pre-select required options with first choice
    if (product.options) {
      const initialOptions: SelectedOptions = {}
      product.options.forEach((option) => {
        if (option.required && option.choices.length > 0) {
          initialOptions[option.name] = {
            choice: option.choices[0].name,
            price: option.choices[0].price,
          }
        }
      })
      setSelectedOptions(initialOptions)
    }
  }

  // Calculate total price with options and addons
  const calculateItemTotal = () => {
    if (!selectedProduct) return 0

    let basePrice = selectedProduct.salePrice || selectedProduct.price

    // Add options prices
    Object.values(selectedOptions).forEach((option) => {
      basePrice += option.price
    })

    // Add addons prices
    Object.values(selectedAddons).forEach((addon) => {
      if (addon.selected) {
        basePrice += addon.price
      }
    })

    return basePrice * quantity
  }

  // Check if all required options are selected
  const areRequiredOptionsSelected = () => {
    if (!selectedProduct?.options) return true

    return selectedProduct.options
      .filter((option) => option.required)
      .every((option) => selectedOptions[option.name])
  }

  const handleOptionSelect = (optionName: string, choice: string, price: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: { choice, price },
    }))
  }

  const handleAddonToggle = (addonName: string, price: number) => {
    setSelectedAddons((prev) => ({
      ...prev,
      [addonName]: {
        selected: !prev[addonName]?.selected,
        price,
      },
    }))
  }

  const handleAddFromModal = () => {
    if (!selectedProduct || !merchant) return
    if (!areRequiredOptionsSelected()) return

    // Build options array for cart
    const options = Object.entries(selectedOptions).map(([name, data]) => ({
      name,
      choice: data.choice,
      price: data.price,
    }))

    // Build addons array for cart
    const addons = Object.entries(selectedAddons)
      .filter(([, data]) => data.selected)
      .map(([name, data]) => ({
        name,
        price: data.price,
      }))

    // Calculate item price including options and addons
    let itemPrice = selectedProduct.salePrice || selectedProduct.price
    options.forEach((opt) => (itemPrice += opt.price))
    addons.forEach((addon) => (itemPrice += addon.price))

    // Generate a unique ID if product has options/addons
    const hasCustomization = options.length > 0 || addons.length > 0 || specialInstructions
    const productId = hasCustomization
      ? `${selectedProduct.id}_${Date.now()}`
      : selectedProduct.id

    addItem(
      {
        productId,
        merchantId: merchant.id,
        name: selectedProduct.name,
        price: itemPrice,
        quantity: quantity,
        image: selectedProduct.image,
        options: options.length > 0 ? options : undefined,
        addons: addons.length > 0 ? addons : undefined,
        specialInstructions: specialInstructions || undefined,
        total: itemPrice * quantity,
      },
      merchant.id,
      merchant.name,
      merchant.type
    )

    setSelectedProduct(null)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !merchant) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4">
        <p className="text-gray-500">Restaurant not found</p>
        <Button className="mt-4" onClick={() => navigate('/food')}>
          Back to Food
        </Button>
      </div>
    )
  }

  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0
  const cartTotal = cart?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Image */}
      <div className="relative h-48 bg-gray-200">
        {merchant.coverImage ? (
          <img
            src={merchant.coverImage}
            alt={merchant.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl">🍽️</span>
          </div>
        )}

        {/* Header Buttons */}
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

      {/* Restaurant Info */}
      <div className="bg-white px-4 py-4 -mt-4 rounded-t-3xl relative">
        <div className="flex items-start gap-3">
          {merchant.logo ? (
            <img
              src={merchant.logo}
              alt={merchant.name}
              className="h-16 w-16 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-100 text-2xl">
              🍽️
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{merchant.name}</h1>
            <p className="text-sm text-gray-500 line-clamp-1">{merchant.description}</p>
            <div className="mt-2 flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{merchant.rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{merchant.estimatedDelivery}</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500">₱{merchant.deliveryFee} delivery</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-2">
          {merchant.categories.map((category) => (
            <Badge key={category} variant="secondary" size="sm">
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu..."
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
                  ? 'bg-primary-600 text-white'
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
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 py-4 space-y-6">
        {Object.entries(productsByCategory).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-lg font-bold text-gray-900 mb-3">{category}</h2>
            <div className="space-y-3">
              {items.map((product) => {
                const cartQty = getCartQuantity(product.id)
                return (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => openProductModal(product)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                          {product.description}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          {product.salePrice ? (
                            <>
                              <span className="font-semibold text-primary-600">
                                ₱{product.salePrice}
                              </span>
                              <span className="text-sm text-gray-400 line-through">
                                ₱{product.price}
                              </span>
                            </>
                          ) : (
                            <span className="font-semibold text-gray-900">
                              ₱{product.price}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="relative">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100 text-2xl">
                            🍴
                          </div>
                        )}
                        {/* Add/Update Button */}
                        <div
                          className="absolute -bottom-2 -right-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {cartQty > 0 ? (
                            <div className="flex items-center gap-1 rounded-full bg-primary-600 px-2 py-1">
                              <button
                                onClick={() => handleUpdateQuantity(product.id, -1)}
                                className="p-0.5"
                              >
                                <Minus className="h-4 w-4 text-white" />
                              </button>
                              <span className="text-sm font-medium text-white min-w-[1.5rem] text-center">
                                {cartQty}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(product.id, 1)}
                                className="p-0.5"
                              >
                                <Plus className="h-4 w-4 text-white" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow-md"
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No items found</p>
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
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <span>{cartItemCount} items</span>
            </div>
            <span>₱{cartTotal.toFixed(2)}</span>
          </Button>
        </div>
      )}

      {/* Product Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.name || ''}
      >
        {selectedProduct && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {selectedProduct.image && (
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <p className="text-gray-600">{selectedProduct.description}</p>
            <div className="flex items-center gap-2">
              {selectedProduct.salePrice ? (
                <>
                  <span className="text-xl font-bold text-primary-600">
                    ₱{selectedProduct.salePrice}
                  </span>
                  <span className="text-gray-400 line-through">
                    ₱{selectedProduct.price}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-gray-900">
                  ₱{selectedProduct.price}
                </span>
              )}
            </div>

            {/* Product Options */}
            {selectedProduct.options && selectedProduct.options.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                {selectedProduct.options.map((option) => (
                  <div key={option.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{option.name}</span>
                      {option.required && (
                        <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {option.choices.map((choice) => {
                        const isSelected = selectedOptions[option.name]?.choice === choice.name
                        return (
                          <button
                            key={choice.name}
                            onClick={() => handleOptionSelect(option.name, choice.name, choice.price)}
                            className={`flex w-full items-center justify-between rounded-lg border p-3 transition ${
                              isSelected
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                              }`}>
                                {isSelected && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <span className={isSelected ? 'font-medium text-primary-600' : 'text-gray-700'}>
                                {choice.name}
                              </span>
                            </div>
                            {choice.price > 0 && (
                              <span className="text-sm text-gray-500">+₱{choice.price}</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Product Addons */}
            {selectedProduct.addons && selectedProduct.addons.length > 0 && (
              <div className="border-t pt-4">
                <span className="font-semibold text-gray-900 block mb-2">Add-ons</span>
                <div className="space-y-2">
                  {selectedProduct.addons.filter(addon => addon.isAvailable).map((addon) => {
                    const isSelected = selectedAddons[addon.name]?.selected
                    return (
                      <button
                        key={addon.name}
                        onClick={() => handleAddonToggle(addon.name, addon.price)}
                        className={`flex w-full items-center justify-between rounded-lg border p-3 transition ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                            isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className={isSelected ? 'font-medium text-primary-600' : 'text-gray-700'}>
                            {addon.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">+₱{addon.price}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div className="border-t pt-4">
              <span className="font-semibold text-gray-900 block mb-2">Special Instructions</span>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="E.g., No onions, extra spicy, etc."
                className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                rows={2}
              />
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between border rounded-lg p-3">
              <span className="font-medium">Quantity</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-semibold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              onClick={handleAddFromModal}
              disabled={!areRequiredOptionsSelected()}
            >
              Add to Cart - ₱{calculateItemTotal().toFixed(2)}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
