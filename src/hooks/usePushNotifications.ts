import { useCallback, useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  setDocument,
  getDocument,
  collections,
  serverTimestamp,
} from '@/services/firebase/firestore'

interface PushNotificationState {
  isSupported: boolean
  permission: NotificationPermission
  token: string | null
  isLoading: boolean
  error: string | null
}

interface UsePushNotificationsReturn extends PushNotificationState {
  requestPermission: () => Promise<boolean>
  subscribe: () => Promise<boolean>
  unsubscribe: () => Promise<boolean>
  sendTestNotification: () => void
}

// Check if Push API and Service Worker are supported
const checkSupport = (): boolean => {
  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  )
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const { user } = useAuthStore()
  const [state, setState] = useState<PushNotificationState>({
    isSupported: checkSupport(),
    permission: typeof Notification !== 'undefined' ? Notification.permission : 'default',
    token: null,
    isLoading: false,
    error: null,
  })

  // Load saved token from Firestore
  useEffect(() => {
    const loadToken = async () => {
      if (!user || !state.isSupported) return

      try {
        const userData = await getDocument<{ fcmToken?: string }>(
          collections.users,
          user.uid
        )
        if (userData?.fcmToken) {
          setState((prev) => ({ ...prev, token: userData.fcmToken }))
        }
      } catch (err) {
        console.error('Failed to load FCM token:', err)
      }
    }

    loadToken()
  }, [user, state.isSupported])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState((prev) => ({
        ...prev,
        error: 'Push notifications are not supported in this browser',
      }))
      return false
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const permission = await Notification.requestPermission()
      setState((prev) => ({
        ...prev,
        permission,
        isLoading: false,
      }))

      return permission === 'granted'
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permission'
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      return false
    }
  }, [state.isSupported])

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!user || !state.isSupported || state.permission !== 'granted') {
      return false
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // Register service worker if not already registered
      const registration = await navigator.serviceWorker.ready

      // Get push subscription
      // Note: In production, you'd use Firebase Cloud Messaging (FCM) here
      // This is a simplified implementation
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // In production, use your VAPID public key
        applicationServerKey: urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
        ),
      })

      // Generate a mock token (in production, this comes from FCM)
      const token = btoa(JSON.stringify(subscription))

      // Save token to Firestore
      await setDocument(collections.users, user.uid, {
        fcmToken: token,
        notificationsEnabled: true,
        updatedAt: serverTimestamp(),
      })

      setState((prev) => ({
        ...prev,
        token,
        isLoading: false,
      }))

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe'
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      return false
    }
  }, [user, state.isSupported, state.permission])

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!user) return false

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
      }

      // Remove token from Firestore
      await setDocument(collections.users, user.uid, {
        fcmToken: null,
        notificationsEnabled: false,
        updatedAt: serverTimestamp(),
      })

      setState((prev) => ({
        ...prev,
        token: null,
        isLoading: false,
      }))

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unsubscribe'
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      return false
    }
  }, [user])

  const sendTestNotification = useCallback(() => {
    if (state.permission !== 'granted') return

    new Notification('GOGO Express Test', {
      body: 'Push notifications are working!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'test-notification',
    })
  }, [state.permission])

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
