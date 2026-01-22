import type { Timestamp, GeoPoint } from 'firebase/firestore'

export type VehicleType = 'motorcycle' | 'car' | 'van' | 'delivery' | 'happy_move'

export type RideStatus =
  | 'pending'
  | 'scheduled'
  | 'accepted'
  | 'arriving'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export interface VehicleTypeInfo {
  type: VehicleType
  name: string
  description: string
  icon: string
  baseFare: number
  perKm: number
  perMinute: number
  minFare: number
  capacity: number
  estimatedArrival?: string
}

export interface Location {
  address: string
  coordinates: GeoPoint
  details?: string
}

export interface RouteInfo {
  distance: number // meters
  duration: number // seconds
  polyline: string
}

export interface RideFare {
  base: number
  distance: number
  time: number
  surge?: number
  discount?: number
  total: number
}

export interface Ride {
  id: string
  passengerId: string
  driverId?: string
  vehicleType: VehicleType
  pickup: Location
  dropoff: Location
  route?: RouteInfo
  fare: RideFare
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'failed'
  status: RideStatus
  scheduledAt?: Timestamp
  acceptedAt?: Timestamp
  arrivedAt?: Timestamp
  startedAt?: Timestamp
  completedAt?: Timestamp
  cancelledAt?: Timestamp
  cancellationReason?: string
  cancelledBy?: 'passenger' | 'driver' | 'system'
  rating?: number
  review?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Driver {
  id: string
  userId: string
  firstName: string
  lastName: string
  phone: string
  email?: string
  profileImage: string
  vehicleType: VehicleType
  vehicle: Vehicle
  license: DriverLicense
  rating: number
  totalRides: number
  status: 'online' | 'offline' | 'busy'
  currentLocation?: GeoPoint
  createdAt: Timestamp
  updatedAt: Timestamp
  verified: boolean
}

export interface Vehicle {
  type: string
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
}

// Ultra-affordable pricing for Cotabato City market (25-30% lower than Manila rates)
export const VEHICLE_TYPES: VehicleTypeInfo[] = [
  {
    type: 'motorcycle',
    name: 'MC Taxi',
    description: 'Motorcycle taxi to beat traffic',
    icon: '🏍️',
    baseFare: 30,
    perKm: 7,
    perMinute: 1,
    minFare: 35,
    capacity: 1,
    estimatedArrival: '3-5 min',
  },
  {
    type: 'car',
    name: 'Car',
    description: 'Standard 4-seater vehicle',
    icon: '🚗',
    baseFare: 45,
    perKm: 10,
    perMinute: 1.5,
    minFare: 55,
    capacity: 4,
    estimatedArrival: '5-8 min',
  },
  {
    type: 'van',
    name: 'Van',
    description: '6-seater for groups/families',
    icon: '🚐',
    baseFare: 60,
    perKm: 13,
    perMinute: 2,
    minFare: 70,
    capacity: 6,
    estimatedArrival: '8-12 min',
  },
  {
    type: 'delivery',
    name: 'Delivery',
    description: 'Parcel/package courier',
    icon: '📦',
    baseFare: 35,
    perKm: 8,
    perMinute: 1,
    minFare: 40,
    capacity: 0,
    estimatedArrival: '5-10 min',
  },
  {
    type: 'happy_move',
    name: 'Happy Move',
    description: 'Multi-vehicle logistics',
    icon: '🚛',
    baseFare: 200,
    perKm: 18,
    perMinute: 3,
    minFare: 350,
    capacity: 0,
    estimatedArrival: '15-25 min',
  },
]
