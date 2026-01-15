import { useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
  initRecaptcha,
  sendOTP,
  signInWithGoogle,
  signInWithFacebook,
  signOut,
  onAuthChange,
  getStoredConfirmationResult,
  clearStoredConfirmationResult,
  isRecaptchaReady,
  resetRecaptcha,
} from '@/services/firebase/auth'
import {
  getDocument,
  setDocument,
  collections,
  serverTimestamp,
} from '@/services/firebase/firestore'
import { APP_CONFIG } from '@/config/app'
import type { User, UserProfile, UserRole } from '@/types'
import type { ConfirmationResult, User as FirebaseUser } from 'firebase/auth'

interface UseAuthReturn {
  user: FirebaseUser | null
  profile: UserProfile | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  confirmationResult: ConfirmationResult | null
  // Role helpers
  isCustomer: boolean
  isDriver: boolean
  isMerchant: boolean
  isAdmin: boolean
  // Actions
  initializeRecaptcha: (containerId: string) => Promise<boolean>
  sendVerificationCode: (phone: string, containerId?: string) => Promise<boolean>
  verifyCode: (code: string) => Promise<boolean>
  loginWithGoogle: () => Promise<boolean>
  loginWithFacebook: () => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
  createUserProfile: (data: Partial<User>) => Promise<boolean>
  updateUserProfile: (data: Partial<User>) => Promise<boolean>
  // Role management
  becomeDriver: () => Promise<boolean>
  becomeMerchant: () => Promise<boolean>
  switchRole: (role: UserRole) => Promise<boolean>
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate()
  const {
    user,
    profile,
    role,
    isAuthenticated,
    isLoading,
    error,
    isCustomer,
    isDriver,
    isMerchant,
    isAdmin,
    setUser,
    setProfile,
    setRole,
    setLoading,
    setError,
    logout: clearAuth,
  } = useAuthStore()

  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Load user profile from Firestore
        const userProfile = await getDocument<User>(collections.users, firebaseUser.uid)
        if (userProfile) {
          setProfile({
            id: userProfile.id,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            phone: userProfile.phone,
            email: userProfile.email,
            profileImage: userProfile.profileImage,
            walletBalance: userProfile.walletBalance || 0,
          })
          // Set the user's role
          setRole(userProfile.role || APP_CONFIG.DEFAULT_ROLE)
        }
      } else {
        setUser(null)
        setProfile(null)
        setRole(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setProfile, setRole, setLoading])

  const initializeRecaptcha = useCallback(async (containerId: string): Promise<boolean> => {
    try {
      const success = await initRecaptcha(containerId)
      return success
    } catch (err) {
      console.error('Recaptcha initialization error:', err)
      return false
    }
  }, [])

  const sendVerificationCode = useCallback(async (phone: string, containerId?: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      // Validate Philippine phone number format (10 digits starting with 9)
      const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '')
      if (cleanPhone.length !== 10 || !cleanPhone.startsWith('9')) {
        setError('Please enter a valid Philippine mobile number starting with 9')
        return false
      }

      // Check if reCAPTCHA is ready, if not try to re-initialize
      if (!isRecaptchaReady()) {
        const recaptchaContainerId = containerId || 'recaptcha-container-login'
        console.log('[Auth] reCAPTCHA not ready, attempting to initialize...')
        const initialized = await initRecaptcha(recaptchaContainerId)
        if (!initialized) {
          setError('Security verification not ready. Please refresh the page and try again.')
          return false
        }
      }

      const result = await sendOTP(cleanPhone)
      setConfirmationResult(result)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP'
      setError(errorMessage)

      // If it's a reCAPTCHA-related error, the auth service already reset it
      // Signal that reCAPTCHA needs re-initialization for next attempt
      if (errorMessage.includes('Security verification') ||
          errorMessage.includes('verification service') ||
          errorMessage.includes('try again')) {
        console.log('[Auth] reCAPTCHA error detected, will re-initialize on next attempt')
      }

      return false
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  const verifyCode = useCallback(async (code: string): Promise<boolean> => {
    // Try local state first, then module-level stored result
    const activeConfirmation = confirmationResult || getStoredConfirmationResult()

    if (!activeConfirmation) {
      setError('No verification in progress')
      return false
    }

    try {
      setLoading(true)
      setError(null)
      const firebaseUser = await activeConfirmation.confirm(code)
      setError(null) // Clear any previous errors before navigation
      setUser(firebaseUser.user)
      setConfirmationResult(null)
      clearStoredConfirmationResult()

      // Check if user profile exists
      const existingProfile = await getDocument<User>(collections.users, firebaseUser.user.uid)
      if (!existingProfile) {
        // New user, redirect to registration
        navigate('/auth/register', { state: { phone: firebaseUser.user.phoneNumber } })
      } else {
        setProfile({
          id: existingProfile.id,
          firstName: existingProfile.firstName,
          lastName: existingProfile.lastName,
          phone: existingProfile.phone,
          email: existingProfile.email,
          profileImage: existingProfile.profileImage,
          walletBalance: existingProfile.walletBalance || 0,
        })
        navigate('/')
      }
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid verification code'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [confirmationResult, navigate, setUser, setProfile, setLoading, setError])

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      const firebaseUser = await signInWithGoogle()
      setUser(firebaseUser)

      // Check if user profile exists
      const existingProfile = await getDocument<User>(collections.users, firebaseUser.uid)
      if (!existingProfile) {
        // Create profile from Google data
        const newProfile: Partial<User> = {
          id: firebaseUser.uid,
          role: APP_CONFIG.DEFAULT_ROLE,
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          email: firebaseUser.email || '',
          phone: firebaseUser.phoneNumber || '',
          walletBalance: 0,
          referralCode: generateReferralCode(),
          status: 'active',
          settings: {
            notifications: {
              push: true,
              email: true,
              sms: true,
              promotions: true,
            },
            language: 'en',
            currency: 'PHP',
          },
        }
        // Only add profileImage if it exists (Firestore rejects undefined)
        if (firebaseUser.photoURL) {
          newProfile.profileImage = firebaseUser.photoURL
        }
        await setDocument(collections.users, firebaseUser.uid, {
          ...newProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        setProfile({
          id: firebaseUser.uid,
          firstName: newProfile.firstName!,
          lastName: newProfile.lastName!,
          phone: newProfile.phone!,
          email: newProfile.email,
          profileImage: newProfile.profileImage,
          walletBalance: 0,
        })
        setRole(APP_CONFIG.DEFAULT_ROLE)
      } else {
        setProfile({
          id: existingProfile.id,
          firstName: existingProfile.firstName,
          lastName: existingProfile.lastName,
          phone: existingProfile.phone,
          email: existingProfile.email,
          profileImage: existingProfile.profileImage,
          walletBalance: existingProfile.walletBalance || 0,
        })
        setRole(existingProfile.role || APP_CONFIG.DEFAULT_ROLE)
      }
      navigate('/')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google sign-in failed'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [navigate, setUser, setProfile, setRole, setLoading, setError])

  const loginWithFacebook = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      const firebaseUser = await signInWithFacebook()
      setUser(firebaseUser)

      // Check if user profile exists
      const existingProfile = await getDocument<User>(collections.users, firebaseUser.uid)
      if (!existingProfile) {
        // Create profile from Facebook data
        const newProfile: Partial<User> = {
          id: firebaseUser.uid,
          role: APP_CONFIG.DEFAULT_ROLE,
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          email: firebaseUser.email || '',
          phone: firebaseUser.phoneNumber || '',
          walletBalance: 0,
          referralCode: generateReferralCode(),
          status: 'active',
          settings: {
            notifications: {
              push: true,
              email: true,
              sms: true,
              promotions: true,
            },
            language: 'en',
            currency: 'PHP',
          },
        }
        // Only add profileImage if it exists (Firestore rejects undefined)
        if (firebaseUser.photoURL) {
          newProfile.profileImage = firebaseUser.photoURL
        }
        await setDocument(collections.users, firebaseUser.uid, {
          ...newProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        setProfile({
          id: firebaseUser.uid,
          firstName: newProfile.firstName!,
          lastName: newProfile.lastName!,
          phone: newProfile.phone!,
          email: newProfile.email,
          profileImage: newProfile.profileImage,
          walletBalance: 0,
        })
        setRole(APP_CONFIG.DEFAULT_ROLE)
      } else {
        setProfile({
          id: existingProfile.id,
          firstName: existingProfile.firstName,
          lastName: existingProfile.lastName,
          phone: existingProfile.phone,
          email: existingProfile.email,
          profileImage: existingProfile.profileImage,
          walletBalance: existingProfile.walletBalance || 0,
        })
        setRole(existingProfile.role || APP_CONFIG.DEFAULT_ROLE)
      }
      navigate('/')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Facebook sign-in failed'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [navigate, setUser, setProfile, setRole, setLoading, setError])

  const logout = useCallback(async (): Promise<void> => {
    try {
      await signOut()
      clearAuth()
      navigate('/auth/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }, [clearAuth, navigate])

  const clearError = useCallback(() => {
    setError(null)
  }, [setError])

  const createUserProfile = useCallback(async (data: Partial<User>): Promise<boolean> => {
    if (!user) {
      setError('No authenticated user')
      return false
    }

    try {
      setLoading(true)
      const newProfile: Partial<User> = {
        id: user.uid,
        role: data.role || APP_CONFIG.DEFAULT_ROLE,
        phone: user.phoneNumber || data.phone || '',
        email: data.email || user.email || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        savedLocations: [],
        walletBalance: 0,
        referralCode: generateReferralCode(),
        status: 'active',
        settings: {
          notifications: {
            push: true,
            email: true,
            sms: true,
            promotions: true,
          },
          language: 'en',
          currency: 'PHP',
        },
      }

      // Only add optional fields if they have values (Firestore rejects undefined)
      const profileImageValue = data.profileImage || user.photoURL
      if (profileImageValue) {
        newProfile.profileImage = profileImageValue
      }
      if (data.dateOfBirth) {
        newProfile.dateOfBirth = data.dateOfBirth
      }
      if (data.gender) {
        newProfile.gender = data.gender
      }

      await setDocument(collections.users, user.uid, {
        ...newProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      setProfile({
        id: user.uid,
        firstName: newProfile.firstName!,
        lastName: newProfile.lastName!,
        phone: newProfile.phone!,
        email: newProfile.email,
        profileImage: newProfile.profileImage,
        walletBalance: 0,
      })
      setRole(newProfile.role || APP_CONFIG.DEFAULT_ROLE)

      navigate('/')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profile'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [user, navigate, setProfile, setRole, setLoading, setError])

  const updateUserProfile = useCallback(async (data: Partial<User>): Promise<boolean> => {
    if (!user) {
      setError('No authenticated user')
      return false
    }

    try {
      setLoading(true)
      await setDocument(collections.users, user.uid, data)

      // Update local profile state
      if (profile) {
        setProfile({
          ...profile,
          firstName: data.firstName || profile.firstName,
          lastName: data.lastName || profile.lastName,
          email: data.email || profile.email,
          profileImage: data.profileImage || profile.profileImage,
        })
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [user, profile, setProfile, setLoading, setError])

  // Switch user role (auto-approve for testing)
  const switchRole = useCallback(async (newRole: UserRole): Promise<boolean> => {
    if (!user) {
      setError('No authenticated user')
      return false
    }

    try {
      setLoading(true)

      // Update role in Firestore
      await setDocument(collections.users, user.uid, {
        role: newRole,
        updatedAt: serverTimestamp(),
      })

      // Update local state
      setRole(newRole)

      if (APP_CONFIG.IS_TESTING) {
        console.log(`[Auth] Role switched to: ${newRole} (auto-approved for testing)`)
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch role'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [user, setRole, setLoading, setError])

  // Become a driver (auto-approve for testing)
  const becomeDriver = useCallback(async (): Promise<boolean> => {
    if (!APP_CONFIG.AUTO_APPROVE_DRIVERS && !APP_CONFIG.IS_TESTING) {
      // In production, this would submit an application for review
      setError('Driver applications require admin approval')
      return false
    }
    return switchRole('driver')
  }, [switchRole, setError])

  // Become a merchant (auto-approve for testing)
  const becomeMerchant = useCallback(async (): Promise<boolean> => {
    if (!APP_CONFIG.AUTO_APPROVE_MERCHANTS && !APP_CONFIG.IS_TESTING) {
      // In production, this would submit an application for review
      setError('Merchant applications require admin approval')
      return false
    }
    return switchRole('merchant')
  }, [switchRole, setError])

  return {
    user,
    profile,
    role,
    isAuthenticated,
    isLoading,
    error,
    confirmationResult,
    // Role helpers
    isCustomer,
    isDriver,
    isMerchant,
    isAdmin,
    // Actions
    initializeRecaptcha,
    sendVerificationCode,
    verifyCode,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    clearError,
    createUserProfile,
    updateUserProfile,
    // Role management
    becomeDriver,
    becomeMerchant,
    switchRole,
  }
}

// Generate a random referral code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'GOGO'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
