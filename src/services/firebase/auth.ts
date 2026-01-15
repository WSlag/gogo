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
let currentContainerId: string | null = null

// Store confirmation result at module level to persist across navigation
let storedConfirmationResult: ConfirmationResult | null = null

// Track rate limit status
let rateLimitedUntil: number | null = null
const RATE_LIMIT_DURATION_MS = 5 * 60 * 1000 // 5 minutes

// Get stored confirmation result
export const getStoredConfirmationResult = (): ConfirmationResult | null => {
  return storedConfirmationResult
}

// Clear stored confirmation result
export const clearStoredConfirmationResult = (): void => {
  storedConfirmationResult = null
}

// Reset reCAPTCHA for recovery after failures
export const resetRecaptcha = (): void => {
  log('Resetting reCAPTCHA...')
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear()
    } catch (e) {
      log('Error clearing reCAPTCHA during reset (non-critical)', e)
    }
  }
  recaptchaVerifier = null
  recaptchaInitialized = false
  currentContainerId = null
}

// Check if currently rate limited
export const isRateLimited = (): boolean => {
  if (!rateLimitedUntil) return false
  if (Date.now() > rateLimitedUntil) {
    rateLimitedUntil = null
    return false
  }
  return true
}

// Get remaining rate limit time in seconds
export const getRateLimitRemainingSeconds = (): number => {
  if (!rateLimitedUntil) return 0
  const remaining = rateLimitedUntil - Date.now()
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0
}

// Initialize recaptcha verifier
export const initRecaptcha = async (containerId: string): Promise<boolean> => {
  log('Initializing reCAPTCHA...', { containerId })

  // If reCAPTCHA is already initialized for the same container, reuse it
  if (recaptchaVerifier && recaptchaInitialized && currentContainerId === containerId) {
    // Verify the container still exists in DOM
    const container = document.getElementById(containerId)
    if (container) {
      log('reCAPTCHA already initialized, reusing existing instance')
      return true
    } else {
      // Container was removed, need to reinitialize
      log('reCAPTCHA container was removed, reinitializing...')
      recaptchaVerifier = null
      recaptchaInitialized = false
      currentContainerId = null
    }
  }

  // If switching containers, clear old verifier
  if (currentContainerId && currentContainerId !== containerId) {
    log('Switching reCAPTCHA containers, clearing old verifier')
    try {
      recaptchaVerifier?.clear()
    } catch (e) {
      log('Error clearing old reCAPTCHA (non-critical)', e)
    }
    recaptchaVerifier = null
    recaptchaInitialized = false
    currentContainerId = null
  }

  // Check if container element exists
  const container = document.getElementById(containerId)
  if (!container) {
    logError('reCAPTCHA container not found', { containerId })
    return false
  }

  // Check if container already has reCAPTCHA rendered (has children)
  if (container.hasChildNodes()) {
    log('reCAPTCHA container already has content, clearing...')
    container.innerHTML = ''
  }

  try {
    // Clear existing verifier if any
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

    // Render the reCAPTCHA widget to ensure it's ready
    await recaptchaVerifier.render()
    recaptchaInitialized = true
    currentContainerId = containerId
    log('reCAPTCHA rendered successfully')
    return true
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    // Handle the "already rendered" error gracefully
    if (errorMessage.includes('already been rendered')) {
      log('reCAPTCHA already rendered, marking as initialized')
      recaptchaInitialized = true
      currentContainerId = containerId
      return true
    }
    logError('Failed to initialize reCAPTCHA', error)
    recaptchaVerifier = null
    recaptchaInitialized = false
    currentContainerId = null
    return false
  }
}

// Check if reCAPTCHA is ready
export const isRecaptchaReady = (): boolean => {
  return recaptchaVerifier !== null && recaptchaInitialized
}

// Send OTP to phone number
export const sendOTP = async (phoneNumber: string): Promise<ConfirmationResult> => {
  log('Sending OTP...', { phoneNumber: phoneNumber.replace(/\d(?=\d{4})/g, '*') })

  if (!recaptchaVerifier) {
    const error = new Error('reCAPTCHA not initialized. Please refresh the page and try again.')
    logError('sendOTP failed', error)
    throw error
  }

  // Verify the reCAPTCHA container still exists
  if (currentContainerId) {
    const container = document.getElementById(currentContainerId)
    if (!container) {
      log('reCAPTCHA container was removed, clearing verifier')
      recaptchaVerifier = null
      recaptchaInitialized = false
      currentContainerId = null
      throw new Error('Security verification expired. Please refresh the page and try again.')
    }
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

    // Track rate limiting
    if (firebaseError.code === 'auth/too-many-requests') {
      rateLimitedUntil = Date.now() + RATE_LIMIT_DURATION_MS
      log('Rate limited until', new Date(rateLimitedUntil).toLocaleTimeString())
    }

    // Determine if we need to reset reCAPTCHA for recovery
    const needsRecaptchaReset =
      firebaseError.code === 'auth/captcha-check-failed' ||
      firebaseError.code === 'auth/invalid-app-credential' ||
      firebaseError.code === 'auth/error-code:-39' ||
      firebaseError.message?.includes('reCAPTCHA client element has been removed') ||
      firebaseError.message?.includes('reCAPTCHA') ||
      firebaseError.message?.includes('recaptcha')

    if (needsRecaptchaReset) {
      log('Resetting reCAPTCHA due to verification failure')
      resetRecaptcha()
    }

    // Map Firebase error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      'auth/invalid-phone-number': 'Invalid phone number format. Please enter a valid Philippine mobile number.',
      'auth/too-many-requests': 'Too many attempts. Please wait a few minutes before trying again.',
      'auth/quota-exceeded': 'SMS quota exceeded. Please try again later or contact support.',
      'auth/captcha-check-failed': 'Security verification failed. Please try again.',
      'auth/missing-phone-number': 'Please enter your phone number.',
      'auth/operation-not-allowed': 'Phone authentication is not enabled. Please contact support.',
      'auth/network-request-failed': 'Network error. Please check your internet connection.',
      'auth/invalid-app-credential': 'Security verification failed. Please try again.',
      'auth/error-code:-39': 'Phone verification service temporarily unavailable. Please try again.',
    }

    // Handle reCAPTCHA element removed error
    if (firebaseError.message?.includes('reCAPTCHA client element has been removed')) {
      throw new Error('Security verification expired. Please try again.')
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
