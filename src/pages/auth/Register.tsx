import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, User, Mail, Camera, AlertCircle } from 'lucide-react'
import { Button, Input, Avatar } from '@/components/ui'
import { useAuth } from '@/hooks'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/services/firebase/config'

export default function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const phone = location.state?.phone || ''
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  })
  const [profileImage, setProfileImage] = useState<string | undefined>()
  const [isUploading, setIsUploading] = useState(false)

  const { isLoading, error, createUserProfile, clearError, user } = useAuth()

  // Clear any stale errors from previous auth steps when component mounts
  useEffect(() => {
    clearError()
  }, [clearError])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return
    }

    try {
      setIsUploading(true)

      // Upload to Firebase Storage
      const userId = user?.uid || `temp_${Date.now()}`
      const storageRef = ref(storage, `profile-images/${userId}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)

      setProfileImage(downloadURL)
    } catch (err) {
      console.error('Image upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName || !formData.lastName) return

    clearError()
    await createUserProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email || undefined,
      phone: phone || undefined,
      profileImage,
    })
  }

  const isValid = formData.firstName.trim() && formData.lastName.trim()

  return (
    <div className="flex min-h-screen flex-col bg-white px-6 lg:items-center lg:justify-center">
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
              Complete your profile
            </h1>
            <p className="mt-2 text-gray-500">
              Tell us a bit about yourself to get started
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Profile Photo */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <Avatar
                size="2xl"
                name={formData.firstName || 'User'}
                src={profileImage}
              />
              <button
                type="button"
                onClick={handleImageClick}
                disabled={isUploading}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary-600 text-white shadow-md disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Juan"
                leftIcon={<User className="h-5 w-5" />}
                required
                disabled={isLoading}
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Dela Cruz"
                required
                disabled={isLoading}
              />
            </div>

            <Input
              label="Email (Optional)"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="juan@email.com"
              leftIcon={<Mail className="h-5 w-5" />}
              hint="For receipts and important updates"
              disabled={isLoading}
            />

            {/* Phone Display */}
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Mobile Number</p>
              <p className="font-medium text-gray-900">{phone || user?.phoneNumber || 'Not provided'}</p>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                fullWidth
                isLoading={isLoading || isUploading}
                disabled={!isValid || isLoading || isUploading}
              >
                Create Account
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="py-6">
          <p className="text-center text-xs text-gray-500">
            By creating an account, you agree to our{' '}
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
    </div>
  )
}
