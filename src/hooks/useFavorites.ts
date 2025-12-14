import { useCallback, useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  setDocument,
  getDocument,
  collections,
  serverTimestamp,
} from '@/services/firebase/firestore'
import type { Merchant } from '@/types'

export interface FavoriteMerchant {
  id: string
  name: string
  type: 'restaurant' | 'grocery' | 'convenience' | 'pharmacy'
  image?: string
  rating?: number
  addedAt: Date
}

interface UseFavoritesReturn {
  favorites: FavoriteMerchant[]
  isLoading: boolean
  isFavorite: (merchantId: string) => boolean
  addFavorite: (merchant: Merchant) => Promise<boolean>
  removeFavorite: (merchantId: string) => Promise<boolean>
  toggleFavorite: (merchant: Merchant) => Promise<boolean>
}

export function useFavorites(): UseFavoritesReturn {
  const { user } = useAuthStore()
  const [favorites, setFavorites] = useState<FavoriteMerchant[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load favorites from user profile
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setFavorites([])
        return
      }

      setIsLoading(true)
      try {
        const userData = await getDocument<{ favorites?: FavoriteMerchant[] }>(
          collections.users,
          user.uid
        )
        if (userData?.favorites) {
          setFavorites(userData.favorites)
        }
      } catch (err) {
        console.error('Failed to load favorites:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [user])

  const saveFavorites = useCallback(async (newFavorites: FavoriteMerchant[]) => {
    if (!user) return

    try {
      await setDocument(collections.users, user.uid, {
        favorites: newFavorites,
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('Failed to save favorites:', err)
    }
  }, [user])

  const isFavorite = useCallback((merchantId: string): boolean => {
    return favorites.some((f) => f.id === merchantId)
  }, [favorites])

  const addFavorite = useCallback(async (merchant: Merchant): Promise<boolean> => {
    if (!user) return false

    const newFavorite: FavoriteMerchant = {
      id: merchant.id,
      name: merchant.name,
      type: merchant.type,
      image: merchant.image,
      rating: merchant.rating,
      addedAt: new Date(),
    }

    const newFavorites = [...favorites, newFavorite]
    setFavorites(newFavorites)
    await saveFavorites(newFavorites)
    return true
  }, [user, favorites, saveFavorites])

  const removeFavorite = useCallback(async (merchantId: string): Promise<boolean> => {
    if (!user) return false

    const newFavorites = favorites.filter((f) => f.id !== merchantId)
    setFavorites(newFavorites)
    await saveFavorites(newFavorites)
    return true
  }, [user, favorites, saveFavorites])

  const toggleFavorite = useCallback(async (merchant: Merchant): Promise<boolean> => {
    if (isFavorite(merchant.id)) {
      return removeFavorite(merchant.id)
    } else {
      return addFavorite(merchant)
    }
  }, [isFavorite, addFavorite, removeFavorite])

  return {
    favorites,
    isLoading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  }
}
