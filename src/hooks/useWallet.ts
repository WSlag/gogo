import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import {
  getDocument,
  getDocuments,
  setDocument,
  collections,
  serverTimestamp,
  where,
  orderBy,
  limit,
} from '@/services/firebase/firestore'
import type { User } from '@/types'

interface Transaction {
  id: string
  userId: string
  type: 'topup' | 'payment' | 'refund' | 'withdrawal' | 'transfer'
  amount: number
  balance: number
  reference?: string
  paymentMethod?: string
  description: string
  status: 'pending' | 'completed' | 'failed'
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

interface UseWalletReturn {
  balance: number
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  topUp: (amount: number, paymentMethod: string) => Promise<boolean>
  getTransactions: (limitCount?: number) => Promise<Transaction[]>
  applyPromoCode: (code: string) => Promise<{ valid: boolean; discount: number; message: string }>
  refreshBalance: () => void
}

export function useWallet(): UseWalletReturn {
  const { user } = useAuthStore()
  const [error, setError] = useState<string | null>(null)

  // Fetch user balance
  const {
    data: userData,
    isLoading: balanceLoading,
    refetch: refreshBalance,
  } = useQuery({
    queryKey: ['userBalance', user?.uid],
    queryFn: async () => {
      if (!user) return null
      const userDoc = await getDocument<User>(collections.users, user.uid)
      return userDoc
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
  })

  // Fetch transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', user?.uid],
    queryFn: async () => {
      if (!user) return []
      const txns = await getDocuments<Transaction>(collections.transactions, [
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50),
      ])
      return txns
    },
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute
  })

  const topUp = useCallback(async (amount: number, paymentMethod: string): Promise<boolean> => {
    if (!user) {
      setError('Please login to top up')
      return false
    }

    if (amount < 100) {
      setError('Minimum top up amount is ₱100')
      return false
    }

    try {
      setError(null)

      // Get current balance
      const userDoc = await getDocument<User>(collections.users, user.uid)
      const currentBalance = userDoc?.walletBalance || 0
      const newBalance = currentBalance + amount

      // Create transaction record
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const transaction: Partial<Transaction> = {
        id: transactionId,
        userId: user.uid,
        type: 'topup',
        amount,
        balance: newBalance,
        paymentMethod,
        description: `Wallet top up via ${paymentMethod}`,
        status: 'completed', // In real app, this would be pending until confirmed
      }

      // Update user balance
      await setDocument(collections.users, user.uid, {
        walletBalance: newBalance,
      })

      // Create transaction record
      await setDocument(collections.transactions, transactionId, {
        ...transaction,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Refresh balance
      refreshBalance()

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Top up failed'
      setError(errorMessage)
      return false
    }
  }, [user, refreshBalance])

  const getTransactions = useCallback(async (limitCount: number = 20): Promise<Transaction[]> => {
    if (!user) return []

    try {
      const txns = await getDocuments<Transaction>(collections.transactions, [
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(limitCount),
      ])
      return txns
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
      return []
    }
  }, [user])

  const applyPromoCode = useCallback(async (code: string): Promise<{ valid: boolean; discount: number; message: string }> => {
    if (!code.trim()) {
      return { valid: false, discount: 0, message: 'Please enter a promo code' }
    }

    try {
      // Fetch promo by code
      const promos = await getDocuments(collections.promos, [
        where('code', '==', code.toUpperCase()),
        where('isActive', '==', true),
      ])

      if (promos.length === 0) {
        return { valid: false, discount: 0, message: 'Invalid promo code' }
      }

      const promo = promos[0] as {
        id: string
        type: 'percentage' | 'fixed' | 'freeDelivery'
        value: number
        minOrder?: number
        maxDiscount?: number
        validFrom: Date
        validTo: Date
        usageLimit?: number
        usedCount: number
        userLimit: number
      }

      // Check validity period
      const now = new Date()
      if (promo.validFrom > now || promo.validTo < now) {
        return { valid: false, discount: 0, message: 'This promo code has expired' }
      }

      // Check usage limits
      if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
        return { valid: false, discount: 0, message: 'This promo code has reached its usage limit' }
      }

      // Calculate discount
      let discount = 0
      let message = ''

      switch (promo.type) {
        case 'percentage':
          discount = promo.value // Will be applied as percentage
          message = `${promo.value}% discount applied!`
          break
        case 'fixed':
          discount = promo.value
          message = `₱${promo.value} discount applied!`
          break
        case 'freeDelivery':
          discount = 0 // Special handling in checkout
          message = 'Free delivery applied!'
          break
      }

      return { valid: true, discount, message }
    } catch (err) {
      console.error('Promo validation error:', err)
      return { valid: false, discount: 0, message: 'Failed to validate promo code' }
    }
  }, [])

  return {
    balance: userData?.walletBalance || 0,
    transactions: transactions || [],
    isLoading: balanceLoading || transactionsLoading,
    error,
    topUp,
    getTransactions,
    applyPromoCode,
    refreshBalance,
  }
}
