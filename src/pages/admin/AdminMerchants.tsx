import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  Store,
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
  ShoppingBag,
  TrendingUp,
} from 'lucide-react'
import { Card, Avatar, Badge, Button, Modal } from '@/components/ui'
import { collection, query, where, orderBy, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/services/firebase/config'

interface Merchant {
  id: string
  businessName: string
  ownerName: string
  email: string
  phone: string
  photoURL?: string
  category: 'restaurant' | 'grocery' | 'convenience' | 'pharmacy'
  address: string
  status: 'open' | 'closed' | 'busy'
  isApproved: boolean
  isSuspended: boolean
  rating: number
  totalOrders: number
  totalRevenue: number
  commissionRate: number
  joinedAt: Date
  documents?: {
    businessPermit: string
    sanitaryPermit: string
    bir: string
  }
}

type FilterStatus = 'all' | 'open' | 'closed' | 'suspended'
type FilterCategory = 'all' | 'restaurant' | 'grocery' | 'convenience' | 'pharmacy'

export default function AdminMerchants() {
  const navigate = useNavigate()
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all')
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)
  const [showMerchantModal, setShowMerchantModal] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)

  useEffect(() => {
    fetchMerchants()
  }, [filterStatus, filterCategory])

  const fetchMerchants = async () => {
    setLoading(true)
    try {
      let q = query(
        collection(db, 'merchants'),
        where('isApproved', '==', true),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      const merchantData: Merchant[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          businessName: data.businessName || 'Unknown',
          ownerName: data.ownerName || '',
          email: data.email || '',
          phone: data.phone || '',
          photoURL: data.photoURL,
          category: data.category || 'restaurant',
          address: data.address || '',
          status: data.status || 'closed',
          isApproved: data.isApproved || false,
          isSuspended: data.isSuspended || false,
          rating: data.rating || 0,
          totalOrders: data.totalOrders || 0,
          totalRevenue: data.totalRevenue || 0,
          commissionRate: data.commissionRate || 15,
          joinedAt: data.createdAt?.toDate() || new Date(),
          documents: data.documents,
        }
      })

      // Apply client-side filters
      let filtered = merchantData
      if (filterStatus === 'suspended') {
        filtered = merchantData.filter((m) => m.isSuspended)
      } else if (filterStatus !== 'all') {
        filtered = merchantData.filter((m) => m.status === filterStatus && !m.isSuspended)
      }

      if (filterCategory !== 'all') {
        filtered = filtered.filter((m) => m.category === filterCategory)
      }

      setMerchants(filtered)
    } catch (error) {
      console.error('Error fetching merchants:', error)
      // Use mock data for demo
      setMerchants(MOCK_MERCHANTS)
    } finally {
      setLoading(false)
    }
  }

  const handleSuspendMerchant = async (merchantId: string, suspend: boolean) => {
    try {
      await updateDoc(doc(db, 'merchants', merchantId), {
        isSuspended: suspend,
        suspendedAt: suspend ? Timestamp.now() : null,
      })
      fetchMerchants()
      setShowActionMenu(null)
    } catch (error) {
      console.error('Error updating merchant:', error)
    }
  }

  const filteredMerchants = merchants.filter((merchant) => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      merchant.businessName.toLowerCase().includes(search) ||
      merchant.ownerName.toLowerCase().includes(search) ||
      merchant.email.toLowerCase().includes(search) ||
      merchant.address.toLowerCase().includes(search)
    )
  })

  const getStatusBadge = (merchant: Merchant) => {
    if (merchant.isSuspended) {
      return <Badge variant="error">Suspended</Badge>
    }
    switch (merchant.status) {
      case 'open':
        return <Badge variant="success">Open</Badge>
      case 'busy':
        return <Badge variant="warning">Busy</Badge>
      default:
        return <Badge variant="secondary">Closed</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'restaurant':
        return '🍽️'
      case 'grocery':
        return '🛒'
      case 'convenience':
        return '🏪'
      case 'pharmacy':
        return '💊'
      default:
        return '🏪'
    }
  }

  const stats = {
    total: merchants.length,
    open: merchants.filter((m) => m.status === 'open' && !m.isSuspended).length,
    closed: merchants.filter((m) => m.status === 'closed' && !m.isSuspended).length,
    suspended: merchants.filter((m) => m.isSuspended).length,
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
            <h1 className="text-lg font-bold">Merchant Management</h1>
            <p className="text-gray-400 text-sm">{stats.total} total merchants</p>
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
          <p className="text-2xl font-bold text-green-600">{stats.open}</p>
          <p className="text-xs text-gray-500">Open</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
          <p className="text-xs text-gray-500">Closed</p>
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
            placeholder="Search by name, owner, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border-0 focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'open', 'closed', 'suspended'] as FilterStatus[]).map((status) => (
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

        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'restaurant', 'grocery', 'convenience', 'pharmacy'] as FilterCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              {cat === 'all' ? 'All Categories' : getCategoryIcon(cat) + ' ' + cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Merchant List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading merchants...</div>
        ) : filteredMerchants.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No merchants found</div>
        ) : (
          filteredMerchants.map((merchant) => (
            <Card key={merchant.id} className="!p-4">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
                  {getCategoryIcon(merchant.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{merchant.businessName}</h3>
                    {getStatusBadge(merchant)}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{merchant.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">• {merchant.totalOrders} orders</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{merchant.address}</span>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowActionMenu(showActionMenu === merchant.id ? null : merchant.id)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <MoreVertical className="h-5 w-5 text-gray-400" />
                  </button>
                  {showActionMenu === merchant.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border z-10 py-2 min-w-[160px]">
                      <button
                        onClick={() => {
                          setSelectedMerchant(merchant)
                          setShowMerchantModal(true)
                          setShowActionMenu(null)
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => window.open(`tel:${merchant.phone}`)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Call Merchant
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Store className="h-4 w-4" />
                        View Store
                      </button>
                      <hr className="my-2" />
                      {merchant.isSuspended ? (
                        <button
                          onClick={() => handleSuspendMerchant(merchant.id, false)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Unsuspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspendMerchant(merchant.id, true)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                        >
                          <Ban className="h-4 w-4" />
                          Suspend Merchant
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

      {/* Merchant Detail Modal */}
      {selectedMerchant && (
        <Modal
          isOpen={showMerchantModal}
          onClose={() => setShowMerchantModal(false)}
          title="Merchant Details"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center text-3xl">
                {getCategoryIcon(selectedMerchant.category)}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{selectedMerchant.businessName}</h3>
                <p className="text-sm text-gray-500">{selectedMerchant.ownerName}</p>
                {getStatusBadge(selectedMerchant)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Star className="h-4 w-4" />
                  <span className="text-sm">Rating</span>
                </div>
                <p className="text-xl font-bold">{selectedMerchant.rating.toFixed(1)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="text-sm">Total Orders</span>
                </div>
                <p className="text-xl font-bold">{selectedMerchant.totalOrders}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Revenue</span>
                </div>
                <p className="text-xl font-bold">₱{selectedMerchant.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Commission</span>
                </div>
                <p className="text-xl font-bold">{selectedMerchant.commissionRate}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Contact Information</h4>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{selectedMerchant.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{selectedMerchant.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{selectedMerchant.address}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Business Information</h4>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium capitalize">{selectedMerchant.category}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm text-gray-500">Joined</p>
                <p className="font-medium">{selectedMerchant.joinedAt.toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => window.open(`tel:${selectedMerchant.phone}`)}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              {selectedMerchant.isSuspended ? (
                <Button
                  fullWidth
                  onClick={() => {
                    handleSuspendMerchant(selectedMerchant.id, false)
                    setShowMerchantModal(false)
                  }}
                >
                  Unsuspend
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  fullWidth
                  onClick={() => {
                    handleSuspendMerchant(selectedMerchant.id, true)
                    setShowMerchantModal(false)
                  }}
                >
                  Suspend
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
const MOCK_MERCHANTS: Merchant[] = [
  {
    id: '1',
    businessName: 'Jollibee - SM City',
    ownerName: 'Tony Tan Caktiong',
    email: 'jollibee@example.com',
    phone: '+639123456789',
    category: 'restaurant',
    address: 'SM City Manila, Ground Floor',
    status: 'open',
    isApproved: true,
    isSuspended: false,
    rating: 4.7,
    totalOrders: 15420,
    totalRevenue: 7850000,
    commissionRate: 15,
    joinedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    businessName: 'Puregold Price Club',
    ownerName: 'Lucio Co',
    email: 'puregold@example.com',
    phone: '+639987654321',
    category: 'grocery',
    address: 'Shaw Blvd, Mandaluyong',
    status: 'open',
    isApproved: true,
    isSuspended: false,
    rating: 4.5,
    totalOrders: 8900,
    totalRevenue: 4500000,
    commissionRate: 12,
    joinedAt: new Date('2024-02-15'),
  },
  {
    id: '3',
    businessName: '7-Eleven Taft',
    ownerName: 'Manager Name',
    email: '7eleven@example.com',
    phone: '+639555123456',
    category: 'convenience',
    address: 'Taft Avenue, Manila',
    status: 'open',
    isApproved: true,
    isSuspended: false,
    rating: 4.3,
    totalOrders: 5600,
    totalRevenue: 1200000,
    commissionRate: 10,
    joinedAt: new Date('2024-03-01'),
  },
  {
    id: '4',
    businessName: 'Mercury Drug - Makati',
    ownerName: 'Pharmacist Name',
    email: 'mercury@example.com',
    phone: '+639777888999',
    category: 'pharmacy',
    address: 'Ayala Ave, Makati',
    status: 'closed',
    isApproved: true,
    isSuspended: false,
    rating: 4.8,
    totalOrders: 3200,
    totalRevenue: 980000,
    commissionRate: 8,
    joinedAt: new Date('2024-04-10'),
  },
]
