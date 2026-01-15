import type { Timestamp } from 'firebase/firestore'

export interface ProductOption {
  name: string
  required: boolean
  maxSelect: number
  choices: {
    name: string
    price: number
  }[]
}

export interface ProductAddon {
  name: string
  price: number
  isAvailable: boolean
}

export interface NutritionInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface Product {
  id: string
  merchantId: string
  name: string
  description: string
  price: number
  salePrice?: number
  image: string
  category: string
  subcategory?: string
  options?: ProductOption[]
  addons?: ProductAddon[]
  isAvailable: boolean
  isFeatured: boolean
  preparationTime?: number // minutes
  nutritionInfo?: NutritionInfo
  tags: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface CartItem {
  productId: string
  merchantId: string
  name: string
  price: number
  quantity: number
  image?: string
  options?: {
    name: string
    choice: string
    price: number
  }[]
  addons?: {
    name: string
    price: number
  }[]
  specialInstructions?: string
  total: number
}

export interface Cart {
  merchantId: string
  merchantName: string
  merchantType: 'restaurant' | 'grocery' | 'convenience' | 'pharmacy'
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  serviceFee: number
  total: number
  minOrder?: number
}
