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

// Recaptcha verifier instance
let recaptchaVerifier: RecaptchaVerifier | null = null

// Initialize recaptcha verifier
export const initRecaptcha = (containerId: string) => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear()
  }

  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      // Reset reCAPTCHA
      recaptchaVerifier?.clear()
    },
  })

  return recaptchaVerifier
}

// Send OTP to phone number
export const sendOTP = async (phoneNumber: string): Promise<ConfirmationResult> => {
  if (!recaptchaVerifier) {
    throw new Error('Recaptcha not initialized')
  }

  // Ensure phone number has country code (+63 for Philippines)
  const formattedPhone = phoneNumber.startsWith('+')
    ? phoneNumber
    : `+63${phoneNumber.replace(/^0/, '')}`

  const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier)
  return confirmationResult
}

// Verify OTP code
export const verifyOTP = async (
  verificationId: string,
  code: string
): Promise<User> => {
  const credential = PhoneAuthProvider.credential(verificationId, code)
  const result = await signInWithCredential(auth, credential)
  return result.user
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
