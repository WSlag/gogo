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
} from '@/services/firebase/auth'
import {
  getDocument,
  setDocument,
  collections,
  serverTimestamp,
} from '@/services/firebase/firestore'
import type { User, UserProfile } from '@/types'
import type { ConfirmationResult, User as FirebaseUser } from 'firebase/auth'

interface UseAuthReturn {
  user: FirebaseUser | null
  profile: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  confirmationResult: ConfirmationResult | null
  initializeRecaptcha: (containerId: string) => void
  sendVerificationCode: (phone: string) => Promise<boolean>
  verifyCode: (code: string) => Promise<boolean>
  loginWithGoogle: () => Promise<boolean>
  loginWithFacebook: () => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
  createUserProfile: (data: Partial<User>) => Promise<boolean>
  updateUserProfile: (data: Partial<User>) => Promise<boolean>
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate()
  const {
    user,
    profile,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setProfile,
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
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setProfile, setLoading])

  const initializeRecaptcha = useCallback((containerId: string) => {
    try {
      initRecaptcha(containerId)
    } catch (err) {
      console.error('Recaptcha initialization error:', err)
    }
  }, [])

  const sendVerificationCode = useCallback(async (phone: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      const result = await sendOTP(phone)
      setConfirmationResult(result)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP'
      setError(errorMessage)
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
  }, [navigate, setUser, setProfile, setLoading, setError])

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
  }, [navigate, setUser, setProfile, setLoading, setError])

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

      navigate('/')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profile'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [user, navigate, setProfile, setLoading, setError])

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

  return {
    user,
    profile,
    isAuthenticated,
    isLoading,
    error,
    confirmationResult,
    initializeRecaptcha,
    sendVerificationCode,
    verifyCode,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    clearError,
    createUserProfile,
    updateUserProfile,
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
