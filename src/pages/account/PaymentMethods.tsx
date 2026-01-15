import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  CreditCard,
  Smartphone,
  Trash2,
  Check,
  ChevronRight,
} from 'lucide-react'
import { Card, Button, Modal } from '@/components/ui'

interface PaymentMethod {
  id: string
  type: 'card' | 'gcash' | 'paymaya'
  name: string
  details: string
  isDefault: boolean
}

export default function PaymentMethods() {
  const navigate = useNavigate()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)

  // Mock payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'gcash',
      name: 'GCash',
      details: '0917 *** 4567',
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      name: 'Visa',
      details: '**** **** **** 1234',
      isDefault: false,
    },
  ])

  const handleSetDefault = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((pm) => ({
        ...pm,
        isDefault: pm.id === id,
      }))
    )
  }

  const handleDelete = (id: string) => {
    setPaymentMethods((prev) => prev.filter((pm) => pm.id !== id))
    setShowDeleteModal(null)
  }

  const getIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'gcash':
      case 'paymaya':
        return <Smartphone className="h-5 w-5" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const getIconBg = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'gcash':
        return 'bg-blue-100 text-blue-600'
      case 'paymaya':
        return 'bg-green-100 text-green-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 lg:top-16 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">Payment Methods</h1>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Payment Methods List */}
        <Card>
          {paymentMethods.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <CreditCard className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-500">No payment methods added</p>
              <Button
                onClick={() => setShowAddModal(true)}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                Add Payment Method
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getIconBg(pm.type)}`}>
                      {getIcon(pm.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{pm.name}</p>
                        {pm.isDefault && (
                          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{pm.details}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!pm.isDefault && (
                      <button
                        onClick={() => handleSetDefault(pm.id)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-primary-600"
                        title="Set as default"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setShowDeleteModal(pm.id)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Info */}
        <p className="text-center text-sm text-gray-400">
          Your payment information is securely encrypted
        </p>
      </div>

      {/* Add Payment Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Payment Method"
      >
        <div className="space-y-3">
          <button
            onClick={() => setShowAddModal(false)}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Smartphone className="h-5 w-5" />
              </div>
              <span className="font-medium">GCash</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          <button
            onClick={() => setShowAddModal(false)}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <Smartphone className="h-5 w-5" />
              </div>
              <span className="font-medium">PayMaya</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          <button
            onClick={() => setShowAddModal(false)}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="font-medium">Credit/Debit Card</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        title="Remove Payment Method"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to remove this payment method?
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowDeleteModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => showDeleteModal && handleDelete(showDeleteModal)}
            >
              Remove
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
