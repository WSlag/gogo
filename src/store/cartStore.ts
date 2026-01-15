import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Cart, MerchantType } from '@/types'

interface MerchantInfo {
  merchantId: string
  merchantName: string
  merchantType: MerchantType
  deliveryFee?: number
  minOrder?: number
}

interface CartState {
  cart: Cart | null
  itemCount: number

  // Actions
  addItem: (item: CartItem, merchant: MerchantInfo) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  setDeliveryFee: (fee: number) => void
}

const SERVICE_FEE_RATE = 0.05 // 5% service fee

const calculateTotals = (items: CartItem[], deliveryFee: number) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE)
  const total = subtotal + deliveryFee + serviceFee

  return { subtotal, serviceFee, total }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      itemCount: 0,

      addItem: (item, merchant) => {
        const { cart } = get()
        const { merchantId, merchantName, merchantType, deliveryFee: merchantDeliveryFee, minOrder } = merchant

        // If cart exists and is from different merchant, clear it
        if (cart && cart.merchantId !== merchantId) {
          const deliveryFee = merchantDeliveryFee ?? 49
          set({
            cart: {
              merchantId,
              merchantName,
              merchantType,
              items: [item],
              deliveryFee,
              minOrder,
              ...calculateTotals([item], deliveryFee),
            },
            itemCount: item.quantity,
          })
          return
        }

        // Add to existing cart or create new
        const existingItems = cart?.items || []
        const existingIndex = existingItems.findIndex(
          (i) => i.productId === item.productId
        )

        let newItems: CartItem[]
        if (existingIndex > -1) {
          // Update existing item
          newItems = existingItems.map((i, index) =>
            index === existingIndex
              ? {
                  ...i,
                  quantity: i.quantity + item.quantity,
                  total: i.total + item.total,
                }
              : i
          )
        } else {
          // Add new item
          newItems = [...existingItems, item]
        }

        const deliveryFee = cart?.deliveryFee ?? merchantDeliveryFee ?? 49
        const totals = calculateTotals(newItems, deliveryFee)

        set({
          cart: {
            merchantId,
            merchantName,
            merchantType,
            items: newItems,
            deliveryFee,
            minOrder: cart?.minOrder ?? minOrder,
            ...totals,
          },
          itemCount: newItems.reduce((sum, i) => sum + i.quantity, 0),
        })
      },

      updateQuantity: (productId, quantity) => {
        const { cart } = get()
        if (!cart) return

        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        const newItems = cart.items.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity,
                total: (item.total / item.quantity) * quantity,
              }
            : item
        )

        const totals = calculateTotals(newItems, cart.deliveryFee)

        set({
          cart: {
            ...cart,
            items: newItems,
            ...totals,
          },
          itemCount: newItems.reduce((sum, i) => sum + i.quantity, 0),
        })
      },

      removeItem: (productId) => {
        const { cart } = get()
        if (!cart) return

        const newItems = cart.items.filter(
          (item) => item.productId !== productId
        )

        if (newItems.length === 0) {
          set({ cart: null, itemCount: 0 })
          return
        }

        const totals = calculateTotals(newItems, cart.deliveryFee)

        set({
          cart: {
            ...cart,
            items: newItems,
            ...totals,
          },
          itemCount: newItems.reduce((sum, i) => sum + i.quantity, 0),
        })
      },

      clearCart: () => {
        set({ cart: null, itemCount: 0 })
      },

      setDeliveryFee: (fee) => {
        const { cart } = get()
        if (!cart) return

        const totals = calculateTotals(cart.items, fee)

        set({
          cart: {
            ...cart,
            deliveryFee: fee,
            ...totals,
          },
        })
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
