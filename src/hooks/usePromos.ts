import { useQuery } from '@tanstack/react-query'
import {
  getDocuments,
  collections,
  where,
  limit,
  type QueryConstraint,
} from '@/services/firebase/firestore'
import type { Timestamp } from 'firebase/firestore'

export interface Promo {
  id: string
  code: string
  title?: string
  description?: string
  type: 'percentage' | 'fixed' | 'freeDelivery'
  value: number
  maxDiscount?: number
  minOrderAmount?: number
  isActive: boolean
  validFrom: Timestamp
  validUntil: Timestamp
  applicableTo?: string[]
  merchantId?: string
  merchantName?: string
  image?: string
  usageLimit?: number
  usageCount?: number
}

export function useActivePromos(limitCount: number = 10) {
  return useQuery({
    queryKey: ['promos', 'active', limitCount],
    queryFn: async () => {
      const constraints: QueryConstraint[] = [
        where('isActive', '==', true),
        limit(limitCount),
      ]

      const promos = await getDocuments<Promo>(collections.promos, constraints)
      return promos
    },
    staleTime: 5 * 60 * 1000,
  })
}
