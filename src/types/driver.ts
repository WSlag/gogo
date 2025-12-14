import type { Timestamp, GeoPoint } from 'firebase/firestore'

export type DriverStatus = 'offline' | 'online' | 'busy'

export type VehicleType = 'motorcycle' | 'car' | 'taxi' | 'premium' | 'van'

export interface Vehicle {
  type: VehicleType
  make: string
  model: string
  year: number
  color: string
  plateNumber: string
  registrationExpiry: Timestamp
}

export interface DriverLicense {
  number: string
  expiry: Timestamp
  type: string
  frontImage?: string
  backImage?: string
}

export interface DriverDocuments {
  nbiClearance?: string
  nbiExpiry?: Timestamp
  orCr?: string
  orCrExpiry?: Timestamp
  insurancePolicy?: string
  insuranceExpiry?: Timestamp
}

export interface DriverEarnings {
  today: number
  thisWeek: number
  thisMonth: number
  total: number
  pendingPayout: number
}

export interface Driver {
  id: string
  userId: string
  firstName: string
  lastName: string
  phone: string
  email?: string
  profileImage?: string
  vehicleType: VehicleType
  vehicle: Vehicle
  license: DriverLicense
  documents: DriverDocuments
  rating: number
  totalRides: number
  totalDeliveries: number
  status: DriverStatus
  currentLocation?: GeoPoint
  earnings: DriverEarnings
  acceptanceRate: number
  cancellationRate: number
  verified: boolean
  verifiedAt?: Timestamp
  suspendedUntil?: Timestamp
  suspensionReason?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface DriverApplication {
  id: string
  userId: string
  firstName: string
  lastName: string
  phone: string
  email?: string
  vehicleType: VehicleType
  vehicle: Partial<Vehicle>
  license: Partial<DriverLicense>
  documents: Partial<DriverDocuments>
  status: 'pending' | 'reviewing' | 'approved' | 'rejected'
  rejectionReason?: string
  submittedAt: Timestamp
  reviewedAt?: Timestamp
  reviewedBy?: string
}

export interface DriverStats {
  ridesCompleted: number
  deliveriesCompleted: number
  totalEarnings: number
  averageRating: number
  acceptanceRate: number
  cancellationRate: number
  onlineHours: number
}
