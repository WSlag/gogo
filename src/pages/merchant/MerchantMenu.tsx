import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Image,
  Tag,
  Upload,
  X,
} from 'lucide-react'
import { PesoSign } from '@/components/icons'
import { Button, Card, Modal, Input, Spinner } from '@/components/ui'
import { useMerchantImageUpload } from '@/hooks/useImageUpload'
import { useMerchantApplication } from '@/hooks/useMerchantApplication'
import {
  getDocuments,
  deleteDocument,
  setDocument,
  updateDocument,
  collections,
  where,
  serverTimestamp,
} from '@/services/firebase/firestore'
import type { Product } from '@/types'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  comparePrice?: number
  category: string
  image?: string
  available: boolean
}

interface Category {
  id: string
  name: string
}

export default function MerchantMenu() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    category: '',
    image: '',
  })

  // Image upload state
  const { merchantData } = useMerchantApplication()
  const merchantId = merchantData?.id || ''
  const { uploadProductImage, uploadState, reset: resetUpload } = useMerchantImageUpload(merchantId)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Load products from Firestore
  const loadProducts = useCallback(async () => {
    if (!merchantId) return

    setIsLoading(true)
    try {
      const products = await getDocuments<Product>(collections.products, [
        where('merchantId', '==', merchantId),
      ])

      const menuItems: MenuItem[] = products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        comparePrice: p.salePrice,
        category: p.category,
        image: p.image,
        available: p.isAvailable,
      }))

      setItems(menuItems)

      // Extract unique categories from products
      const uniqueCategories = [...new Set(products.map((p) => p.category))].filter(Boolean)
      setCategories(uniqueCategories.map((cat) => ({ id: cat, name: cat })))
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setIsLoading(false)
    }
  }, [merchantId])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const filteredItems = items.filter((item) => {
    if (selectedCategory && item.category !== selectedCategory) return false
    if (searchQuery) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  const handleToggleAvailability = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId)
    if (!item) return

    const newAvailability = !item.available

    // Optimistically update UI
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, available: newAvailability } : i))
    )

    try {
      await updateDocument(collections.products, itemId, {
        isAvailable: newAvailability,
      })
    } catch (error) {
      console.error('Failed to update availability:', error)
      // Revert on error
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, available: !newAvailability } : i))
      )
      alert('Failed to update availability. Please try again.')
    }
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      comparePrice: item.comparePrice?.toString() || '',
      category: item.category,
      image: item.image || '',
    })
    setImagePreview(item.image || null)
    setShowAddModal(true)
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    setDeletingId(itemId)
    try {
      await deleteDocument(collections.products, itemId)
      setItems((prev) => prev.filter((item) => item.id !== itemId))
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('Failed to delete item. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create local preview immediately
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Generate a product ID for new items, or use existing
    const productId = editingItem?.id || `item_${Date.now()}`

    try {
      const url = await uploadProductImage(file, productId)
      if (url) {
        setFormData((prev) => ({ ...prev, image: url }))
      }
    } catch (error) {
      console.error('Upload failed:', error)
      setImagePreview(null)
    }

    // Reset input
    e.target.value = ''
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }))
    setImagePreview(null)
    resetUpload()
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const productData = {
        merchantId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        salePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        category: formData.category,
        image: formData.image || '',
        isFeatured: false,
        tags: [],
      }

      if (editingItem) {
        await updateDocument(collections.products, editingItem.id, productData)
      } else {
        const newId = `product_${Date.now()}`
        await setDocument(collections.products, newId, {
          ...productData,
          isAvailable: true,
          createdAt: serverTimestamp(),
        })
      }

      // Reload products from Firestore
      await loadProducts()

      setShowAddModal(false)
      setEditingItem(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        comparePrice: '',
        category: '',
        image: '',
      })
      setImagePreview(null)
      resetUpload()
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Failed to save item. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeModal = () => {
    setShowAddModal(false)
    setEditingItem(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      comparePrice: '',
      category: '',
      image: '',
    })
    setImagePreview(null)
    resetUpload()
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className="bg-primary-600 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-full p-2 hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">Menu Management</h1>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="!border-white !text-white hover:!bg-white/10"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowAddModal(true)}
          >
            Add Item
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-30 lg:top-16">
        <div className="relative">
          {!searchQuery && (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          )}
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${searchQuery ? 'pl-4' : 'pl-10'} pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500`}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedCategory === null
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            All ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat.name} ({items.filter((i) => i.category === cat.id).length})
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="text-center py-8">
            <Image className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No items found</p>
            <Button
              size="sm"
              className="mt-3"
              onClick={() => setShowAddModal(true)}
            >
              Add First Item
            </Button>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className={!item.available ? 'opacity-60' : ''}>
              <div className="flex gap-3">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-semibold text-primary-600">P{item.price}</span>
                    {item.comparePrice && (
                      <span className="text-sm text-gray-400 line-through">
                        P{item.comparePrice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleToggleAvailability(item.id)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                        item.available
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.available ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                      {item.available ? 'Available' : 'Unavailable'}
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50"
                    >
                      {deletingId === item.id ? (
                        <Spinner size="sm" className="h-4 w-4" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={closeModal}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
      >
        <div className="space-y-4">
          <Input
            label="Item Name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Chickenjoy"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your item..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <div className="relative">
                <PesoSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="99"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compare Price
              </label>
              <div className="relative">
                <PesoSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={formData.comparePrice}
                  onChange={(e) => setFormData((prev) => ({ ...prev, comparePrice: e.target.value }))}
                  placeholder="129"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Image
            </label>
            <div
              onClick={handleImageClick}
              className="relative w-full h-40 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 cursor-pointer transition flex items-center justify-center overflow-hidden"
            >
              {(imagePreview || formData.image) ? (
                <>
                  <img
                    src={imagePreview || formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveImage()
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Upload className="h-8 w-8" />
                  <span className="text-sm">Click to upload image</span>
                </div>
              )}

              {/* Upload Progress Overlay */}
              {uploadState.status === 'uploading' && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                  <Spinner className="text-white" />
                  <span className="text-white text-sm mt-2">{Math.round(uploadState.progress)}%</span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {uploadState.status === 'error' && (
              <p className="mt-1 text-sm text-red-500">{uploadState.error}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={closeModal}>
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={handleSubmit}
              disabled={!formData.name || !formData.price || isSubmitting}
            >
              {isSubmitting ? <Spinner size="sm" /> : editingItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
