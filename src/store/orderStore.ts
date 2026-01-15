import { create } from 'zustand'
import { useAuthStore } from './authStore'
import {
  subscribeToCollection,
  collections,
  where,
  orderBy,
} from '@/services/firebase/firestore'
import type { Order } from '@/types'
import { APP_CONFIG } from '@/config/app'

interface OrderState {
  activeOrderCount: number
  unsubscribe: (() => void) | null

  subscribeToActiveOrders: () => () => void
}

export const useOrderStore = create<OrderState>()((set, get) => ({
  activeOrderCount: 0,
  unsubscribe: null,

  subscribeToActiveOrders: () => {
    const { user, profile } = useAuthStore.getState()
    const customerId = user?.uid || profile?.id || (APP_CONFIG.SKIP_AUTH ? APP_CONFIG.TEST_USER_ID : null)

    if (!customerId) {
      return () => {}
    }

    // Unsubscribe from previous subscription if exists
    const { unsubscribe: prevUnsub } = get()
    if (prevUnsub) {
      prevUnsub()
    }

    const unsub = subscribeToCollection<Order>(
      collections.orders,
      [
        where('customerId', '==', customerId),
        where('status', 'in', ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way']),
        orderBy('createdAt', 'desc'),
      ],
      (activeOrders) => {
        set({ activeOrderCount: activeOrders.length })
      }
    )

    set({ unsubscribe: unsub })

    return () => {
      unsub()
      set({ unsubscribe: null, activeOrderCount: 0 })
    }
  },
}))
