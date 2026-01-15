import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  PhoneAuthProvider,
  signInWithCredential,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type ConfirmationResult,
} from 'firebase/auth'
import { auth } from './config'

// Debug logging helper
const DEBUG = import.meta.env.DEV
const log = (message: string, data?: unknown) => {
  if (DEBUG) {
    console.log(`[Auth] ${message}`, data || '')
  }
}
const logError = (message: string, error: unknown) => {
  console.error(`[Auth] ${message}`, error)
}

// Recaptcha verifier instance
let recaptchaVerifier: RecaptchaVerifier | null = null
let recaptchaInitialized = false

// Store confirmation result at module level to persist across navigation
let storedConfirmationResult: ConfirmationResult | null = null

// Get stored confirmation result
export const getStoredConfirmationResult = (): ConfirmationResult | null => {
  return storedConfirmationResult
}

// Clear stored confirmation result
export const clearStoredConfirmationResult = (): void => {
  storedConfirmationResult = null
}

// Initialize recaptcha verifier
export const initRecaptcha = (containerId: string): RecaptchaVerifier | null => {
  log('Initializing reCAPTCHA...', { containerId })

  // Check if container element exists
  const container = document.getElementById(containerId)
  if (!container) {
    logError('reCAPTCHA container not found', { containerId })
    return null
  }

  try {
    // Clear existing verifier
    if (recaptchaVerifier) {
      log('Clearing existing reCAPTCHA verifier')
      try {
        recaptchaVerifier.clear()
      } catch (e) {
        log('Error clearing reCAPTCHA (non-critical)', e)
      }
      recaptchaVerifier = null
      recaptchaInitialized = false
    }

    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        log('reCAPTCHA solved successfully')
        recaptchaInitialized = true
      },
      'expired-callback': () => {
        log('reCAPTCHA expired, clearing...')
        recaptchaInitialized = false
        try {
          recaptchaVerifier?.clear()
        } catch (e) {
          log('Error clearing expired reCAPTCHA', e)
        }
      },
      'error-callback': (error: Error) => {
        logError('reCAPTCHA error', error)
        recaptchaInitialized = false
      },
    })

    log('reCAPTCHA verifier created successfully')
    return recaptchaVerifier
  } catch (error) {
    logError('Failed to initialize reCAPTCHA', error)
    return null
  }
}

// Check if reCAPTCHA is ready
export const isRecaptchaReady = (): boolean => {
  return recaptchaVerifier !== null
}

// Send OTP to phone number
export const sendOTP = async (phoneNumber: string): Promise<ConfirmationResult> => {
  log('Sending OTP...', { phoneNumber: phoneNumber.replace(/\d(?=\d{4})/g, '*') })

  if (!recaptchaVerifier) {
    const error = new Error('reCAPTCHA not initialized. Please refresh the page and try again.')
    logError('sendOTP failed', error)
    throw error
  }

  // Ensure phone number has country code (+63 for Philippines)
  const formattedPhone = phoneNumber.startsWith('+')
    ? phoneNumber
    : `+63${phoneNumber.replace(/^0/, '')}`

  log('Formatted phone number', { formattedPhone: formattedPhone.replace(/\d(?=\d{4})/g, '*') })

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier)
    log('OTP sent successfully, verification ID received')
    // Store at module level for persistence across navigation
    storedConfirmationResult = confirmationResult
    return confirmationResult
  } catch (error: unknown) {
    // Provide user-friendly error messages
    const firebaseError = error as { code?: string; message?: string }
    logError('sendOTP failed', { code: firebaseError.code, message: firebaseError.message })

    // Map Firebase error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      'auth/invalid-phone-number': 'Invalid phone number format. Please enter a valid Philippine mobile number.',
      'auth/too-many-requests': 'Too many attempts. Please wait a few minutes before trying again.',
      'auth/quota-exceeded': 'SMS quota exceeded. Please try again later or contact support.',
      'auth/captcha-check-failed': 'Security verification failed. Please refresh the page and try again.',
      'auth/missing-phone-number': 'Please enter your phone number.',
      'auth/operation-not-allowed': 'Phone authentication is not enabled. Please contact support.',
      'auth/network-request-failed': 'Network error. Please check your internet connection.',
    }

    const userMessage = errorMessages[firebaseError.code || ''] || firebaseError.message || 'Failed to send verification code. Please try again.'
    throw new Error(userMessage)
  }
}

// Verify OTP code
export const verifyOTP = async (
  verificationId: string,
  code: string
): Promise<User> => {
  log('Verifying OTP code...')

  try {
    const credential = PhoneAuthProvider.credential(verificationId, code)
    const result = await signInWithCredential(auth, credential)
    log('OTP verified successfully', { uid: result.user.uid })
    return result.user
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string }
    logError('verifyOTP failed', { code: firebaseError.code, message: firebaseError.message })

    const errorMessages: Record<string, string> = {
      'auth/invalid-verification-code': 'Invalid verification code. Please check and try again.',
      'auth/code-expired': 'Verification code has expired. Please request a new code.',
      'auth/invalid-verification-id': 'Verification session expired. Please request a new code.',
      'auth/session-expired': 'Session expired. Please start the login process again.',
    }

    const userMessage = errorMessages[firebaseError.code || ''] || firebaseError.message || 'Verification failed. Please try again.'
    throw new Error(userMessage)
  }
}

// Google Sign-In
export const signInWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider()
  provider.addScope('email')
  provider.addScope('profile')

  const result = await signInWithPopup(auth, provider)
  return result.user
}

// Facebook Sign-In
export const signInWithFacebook = async (): Promise<User> => {
  const provider = new FacebookAuthProvider()
  provider.addScope('email')
  provider.addScope('public_profile')

  const result = await signInWithPopup(auth, provider)
  return result.user
}

// Sign out
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth)
}

// Auth state observer
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser
}

// Get ID token
export const getIdToken = async (): Promise<string | null> => {
  const user = auth.currentUser
  if (user) {
    return user.getIdToken()
  }
  return null
}
