import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AlertCircle, Phone, ArrowLeft } from 'lucide-react'
import { Button, PhoneInput } from '@/components/ui'
import { useAuth } from '@/hooks'
import { APP_CONFIG } from '@/config/app'

interface LocationState {
  from?: {
    pathname: string
  }
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [authMode, setAuthMode] = useState<'choose' | 'phone'>('choose')
  const [phoneNumber, setPhoneNumber] = useState('')

  const {
    isAuthenticated,
    isLoading,
    error,
    loginWithGoogle,
    sendVerificationCode,
    initializeRecaptcha,
    clearError,
  } = useAuth()

  // Get the return path from location state or default to home
  const from = (location.state as LocationState)?.from?.pathname || '/'

  // Skip auth - redirect to home immediately
  useEffect(() => {
    if (APP_CONFIG.SKIP_AUTH) {
      navigate('/', { replace: true })
    }
  }, [navigate])

  // Redirect if already authenticated - go back to original page
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  // Initialize reCAPTCHA when phone mode is active
  const [recaptchaInitialized, setRecaptchaInitialized] = useState(false)

  useEffect(() => {
    if (authMode === 'phone' && !recaptchaInitialized) {
      const timer = setTimeout(async () => {
        const success = await initializeRecaptcha('recaptcha-container-login')
        if (success) {
          setRecaptchaInitialized(true)
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [authMode, initializeRecaptcha, recaptchaInitialized])

  const handleGoogleSignIn = async () => {
    clearError()
    await loginWithGoogle()
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    // Validate phone number (10 digits, starts with 9)
    const cleanPhone = phoneNumber.replace(/\D/g, '').replace(/^0/, '')
    if (cleanPhone.length !== 10 || !cleanPhone.startsWith('9')) {
      return
    }

    // Pass the container ID so reCAPTCHA can be re-initialized if needed
    const success = await sendVerificationCode(cleanPhone, 'recaptcha-container-login')
    if (success) {
      navigate('/auth/otp', {
        state: {
          phone: `+63${cleanPhone}`,
          from,
        },
      })
    }
  }

  const handleBackToChoose = () => {
    setAuthMode('choose')
    setPhoneNumber('')
    clearError()
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="flex-1 px-6 pt-12 lg:flex lg:flex-col lg:items-center lg:justify-center lg:pt-0">
        <div className="lg:w-full lg:max-w-md">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img
              src="/icons/logo.jpg"
              alt="GOGO Express"
              className="h-24 w-auto rounded-2xl"
            />
          </div>

          {/* Welcome Text */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to GOGO Express</h1>
            <p className="mt-2 text-gray-500">
              Your all-in-one app for rides, food, and grocery delivery
            </p>
          </div>

          {/* reCAPTCHA container (invisible) */}
          <div id="recaptcha-container-login"></div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-error-light p-3 text-sm text-error">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {authMode === 'choose' ? (
            <>
              {/* Phone Sign In */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setAuthMode('phone')}
                disabled={isLoading}
              >
                <Phone className="h-5 w-5" />
                Continue with Phone
              </Button>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-sm text-gray-500">or</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Google Sign In */}
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="h-5 w-5"
                />
                Continue with Google
              </Button>
            </>
          ) : (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              {/* Back button */}
              <button
                type="button"
                onClick={handleBackToChoose}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              {/* Phone Input */}
              <PhoneInput
                label="Mobile Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="9XX XXX XXXX"
                disabled={isLoading}
                autoFocus
              />

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                fullWidth
                isLoading={isLoading}
                disabled={isLoading || phoneNumber.replace(/\D/g, '').length < 10}
              >
                Send Verification Code
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6">
        <p className="text-center text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-primary-600">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-primary-600">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
