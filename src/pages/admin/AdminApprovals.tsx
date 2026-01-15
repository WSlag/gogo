import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Car,
  Store,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Phone,
  Mail,
  MapPin,
  Eye,
  Download,
  AlertCircle,
} from 'lucide-react'
import { Card, Avatar, Badge, Button, Modal } from '@/components/ui'
import { collection, query, where, orderBy, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/services/firebase/config'

interface DriverApplication {
  id: string
  type: 'driver'
  name: string
  email: string
  phone: string
  photoURL?: string
  vehicleType: 'motorcycle' | 'car' | 'suv'
  vehiclePlate: string
  vehicleModel: string
  vehicleYear: string
  licenseNumber: string
  address: string
  submittedAt: Date
  documents: {
    license: string
    registration: string
    insurance: string
    nbi: string
    photo: string
  }
}

interface MerchantApplication {
  id: string
  type: 'merchant'
  businessName: string
  ownerName: string
  email: string
  phone: string
  photoURL?: string
  category: 'restaurant' | 'grocery' | 'convenience' | 'pharmacy'
  address: string
  submittedAt: Date
  documents: {
    businessPermit: string
    sanitaryPermit: string
    bir: string
    validId: string
    photo: string
  }
}

type Application = DriverApplication | MerchantApplication
type FilterType = 'all' | 'driver' | 'merchant'

export default function AdminApprovals() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<FilterType>(
    (searchParams.get('type') as FilterType) || 'all'
  )
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<{ name: string; url: string } | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [filterType])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      // Fetch pending driver applications
      const driverQuery = query(
        collection(db, 'users'),
        where('role', '==', 'driver'),
        where('driverInfo.isApproved', '==', false),
        where('driverInfo.applicationStatus', '==', 'pending'),
        orderBy('driverInfo.submittedAt', 'desc')
      )

      // Fetch pending merchant applications
      // Query for merchants with applicationStatus === 'pending' OR isApproved === false
      // We need to handle legacy data that may not have applicationStatus set
      const merchantQueryPending = query(
        collection(db, 'merchants'),
        where('applicationStatus', '==', 'pending')
      )

      const merchantQueryUnapproved = query(
        collection(db, 'merchants'),
        where('isApproved', '==', false)
      )

      const [driverSnapshot, merchantPendingSnapshot, merchantUnapprovedSnapshot] = await Promise.all([
        filterType !== 'merchant' ? getDocs(driverQuery) : { docs: [] },
        filterType !== 'driver' ? getDocs(merchantQueryPending) : { docs: [] },
        filterType !== 'driver' ? getDocs(merchantQueryUnapproved) : { docs: [] },
      ])

      const driverApps: DriverApplication[] = driverSnapshot.docs?.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          type: 'driver' as const,
          name: data.displayName || 'Unknown',
          email: data.email || '',
          phone: data.phone || '',
          photoURL: data.photoURL,
          vehicleType: data.driverInfo?.vehicleType || 'motorcycle',
          vehiclePlate: data.driverInfo?.vehiclePlate || '',
          vehicleModel: data.driverInfo?.vehicleModel || '',
          vehicleYear: data.driverInfo?.vehicleYear || '',
          licenseNumber: data.driverInfo?.licenseNumber || '',
          address: data.address || '',
          submittedAt: data.driverInfo?.submittedAt?.toDate() || new Date(),
          documents: data.driverInfo?.documents || {},
        }
      }) || []

      // Combine and deduplicate merchant results
      const merchantDocsMap = new Map<string, typeof merchantPendingSnapshot.docs[0]>()
      merchantPendingSnapshot.docs?.forEach(doc => merchantDocsMap.set(doc.id, doc))
      merchantUnapprovedSnapshot.docs?.forEach(doc => merchantDocsMap.set(doc.id, doc))

      const merchantApps: MerchantApplication[] = Array.from(merchantDocsMap.values()).map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          type: 'merchant' as const,
          businessName: data.businessName || data.name || 'Unknown',
          ownerName: data.ownerName || '',
          email: data.email || '',
          phone: data.phone || '',
          photoURL: data.photoURL || data.coverImage,
          category: data.category || data.type || 'restaurant',
          address: data.address || '',
          submittedAt: data.submittedAt?.toDate() || data.createdAt?.toDate() || new Date(),
          documents: data.documents || {},
        }
      }).sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())

      setApplications([...driverApps, ...merchantApps])
    } catch (error) {
      console.error('Error fetching applications:', error)
      // Use mock data for demo
      setApplications(MOCK_APPLICATIONS)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (application: Application) => {
    setProcessing(true)
    try {
      if (application.type === 'driver') {
        await updateDoc(doc(db, 'users', application.id), {
          'driverInfo.isApproved': true,
          'driverInfo.applicationStatus': 'approved',
          'driverInfo.approvedAt': Timestamp.now(),
        })
      } else {
        await updateDoc(doc(db, 'merchants', application.id), {
          isApproved: true,
          applicationStatus: 'approved',
          approvedAt: Timestamp.now(),
        })
      }
      fetchApplications()
      setShowDetailModal(false)
    } catch (error) {
      console.error('Error approving application:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (application: Application, reason: string = '') => {
    setProcessing(true)
    try {
      if (application.type === 'driver') {
        await updateDoc(doc(db, 'users', application.id), {
          'driverInfo.applicationStatus': 'rejected',
          'driverInfo.rejectedAt': Timestamp.now(),
          'driverInfo.rejectionReason': reason,
        })
      } else {
        await updateDoc(doc(db, 'merchants', application.id), {
          applicationStatus: 'rejected',
          rejectedAt: Timestamp.now(),
          rejectionReason: reason,
        })
      }
      fetchApplications()
      setShowDetailModal(false)
    } catch (error) {
      console.error('Error rejecting application:', error)
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    if (diff < 7) return `${diff} days ago`
    return date.toLocaleDateString()
  }

  const stats = {
    total: applications.length,
    drivers: applications.filter((a) => a.type === 'driver').length,
    merchants: applications.filter((a) => a.type === 'merchant').length,
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
            <h1 className="text-lg font-bold">Pending Approvals</h1>
            <p className="text-gray-400 text-sm">{stats.total} applications waiting</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 p-4">
        <div className="bg-white rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.drivers}</p>
          <p className="text-xs text-gray-500">Drivers</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-orange-600">{stats.merchants}</p>
          <p className="text-xs text-gray-500">Merchants</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4">
        <div className="flex gap-2">
          {(['all', 'driver', 'merchant'] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium ${
                filterType === type
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              {type === 'all' ? 'All' : type === 'driver' ? 'Drivers' : 'Merchants'}
            </button>
          ))}
        </div>
      </div>

      {/* Application List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">All caught up!</p>
            <p className="text-sm text-gray-500">No pending applications</p>
          </div>
        ) : (
          applications.map((application) => (
            <Card key={application.id} className="!p-4">
              <div className="flex items-start gap-3">
                {application.type === 'driver' ? (
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Car className="h-6 w-6 text-green-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Store className="h-6 w-6 text-orange-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {application.type === 'driver'
                        ? (application as DriverApplication).name
                        : (application as MerchantApplication).businessName}
                    </h3>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {application.type === 'driver'
                      ? `${(application as DriverApplication).vehicleType} • ${(application as DriverApplication).vehiclePlate}`
                      : `${(application as MerchantApplication).category} • ${(application as MerchantApplication).ownerName}`}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>Submitted {formatDate(application.submittedAt)}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedApplication(application)
                    setShowDetailModal(true)
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <Eye className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => handleReject(application)}
                >
                  <XCircle className="h-4 w-4 mr-1 text-red-500" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  fullWidth
                  onClick={() => handleApprove(application)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedApplication && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={selectedApplication.type === 'driver' ? 'Driver Application' : 'Merchant Application'}
        >
          <div className="space-y-4">
            {selectedApplication.type === 'driver' ? (
              // Driver Details
              <>
                <div className="flex items-center gap-4">
                  <Avatar
                    name={(selectedApplication as DriverApplication).name}
                    src={(selectedApplication as DriverApplication).photoURL}
                    size="xl"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{(selectedApplication as DriverApplication).name}</h3>
                    <Badge variant="warning">Pending Review</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Contact Information</h4>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{(selectedApplication as DriverApplication).phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{(selectedApplication as DriverApplication).email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{(selectedApplication as DriverApplication).address || 'Not provided'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Vehicle Information</h4>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="font-medium">{(selectedApplication as DriverApplication).vehicleModel}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedApplication as DriverApplication).vehicleType.toUpperCase()} •
                      {(selectedApplication as DriverApplication).vehiclePlate} •
                      {(selectedApplication as DriverApplication).vehicleYear}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-sm text-gray-500">License Number</p>
                    <p className="font-medium">{(selectedApplication as DriverApplication).licenseNumber}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Submitted Documents</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries((selectedApplication as DriverApplication).documents || {}).map(([key, url]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedDocument({ name: key, url })
                          setShowDocumentModal(true)
                        }}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100"
                      >
                        <FileText className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              // Merchant Details
              <>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Store className="h-8 w-8 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{(selectedApplication as MerchantApplication).businessName}</h3>
                    <p className="text-sm text-gray-500">{(selectedApplication as MerchantApplication).ownerName}</p>
                    <Badge variant="warning">Pending Review</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Contact Information</h4>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{(selectedApplication as MerchantApplication).phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{(selectedApplication as MerchantApplication).email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{(selectedApplication as MerchantApplication).address}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Business Information</h4>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium capitalize">{(selectedApplication as MerchantApplication).category}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Submitted Documents</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries((selectedApplication as MerchantApplication).documents || {}).map(([key, url]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedDocument({ name: key, url })
                          setShowDocumentModal(true)
                        }}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100"
                      >
                        <FileText className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Warning */}
            <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-xl">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Review carefully</p>
                <p className="text-xs text-yellow-700">
                  Please verify all documents before approving. Check for authenticity and completeness.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => handleReject(selectedApplication)}
                disabled={processing}
              >
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                Reject
              </Button>
              <Button
                fullWidth
                onClick={() => handleApprove(selectedApplication)}
                isLoading={processing}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Document Preview Modal */}
      {selectedDocument && (
        <Modal
          isOpen={showDocumentModal}
          onClose={() => setShowDocumentModal(false)}
          title={selectedDocument.name.replace(/([A-Z])/g, ' $1')}
        >
          <div className="space-y-4">
            {selectedDocument.url ? (
              <img
                src={selectedDocument.url}
                alt={selectedDocument.name}
                className="w-full rounded-xl"
              />
            ) : (
              <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                <p className="text-gray-500">Document not available</p>
              </div>
            )}
            <Button
              variant="outline"
              fullWidth
              onClick={() => window.open(selectedDocument.url, '_blank')}
              disabled={!selectedDocument.url}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Full Size
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// Mock data for demo
const MOCK_APPLICATIONS: Application[] = [
  {
    id: '1',
    type: 'driver',
    name: 'Roberto Cruz',
    email: 'roberto@example.com',
    phone: '+639123456789',
    vehicleType: 'motorcycle',
    vehiclePlate: 'ABC 1234',
    vehicleModel: 'Honda Click 125i',
    vehicleYear: '2023',
    licenseNumber: 'N01-23-456789',
    address: 'Quezon City, Metro Manila',
    submittedAt: new Date(Date.now() - 86400000),
    documents: {
      license: '/placeholder-doc.jpg',
      registration: '/placeholder-doc.jpg',
      insurance: '/placeholder-doc.jpg',
      nbi: '/placeholder-doc.jpg',
      photo: '/placeholder-doc.jpg',
    },
  },
  {
    id: '2',
    type: 'merchant',
    businessName: 'Karinderia ni Aling Nena',
    ownerName: 'Nena Santos',
    email: 'nena@example.com',
    phone: '+639987654321',
    category: 'restaurant',
    address: 'Taft Avenue, Manila',
    submittedAt: new Date(Date.now() - 172800000),
    documents: {
      businessPermit: '/placeholder-doc.jpg',
      sanitaryPermit: '/placeholder-doc.jpg',
      bir: '/placeholder-doc.jpg',
      validId: '/placeholder-doc.jpg',
      photo: '/placeholder-doc.jpg',
    },
  },
  {
    id: '3',
    type: 'driver',
    name: 'Mark Gonzales',
    email: 'mark@example.com',
    phone: '+639555123456',
    vehicleType: 'car',
    vehiclePlate: 'XYZ 5678',
    vehicleModel: 'Toyota Vios',
    vehicleYear: '2022',
    licenseNumber: 'N02-22-789012',
    address: 'Makati City',
    submittedAt: new Date(Date.now() - 259200000),
    documents: {
      license: '/placeholder-doc.jpg',
      registration: '/placeholder-doc.jpg',
      insurance: '/placeholder-doc.jpg',
      nbi: '/placeholder-doc.jpg',
      photo: '/placeholder-doc.jpg',
    },
  },
]
