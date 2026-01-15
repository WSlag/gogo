import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Phone,
  MapPin,
  Clock,
  Store,
  Package,
  Star,
  CheckCircle2,
  XCircle,
  Download,
  FileText,
} from 'lucide-react'
import { Button, Card, Spinner, Modal } from '@/components/ui'
import { useOrders } from '@/hooks'
import type { Order, OrderStatus } from '@/types'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Order Placed', color: 'yellow', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'blue', icon: CheckCircle2 },
  preparing: { label: 'Preparing', color: 'blue', icon: Package },
  ready: { label: 'Ready', color: 'green', icon: Package },
  picked_up: { label: 'Picked Up', color: 'primary', icon: Package },
  on_the_way: { label: 'On the Way', color: 'primary', icon: MapPin },
  delivered: { label: 'Delivered', color: 'green', icon: CheckCircle2 },
  completed: { label: 'Completed', color: 'green', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'red', icon: XCircle },
}

const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered']

// Generate receipt text for download
function generateReceipt(order: Order): string {
  const formatDate = (timestamp: { toDate?: () => Date } | Date) => {
    const date = timestamp instanceof Date
      ? timestamp
      : timestamp.toDate
        ? timestamp.toDate()
        : new Date()
    return date.toLocaleString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const lines = [
    '═══════════════════════════════════════',
    '           GOGO EXPRESS RECEIPT          ',
    '═══════════════════════════════════════',
    '',
    `Order ID: ${order.id}`,
    `Date: ${formatDate(order.createdAt)}`,
    `Type: ${order.type.toUpperCase()} ORDER`,
    '',
    '───────────────────────────────────────',
    '             ORDER ITEMS               ',
    '───────────────────────────────────────',
    '',
  ]

  order.items.forEach((item) => {
    lines.push(`${item.quantity}x ${item.name}`)
    if (item.options && item.options.length > 0) {
      item.options.forEach((opt) => {
        lines.push(`   └ ${opt.name}: ${opt.choice} (+₱${opt.price.toFixed(2)})`)
      })
    }
    if (item.addons && item.addons.length > 0) {
      item.addons.forEach((addon) => {
        lines.push(`   └ ${addon.name} (+₱${addon.price.toFixed(2)})`)
      })
    }
    lines.push(`   ₱${item.total.toFixed(2)}`)
    lines.push('')
  })

  lines.push('───────────────────────────────────────')
  lines.push('')
  lines.push(`Subtotal:                    ₱${order.subtotal.toFixed(2)}`)
  lines.push(`Delivery Fee:                ₱${order.deliveryFee.toFixed(2)}`)
  lines.push(`Service Fee:                 ₱${order.serviceFee.toFixed(2)}`)
  if (order.discount) {
    lines.push(`Discount:                   -₱${order.discount.toFixed(2)}`)
  }
  lines.push('───────────────────────────────────────')
  lines.push(`TOTAL:                       ₱${order.total.toFixed(2)}`)
  lines.push('')
  lines.push('───────────────────────────────────────')
  lines.push('          DELIVERY ADDRESS            ')
  lines.push('───────────────────────────────────────')
  lines.push('')
  lines.push(order.deliveryAddress.address)
  if (order.deliveryAddress.details) {
    lines.push(order.deliveryAddress.details)
  }
  lines.push(`${order.deliveryAddress.contactName} • ${order.deliveryAddress.contactPhone}`)
  lines.push('')
  lines.push('───────────────────────────────────────')
  lines.push(`Payment Method: ${order.paymentMethod.toUpperCase()}`)
  lines.push(`Payment Status: ${order.paymentStatus.toUpperCase()}`)
  lines.push('')
  lines.push('═══════════════════════════════════════')
  lines.push('    Thank you for using GOGO Express!   ')
  lines.push('═══════════════════════════════════════')

  return lines.join('\n')
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getOrder, cancelOrder, rateOrder, subscribeToOrder, isLoading } = useOrders()

  const [order, setOrder] = useState<Order | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)

  const CANCEL_REASONS = [
    'Changed my mind',
    'Order taking too long',
    'Found better option',
    'Wrong items selected',
    'Emergency',
    'Other',
  ]

  useEffect(() => {
    if (!id) return

    // Initial load
    getOrder(id).then(setOrder)

    // Subscribe to real-time updates
    const unsub = subscribeToOrder(id)
    return () => unsub()
  }, [id, getOrder, subscribeToOrder])

  const handleCancel = async () => {
    if (!id || !cancelReason) return
    setIsCancelling(true)
    const success = await cancelOrder(id, cancelReason)
    setIsCancelling(false)
    if (success) {
      setShowCancelModal(false)
      setCancelReason('')
      // Reload order
      const updated = await getOrder(id)
      setOrder(updated)
    }
  }

  const handleSubmitRating = async () => {
    if (!id) return
    setIsSubmittingRating(true)
    await rateOrder(id, rating, review)
    setIsSubmittingRating(false)
    setShowRatingModal(false)
    // Reload order
    const updated = await getOrder(id)
    setOrder(updated)
  }

  if (isLoading || !order) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[order.status]
  const currentStepIndex = STATUS_STEPS.indexOf(order.status)
  const canCancel = ['pending', 'confirmed'].includes(order.status)
  const canRate = order.status === 'delivered' && !order.rating

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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
            <div>
              <h1 className="text-lg font-semibold">Order Details</h1>
              <p className="text-xs text-gray-500">#{id?.slice(0, 8)}</p>
            </div>
          </div>
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-sm font-medium text-red-500"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Card */}
        <Card className={`bg-${statusConfig.color}-50 border-${statusConfig.color}-200`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-${statusConfig.color}-100`}>
              <statusConfig.icon className={`h-6 w-6 text-${statusConfig.color}-600`} />
            </div>
            <div>
              <p className={`font-semibold text-${statusConfig.color}-700`}>{statusConfig.label}</p>
              <p className="text-sm text-gray-600">
                {order.status === 'on_the_way'
                  ? 'Your order is on its way!'
                  : order.status === 'delivered'
                  ? 'Order has been delivered'
                  : order.status === 'cancelled'
                  ? order.cancellationReason || 'Order was cancelled'
                  : `Estimated delivery: ${order.type === 'food' ? '30-45 min' : order.type === 'pharmacy' ? '20-30 min' : '45-60 min'}`}
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          {order.status !== 'cancelled' && (
            <div className="mt-4 flex items-center justify-between">
              {STATUS_STEPS.slice(0, -1).map((step, index) => {
                const isCompleted = index <= currentStepIndex
                return (
                  <div key={step} className="flex items-center">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                        isCompleted
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    {index < STATUS_STEPS.length - 2 && (
                      <div
                        className={`h-0.5 w-8 ${
                          index < currentStepIndex ? 'bg-primary-600' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Merchant Info */}
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50">
              <Store className="h-6 w-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{order.merchantId}</h3>
              <p className="text-sm text-gray-500 capitalize">{order.type} order</p>
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <Phone className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </Card>

        {/* Delivery Address */}
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <MapPin className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Deliver to</p>
              <p className="font-medium text-gray-900">{order.deliveryAddress.address}</p>
              {order.deliveryAddress.details && (
                <p className="text-sm text-gray-500">{order.deliveryAddress.details}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {order.deliveryAddress.contactName} • {order.deliveryAddress.contactPhone}
              </p>
            </div>
          </div>
        </Card>

        {/* Order Items */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex justify-between">
                <div className="flex gap-3">
                  <span className="text-sm font-medium text-primary-600">{item.quantity}x</span>
                  <div>
                    <p className="text-gray-900">{item.name}</p>
                    {item.options && item.options.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {item.options.map((o) => `${o.name}: ${o.choice}`).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <span className="font-medium text-gray-900">₱{item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Payment Summary */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">₱{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Fee</span>
              <span className="text-gray-900">₱{order.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Service Fee</span>
              <span className="text-gray-900">₱{order.serviceFee.toFixed(2)}</span>
            </div>
            {order.discount && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₱{order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-base">
              <span className="text-gray-900">Total</span>
              <span className="text-primary-600">₱{order.total.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-medium text-gray-900 capitalize">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Payment Status</span>
              <span className={`font-medium capitalize ${
                order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </Card>

        {/* Notes */}
        {order.notes && (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-2">Delivery Notes</h3>
            <p className="text-sm text-gray-600">{order.notes}</p>
          </Card>
        )}

        {/* Receipt Download - Show for completed/delivered orders */}
        {(order.status === 'delivered' || order.status === 'completed') && (
          <Card>
            <button
              onClick={() => {
                // Generate and download receipt as text
                const receipt = generateReceipt(order)
                const blob = new Blob([receipt], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `receipt-${order.id}.txt`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }}
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <FileText className="h-5 w-5 text-gray-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Download Receipt</p>
                  <p className="text-sm text-gray-500">Save a copy of your order receipt</p>
                </div>
              </div>
              <Download className="h-5 w-5 text-gray-400" />
            </button>
          </Card>
        )}
      </div>

      {/* Bottom Actions */}
      {canRate && (
        <div className="fixed bottom-16 left-0 right-0 lg:bottom-0 lg:left-[240px] bg-white border-t p-4 pb-safe z-50">
          <Button
            fullWidth
            size="lg"
            onClick={() => setShowRatingModal(true)}
          >
            Rate Your Order
          </Button>
        </div>
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Order?"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please select a reason for cancellation. This action cannot be undone.
          </p>

          {/* Cancellation Reasons */}
          <div className="space-y-2">
            {CANCEL_REASONS.map((reason) => (
              <button
                key={reason}
                onClick={() => setCancelReason(reason)}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                  cancelReason === reason
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    cancelReason === reason
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300'
                  }`}
                >
                  {cancelReason === reason && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">{reason}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setShowCancelModal(false)
                setCancelReason('')
              }}
            >
              Keep Order
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleCancel}
              isLoading={isCancelling}
              disabled={!cancelReason}
            >
              Cancel Order
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rating Modal */}
      <Modal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        title="Rate Your Order"
      >
        <div className="space-y-4">
          {/* Star Rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= rating
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Review */}
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience (optional)"
            className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            rows={3}
          />

          <Button
            fullWidth
            onClick={handleSubmitRating}
            isLoading={isSubmittingRating}
          >
            Submit Rating
          </Button>
        </div>
      </Modal>
    </div>
  )
}
