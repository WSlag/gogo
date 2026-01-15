import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui'
import { useAuth } from '@/hooks'

export default function OTPVerification() {
  const navigate = useNavigate()
  const location = useLocation()
  const phone = location.state?.phone || '+63*********'
  const returnPath = location.state?.from || '/'

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resendTimer, setResendTimer] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const {
    isAuthenticated,
    isLoading,
    error,
    verifyCode,
    sendVerificationCode,
    initializeRecaptcha,
    clearError,
  } = useAuth()

  // Redirect to login if no phone in navigation state
  useEffect(() => {
    if (!location.state?.phone) {
      navigate('/auth/login', { replace: true })
    }
  }, [location.state, navigate])

  // Redirect to return path after successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnPath, { replace: true })
    }
  }, [isAuthenticated, navigate, returnPath])

  // Initialize recaptcha for resend functionality
  useEffect(() => {
    const initRecaptchaForResend = async () => {
      // Small delay to let any existing reCAPTCHA settle
      await new Promise(resolve => setTimeout(resolve, 200))
      await initializeRecaptcha('recaptcha-container')
    }
    initRecaptchaForResend()
  }, [initializeRecaptcha])

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when complete
    if (newOtp.every((digit) => digit) && index === 5) {
      handleVerify(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)

    if (pastedData.length === 6) {
      const newOtp = pastedData.split('')
      setOtp(newOtp)
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (code: string) => {
    clearError()
    await verifyCode(code)
  }

  const handleResend = async () => {
    if (resendTimer > 0) return

    clearError()
    // Extract phone number without country code
    const phoneNumber = phone.replace('+63', '')
    const success = await sendVerificationCode(phoneNumber)

    if (success) {
      setResendTimer(60)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white px-6 lg:items-center lg:justify-center">
      {/* Recaptcha container (invisible) */}
      <div id="recaptcha-container"></div>

      <div className="lg:w-full lg:max-w-md">
        {/* Header */}
        <div className="flex items-center py-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Verify your number
            </h1>
            <p className="mt-2 text-gray-500">
              Enter the 6-digit code sent to{' '}
              <span className="font-medium text-gray-900">{phone}</span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* OTP Input */}
          <div className="mb-6 flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                className="h-14 w-12 rounded-xl border-2 border-gray-200 text-center text-xl font-bold text-gray-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-gray-100"
              />
            ))}
          </div>

          {/* Resend */}
          <div className="mb-8 text-center">
            {resendTimer > 0 ? (
              <p className="text-sm text-gray-500">
                Resend code in{' '}
                <span className="font-medium text-gray-900">{resendTimer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="text-sm font-medium text-primary-600 disabled:opacity-50"
              >
                Resend code
              </button>
            )}
          </div>

          {/* Verify Button */}
          <Button
            size="lg"
            fullWidth
            isLoading={isLoading}
            disabled={!otp.every((digit) => digit) || isLoading}
            onClick={() => handleVerify(otp.join(''))}
          >
            Verify
          </Button>
        </div>
      </div>
    </div>
  )
}
