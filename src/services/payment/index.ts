// Payment Service - Integrates with PayMongo (Philippine payment gateway)
// Supports GCash, Maya, Cards, and other local payment methods

import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '@/services/firebase/config'

const functions = getFunctions(app, 'asia-southeast1')

export type PaymentMethod = 'gcash' | 'maya' | 'card' | 'wallet' | 'cash'

export interface PaymentIntent {
  id: string
  clientKey: string
  status: 'awaiting_payment_method' | 'awaiting_next_action' | 'processing' | 'succeeded' | 'failed'
  amount: number
  currency: string
  paymentMethod?: PaymentMethod
  redirectUrl?: string
  checkoutUrl?: string
}

export interface PaymentSource {
  id: string
  type: 'gcash' | 'grab_pay' | 'paymaya'
  status: 'pending' | 'chargeable' | 'cancelled' | 'expired' | 'paid'
  amount: number
  redirectUrl: string
  checkoutUrl: string
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  paymentIntentId?: string
  redirectUrl?: string
  error?: string
}

export interface TopUpResult {
  success: boolean
  transactionId?: string
  newBalance?: number
  redirectUrl?: string
  error?: string
}

// Create a payment intent for card payments
export async function createPaymentIntent(
  amount: number,
  description: string,
  metadata?: Record<string, string>
): Promise<PaymentIntent | null> {
  try {
    const createIntent = httpsCallable<
      { amount: number; description: string; metadata?: Record<string, string> },
      PaymentIntent
    >(functions, 'createPaymentIntent')

    const result = await createIntent({ amount, description, metadata })
    return result.data
  } catch (error) {
    console.error('Failed to create payment intent:', error)
    return null
  }
}

// Create a payment source for e-wallet payments (GCash, Maya)
export async function createPaymentSource(
  amount: number,
  type: 'gcash' | 'maya',
  successUrl: string,
  failedUrl: string,
  description: string,
  metadata?: Record<string, string>
): Promise<PaymentSource | null> {
  try {
    const createSource = httpsCallable<
      {
        amount: number
        type: string
        successUrl: string
        failedUrl: string
        description: string
        metadata?: Record<string, string>
      },
      PaymentSource
    >(functions, 'createPaymentSource')

    const result = await createSource({
      amount,
      type,
      successUrl,
      failedUrl,
      description,
      metadata,
    })
    return result.data
  } catch (error) {
    console.error('Failed to create payment source:', error)
    return null
  }
}

// Process wallet top-up
export async function processTopUp(
  amount: number,
  paymentMethod: PaymentMethod
): Promise<TopUpResult> {
  try {
    const topUp = httpsCallable<
      { amount: number; paymentMethod: string },
      TopUpResult
    >(functions, 'processTopUp')

    const result = await topUp({ amount, paymentMethod })
    return result.data
  } catch (error) {
    console.error('Failed to process top-up:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process top-up',
    }
  }
}

// Process ride payment
export async function processRidePayment(
  rideId: string,
  amount: number,
  paymentMethod: PaymentMethod
): Promise<PaymentResult> {
  try {
    const processPayment = httpsCallable<
      { rideId: string; amount: number; paymentMethod: string },
      PaymentResult
    >(functions, 'processRidePayment')

    const result = await processPayment({ rideId, amount, paymentMethod })
    return result.data
  } catch (error) {
    console.error('Failed to process ride payment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process payment',
    }
  }
}

// Process order payment
export async function processOrderPayment(
  orderId: string,
  amount: number,
  paymentMethod: PaymentMethod
): Promise<PaymentResult> {
  try {
    const processPayment = httpsCallable<
      { orderId: string; amount: number; paymentMethod: string },
      PaymentResult
    >(functions, 'processOrderPayment')

    const result = await processPayment({ orderId, amount, paymentMethod })
    return result.data
  } catch (error) {
    console.error('Failed to process order payment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process payment',
    }
  }
}

// Check payment status
export async function checkPaymentStatus(
  paymentId: string,
  type: 'intent' | 'source'
): Promise<{ status: string; paid: boolean }> {
  try {
    const checkStatus = httpsCallable<
      { paymentId: string; type: string },
      { status: string; paid: boolean }
    >(functions, 'checkPaymentStatus')

    const result = await checkStatus({ paymentId, type })
    return result.data
  } catch (error) {
    console.error('Failed to check payment status:', error)
    return { status: 'unknown', paid: false }
  }
}

// Verify GCash/Maya payment after redirect
export async function verifyEWalletPayment(
  sourceId: string
): Promise<PaymentResult> {
  try {
    const verify = httpsCallable<{ sourceId: string }, PaymentResult>(
      functions,
      'verifyEWalletPayment'
    )

    const result = await verify({ sourceId })
    return result.data
  } catch (error) {
    console.error('Failed to verify e-wallet payment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify payment',
    }
  }
}

// Format amount for display
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

// Get payment method display name
export function getPaymentMethodName(method: PaymentMethod): string {
  const names: Record<PaymentMethod, string> = {
    gcash: 'GCash',
    maya: 'Maya',
    card: 'Credit/Debit Card',
    wallet: 'GOGO Express Wallet',
    cash: 'Cash',
  }
  return names[method] || method
}
