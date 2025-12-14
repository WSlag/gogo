import { useState, useEffect } from 'react'
import {
  Bell,
  X,
  Check,
  ShoppingBag,
  Car,
  Gift,
  AlertCircle,
  Clock,
  ChevronRight,
} from 'lucide-react'
import { Button, Modal, Spinner } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import {
  getDocuments,
  setDocument,
  collections,
  where,
  orderBy,
  limit,
  Timestamp,
} from '@/services/firebase/firestore'

interface Notification {
  id: string
  userId: string
  type: 'order' | 'ride' | 'promo' | 'system'
  title: string
  message: string
  data?: Record<string, any>
  isRead: boolean
  createdAt: Timestamp
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

const NOTIFICATION_ICONS = {
  order: ShoppingBag,
  ride: Car,
  promo: Gift,
  system: AlertCircle,
}

const NOTIFICATION_COLORS = {
  order: 'bg-blue-50 text-blue-600',
  ride: 'bg-green-50 text-green-600',
  promo: 'bg-purple-50 text-purple-600',
  system: 'bg-gray-100 text-gray-600',
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user || !isOpen) return

      setIsLoading(true)
      setError(null)

      try {
        const notifs = await getDocuments<Notification>(
          collections.notifications,
          [
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(50),
          ]
        )
        setNotifications(notifs)
      } catch (err) {
        console.error('Failed to fetch notifications:', err)
        setError('Failed to load notifications')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [user, isOpen])

  const markAsRead = async (notificationId: string) => {
    try {
      await setDocument(collections.notifications, notificationId, {
        isRead: true,
      })
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      )
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.isRead)
      await Promise.all(
        unread.map((n) =>
          setDocument(collections.notifications, n.id, { isRead: true })
        )
      )
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      )
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp) return ''

    const date = timestamp.toDate()
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notifications">
      <div className="min-h-[300px] max-h-[70vh] overflow-y-auto -mx-4">
        {/* Header Actions */}
        {notifications.length > 0 && unreadCount > 0 && (
          <div className="px-4 pb-3 border-b flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </span>
            <button
              onClick={markAllAsRead}
              className="text-sm font-medium text-primary-600"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4">
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900">No notifications</h3>
            <p className="text-sm text-gray-500 text-center mt-1">
              You'll see your order updates and promotions here
            </p>
          </div>
        )}

        {/* Notification List */}
        {!isLoading && notifications.length > 0 && (
          <div className="divide-y">
            {notifications.map((notification) => {
              const Icon = NOTIFICATION_ICONS[notification.type]
              const colorClass = NOTIFICATION_COLORS[notification.type]

              return (
                <button
                  key={notification.id}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                  className={`flex w-full items-start gap-3 p-4 text-left transition hover:bg-gray-50 ${
                    !notification.isRead ? 'bg-primary-50/30' : ''
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-medium ${
                        !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-primary-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(notification.createdAt)}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </Modal>
  )
}

// Notification Bell Button Component
interface NotificationBellProps {
  onClick: () => void
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const { user } = useAuthStore()
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) {
        setUnreadCount(0)
        return
      }

      try {
        const unread = await getDocuments<Notification>(
          collections.notifications,
          [
            where('userId', '==', user.uid),
            where('isRead', '==', false),
            limit(100),
          ]
        )
        setUnreadCount(unread.length)
      } catch (err) {
        console.error('Failed to fetch unread count:', err)
      }
    }

    fetchUnreadCount()
    // Refresh every minute
    const interval = setInterval(fetchUnreadCount, 60000)
    return () => clearInterval(interval)
  }, [user])

  return (
    <button
      onClick={onClick}
      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50"
    >
      <Bell className="h-5 w-5 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}
