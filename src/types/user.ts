import type { Timestamp, GeoPoint } from 'firebase/firestore'

export type UserRole = 'customer' | 'driver' | 'merchant' | 'admin'

export interface User {
  id: string
  role: UserRole
  phone: string
  email?: string
  firstName: string
  lastName: string
  profileImage?: string
  dateOfBirth?: Timestamp
  gender?: 'male' | 'female' | 'other'
  savedLocations: SavedLocation[]
  defaultPaymentMethod?: string
  walletBalance: number
  referralCode: string
  referredBy?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  status: 'active' | 'suspended' | 'deleted'
  settings: UserSettings
}

export interface SavedLocation {
  id: string
  label: string
  type: 'home' | 'work' | 'other'
  address: string
  coordinates: GeoPoint
  details?: string
}

export interface UserSettings {
  notifications: {
    push: boolean
    email: boolean
    sms: boolean
    promotions: boolean
  }
  language: 'en' | 'fil'
  currency: 'PHP'
}

export interface UserProfile {
  id: string
  phone: string
  email?: string
  firstName: string
  lastName: string
  profileImage?: string
  walletBalance: number
}

export type PaymentMethod = 'cash' | 'gcash' | 'wallet'

export interface PaymentMethodInfo {
  id: PaymentMethod
  name: string
  icon: string
  description: string
  isAvailable: boolean
}
