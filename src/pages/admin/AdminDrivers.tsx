import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  Car,
  Star,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  MoreVertical,
  Eye,
  Ban,
  MessageSquare,
  UserPlus,
  Loader2,
  Link,
} from 'lucide-react'
import { PesoSign } from '@/components/icons'
import { Card, Avatar, Badge, Button, Modal } from '@/components/ui'
import { collection, getDocs, doc, updateDoc, setDoc, Timestamp, GeoPoint } from 'firebase/firestore'
import { db } from '@/services/firebase/config'
import { useAuthStore } from '@/store/authStore'

interface Driver {
  id: string
  name: string
  email: string
  phone: string
  photoURL?: string
  vehicleType: 'motorcycle' | 'car' | 'suv' | 'taxi' | 'premium' | 'van'
  vehiclePlate: string
  vehicleModel: string
  status: 'online' | 'offline' | 'busy'
  isApproved: boolean
  isSuspended: boolean
  isPending: boolean
  rating: number
  totalRides: number
  totalEarnings: number
  joinedAt: Date
  lastActive?: Date
  documents?: {
    license?: string
    registration?: string
    insurance?: string
    nbi?: string
    selfie?: string
  }
  license?: {
    number: string
    expiry: Date
    type: string
  }
  vehicle?: {
    make: string
    model: string
    year: number
    color: string
    plateNumber: string
  }
}

type FilterStatus = 'all' | 'pending' | 'online' | 'offline' | 'busy' | 'suspended'

