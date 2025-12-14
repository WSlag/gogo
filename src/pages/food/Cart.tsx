import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Store,
  AlertCircle,
} from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { useCartStore } from '@/store/cartStore'
import { useRequireAuth } from '@/hooks'

export default function Cart() {
  const navigate = useNavigate()
  const { checkAuthAndRedirect } = useRequireAuth()
  const { cart, updateQuantity, removeItem, clearCart } = useCartStore()

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <ShoppingBag className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Your cart is empty</h2>
        <p className="mt-2 text-center text-gray-500">
          Add items from a restaurant to start your order
        </p>
        <Button className="mt-6" onClick={() => navigate('/food')}>
          Browse Restaurants
        </Button>
      </div>
    )
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const serviceFee = Math.round(subtotal * 0.05) // 5% service fee
  const total = subtotal + cart.deliveryFee + serviceFee

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">Cart</h1>
          </div>
          <button
            onClick={clearCart}
            className="rounded-full p-2 text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Restaurant Info */}
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50">
              <Store className="h-6 w-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{cart.merchantName}</h3>
              <p className="text-sm text-gray-500 capitalize">{cart.merchantType}</p>
            </div>
            <button
              onClick={() => navigate(`/food/restaurant/${cart.merchantId}`)}
              className="text-sm font-medium text-primary-600"
            >
              Add More
            </button>
          </div>
        </Card>

        {/* Cart Items */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.productId} className="flex gap-3">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-xl">
                    🍴
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  {item.options && item.options.length > 0 && (
                    <p className="text-xs text-gray-500">
                      {item.options.map((o) => `${o.name}: ${o.choice}`).join(', ')}
                    </p>
                  )}
                  {item.addons && item.addons.length > 0 && (
                    <p className="text-xs text-gray-500">
                      + {item.addons.map((a) => a.name).join(', ')}
                    </p>
                  )}
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Special Instructions */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-2">Special Instructions</h3>
          <textarea
            placeholder="Add notes for the restaurant (e.g., allergies, extra sauce)"
            className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            rows={3}
          />
        </Card>

        {/* Order Summary */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery Fee</span>
              <span className="text-gray-900">₱{cart.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Service Fee</span>
              <span className="text-gray-900">₱{serviceFee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
              <span className="text-gray-900">Total</span>
              <span className="text-primary-600">₱{total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Promo Code */}
        <Card>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter promo code"
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <Button variant="outline">Apply</Button>
          </div>
        </Card>

        {/* Minimum Order Warning */}
        {subtotal < 99 && (
          <div className="flex items-start gap-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Minimum order not met</p>
              <p className="text-yellow-600">
                Add ₱{(99 - subtotal).toFixed(2)} more to place your order
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-safe">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500">
              {cart.items.reduce((sum, item) => sum + item.quantity, 0)} items
            </span>
            <span className="text-2xl font-bold text-gray-900">₱{total.toFixed(2)}</span>
          </div>
          <Button
            size="lg"
            fullWidth
            onClick={() => {
              // Require authentication before proceeding to checkout
              if (!checkAuthAndRedirect()) return
              navigate('/checkout')
            }}
            disabled={subtotal < 99}
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  )
}
