import type { Timestamp, GeoPoint } from 'firebase/firestore'

export type MerchantType = 'restaurant' | 'grocery' | 'convenience' | 'pharmacy'

export interface OperatingHours {
  day: number // 0-6 (Sunday-Saturday)
  open: string // "09:00"
  close: string // "22:00"
  isClosed: boolean
}

export interface Merchant {
  id: string
  name: string
  type: MerchantType
  description: string
  logo: string
  coverImage: string
  categories: string[]
  address: string
  coordinates: GeoPoint
  phone: string
  email: string
  operatingHours: OperatingHours[]
  rating: number
  totalOrders: number
  reviewCount: number
  deliveryFee: number
  minOrder: number
  estimatedDelivery: string
  isOpen: boolean
  isFeatured: boolean
  status: 'active' | 'suspended' | 'closed'
  createdAt: Timestamp
  updatedAt: Timestamp
}

export const RESTAURANT_CATEGORIES = [
  { id: 'fast-food', name: 'Fast Food', icon: '🍔' },
  { id: 'filipino', name: 'Filipino', icon: '🍛' },
  { id: 'chinese', name: 'Chinese', icon: '🥡' },
  { id: 'japanese', name: 'Japanese', icon: '🍣' },
  { id: 'korean', name: 'Korean', icon: '🍜' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'burgers', name: 'Burgers', icon: '🍔' },
  { id: 'coffee', name: 'Coffee & Tea', icon: '☕' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' },
  { id: 'healthy', name: 'Healthy', icon: '🥗' },
  { id: 'convenience', name: 'Convenience', icon: '🏪' },
]

export const GROCERY_CATEGORIES = [
  { id: 'fruits-vegetables', name: 'Fruits & Vegetables', icon: '🥬' },
  { id: 'meat-seafood', name: 'Meat & Seafood', icon: '🥩' },
  { id: 'dairy-eggs', name: 'Dairy & Eggs', icon: '🥛' },
  { id: 'bread-bakery', name: 'Bread & Bakery', icon: '🍞' },
  { id: 'beverages', name: 'Beverages', icon: '🥤' },
  { id: 'snacks', name: 'Snacks', icon: '🍿' },
  { id: 'frozen', name: 'Frozen Foods', icon: '🧊' },
  { id: 'household', name: 'Household', icon: '🧹' },
  { id: 'personal-care', name: 'Personal Care', icon: '🧴' },
  { id: 'baby', name: 'Baby Products', icon: '👶' },
]

// Merchant Portal Types
export interface MerchantApplication {
  id: string
  ownerId: string
  businessName: string
  businessType: MerchantType
  ownerName: string
  phone: string
  email: string
  address: string
  businessPermit?: string
  sanitaryPermit?: string
  birRegistration?: string
  status: 'pending' | 'reviewing' | 'approved' | 'rejected'
  rejectionReason?: string
  submittedAt: Timestamp
  reviewedAt?: Timestamp
  reviewedBy?: string
}

export interface MerchantEarnings {
  today: number
  thisWeek: number
  thisMonth: number
  total: number
  pendingPayout: number
}

export interface MerchantStats {
  totalOrders: number
  completedOrders: number
  cancelledOrders: number
  averageOrderValue: number
  averageRating: number
  totalRevenue: number
}

export interface MerchantOrder {
  id: string
  merchantId: string
  customerId: string
  customerName: string
  customerPhone: string
  items: MerchantOrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled'
  paymentMethod: 'cash' | 'wallet' | 'card'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  deliveryAddress: string
  notes?: string
  driverId?: string
  driverName?: string
  estimatedDelivery?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface MerchantOrderItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  options?: { name: string; choice: string; price: number }[]
  notes?: string
}