export default function AdminDrivers() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [showDriverModal, setShowDriverModal] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [seedMessage, setSeedMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [linking, setLinking] = useState(false)
  const [approving, setApproving] = useState<string | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [pendingDriver, setPendingDriver] = useState<Driver | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Test drivers data for seeding
  const testDriversData = [
    {
      id: 'test_driver_motorcycle_001',
      userId: 'test_user_driver_001',
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      phone: '+639171234567',
      email: 'juan.driver@test.com',
      profileImage: 'https://ui-avatars.com/api/?name=Juan+Dela+Cruz&background=10B981&color=fff',
      vehicleType: 'motorcycle',
      vehicle: {
        type: 'motorcycle',
        make: 'Honda',
        model: 'Click 125i',
        year: 2023,
        color: 'Red',
        plateNumber: 'ABC 1234',
        registrationExpiry: Timestamp.fromDate(new Date('2025-12-31')),
      },
      license: { number: 'N01-12-345678', expiry: Timestamp.fromDate(new Date('2026-06-15')), type: 'Professional' },
      documents: {},
      rating: 4.8,
      totalRides: 256,
      totalDeliveries: 89,
      status: 'online',
      currentLocation: new GeoPoint(14.5995, 120.9842),
      earnings: { today: 850, thisWeek: 4250, thisMonth: 18500, total: 156000, pendingPayout: 2500 },
      acceptanceRate: 92,
      cancellationRate: 3,
      verified: true,
      verifiedAt: Timestamp.fromDate(new Date('2024-01-15')),
      createdAt: Timestamp.fromDate(new Date('2024-01-10')),
      updatedAt: Timestamp.now(),
    },
    {
      id: 'test_driver_car_001',
      userId: 'test_user_driver_002',
      firstName: 'Maria',
      lastName: 'Santos',
      phone: '+639182345678',
      email: 'maria.driver@test.com',
      profileImage: 'https://ui-avatars.com/api/?name=Maria+Santos&background=3B82F6&color=fff',
      vehicleType: 'car',
      vehicle: {
        type: 'car',
        make: 'Toyota',
        model: 'Vios',
        year: 2022,
        color: 'White',
        plateNumber: 'XYZ 5678',
        registrationExpiry: Timestamp.fromDate(new Date('2025-10-31')),
      },
      license: { number: 'N02-34-567890', expiry: Timestamp.fromDate(new Date('2026-08-20')), type: 'Professional' },
      documents: {},
      rating: 4.9,
      totalRides: 512,
      totalDeliveries: 0,
      status: 'online',
      currentLocation: new GeoPoint(14.5547, 121.0244),
      earnings: { today: 1200, thisWeek: 6800, thisMonth: 28500, total: 285000, pendingPayout: 4200 },
      acceptanceRate: 95,
      cancellationRate: 2,
      verified: true,
      verifiedAt: Timestamp.fromDate(new Date('2023-08-20')),
      createdAt: Timestamp.fromDate(new Date('2023-08-15')),
      updatedAt: Timestamp.now(),
    },
    {
      id: 'test_driver_taxi_001',
      userId: 'test_user_driver_003',
      firstName: 'Pedro',
      lastName: 'Reyes',
      phone: '+639193456789',
      email: 'pedro.driver@test.com',
      profileImage: 'https://ui-avatars.com/api/?name=Pedro+Reyes&background=F59E0B&color=fff',
      vehicleType: 'taxi',
      vehicle: {
        type: 'taxi',
        make: 'Toyota',
        model: 'Innova',
        year: 2021,
        color: 'Yellow',
        plateNumber: 'TAX 9012',
        registrationExpiry: Timestamp.fromDate(new Date('2025-09-30')),
      },
      license: { number: 'N03-45-678901', expiry: Timestamp.fromDate(new Date('2026-03-10')), type: 'Professional' },
      documents: {},
      rating: 4.7,
      totalRides: 1024,
      totalDeliveries: 0,
      status: 'online',
      currentLocation: new GeoPoint(14.6507, 121.0495),
      earnings: { today: 1500, thisWeek: 8500, thisMonth: 35000, total: 420000, pendingPayout: 5500 },
      acceptanceRate: 88,
      cancellationRate: 5,
      verified: true,
      verifiedAt: Timestamp.fromDate(new Date('2023-05-10')),
      createdAt: Timestamp.fromDate(new Date('2023-05-01')),
      updatedAt: Timestamp.now(),
    },
    {
      id: 'test_driver_premium_001',
      userId: 'test_user_driver_004',
      firstName: 'Carlo',
      lastName: 'Mendoza',
      phone: '+639204567890',
      email: 'carlo.driver@test.com',
      profileImage: 'https://ui-avatars.com/api/?name=Carlo+Mendoza&background=8B5CF6&color=fff',
      vehicleType: 'premium',
      vehicle: {
        type: 'premium',
        make: 'Honda',
        model: 'Accord',
        year: 2023,
        color: 'Black',
        plateNumber: 'PRE 3456',
        registrationExpiry: Timestamp.fromDate(new Date('2026-03-31')),
      },
      license: { number: 'N04-56-789012', expiry: Timestamp.fromDate(new Date('2027-01-15')), type: 'Professional' },
      documents: {},
      rating: 4.95,
      totalRides: 328,
      totalDeliveries: 0,
      status: 'online',
      currentLocation: new GeoPoint(14.5176, 121.0509),
      earnings: { today: 2500, thisWeek: 12500, thisMonth: 52000, total: 380000, pendingPayout: 8500 },
      acceptanceRate: 98,
      cancellationRate: 1,
      verified: true,
      verifiedAt: Timestamp.fromDate(new Date('2024-02-01')),
      createdAt: Timestamp.fromDate(new Date('2024-01-25')),
      updatedAt: Timestamp.now(),
    },
    {
      id: 'test_driver_van_001',
      userId: 'test_user_driver_005',
      firstName: 'Roberto',
      lastName: 'Garcia',
      phone: '+639215678901',
      email: 'roberto.driver@test.com',
      profileImage: 'https://ui-avatars.com/api/?name=Roberto+Garcia&background=EF4444&color=fff',
      vehicleType: 'van',
      vehicle: {
        type: 'van',
        make: 'Toyota',
        model: 'HiAce',
        year: 2022,
        color: 'Silver',
        plateNumber: 'VAN 7890',
        registrationExpiry: Timestamp.fromDate(new Date('2025-11-30')),
      },
      license: { number: 'N05-67-890123', expiry: Timestamp.fromDate(new Date('2026-09-25')), type: 'Professional' },
      documents: {},
      rating: 4.85,
      totalRides: 189,
      totalDeliveries: 156,
      status: 'online',
      currentLocation: new GeoPoint(14.5794, 120.9772),
      earnings: { today: 1800, thisWeek: 9200, thisMonth: 38000, total: 295000, pendingPayout: 6200 },
      acceptanceRate: 90,
      cancellationRate: 4,
      verified: true,
      verifiedAt: Timestamp.fromDate(new Date('2023-11-15')),
      createdAt: Timestamp.fromDate(new Date('2023-11-01')),
      updatedAt: Timestamp.now(),
    },
  ]

  const seedTestDrivers = async () => {
    setSeeding(true)
    setSeedMessage(null)
    try {
      for (const driver of testDriversData) {
        const docRef = doc(db, 'drivers', driver.id)
        await setDoc(docRef, driver, { merge: true })
      }
      setSeedMessage({ type: 'success', text: `Successfully added ${testDriversData.length} test drivers!` })
      // Refresh the list
      fetchDrivers()
    } catch (error) {
      console.error('Error seeding test drivers:', error)
      setSeedMessage({ type: 'error', text: 'Failed to add test drivers. Check console for details.' })
    } finally {
      setSeeding(false)
      // Clear message after 5 seconds
      setTimeout(() => setSeedMessage(null), 5000)
    }
  }

  // Link a driver profile to the current logged-in user (for testing)
  const linkDriverToMyAccount = async (driverId: string) => {
    if (!user) {
      setSeedMessage({ type: 'error', text: 'You must be logged in to link a driver profile.' })
      return
    }
    setLinking(true)
    try {
      const docRef = doc(db, 'drivers', driverId)
      await updateDoc(docRef, {
        userId: user.uid,
        updatedAt: Timestamp.now(),
      })
      setSeedMessage({ type: 'success', text: `Driver linked to your account! Go to /driver to access the driver dashboard.` })
      setShowActionMenu(null)
      fetchDrivers()
    } catch (error) {
      console.error('Error linking driver:', error)
      setSeedMessage({ type: 'error', text: 'Failed to link driver. Check console for details.' })
    } finally {
      setLinking(false)
      setTimeout(() => setSeedMessage(null), 5000)
    }
  }

  useEffect(() => {
    fetchDrivers()
  }, [filterStatus])

  const fetchDrivers = async () => {
    setLoading(true)
    try {
      // Query the drivers collection directly
      // Simple query without composite index requirement
      const snapshot = await getDocs(collection(db, 'drivers'))
      const driverData: Driver[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        const isVerified = data.verified || false
        const isSuspended = !!data.suspendedUntil
        return {
          id: doc.id,
          name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown',
          email: data.email || '',
          phone: data.phone || '',
          photoURL: data.profileImage,
          vehicleType: data.vehicleType || 'motorcycle',
          vehiclePlate: data.vehicle?.plateNumber || '',
          vehicleModel: `${data.vehicle?.make || ''} ${data.vehicle?.model || ''} ${data.vehicle?.year || ''}`.trim(),
          status: data.status || 'offline',
          isApproved: isVerified,
          isSuspended: isSuspended,
          isPending: !isVerified && !isSuspended && !data.rejectedAt,
          rating: data.rating || 0,
          totalRides: data.totalRides || 0,
          totalEarnings: data.earnings?.total || 0,
          joinedAt: data.createdAt?.toDate() || new Date(),
          lastActive: data.updatedAt?.toDate(),
          documents: data.documents,
          license: data.license ? {
            number: data.license.number,
            expiry: data.license.expiry?.toDate(),
            type: data.license.type,
          } : undefined,
          vehicle: data.vehicle,
        }
      })

      // Apply client-side filters
      let filtered = driverData
      if (filterStatus === 'pending') {
        filtered = driverData.filter((d) => d.isPending)
      } else if (filterStatus === 'suspended') {
        filtered = driverData.filter((d) => d.isSuspended)
      } else if (filterStatus !== 'all') {
        filtered = driverData.filter((d) => d.status === filterStatus && !d.isSuspended && d.isApproved)
      }

      setDrivers(filtered)
    } catch (error) {
      console.error('Error fetching drivers:', error)
      setDrivers([])
      setSeedMessage({ type: 'error', text: 'Failed to load drivers. Pull down to retry.' })
    } finally {
      setLoading(false)
    }
  }

  // Approve a pending driver
  const handleApproveDriver = async (driverId: string) => {
    setApproving(driverId)
    try {
      await updateDoc(doc(db, 'drivers', driverId), {
        verified: true,
        verifiedAt: Timestamp.now(),
        verifiedBy: user?.uid,
        updatedAt: Timestamp.now(),
      })

      // Also update the user's role in users collection
      await updateDoc(doc(db, 'users', driverId), {
        role: 'driver',
        updatedAt: Timestamp.now(),
      })

      setSeedMessage({ type: 'success', text: 'Driver approved successfully! They can now accept rides.' })
      setShowApprovalModal(false)
      setPendingDriver(null)
      fetchDrivers()
    } catch (error) {
      console.error('Error approving driver:', error)
      setSeedMessage({ type: 'error', text: 'Failed to approve driver. Please try again.' })
    } finally {
      setApproving(null)
      setTimeout(() => setSeedMessage(null), 5000)
    }
  }

  // Reject a pending driver
  const handleRejectDriver = async (driverId: string, reason: string) => {
    setApproving(driverId)
    try {
      await updateDoc(doc(db, 'drivers', driverId), {
        verified: false,
        rejectedAt: Timestamp.now(),
        rejectedBy: user?.uid,
        rejectionReason: reason || 'Application did not meet requirements',
        updatedAt: Timestamp.now(),
      })

      setSeedMessage({ type: 'success', text: 'Driver application rejected.' })
      setShowApprovalModal(false)
      setPendingDriver(null)
      setRejectionReason('')
      fetchDrivers()
    } catch (error) {
      console.error('Error rejecting driver:', error)
      setSeedMessage({ type: 'error', text: 'Failed to reject driver. Please try again.' })
    } finally {
      setApproving(null)
      setTimeout(() => setSeedMessage(null), 5000)
    }
  }

  const handleSuspendDriver = async (driverId: string, suspend: boolean) => {
    try {
      await updateDoc(doc(db, 'drivers', driverId), {
        suspendedUntil: suspend ? Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) : null,
        suspensionReason: suspend ? 'Suspended by admin' : null,
        updatedAt: Timestamp.now(),
      })
      fetchDrivers()
      setShowActionMenu(null)
      setSeedMessage({ type: 'success', text: suspend ? 'Driver suspended successfully' : 'Driver unsuspended successfully' })
      setTimeout(() => setSeedMessage(null), 3000)
    } catch (error) {
      console.error('Error updating driver:', error)
      setSeedMessage({ type: 'error', text: 'Failed to update driver status' })
      setTimeout(() => setSeedMessage(null), 3000)
    }
  }

  const filteredDrivers = drivers.filter((driver) => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      driver.name.toLowerCase().includes(search) ||
      driver.email.toLowerCase().includes(search) ||
      driver.phone.includes(search) ||
      driver.vehiclePlate.toLowerCase().includes(search)
    )
  })

  const getStatusBadge = (driver: Driver) => {
    if (driver.isPending) {
      return <Badge variant="warning">Pending Approval</Badge>
    }
    if (driver.isSuspended) {
      return <Badge variant="error">Suspended</Badge>
    }
    if (!driver.isApproved) {
      return <Badge variant="error">Rejected</Badge>
    }
    switch (driver.status) {
      case 'online':
        return <Badge variant="success">Online</Badge>
      case 'busy':
        return <Badge variant="warning">On Ride</Badge>
      default:
        return <Badge variant="secondary">Offline</Badge>
    }
  }

  // Calculate stats from all drivers (not just filtered)
  const [allDrivers, setAllDrivers] = useState<Driver[]>([])

  // Update allDrivers when drivers change (for accurate stats)
  useEffect(() => {
    if (filterStatus === 'all') {
      setAllDrivers(drivers)
    }
  }, [drivers, filterStatus])

  const stats = {
    total: allDrivers.length || drivers.length,
    pending: (allDrivers.length ? allDrivers : drivers).filter((d) => d.isPending).length,
    online: (allDrivers.length ? allDrivers : drivers).filter((d) => d.status === 'online' && !d.isSuspended && d.isApproved).length,
    busy: (allDrivers.length ? allDrivers : drivers).filter((d) => d.status === 'busy').length,
    suspended: (allDrivers.length ? allDrivers : drivers).filter((d) => d.isSuspended).length,
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-900 text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="p-1">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-lg font-bold">Driver Management</h1>
              <p className="text-gray-400 text-sm">{stats.total} total drivers</p>
            </div>
          </div>
          <button
            onClick={seedTestDrivers}
            disabled={seeding}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 rounded-lg text-sm font-medium transition-colors"
          >
            {seeding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {seeding ? 'Adding...' : 'Seed Test Drivers'}
          </button>
        </div>
      </div>

      {/* Seed Message */}
      {seedMessage && (
        <div className={`mx-4 mt-4 p-3 rounded-lg text-sm ${
          seedMessage.type === 'success'
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {seedMessage.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-2 p-4">
        <div className="bg-white rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 text-center relative">
          <p className="text-xl font-bold text-orange-600">{stats.pending}</p>
          <p className="text-xs text-gray-500">Pending</p>
          {stats.pending > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {stats.pending}
            </span>
          )}
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-green-600">{stats.online}</p>
          <p className="text-xs text-gray-500">Online</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-yellow-600">{stats.busy}</p>
          <p className="text-xs text-gray-500">On Ride</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-red-600">{stats.suspended}</p>
          <p className="text-xs text-gray-500">Suspended</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="px-4 space-y-3">
        <div className="relative">
          {!searchQuery && (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          )}
          <input
            type="text"
            placeholder="Search by name, email, phone, or plate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${searchQuery ? 'pl-4' : 'pl-10'} pr-4 py-3 bg-white rounded-xl border-0 focus:ring-2 focus:ring-primary-500`}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'pending', 'online', 'offline', 'busy', 'suspended'] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap relative ${
                filterStatus === status
                  ? status === 'pending' ? 'bg-orange-500 text-white' : 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'pending' && stats.pending > 0 && filterStatus !== 'pending' && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Driver List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading drivers...</div>
        ) : filteredDrivers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No drivers found</div>
        ) : (
          filteredDrivers.map((driver) => (
            <Card key={driver.id} className="!p-4">
              <div className="flex items-start gap-3">
                <Avatar name={driver.name} src={driver.photoURL} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{driver.name}</h3>
                    {getStatusBadge(driver)}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{driver.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">• {driver.totalRides} rides</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <Car className="h-4 w-4" />
                    <span>{driver.vehicleModel} • {driver.vehiclePlate}</span>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowActionMenu(showActionMenu === driver.id ? null : driver.id)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <MoreVertical className="h-5 w-5 text-gray-400" />
                  </button>
                  {showActionMenu === driver.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border z-10 py-2 min-w-[160px]">
                      <button
                        onClick={() => {
                          setSelectedDriver(driver)
                          setShowDriverModal(true)
                          setShowActionMenu(null)
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => window.open(`tel:${driver.phone}`)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Call Driver
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Send Message
                      </button>
                      <button
                        onClick={() => linkDriverToMyAccount(driver.id)}
                        disabled={linking}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-blue-600"
                      >
                        <Link className="h-4 w-4" />
                        {linking ? 'Linking...' : 'Link to My Account'}
                      </button>
                      <hr className="my-2" />
                      {driver.isPending ? (
                        <>
                          <button
                            onClick={() => {
                              setPendingDriver(driver)
                              setShowApprovalModal(true)
                              setShowActionMenu(null)
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Review & Approve
                          </button>
                          <button
                            onClick={() => {
                              setPendingDriver(driver)
                              setShowApprovalModal(true)
                              setShowActionMenu(null)
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                          >
                            <Ban className="h-4 w-4" />
                            Reject Application
                          </button>
                        </>
                      ) : driver.isSuspended ? (
                        <button
                          onClick={() => handleSuspendDriver(driver.id, false)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Unsuspend
                        </button>
                      ) : driver.isApproved ? (
                        <button
                          onClick={() => handleSuspendDriver(driver.id, true)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                        >
                          <Ban className="h-4 w-4" />
                          Suspend Driver
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Driver Detail Modal */}
      {selectedDriver && (
        <Modal
          isOpen={showDriverModal}
          onClose={() => setShowDriverModal(false)}
          title="Driver Details"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={selectedDriver.name} src={selectedDriver.photoURL} size="xl" />
              <div>
                <h3 className="text-lg font-semibold">{selectedDriver.name}</h3>
                {getStatusBadge(selectedDriver)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Star className="h-4 w-4" />
                  <span className="text-sm">Rating</span>
                </div>
                <p className="text-xl font-bold">{selectedDriver.rating.toFixed(1)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Car className="h-4 w-4" />
                  <span className="text-sm">Total Rides</span>
                </div>
                <p className="text-xl font-bold">{selectedDriver.totalRides}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <PesoSign className="h-4 w-4" />
                  <span className="text-sm">Earnings</span>
                </div>
                <p className="text-xl font-bold">₱{selectedDriver.totalEarnings.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Joined</span>
                </div>
                <p className="text-sm font-medium">{selectedDriver.joinedAt.toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Contact Information</h4>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{selectedDriver.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{selectedDriver.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Vehicle Information</h4>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-medium">{selectedDriver.vehicleModel}</p>
                <p className="text-sm text-gray-500">
                  {selectedDriver.vehicleType.toUpperCase()} • {selectedDriver.vehiclePlate}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => window.open(`tel:${selectedDriver.phone}`)}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              {selectedDriver.isPending ? (
                <Button
                  fullWidth
                  onClick={() => {
                    setPendingDriver(selectedDriver)
                    setShowDriverModal(false)
                    setShowApprovalModal(true)
                  }}
                >
                  Review Application
                </Button>
              ) : selectedDriver.isSuspended ? (
                <Button
                  fullWidth
                  onClick={() => {
                    handleSuspendDriver(selectedDriver.id, false)
                    setShowDriverModal(false)
                  }}
                >
                  Unsuspend Driver
                </Button>
              ) : selectedDriver.isApproved ? (
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => {
                    handleSuspendDriver(selectedDriver.id, true)
                    setShowDriverModal(false)
                  }}
                >
                  Suspend Driver
                </Button>
              ) : null}
            </div>
          </div>
        </Modal>
      )}

      {/* Driver Approval Modal */}
      {pendingDriver && (
        <Modal
          isOpen={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false)
            setPendingDriver(null)
            setRejectionReason('')
          }}
          title="Review Driver Application"
        >
          <div className="space-y-4">
            {/* Driver Info Header */}
            <div className="flex items-center gap-4 pb-4 border-b">
              <Avatar name={pendingDriver.name} src={pendingDriver.photoURL} size="xl" />
              <div>
                <h3 className="text-lg font-semibold">{pendingDriver.name}</h3>
                <p className="text-sm text-gray-500">{pendingDriver.email}</p>
                <p className="text-sm text-gray-500">{pendingDriver.phone}</p>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Car className="h-4 w-4" />
                Vehicle Information
              </h4>
              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                <p className="font-medium">{pendingDriver.vehicleModel || 'Not provided'}</p>
                <p className="text-sm text-gray-500">
                  Type: {pendingDriver.vehicleType?.toUpperCase() || 'N/A'} • Plate: {pendingDriver.vehiclePlate || 'N/A'}
                </p>
                {pendingDriver.vehicle && (
                  <p className="text-sm text-gray-500">
                    Color: {pendingDriver.vehicle.color || 'N/A'}
                  </p>
                )}
              </div>
            </div>

            {/* License Information */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">License Information</h4>
              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                {pendingDriver.license ? (
                  <>
                    <p className="font-medium">License #: {pendingDriver.license.number}</p>
                    <p className="text-sm text-gray-500">
                      Type: {pendingDriver.license.type} • Expires: {pendingDriver.license.expiry?.toLocaleDateString() || 'N/A'}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">License information not provided</p>
                )}
              </div>
            </div>

            {/* Documents Status */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Document Verification</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className={`p-2 rounded-lg text-sm ${pendingDriver.documents?.license ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {pendingDriver.documents?.license ? '✓' : '○'} Driver's License
                </div>
                <div className={`p-2 rounded-lg text-sm ${pendingDriver.documents?.registration ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {pendingDriver.documents?.registration ? '✓' : '○'} Vehicle Registration
                </div>
                <div className={`p-2 rounded-lg text-sm ${pendingDriver.documents?.insurance ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {pendingDriver.documents?.insurance ? '✓' : '○'} Insurance
                </div>
                <div className={`p-2 rounded-lg text-sm ${pendingDriver.documents?.nbi ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {pendingDriver.documents?.nbi ? '✓' : '○'} NBI Clearance
                </div>
              </div>
            </div>

            {/* Application Date */}
            <div className="text-sm text-gray-500">
              Applied: {pendingDriver.joinedAt.toLocaleDateString()} ({Math.floor((Date.now() - pendingDriver.joinedAt.getTime()) / (1000 * 60 * 60 * 24))} days ago)
            </div>

            {/* Rejection Reason Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Rejection Reason (optional)</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason if rejecting..."
                className="w-full p-3 border rounded-xl text-sm resize-none"
                rows={2}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="danger"
                fullWidth
                onClick={() => handleRejectDriver(pendingDriver.id, rejectionReason)}
                disabled={approving === pendingDriver.id}
              >
                {approving === pendingDriver.id ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Ban className="h-4 w-4 mr-2" />
                )}
                Reject
              </Button>
              <Button
                fullWidth
                onClick={() => handleApproveDriver(pendingDriver.id)}
                disabled={approving === pendingDriver.id}
              >
                {approving === pendingDriver.id ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Approve Driver
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

