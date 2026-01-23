import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Store,
  Clock,
  MapPin,
  Phone,
  Mail,
  Edit2,
  Camera,
  Bell,
  CreditCard,
  Shield,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  Save,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { Card, Button, Modal, Input, Spinner } from '@/components/ui'
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/services/firebase/config'
import { useMerchantImageUpload } from '@/hooks/useImageUpload'
import { useMerchantApplication } from '@/hooks/useMerchantApplication'
import type { OperatingHours } from '@/types/merchant'

interface MerchantSettings {
  businessName: string
  ownerName: string
  email: string
  phone: string
  address: string
  photoURL?: string
  category: string
  description?: string
  operatingHours: {
    monday: { open: string; close: string; isOpen: boolean }
    tuesday: { open: string; close: string; isOpen: boolean }
    wednesday: { open: string; close: string; isOpen: boolean }
    thursday: { open: string; close: string; isOpen: boolean }
    friday: { open: string; close: string; isOpen: boolean }
    saturday: { open: string; close: string; isOpen: boolean }
    sunday: { open: string; close: string; isOpen: boolean }
  }
  settings: {
    autoAcceptOrders: boolean
    notifications: boolean
    soundAlerts: boolean
    preparationTime: number
    minimumOrder: number
    deliveryRadius: number
  }
}

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

const DEFAULT_OPERATING_HOURS: MerchantSettings['operatingHours'] = {
  monday: { open: '08:00', close: '22:00', isOpen: true },
  tuesday: { open: '08:00', close: '22:00', isOpen: true },
  wednesday: { open: '08:00', close: '22:00', isOpen: true },
  thursday: { open: '08:00', close: '22:00', isOpen: true },
  friday: { open: '08:00', close: '22:00', isOpen: true },
  saturday: { open: '08:00', close: '22:00', isOpen: true },
  sunday: { open: '09:00', close: '21:00', isOpen: true },
}

const DAY_NAMES: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

function mapOperatingHours(raw: unknown): MerchantSettings['operatingHours'] {
  if (!raw) return { ...DEFAULT_OPERATING_HOURS }

  // Record format from registration: { monday: { open, close, isOpen } }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const record = raw as Record<string, { open?: string; close?: string; isOpen?: boolean }>
    const result = { ...DEFAULT_OPERATING_HOURS }
    for (const day of Object.keys(result) as DayOfWeek[]) {
      if (record[day]) {
        result[day] = {
          open: record[day].open || '08:00',
          close: record[day].close || '22:00',
          isOpen: record[day].isOpen !== undefined ? record[day].isOpen! : true,
        }
      }
    }
    return result
  }

  // Array format: [{ day: 0-6, open, close, isClosed }]
  if (Array.isArray(raw)) {
    const result = { ...DEFAULT_OPERATING_HOURS }
    for (const entry of raw as OperatingHours[]) {
      const dayName = DAY_NAMES[entry.day]
      if (dayName) {
        result[dayName] = {
          open: entry.open || '08:00',
          close: entry.close || '22:00',
          isOpen: !entry.isClosed,
        }
      }
    }
    return result
  }

  return { ...DEFAULT_OPERATING_HOURS }
}

