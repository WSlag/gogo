import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Home,
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Star,
  Search,
  Navigation,
  AlertCircle,
} from 'lucide-react'
import { Button, Card, Modal, Spinner } from '@/components/ui'
import { useAddresses, useLocation } from '@/hooks'
import { GeoPoint } from '@/services/firebase/firestore'
import type { SavedLocation } from '@/types'

export default function Addresses() {
  const navigate = useNavigate()
  const {
    addresses,
    isLoading: isLoadingAddresses,
    error: addressError,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddresses()
  const { searchPlaces, getPlaceDetails, getCurrentLocation, isLocationLoading } = useLocation()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<SavedLocation | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    label: '',
    type: 'other' as 'home' | 'work' | 'other',
    address: '',
    details: '',
    coordinates: null as { lat: number; lng: number } | null,
  })

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ address: string; placeId?: string }[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Search for addresses
  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 3) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      const results = await searchPlaces(searchQuery)
      setSearchResults(results.map(r => ({ address: r.address, placeId: r.placeId })))
      setIsSearching(false)
    }

    const debounce = setTimeout(search, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery, searchPlaces])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return Home
      case 'work':
        return Briefcase
      default:
        return MapPin
    }
  }

  const handleAdd = () => {
    setSelectedAddress(null)
    setFormData({ label: '', type: 'other', address: '', details: '', coordinates: null })
    setSearchQuery('')
    setSearchResults([])
    setShowAddModal(true)
  }

  const handleEdit = (address: SavedLocation) => {
    setSelectedAddress(address)
    const coords = address.coordinates as any
    setFormData({
      label: address.label,
      type: address.type,
      address: address.address,
      details: address.details || '',
      coordinates: coords ? { lat: coords.latitude, lng: coords.longitude } : null,
    })
    setSearchQuery('')
    setSearchResults([])
    setShowAddModal(true)
  }

  const handleDelete = (address: SavedLocation) => {
    setSelectedAddress(address)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!selectedAddress) return

    setIsDeleting(true)
    const success = await deleteAddress(selectedAddress.id)
    setIsDeleting(false)

    if (success) {
      setShowDeleteModal(false)
      setSelectedAddress(null)
    }
  }

  const handleSelectSearchResult = async (result: { address: string; placeId?: string }) => {
    setFormData({ ...formData, address: result.address })
    setSearchQuery('')
    setSearchResults([])

    // Get coordinates for the selected place
    if (result.placeId) {
      const details = await getPlaceDetails(result.placeId)
      if (details) {
        setFormData(prev => ({
          ...prev,
          address: details.address,
          coordinates: details.coordinates,
        }))
      }
    }
  }

  const handleUseCurrentLocation = async () => {
    const location = await getCurrentLocation()
    if (location) {
      setFormData(prev => ({
        ...prev,
        address: location.address,
        coordinates: location.coordinates,
      }))
      setSearchQuery('')
      setSearchResults([])
    }
  }

  const handleSave = async () => {
    if (!formData.label || !formData.address) return

    setIsSaving(true)

    // Default coordinates to Cotabato City if not set
    const coordinates = formData.coordinates || { lat: 7.2047, lng: 124.2530 }

    if (selectedAddress) {
      // Edit existing
      const success = await updateAddress(selectedAddress.id, {
        label: formData.label,
        type: formData.type,
        address: formData.address,
        details: formData.details || undefined,
        coordinates: new GeoPoint(coordinates.lat, coordinates.lng),
      })

      if (success) {
        setShowAddModal(false)
        setSelectedAddress(null)
      }
    } else {
      // Add new
      const success = await addAddress({
        label: formData.label,
        type: formData.type,
        address: formData.address,
        coordinates: new GeoPoint(coordinates.lat, coordinates.lng),
        details: formData.details || undefined,
      })

      if (success) {
        setShowAddModal(false)
        setSelectedAddress(null)
      }
    }

    setIsSaving(false)
  }

  const handleSetAsDefault = async (address: SavedLocation) => {
    await setDefaultAddress(address.id)
  }

  if (isLoadingAddresses) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Saved Addresses</h1>
        </div>
      </div>

      {/* Error Message */}
      {addressError && (
        <div className="mx-4 mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{addressError}</span>
        </div>
      )}

      <div className="p-4 space-y-3">
        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <MapPin className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900">No saved addresses</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add addresses for faster checkout
            </p>
          </div>
        ) : (
          addresses.map((address, index) => {
            const Icon = getTypeIcon(address.type)
            const isDefault = index === 0

            return (
              <Card key={address.id}>
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    address.type === 'home'
                      ? 'bg-blue-50'
                      : address.type === 'work'
                      ? 'bg-purple-50'
                      : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      address.type === 'home'
                        ? 'text-blue-600'
                        : address.type === 'work'
                        ? 'text-purple-600'
                        : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{address.label}</p>
                      {isDefault && (
                        <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-600">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{address.address}</p>
                    {address.details && (
                      <p className="text-sm text-gray-400">{address.details}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(address)}
                      className="rounded-full p-2 hover:bg-gray-100"
                    >
                      <Edit2 className="h-4 w-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(address)}
                      className="rounded-full p-2 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                {!isDefault && (
                  <button
                    onClick={() => handleSetAsDefault(address)}
                    className="mt-3 flex items-center gap-1 text-sm text-primary-600 font-medium"
                  >
                    <Star className="h-4 w-4" />
                    Set as default
                  </button>
                )}
              </Card>
            )
          })
        )}
      </div>

      {/* Add Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-safe">
        <Button
          fullWidth
          size="lg"
          onClick={handleAdd}
          leftIcon={<Plus className="h-5 w-5" />}
        >
          Add New Address
        </Button>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={selectedAddress ? 'Edit Address' : 'Add Address'}
      >
        <div className="space-y-4">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Type
            </label>
            <div className="flex gap-2">
              {[
                { value: 'home', label: 'Home', icon: Home },
                { value: 'work', label: 'Work', icon: Briefcase },
                { value: 'other', label: 'Other', icon: MapPin },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFormData({ ...formData, type: type.value as any, label: formData.label || type.label })}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-3 transition ${
                    formData.type === type.value
                      ? 'bg-primary-50 ring-2 ring-primary-500'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <type.icon className={`h-5 w-5 ${
                    formData.type === type.value ? 'text-primary-600' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                    formData.type === type.value ? 'text-primary-600' : 'text-gray-600'
                  }`}>
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="e.g., Home, Office, Mom's House"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          {/* Address Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery || formData.address}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setFormData({ ...formData, address: e.target.value })
                }}
                placeholder="Search for address"
                className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            {/* Use Current Location */}
            <button
              onClick={handleUseCurrentLocation}
              disabled={isLocationLoading}
              className="mt-2 flex w-full items-center gap-2 rounded-lg bg-gray-50 p-3 text-sm text-primary-600 hover:bg-gray-100"
            >
              {isLocationLoading ? (
                <Spinner size="sm" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              <span>Use current location</span>
            </button>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSearchResult(result)}
                    className="flex w-full items-center gap-3 p-3 text-left hover:bg-gray-50"
                  >
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-900 line-clamp-2">{result.address}</span>
                  </button>
                ))}
              </div>
            )}

            {isSearching && (
              <div className="mt-2 flex items-center justify-center py-4">
                <Spinner size="sm" />
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Details (Optional)
            </label>
            <input
              type="text"
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              placeholder="Floor, unit, landmark, etc."
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <Button
            fullWidth
            onClick={handleSave}
            isLoading={isSaving}
            disabled={!formData.label || !formData.address}
          >
            {selectedAddress ? 'Save Changes' : 'Add Address'}
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Address"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this address?
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={confirmDelete}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
