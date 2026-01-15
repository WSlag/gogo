// Notifications hook with real-time updates and FCM integration
import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getMessagingInstance } from '@/services/firebase/config'
import { getToken, onMessage, type Messaging } from 'firebase/messaging'
import {
  subscribeToCollection,
  setDocument,
  updateDocument,
  deleteDocument,
  collections,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from '@/services/firebase/firestore'

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  body: string
  data?: Record<string, unknown>
  read: boolean
  createdAt: Date
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  fcmToken: string | null
  permissionStatus: NotificationPermission
  requestPermission: () => Promise<boolean>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  clearAll: () => Promise<void>
}

// VAPID key for FCM (replace with your actual key from Firebase Console)
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || ''

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fcmToken, setFcmToken] = useState<string | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )
  const [messaging, setMessaging] = useState<Messaging | null>(null)

  // Initialize FCM
  useEffect(() => {
    const initMessaging = async () => {
      try {
        const messagingInstance = await getMessagingInstance()
        if (messagingInstance) {
          setMessaging(messagingInstance)
        }
      } catch (err) {
        console.error('Failed to initialize FCM:', err)
      }
    }

    initMessaging()
  }, [])

  // Listen for foreground messages
  useEffect(() => {
    if (!messaging) return

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload)

      // Show browser notification
      if (Notification.permission === 'granted' && payload.notification) {
        new Notification(payload.notification.title || 'GOGO Express', {
          body: payload.notification.body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: payload.data?.type || 'default',
        })
      }

      // Add to local notifications list
      if (payload.notification) {
        const newNotification: Notification = {
          id: `local_${Date.now()}`,
          userId: user?.uid || '',
          type: payload.data?.type as string || 'general',
          title: payload.notification.title || '',
          body: payload.notification.body || '',
          data: payload.data as Record<string, unknown>,
          read: false,
          createdAt: new Date(),
        }
        setNotifications(prev => [newNotification, ...prev])
      }
    })

    return () => {
      unsubscribe()
    }
  }, [messaging, user])

  // Subscribe to notifications from Firestore
  useEffect(() => {
    if (!user) {
      setNotifications([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    const unsubscribe = subscribeToCollection<Notification>(
      collections.notifications,
      [
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50),
      ],
      (notificationsList) => {
        setNotifications(notificationsList)
        setIsLoading(false)
      }
    )

    return () => {
      unsubscribe()
    }
  }, [user])

  // Request notification permission and get FCM token
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      setError('Notifications not supported in this browser')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      setPermissionStatus(permission)

      if (permission !== 'granted') {
        return false
      }

      // Get FCM token
      if (messaging && VAPID_KEY) {
        try {
          const token = await getToken(messaging, { vapidKey: VAPID_KEY })
          setFcmToken(token)

          // Save token to user document
          if (user) {
            await setDocument(collections.users, user.uid, {
              fcmToken: token,
              notificationsEnabled: true,
              updatedAt: serverTimestamp(),
            })
          }

          return true
        } catch (tokenError) {
          console.error('Failed to get FCM token:', tokenError)
          // Still return true since browser notifications are enabled
          return true
        }
      }

      return true
    } catch (err) {
      console.error('Failed to request notification permission:', err)
      setError('Failed to enable notifications')
      return false
    }
  }, [messaging, user])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string): Promise<void> => {
    try {
      await updateDocument(collections.notifications, notificationId, {
        read: true,
      })
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async (): Promise<void> => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read)
      await Promise.all(
        unreadNotifications.map(n =>
          updateDocument(collections.notifications, n.id, { read: true })
        )
      )
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }, [notifications])

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId: string): Promise<void> => {
    try {
      await deleteDocument(collections.notifications, notificationId)
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }, [])

  // Clear all notifications
  const clearAll = useCallback(async (): Promise<void> => {
    try {
      await Promise.all(
        notifications.map(n => deleteDocument(collections.notifications, n.id))
      )
    } catch (err) {
      console.error('Failed to clear notifications:', err)
    }
  }, [notifications])

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fcmToken,
    permissionStatus,
    requestPermission,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  }
}
