import { useState, useCallback, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  getDocument,
  setDocument,
  collections,
  serverTimestamp,
  GeoPoint,
} from '@/services/firebase/firestore'
import type { User, SavedLocation } from '@/types'

interface UseAddressesReturn {
  addresses: SavedLocation[]
  isLoading: boolean
  error: string | null
  addAddress: (address: Omit<SavedLocation, 'id'>) => Promise<boolean>
  updateAddress: (id: string, address: Partial<SavedLocation>) => Promise<boolean>
  deleteAddress: (id: string) => Promise<boolean>
  setDefaultAddress: (id: string) => Promise<boolean>
  getDefaultAddress: () => SavedLocation | null
  refreshAddresses: () => Promise<void>
}

export function useAddresses(): UseAddressesReturn {
  const { user, profile } = useAuthStore()
  const [addresses, setAddresses] = useState<SavedLocation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load addresses from Firestore
  const refreshAddresses = useCallback(async () => {
    if (!user) {
      setAddresses([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const userData = await getDocument<User>(collections.users, user.uid)
      if (userData?.savedLocations) {
        setAddresses(userData.savedLocations)
      } else {
        setAddresses([])
      }
    } catch (err) {
      console.error('Failed to load addresses:', err)
      setError('Failed to load addresses')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Load addresses on mount and when user changes
  useEffect(() => {
    refreshAddresses()
  }, [refreshAddresses])

  const saveAddressesToFirestore = useCallback(async (newAddresses: SavedLocation[]) => {
    if (!user) return false

    try {
      await setDocument(collections.users, user.uid, {
        savedLocations: newAddresses,
        updatedAt: serverTimestamp(),
      })
      return true
    } catch (err) {
      console.error('Failed to save addresses:', err)
      setError('Failed to save addresses')
      return false
    }
  }, [user])

  const addAddress = useCallback(async (address: Omit<SavedLocation, 'id'>): Promise<boolean> => {
    if (!user) {
      setError('Please login to save addresses')
      return false
    }

    setIsLoading(true)
    setError(null)

    const newAddress: SavedLocation = {
      ...address,
      id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }

    const newAddresses = [...addresses, newAddress]
    const success = await saveAddressesToFirestore(newAddresses)

    if (success) {
      setAddresses(newAddresses)
    }

    setIsLoading(false)
    return success
  }, [user, addresses, saveAddressesToFirestore])

  const updateAddress = useCallback(async (id: string, updates: Partial<SavedLocation>): Promise<boolean> => {
    if (!user) {
      setError('Please login to update addresses')
      return false
    }

    setIsLoading(true)
    setError(null)

    const newAddresses = addresses.map((addr) =>
      addr.id === id ? { ...addr, ...updates } : addr
    )

    const success = await saveAddressesToFirestore(newAddresses)

    if (success) {
      setAddresses(newAddresses)
    }

    setIsLoading(false)
    return success
  }, [user, addresses, saveAddressesToFirestore])

  const deleteAddress = useCallback(async (id: string): Promise<boolean> => {
    if (!user) {
      setError('Please login to delete addresses')
      return false
    }

    setIsLoading(true)
    setError(null)

    const newAddresses = addresses.filter((addr) => addr.id !== id)
    const success = await saveAddressesToFirestore(newAddresses)

    if (success) {
      setAddresses(newAddresses)
    }

    setIsLoading(false)
    return success
  }, [user, addresses, saveAddressesToFirestore])

  const setDefaultAddress = useCallback(async (id: string): Promise<boolean> => {
    if (!user) {
      setError('Please login to set default address')
      return false
    }

    setIsLoading(true)
    setError(null)

    // Move the selected address to the front (first = default)
    const addressToMove = addresses.find((addr) => addr.id === id)
    if (!addressToMove) {
      setError('Address not found')
      setIsLoading(false)
      return false
    }

    const newAddresses = [addressToMove, ...addresses.filter((addr) => addr.id !== id)]
    const success = await saveAddressesToFirestore(newAddresses)

    if (success) {
      setAddresses(newAddresses)
    }

    setIsLoading(false)
    return success
  }, [user, addresses, saveAddressesToFirestore])

  const getDefaultAddress = useCallback((): SavedLocation | null => {
    return addresses.length > 0 ? addresses[0] : null
  }, [addresses])

  return {
    addresses,
    isLoading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
    refreshAddresses,
  }
}

// Helper to create a SavedLocation from coordinates
export function createSavedLocation(
  label: string,
  type: 'home' | 'work' | 'other',
  address: string,
  lat: number,
  lng: number,
  details?: string
): Omit<SavedLocation, 'id'> {
  return {
    label,
    type,
    address,
    coordinates: new GeoPoint(lat, lng),
    details,
  }
}
