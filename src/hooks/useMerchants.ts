import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getDocument,
  getDocuments,
  collections,
  where,
  orderBy,
  limit,
  type QueryConstraint,
} from '@/services/firebase/firestore'
import type { Merchant, Product, MerchantType } from '@/types'

interface UseMerchantsOptions {
  type?: MerchantType
  category?: string
  isOpen?: boolean
  isFeatured?: boolean
  limitCount?: number
}

interface UseMerchantsReturn {
  merchants: Merchant[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

interface UseMerchantDetailReturn {
  merchant: Merchant | null
  products: Product[]
  categories: string[]
  isLoading: boolean
  error: Error | null
}

interface UseProductsOptions {
  merchantId: string
  category?: string
  isAvailable?: boolean
  isFeatured?: boolean
  limitCount?: number
}

// Fetch merchants list with filters
export function useMerchants(options: UseMerchantsOptions = {}): UseMerchantsReturn {
  const {
    type,
    category,
    isOpen,
    isFeatured,
    limitCount = 50,
  } = options

  const queryKey = ['merchants', type, category, isOpen, isFeatured, limitCount]

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const constraints: QueryConstraint[] = []

      if (type) {
        constraints.push(where('type', '==', type))
      }

      if (category) {
        constraints.push(where('categories', 'array-contains', category))
      }

      if (isOpen !== undefined) {
        constraints.push(where('isOpen', '==', isOpen))
      }

      if (isFeatured !== undefined) {
        constraints.push(where('isFeatured', '==', isFeatured))
      }

      constraints.push(orderBy('rating', 'desc'))
      constraints.push(limit(limitCount))

      const merchants = await getDocuments<Merchant>(collections.merchants, constraints)
      return merchants
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    merchants: data || [],
    isLoading,
    error: error as Error | null,
    refetch,
  }
}

// Fetch single merchant with products
export function useMerchantDetail(merchantId: string): UseMerchantDetailReturn {
  const { data: merchant, isLoading: merchantLoading, error: merchantError } = useQuery({
    queryKey: ['merchant', merchantId],
    queryFn: async () => {
      const merchant = await getDocument<Merchant>(collections.merchants, merchantId)
      return merchant
    },
    enabled: !!merchantId,
    staleTime: 5 * 60 * 1000,
  })

  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products', merchantId],
    queryFn: async () => {
      const products = await getDocuments<Product>(collections.products, [
        where('merchantId', '==', merchantId),
        where('isAvailable', '==', true),
        orderBy('category'),
      ])
      return products
    },
    enabled: !!merchantId,
    staleTime: 5 * 60 * 1000,
  })

  // Extract unique categories from products
  const categories = products
    ? [...new Set(products.map((p) => p.category))].filter(Boolean)
    : []

  return {
    merchant: merchant || null,
    products: products || [],
    categories,
    isLoading: merchantLoading || productsLoading,
    error: (merchantError || productsError) as Error | null,
  }
}

// Fetch products with filters
export function useProducts(options: UseProductsOptions) {
  const {
    merchantId,
    category,
    isAvailable = true,
    isFeatured,
    limitCount = 100,
  } = options

  const queryKey = ['products', merchantId, category, isAvailable, isFeatured, limitCount]

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const constraints: QueryConstraint[] = [
        where('merchantId', '==', merchantId),
      ]

      if (isAvailable !== undefined) {
        constraints.push(where('isAvailable', '==', isAvailable))
      }

      if (category) {
        constraints.push(where('category', '==', category))
      }

      if (isFeatured !== undefined) {
        constraints.push(where('isFeatured', '==', isFeatured))
      }

      constraints.push(limit(limitCount))

      const products = await getDocuments<Product>(collections.products, constraints)
      return products
    },
    enabled: !!merchantId,
    staleTime: 5 * 60 * 1000,
  })

  return {
    products: data || [],
    isLoading,
    error: error as Error | null,
    refetch,
  }
}

// Search merchants
export function useSearchMerchants() {
  const [searchResults, setSearchResults] = useState<Merchant[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const search = useCallback(async (query: string, type?: MerchantType) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    try {
      // In a real app, you'd use a search service like Algolia or Elasticsearch
      // For now, we'll fetch all and filter client-side
      const constraints: QueryConstraint[] = []

      if (type) {
        constraints.push(where('type', '==', type))
      }

      constraints.push(where('status', '==', 'active'))
      constraints.push(limit(100))

      const merchants = await getDocuments<Merchant>(collections.merchants, constraints)

      // Client-side search (not ideal for production)
      const queryLower = query.toLowerCase()
      const filtered = merchants.filter(
        (m) =>
          m.name.toLowerCase().includes(queryLower) ||
          m.description?.toLowerCase().includes(queryLower) ||
          m.categories.some((c) => c.toLowerCase().includes(queryLower))
      )

      setSearchResults(filtered)
    } catch (err) {
      console.error('Search error:', err)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setSearchResults([])
  }, [])

  return {
    searchResults,
    isSearching,
    search,
    clearSearch,
  }
}

// Get nearby merchants (requires geohashing for production)
export function useNearbyMerchants(
  lat: number,
  lng: number,
  radiusKm: number = 5,
  type?: MerchantType
) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['nearbyMerchants', lat, lng, radiusKm, type],
    queryFn: async () => {
      // In production, use geohashing or a proper geo query
      // For now, fetch all and filter by distance
      const constraints: QueryConstraint[] = []

      if (type) {
        constraints.push(where('type', '==', type))
      }

      constraints.push(where('status', '==', 'active'))
      constraints.push(where('isOpen', '==', true))
      constraints.push(limit(100))

      const merchants = await getDocuments<Merchant>(collections.merchants, constraints)

      // Calculate distance and filter
      const nearbyMerchants = merchants
        .map((m) => {
          const distance = calculateDistance(
            lat,
            lng,
            m.coordinates.latitude,
            m.coordinates.longitude
          )
          return { ...m, distance }
        })
        .filter((m) => m.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance)

      return nearbyMerchants
    },
    enabled: lat !== 0 && lng !== 0,
    staleTime: 5 * 60 * 1000,
  })

  return {
    merchants: data || [],
    isLoading,
    error: error as Error | null,
    refetch,
  }
}

// Haversine formula for distance calculation
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
