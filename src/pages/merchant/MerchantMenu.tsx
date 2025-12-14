import { useState } from 'react'
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
  DollarSign,
  Tag,
} from 'lucide-react'
import { Button, Card, Modal, Input, Spinner } from '@/components/ui'

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
  itemCount: number
}

const MOCK_CATEGORIES: Category[] = [
  { id: 'chicken', name: 'Chicken', itemCount: 8 },
  { id: 'burgers', name: 'Burgers & Sandwiches', itemCount: 5 },
  { id: 'spaghetti', name: 'Spaghetti', itemCount: 3 },
  { id: 'sides', name: 'Sides & Extras', itemCount: 6 },
  { id: 'desserts', name: 'Desserts', itemCount: 4 },
  { id: 'drinks', name: 'Beverages', itemCount: 8 },
]

const MOCK_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: '1pc Chickenjoy w/ Rice',
    description: 'Crispy, juicy, tender fried chicken served with steamed rice',
    price: 99,
    category: 'chicken',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400',
    available: true,
  },
  {
    id: '2',
    name: '2pc Chickenjoy w/ Rice',
    description: '2 pieces of our famous Chickenjoy with steamed rice',
    price: 169,
    category: 'chicken',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400',
    available: true,
  },
  {
    id: '3',
    name: 'Jolly Spaghetti',
    description: 'Sweet-style spaghetti with chunky sliced hotdog, ground meat, and cheese',
    price: 55,
    category: 'spaghetti',
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400',
    available: true,
  },
  {
    id: '4',
    name: 'Burger Steak',
    description: 'Savory beef patties smothered in mushroom gravy with rice',
    price: 79,
    category: 'burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    available: true,
  },
  {
    id: '5',
    name: 'Yumburger',
    description: 'Classic burger with special Jollibee sauce',
    price: 39,
    category: 'burgers',
    available: false,
  },
  {
    id: '6',
    name: 'Peach Mango Pie',
    description: 'Crispy pie filled with sweet peach and mango',
    price: 39,
    category: 'desserts',
    image: 'https://images.unsplash.com/photo-1621955964441-c173e01c6f18?w=400',
    available: true,
  },
]

export default function MerchantMenu() {
  const navigate = useNavigate()
  const [categories] = useState<Category[]>(MOCK_CATEGORIES)
  const [items, setItems] = useState<MenuItem[]>(MOCK_ITEMS)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    category: 'chicken',
    image: '',
  })

  const filteredItems = items.filter((item) => {
    if (selectedCategory && item.category !== selectedCategory) return false
    if (searchQuery) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  const handleToggleAvailability = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, available: !item.available } : item
      )
    )
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
    setShowAddModal(true)
  }

  const handleDelete = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems((prev) => prev.filter((item) => item.id !== itemId))
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (editingItem) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
                category: formData.category,
                image: formData.image || undefined,
              }
            : item
        )
      )
    } else {
      const newItem: MenuItem = {
        id: `item_${Date.now()}`,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        category: formData.category,
        image: formData.image || undefined,
        available: true,
      }
      setItems((prev) => [...prev, newItem])
    }

    setIsSubmitting(false)
    setShowAddModal(false)
    setEditingItem(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      comparePrice: '',
      category: 'chicken',
      image: '',
    })
  }

  const closeModal = () => {
    setShowAddModal(false)
    setEditingItem(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      comparePrice: '',
      category: 'chicken',
      image: '',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
        {filteredItems.length === 0 ? (
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
                      className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
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
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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

          <Input
            label="Image URL"
            value={formData.image}
            onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
            placeholder="https://example.com/image.jpg"
          />

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
