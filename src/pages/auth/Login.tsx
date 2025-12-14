import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Phone, ArrowRight, AlertCircle } from 'lucide-react'
import { Button, Card, PhoneInput } from '@/components/ui'
import { useAuth } from '@/hooks'

interface LocationState {
  from?: {
    pathname: string
  }
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [phone, setPhone] = useState('')
  const {
    isAuthenticated,
    isLoading,
    error,
    initializeRecaptcha,
    sendVerificationCode,
    loginWithGoogle,
    loginWithFacebook,
    clearError,
  } = useAuth()

  // Get the return path from location state or default to home
  const from = (location.state as LocationState)?.from?.pathname || '/'

  // Initialize recaptcha on mount
  useEffect(() => {
    initializeRecaptcha('recaptcha-container')
  }, [initializeRecaptcha])

  // Redirect if already authenticated - go back to original page
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || phone.length < 10) return

    clearError()
    const success = await sendVerificationCode(phone)

    if (success) {
      navigate('/auth/otp', { state: { phone: `+63${phone}`, from } })
    }
  }

  const handleGoogleSignIn = async () => {
    clearError()
    await loginWithGoogle()
  }

  const handleFacebookSignIn = async () => {
    clearError()
    await loginWithFacebook()
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Recaptcha container (invisible) */}
      <div id="recaptcha-container"></div>

      {/* Header */}
      <div className="flex-1 px-6 pt-12 lg:flex lg:flex-col lg:items-center lg:justify-center lg:pt-0">
        <div className="lg:w-full lg:max-w-md">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-600 text-3xl font-bold text-white">
              G
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to GOGO</h1>
            <p className="mt-2 text-gray-500">
              Your all-in-one app for rides, food, and grocery delivery
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Phone Input Form */}
          <Card variant="flat" className="bg-gray-50">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Enter your mobile number
                </label>
                <PhoneInput
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  inputSize="lg"
                  leftIcon={<Phone className="h-5 w-5" />}
                  disabled={isLoading}
                />
                <p className="mt-2 text-xs text-gray-500">
                  We'll send you a verification code via SMS
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                fullWidth
                isLoading={isLoading}
                disabled={phone.length < 10 || isLoading}
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Continue
              </Button>
            </form>
          </Card>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-sm text-gray-500">or continue with</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Social Login */}
          <div className="space-y-3">
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

            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={handleFacebookSignIn}
              disabled={isLoading}
            >
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </Button>
          </div>
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