export default function MerchantSettings() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<MerchantSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editField, setEditField] = useState<string>('')
  const [editValue, setEditValue] = useState<string>('')
  const [showHoursModal, setShowHoursModal] = useState(false)

  // Image upload
  const { merchantData, isLoading: applicationLoading } = useMerchantApplication()
  const merchantId = merchantData?.id || ''
  const { uploadBannerImage, uploadState } = useMerchantImageUpload(merchantId)
  const isUploading = uploadState.status === 'uploading'

  useEffect(() => {
    if (merchantId) {
      fetchSettings()
    }
  }, [merchantId])

  const fetchSettings = async () => {
    if (!merchantId) return
    setLoading(true)
    try {
      const merchantRef = doc(db, 'merchants', merchantId)
      const merchantSnap = await getDoc(merchantRef)

      if (merchantSnap.exists()) {
        const data = merchantSnap.data()
        const mappedSettings: MerchantSettings = {
          businessName: data.businessName || data.name || '',
          ownerName: data.ownerName || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          photoURL: data.photoURL || data.logo || data.coverImage || '',
          category: data.category || data.type || '',
          description: data.description || '',
          operatingHours: mapOperatingHours(data.operatingHours),
          settings: {
            autoAcceptOrders: data.settings?.autoAcceptOrders ?? false,
            notifications: data.settings?.notifications ?? true,
            soundAlerts: data.settings?.soundAlerts ?? true,
            preparationTime: data.settings?.preparationTime ?? 15,
            minimumOrder: data.settings?.minimumOrder ?? 100,
            deliveryRadius: data.settings?.deliveryRadius ?? 5,
          },
        }
        setSettings(mappedSettings)
      } else {
        console.error('Merchant document not found for ID:', merchantId)
        setSettings(null)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setSettings(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveField = async () => {
    if (!settings || !merchantId) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'merchants', merchantId), {
        [editField]: editValue,
        updatedAt: Timestamp.now(),
      })

      setSettings((prev) => {
        if (!prev) return null
        return { ...prev, [editField]: editValue }
      })
      setShowEditModal(false)
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleSetting = async (key: keyof MerchantSettings['settings']) => {
    if (!settings || !merchantId) return
    const newValue = !settings.settings[key]

    // Optimistic update
    setSettings((prev) => {
      if (!prev) return null
      return {
        ...prev,
        settings: { ...prev.settings, [key]: newValue },
      }
    })

    try {
      await updateDoc(doc(db, 'merchants', merchantId), {
        [`settings.${key}`]: newValue,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error('Error saving setting:', error)
      // Revert on failure
      setSettings((prev) => {
        if (!prev) return null
        return {
          ...prev,
          settings: { ...prev.settings, [key]: !newValue },
        }
      })
    }
  }

  const handleToggleDay = async (day: DayOfWeek) => {
    if (!settings || !merchantId) return
    const newIsOpen = !settings.operatingHours[day].isOpen

    setSettings((prev) => {
      if (!prev) return null
      return {
        ...prev,
        operatingHours: {
          ...prev.operatingHours,
          [day]: { ...prev.operatingHours[day], isOpen: newIsOpen },
        },
      }
    })

    try {
      await updateDoc(doc(db, 'merchants', merchantId), {
        [`operatingHours.${day}.isOpen`]: newIsOpen,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error('Error toggling day:', error)
      setSettings((prev) => {
        if (!prev) return null
        return {
          ...prev,
          operatingHours: {
            ...prev.operatingHours,
            [day]: { ...prev.operatingHours[day], isOpen: !newIsOpen },
          },
        }
      })
    }
  }

  const handleSaveHours = async () => {
    if (!settings || !merchantId) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'merchants', merchantId), {
        operatingHours: settings.operatingHours,
        updatedAt: Timestamp.now(),
      })
      setShowHoursModal(false)
    } catch (error) {
      console.error('Error saving hours:', error)
    } finally {
      setSaving(false)
    }
  }

  const openEditModal = (field: string, value: string) => {
    setEditField(field)
    setEditValue(value)
    setShowEditModal(true)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !merchantId) return

    try {
      const url = await uploadBannerImage(file)
      if (url) {
        // Update local state
        setSettings((prev) => prev ? { ...prev, photoURL: url } : null)

        // Update in Firestore
        if (merchantId) {
          await updateDoc(doc(db, 'merchants', merchantId), {
            photoURL: url,
            updatedAt: Timestamp.now(),
          })
        }
      }
    } catch (error) {
      console.error('Photo upload failed:', error)
    }

    e.target.value = ''
  }

  if (loading || applicationLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Settings not found</p>
      </div>
    )
  }

  const menuItems = [
    { icon: CreditCard, label: 'Payment Settings', path: '/merchant/payment' },
    { icon: Shield, label: 'Security', path: '/merchant/security' },
    { icon: FileText, label: 'Documents', path: '/merchant/documents' },
    { icon: HelpCircle, label: 'Help & Support', path: '/merchant/support' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 pb-6">
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/merchant')} className="p-1">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold">Settings</h1>
        </div>
      </div>

      {/* Business Profile */}
      <div className="px-4 py-4">
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-orange-100 rounded-xl flex items-center justify-center overflow-hidden">
                {settings.photoURL ? (
                  <img src={settings.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Store className="h-10 w-10 text-orange-500" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                    <Spinner size="sm" className="text-white" />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 p-1.5 bg-orange-500 rounded-full cursor-pointer hover:bg-orange-600 transition">
                <Camera className="h-4 w-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">{settings.businessName}</h2>
              <p className="text-sm text-gray-500 capitalize">{settings.category}</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => openEditModal('businessName', settings.businessName)}
              className="w-full flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-gray-400" />
                <div className="text-left">
                  <p className="text-xs text-gray-500">Business Name</p>
                  <p className="text-sm font-medium">{settings.businessName}</p>
                </div>
              </div>
              <Edit2 className="h-4 w-4 text-gray-400" />
            </button>

            <button
              onClick={() => openEditModal('phone', settings.phone)}
              className="w-full flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div className="text-left">
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium">{settings.phone}</p>
                </div>
              </div>
              <Edit2 className="h-4 w-4 text-gray-400" />
            </button>

            <button
              onClick={() => openEditModal('address', settings.address)}
              className="w-full flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div className="text-left">
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm font-medium">{settings.address}</p>
                </div>
              </div>
              <Edit2 className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </Card>
      </div>

      {/* Operating Hours */}
      <div className="px-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Operating Hours</h3>
            </div>
            <button
              onClick={() => setShowHoursModal(true)}
              className="text-sm text-orange-500 font-medium"
            >
              Edit
            </button>
          </div>
          <div className="space-y-2">
            {(Object.keys(settings.operatingHours) as DayOfWeek[]).map((day) => {
              const hours = settings.operatingHours[day]
              return (
                <div key={day} className="flex items-center justify-between py-1">
                  <span className="text-sm capitalize text-gray-600">{day}</span>
                  <span className={`text-sm font-medium ${hours.isOpen ? 'text-gray-900' : 'text-gray-400'}`}>
                    {hours.isOpen ? `${hours.open} - ${hours.close}` : 'Closed'}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Order Settings */}
      <div className="px-4 mt-4">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Order Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Auto-Accept Orders</p>
                <p className="text-xs text-gray-500">Automatically accept new orders</p>
              </div>
              <button onClick={() => handleToggleSetting('autoAcceptOrders')}>
                {settings.settings.autoAcceptOrders ? (
                  <ToggleRight className="h-8 w-8 text-green-500" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-gray-300" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Preparation Time</p>
                <p className="text-xs text-gray-500">Default prep time for orders</p>
              </div>
              <button className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                {settings.settings.preparationTime} min
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Minimum Order</p>
                <p className="text-xs text-gray-500">Minimum order value</p>
              </div>
              <button className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                ₱{settings.settings.minimumOrder}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Delivery Radius</p>
                <p className="text-xs text-gray-500">Maximum delivery distance</p>
              </div>
              <button className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                {settings.settings.deliveryRadius} km
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Notification Settings */}
      <div className="px-4 mt-4">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-xs text-gray-500">Receive order notifications</p>
              </div>
              <button onClick={() => handleToggleSetting('notifications')}>
                {settings.settings.notifications ? (
                  <ToggleRight className="h-8 w-8 text-green-500" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-gray-300" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Sound Alerts</p>
                <p className="text-xs text-gray-500">Play sound for new orders</p>
              </div>
              <button onClick={() => handleToggleSetting('soundAlerts')}>
                {settings.settings.soundAlerts ? (
                  <ToggleRight className="h-8 w-8 text-green-500" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-gray-300" />
                )}
              </button>
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

      {/* Logout */}
      <div className="px-4 mt-4">
        <Button
          variant="outline"
          fullWidth
          onClick={() => navigate('/welcome')}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit ${editField.charAt(0).toUpperCase() + editField.slice(1)}`}
      >
        <div className="space-y-4">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={`Enter ${editField}`}
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

      {/* Hours Modal */}
      <Modal
        isOpen={showHoursModal}
        onClose={() => setShowHoursModal(false)}
        title="Operating Hours"
      >
        <div className="space-y-3">
          {(Object.keys(settings.operatingHours) as DayOfWeek[]).map((day) => {
            const hours = settings.operatingHours[day]
            return (
              <div key={day} className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-3">
                  <button onClick={() => handleToggleDay(day)}>
                    {hours.isOpen ? (
                      <ToggleRight className="h-6 w-6 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-gray-300" />
                    )}
                  </button>
                  <span className="capitalize font-medium">{day}</span>
                </div>
                {hours.isOpen && (
                  <div className="flex items-center gap-2 text-sm">
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) => {
                        setSettings((prev) => {
                          if (!prev) return null
                          return {
                            ...prev,
                            operatingHours: {
                              ...prev.operatingHours,
                              [day]: { ...hours, open: e.target.value },
                            },
                          }
                        })
                      }}
                      className="px-2 py-1 border rounded"
                    />
                    <span>-</span>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) => {
                        setSettings((prev) => {
                          if (!prev) return null
                          return {
                            ...prev,
                            operatingHours: {
                              ...prev.operatingHours,
                              [day]: { ...hours, close: e.target.value },
                            },
                          }
                        })
                      }}
                      className="px-2 py-1 border rounded"
                    />
                  </div>
                )}
              </div>
            )
          })}
          <Button fullWidth onClick={handleSaveHours} isLoading={saving}>
            <Save className="h-4 w-4 mr-2" />
            Save Hours
          </Button>
        </div>
      </Modal>
    </div>
  )
}

