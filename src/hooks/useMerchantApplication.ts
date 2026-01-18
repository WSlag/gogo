import { useQuery } from '@tanstack/react-query'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/services/firebase/config'
import { useAuthStore } from '@/store/authStore'

export type MerchantApplicationStatus = 'pending' | 'approved' | 'rejected' | null

interface MerchantApplicationData {
  id: string
  businessName: string
  applicationStatus: 'pending' | 'approved' | 'rejected'
  category: string
  userId: string // The merchant's userId (phone number or UID) for querying orders
}

interface UseMerchantApplicationReturn {
  merchantData: MerchantApplicationData | null
  applicationStatus: MerchantApplicationStatus
  isLoading: boolean
  error: Error | null
}

export function useMerchantApplication(): UseMerchantApplicationReturn {
  const { user } = useAuthStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ['merchantApplication', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null

      // First try: check if merchant document ID equals user.uid
      const merchantRef = doc(db, 'merchants', user.uid)
      const merchantSnap = await getDoc(merchantRef)

      if (merchantSnap.exists()) {
        const data = merchantSnap.data()
        return {
          id: merchantSnap.id,
          businessName: data.businessName || data.name || 'Unknown',
          applicationStatus: data.applicationStatus as 'pending' | 'approved' | 'rejected',
          category: data.category || data.type || '',
          userId: data.userId || user.uid,
        }
      }

      // Second try: query merchants where userId field equals user.uid
      const merchantsQuery = query(
        collection(db, 'merchants'),
        where('userId', '==', user.uid)
      )
      const querySnapshot = await getDocs(merchantsQuery)

      if (!querySnapshot.empty) {
        const merchantDoc = querySnapshot.docs[0]
        const data = merchantDoc.data()
        return {
          id: merchantDoc.id,
          businessName: data.businessName || data.name || 'Unknown',
          applicationStatus: data.applicationStatus as 'pending' | 'approved' | 'rejected',
          category: data.category || data.type || '',
          userId: data.userId || user.uid,
        }
      }

      // Third try: query merchants where userId field equals user's phone number
      // (for backwards compatibility with older data)
      if (user.phoneNumber) {
        const phoneQuery = query(
          collection(db, 'merchants'),
          where('userId', '==', user.phoneNumber)
        )
        const phoneSnapshot = await getDocs(phoneQuery)

        if (!phoneSnapshot.empty) {
          const merchantDoc = phoneSnapshot.docs[0]
          const data = merchantDoc.data()
          return {
            id: merchantDoc.id,
            businessName: data.businessName || data.name || 'Unknown',
            applicationStatus: data.applicationStatus as 'pending' | 'approved' | 'rejected',
            category: data.category || data.type || '',
            userId: data.userId || user.phoneNumber,
          }
        }
      }

      return null
    },
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    merchantData: data || null,
    applicationStatus: data?.applicationStatus || null,
    isLoading,
    error: error as Error | null,
  }
}
