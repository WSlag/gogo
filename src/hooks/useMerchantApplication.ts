import { useQuery } from '@tanstack/react-query'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/services/firebase/config'
import { useAuthStore } from '@/store/authStore'

export type MerchantApplicationStatus = 'pending' | 'approved' | 'rejected' | null

interface MerchantApplicationData {
  id: string
  businessName: string
  applicationStatus: 'pending' | 'approved' | 'rejected'
  category: string
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

      // Merchant document ID is the same as user.uid (set in MerchantRegistration.tsx)
      const merchantRef = doc(db, 'merchants', user.uid)
      const merchantSnap = await getDoc(merchantRef)

      if (!merchantSnap.exists()) {
        return null
      }

      const data = merchantSnap.data()
      return {
        id: merchantSnap.id,
        businessName: data.businessName || data.name || 'Unknown',
        applicationStatus: data.applicationStatus as 'pending' | 'approved' | 'rejected',
        category: data.category || data.type || '',
      }
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
