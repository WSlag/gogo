import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  Filter,
  Car,
  Star,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Eye,
  Ban,
  MessageSquare,
  DollarSign,
  TrendingUp,
} from 'lucide-react'
import { Card, Avatar, Badge, Button, Modal, Input } from '@/components/ui'
import { collection, query, where, orderBy, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/services/firebase/config'

interface Driver {
  id: string
  name: string
  email: string
  phone: string
  photoURL?: string
  vehicleType: 'motorcycle' | 'car' | 'suv'
  vehiclePlate: string
  vehicleModel: string
  status: 'online' | 'offline' | 'busy'
  isApproved: boolean
  isSuspended: boolean
  rating: number
  totalRides: number
  totalEarnings: number
  joinedAt: Date
  lastActive?: Date
  documents?: {
    license: string
    registration: string
    insurance: string
  }
}

type FilterStatus = 'all' | 'online' | 'offline' | 'busy' | 'suspended'

export default function AdminDrivers() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [showDriverModal, setShowDriverModal] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)

  useEffect(() => {
    fetchDrivers()
  }, [filterStatus])

  const fetchDrivers = async () => {
    setLoading(true)
    try {
      let q = query(
        collection(db, 'users'),
        where('role', '==', 'driver'),
        where('driverInfo.isApproved', '==', true),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      const driverData: Driver[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.displayName || 'Unknown',
          email: data.email || '',
          phone: data.phone || '',
          photoURL: data.photoURL,
          vehicleType: data.driverInfo?.vehicleType || 'motorcycle',
          vehiclePlate: data.driverInfo?.vehiclePlate || '',
          vehicleModel: data.driverInfo?.vehicleModel || '',
          status: data.driverInfo?.status || 'offline',
          isApproved: data.driverInfo?.isApproved || false,
          isSuspended: data.driverInfo?.isSuspended || false,
          rating: data.driverInfo?.rating || 0,
          totalRides: data.driverInfo?.totalRides || 0,
          totalEarnings: data.driverInfo?.totalEarnings || 0,
          joinedAt: data.createdAt?.toDate() || new Date(),
          lastActive: data.driverInfo?.lastActive?.toDate(),
          documents: data.driverInfo?.documents,
        }
      })

      // Apply client-side filters
      let filtered = driverData
      if (filterStatus === 'suspended') {
        filtered = driverData.filter((d) => d.isSuspended)
      } else if (filterStatus !== 'all') {
        filtered = driverData.filter((d) => d.status === filterStatus && !d.isSuspended)
      }

      setDrivers(filtered)
    } catch (error) {
      console.error('Error fetching drivers:', error)
      // Use mock data for demo
      setDrivers(MOCK_DRIVERS)
    } finally {
      setLoading(false)
    }
  }

  const handleSuspendDriver = async (driverId: string, suspend: boolean) => {
    try {
      await updateDoc(doc(db, 'users', driverId), {
        'driverInfo.isSuspended': suspend,
        'driverInfo.suspendedAt': suspend ? Timestamp.now() : null,
      })
      fetchDrivers()
      setShowActionMenu(null)
    } catch (error) {
      console.error('Error updating driver:', error)
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
    if (driver.isSuspended) {
      return <Badge variant="error">Suspended</Badge>
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

  const stats = {
    total: drivers.length,
    online: drivers.filter((d) => d.status === 'online' && !d.isSuspended).length,
    busy: drivers.filter((d) => d.status === 'busy').length,
    suspended: drivers.filter((d) => d.isSuspended).length,
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-900 text-white px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin')} className="p-1">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Driver Management</h1>
            <p className="text-gray-400 text-sm">{stats.total} total drivers</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 p-4">
        <div className="bg-white rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.online}</p>
          <p className="text-xs text-gray-500">Online</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.busy}</p>
          <p className="text-xs text-gray-500">On Ride</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
          <p className="text-xs text-gray-500">Suspended</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="px-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or plate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border-0 focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'online', 'offline', 'busy', 'suspended'] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
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
                      <hr className="my-2" />
                      {driver.isSuspended ? (
                        <button
                          onClick={() => handleSuspendDriver(driver.id, false)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Unsuspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspendDriver(driver.id, true)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                        >
                          <Ban className="h-4 w-4" />
                          Suspend Driver
                        </button>
                      )}
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
                  <DollarSign className="h-4 w-4" />
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
              {selectedDriver.isSuspended ? (
                <Button
                  fullWidth
                  onClick={() => {
                    handleSuspendDriver(selectedDriver.id, false)
                    setShowDriverModal(false)
                  }}
                >
                  Unsuspend Driver
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  fullWidth
                  onClick={() => {
                    handleSuspendDriver(selectedDriver.id, true)
                    setShowDriverModal(false)
                  }}
                >
                  Suspend Driver
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// Mock data for demo
const MOCK_DRIVERS: Driver[] = [
  {
    id: '1',
    name: 'Juan Dela Cruz',
    email: 'juan@example.com',
    phone: '+639123456789',
    vehicleType: 'motorcycle',
    vehiclePlate: 'ABC 1234',
    vehicleModel: 'Honda Click 125i',
    status: 'online',
    isApproved: true,
    isSuspended: false,
    rating: 4.8,
    totalRides: 1250,
    totalEarnings: 125000,
    joinedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@example.com',
    phone: '+639987654321',
    vehicleType: 'car',
    vehiclePlate: 'XYZ 5678',
    vehicleModel: 'Toyota Vios 2022',
    status: 'busy',
    isApproved: true,
    isSuspended: false,
    rating: 4.9,
    totalRides: 890,
    totalEarnings: 178000,
    joinedAt: new Date('2024-02-20'),
  },
  {
    id: '3',
    name: 'Pedro Reyes',
    email: 'pedro@example.com',
    phone: '+639555123456',
    vehicleType: 'motorcycle',
    vehiclePlate: 'DEF 9012',
    vehicleModel: 'Yamaha Mio',
    status: 'offline',
    isApproved: true,
    isSuspended: false,
    rating: 4.5,
    totalRides: 450,
    totalEarnings: 45000,
    joinedAt: new Date('2024-03-10'),
  },
  {
    id: '4',
    name: 'Jose Garcia',
    email: 'jose@example.com',
    phone: '+639777888999',
    vehicleType: 'car',
    vehiclePlate: 'GHI 3456',
    vehicleModel: 'Honda City 2021',
    status: 'offline',
    isApproved: true,
    isSuspended: true,
    rating: 3.2,
    totalRides: 120,
    totalEarnings: 24000,
    joinedAt: new Date('2024-04-05'),
  },
]
