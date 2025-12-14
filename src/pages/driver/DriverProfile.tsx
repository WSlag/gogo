import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Car,
  Phone,
  Mail,
  MapPin,
  Camera,
  Edit2,
  Shield,
  FileText,
  Star,
  Award,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  CheckCircle,
} from 'lucide-react'
import { Card, Avatar, Badge, Button, Modal, Input } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/services/firebase/config'
import { useProfileImageUpload } from '@/hooks/useImageUpload'

interface DriverProfile {
  displayName: string
  email: string
  phone: string
  photoURL?: string
  address?: string
  driverInfo: {
    vehicleType: 'motorcycle' | 'car' | 'suv'
    vehiclePlate: string
    vehicleModel: string
    vehicleYear: string
    vehicleColor: string
    licenseNumber: string
    licenseExpiry: Date
    rating: number
    totalRides: number
    totalEarnings: number
    completionRate: number
    acceptanceRate: number
    isApproved: boolean
    status: 'online' | 'offline' | 'busy'
    documents: {
      license: string
      registration: string
      insurance: string
    }
  }
}

export default function DriverProfile() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<DriverProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editField, setEditField] = useState<string>('')
  const [editValue, setEditValue] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const { uploadImage, uploading } = useProfileImageUpload()

  useEffect(() => {
    if (user?.uid) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user?.uid) return
    setLoading(true)
    try {
      const docRef = doc(db, 'users', user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        setProfile({
          displayName: data.displayName || '',
          email: data.email || '',
          phone: data.phone || '',
          photoURL: data.photoURL,
          address: data.address,
          driverInfo: {
            vehicleType: data.driverInfo?.vehicleType || 'motorcycle',
            vehiclePlate: data.driverInfo?.vehiclePlate || '',
            vehicleModel: data.driverInfo?.vehicleModel || '',
            vehicleYear: data.driverInfo?.vehicleYear || '',
            vehicleColor: data.driverInfo?.vehicleColor || '',
            licenseNumber: data.driverInfo?.licenseNumber || '',
            licenseExpiry: data.driverInfo?.licenseExpiry?.toDate() || new Date(),
            rating: data.driverInfo?.rating || 0,
            totalRides: data.driverInfo?.totalRides || 0,
            totalEarnings: data.driverInfo?.totalEarnings || 0,
            completionRate: data.driverInfo?.completionRate || 0,
            acceptanceRate: data.driverInfo?.acceptanceRate || 0,
            isApproved: data.driverInfo?.isApproved || false,
            status: data.driverInfo?.status || 'offline',
            documents: data.driverInfo?.documents || {},
          },
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Use mock data for demo
      setProfile(MOCK_PROFILE)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.uid) return

    try {
      const url = await uploadImage(file)
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: url,
      })
      setProfile((prev) => prev ? { ...prev, photoURL: url } : null)
    } catch (error) {
      console.error('Error uploading photo:', error)
    }
  }

  const handleSaveField = async () => {
    if (!user?.uid || !editField) return
    setSaving(true)
    try {
      const updateData: Record<string, string> = {}

      if (editField.startsWith('driverInfo.')) {
        updateData[editField] = editValue
      } else {
        updateData[editField] = editValue
      }

      await updateDoc(doc(db, 'users', user.uid), updateData)

      setProfile((prev) => {
        if (!prev) return null
        if (editField.startsWith('driverInfo.')) {
          const field = editField.replace('driverInfo.', '')
          return {
            ...prev,
            driverInfo: {
              ...prev.driverInfo,
              [field]: editValue,
            },
          }
        }
        return { ...prev, [editField]: editValue }
      })

      setShowEditModal(false)
    } catch (error) {
      console.error('Error saving field:', error)
    } finally {
      setSaving(false)
    }
  }

  const openEditModal = (field: string, value: string) => {
    setEditField(field)
    setEditValue(value)
    setShowEditModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Profile not found</p>
      </div>
    )
  }

  const menuItems = [
    { icon: FileText, label: 'Documents', path: '/driver/documents' },
    { icon: Shield, label: 'Verification Status', path: '/driver/verification' },
    { icon: Settings, label: 'Settings', path: '/driver/settings' },
    { icon: Bell, label: 'Notifications', path: '/driver/notifications' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 pb-6">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-4 pb-24">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/driver')} className="p-1">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold">My Profile</h1>
        </div>
      </div>

      {/* Profile Card */}
      <div className="px-4 -mt-16">
        <Card className="!p-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar
                name={profile.displayName}
                src={profile.photoURL}
                size="xl"
                className="w-24 h-24"
              />
              <label className="absolute bottom-0 right-0 p-2 bg-green-500 rounded-full cursor-pointer hover:bg-green-600">
                <Camera className="h-4 w-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-3">{profile.displayName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{profile.driverInfo.rating.toFixed(1)}</span>
              <span className="text-gray-500">• {profile.driverInfo.totalRides} rides</span>
            </div>
            {profile.driverInfo.isApproved && (
              <div className="flex items-center gap-1 mt-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Verified Driver</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{profile.driverInfo.completionRate}%</p>
              <p className="text-xs text-gray-500">Completion</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{profile.driverInfo.acceptanceRate}%</p>
              <p className="text-xs text-gray-500">Acceptance</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">₱{(profile.driverInfo.totalEarnings / 1000).toFixed(0)}K</p>
              <p className="text-xs text-gray-500">Earnings</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Personal Info */}
      <div className="px-4 mt-4">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-4">
            <button
              onClick={() => openEditModal('displayName', profile.displayName)}
              className="w-full flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div className="text-left">
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="text-sm font-medium">{profile.displayName}</p>
                </div>
              </div>
              <Edit2 className="h-4 w-4 text-gray-400" />
            </button>

            <button
              onClick={() => openEditModal('phone', profile.phone)}
              className="w-full flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div className="text-left">
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="text-sm font-medium">{profile.phone}</p>
                </div>
              </div>
              <Edit2 className="h-4 w-4 text-gray-400" />
            </button>

            <div className="flex items-center gap-3 py-2">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium">{profile.email}</p>
              </div>
            </div>

            <button
              onClick={() => openEditModal('address', profile.address || '')}
              className="w-full flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div className="text-left">
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm font-medium">{profile.address || 'Not set'}</p>
                </div>
              </div>
              <Edit2 className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </Card>
      </div>

      {/* Vehicle Info */}
      <div className="px-4 mt-4">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Vehicle Information</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Car className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Vehicle</p>
                  <p className="text-sm font-medium">
                    {profile.driverInfo.vehicleModel} ({profile.driverInfo.vehicleYear})
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-gray-200" style={{ backgroundColor: profile.driverInfo.vehicleColor || '#ccc' }} />
                <div>
                  <p className="text-xs text-gray-500">Color & Plate</p>
                  <p className="text-sm font-medium">
                    {profile.driverInfo.vehicleColor || 'Unknown'} • {profile.driverInfo.vehiclePlate}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">License Number</p>
                  <p className="text-sm font-medium">{profile.driverInfo.licenseNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Menu Items */}
      <div className="px-4 mt-4">
        <Card className="!p-0 overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 ${
                  index !== menuItems.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-400" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            )
          })}
        </Card>
      </div>

      {/* Logout Button */}
      <div className="px-4 mt-4">
        <Button
          variant="outline"
          fullWidth
          onClick={() => {
            // Handle logout
            navigate('/welcome')
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit ${editField.replace('driverInfo.', '').replace(/([A-Z])/g, ' $1')}`}
      >
        <div className="space-y-4">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={`Enter ${editField.replace('driverInfo.', '')}`}
          />
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button fullWidth onClick={handleSaveField} isLoading={saving}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// Mock data for demo
const MOCK_PROFILE: DriverProfile = {
  displayName: 'Juan Dela Cruz',
  email: 'juan@example.com',
  phone: '+639123456789',
  photoURL: undefined,
  address: 'Quezon City, Metro Manila',
  driverInfo: {
    vehicleType: 'motorcycle',
    vehiclePlate: 'ABC 1234',
    vehicleModel: 'Honda Click 125i',
    vehicleYear: '2023',
    vehicleColor: 'Black',
    licenseNumber: 'N01-23-456789',
    licenseExpiry: new Date('2025-12-31'),
    rating: 4.8,
    totalRides: 1250,
    totalEarnings: 125000,
    completionRate: 98,
    acceptanceRate: 92,
    isApproved: true,
    status: 'offline',
    documents: {
      license: '/doc.jpg',
      registration: '/doc.jpg',
      insurance: '/doc.jpg',
    },
  },
}
