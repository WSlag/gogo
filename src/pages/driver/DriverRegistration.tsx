import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Check,
  User,
  Car,
  FileText,
  Camera,
  AlertCircle,
} from 'lucide-react'
import { Button, Card, Input, Spinner } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { useDocumentUpload } from '@/hooks/useImageUpload'
import { doc, setDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/services/firebase/config'
import type { VehicleType } from '@/types'

type Step = 'personal' | 'vehicle' | 'documents' | 'review'

interface PersonalInfo {
  firstName: string
  lastName: string
  phone: string
  email: string
  profileImage: string | null
}

interface VehicleInfo {
  type: VehicleType
  make: string
  model: string
  year: string
  color: string
  plateNumber: string
}

interface DocumentInfo {
  licenseNumber: string
  licenseExpiry: string
  licenseFront: string | null
  licenseBack: string | null
  orCr: string | null
  nbiClearance: string | null
}

const VEHICLE_TYPES: { type: VehicleType; label: string; description: string }[] = [
  { type: 'motorcycle', label: 'Motorcycle', description: 'For quick rides and small deliveries' },
  { type: 'car', label: 'Sedan', description: 'Standard 4-seater vehicle' },
  { type: 'premium', label: 'Premium', description: 'Luxury or high-end vehicles' },
  { type: 'van', label: 'Van/SUV', description: 'For groups or large deliveries' },
]

export default function DriverRegistration() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { uploadImage, uploading } = useDocumentUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentStep, setCurrentStep] = useState<Step>('personal')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [currentUploadField, setCurrentUploadField] = useState<string | null>(null)

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    profileImage: null,
  })

  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    type: 'motorcycle',
    make: '',
    model: '',
    year: '',
    color: '',
    plateNumber: '',
  })

  const [documentInfo, setDocumentInfo] = useState<DocumentInfo>({
    licenseNumber: '',
    licenseExpiry: '',
    licenseFront: null,
    licenseBack: null,
    orCr: null,
    nbiClearance: null,
  })

  const steps: { key: Step; label: string; icon: typeof User }[] = [
    { key: 'personal', label: 'Personal', icon: User },
    { key: 'vehicle', label: 'Vehicle', icon: Car },
    { key: 'documents', label: 'Documents', icon: FileText },
    { key: 'review', label: 'Review', icon: Check },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep)

  const handleNext = () => {
    const stepKeys = steps.map((s) => s.key)
    const nextIndex = currentStepIndex + 1
    if (nextIndex < stepKeys.length) {
      setCurrentStep(stepKeys[nextIndex])
    }
  }

  const handleBack = () => {
    const stepKeys = steps.map((s) => s.key)
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(stepKeys[prevIndex])
    }
  }

  const handleImageUpload = (
    field: 'profileImage' | 'licenseFront' | 'licenseBack' | 'orCr' | 'nbiClearance'
  ) => {
    setCurrentUploadField(field)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUploadField) return

    try {
      const url = await uploadImage(file)
      if (currentUploadField === 'profileImage') {
        setPersonalInfo((prev) => ({ ...prev, profileImage: url }))
      } else {
        setDocumentInfo((prev) => ({ ...prev, [currentUploadField]: url }))
      }
    } catch (error) {
      console.error('Upload failed:', error)
    }

    // Reset
    e.target.value = ''
    setCurrentUploadField(null)
  }

  const handleSubmit = async () => {
    if (!user?.uid) {
      setSubmitError('Please log in to submit your application')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Save driver application to Firestore
      // Build driverData without undefined values (Firestore rejects undefined)
      const driverData: Record<string, unknown> = {
        // Personal info
        displayName: `${personalInfo.firstName} ${personalInfo.lastName}`,
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        phone: personalInfo.phone,
        email: personalInfo.email || user.email || '',

        // Role
        role: 'driver',

        // Driver-specific info
        driverInfo: {
          vehicleType: vehicleInfo.type,
          vehicleMake: vehicleInfo.make,
          vehicleModel: vehicleInfo.model,
          vehicleYear: vehicleInfo.year,
          vehicleColor: vehicleInfo.color,
          vehiclePlate: vehicleInfo.plateNumber,

          licenseNumber: documentInfo.licenseNumber,
          licenseExpiry: documentInfo.licenseExpiry,

          // Only include documents that have values
          documents: Object.fromEntries(
            Object.entries({
              licenseFront: documentInfo.licenseFront,
              licenseBack: documentInfo.licenseBack,
              orCr: documentInfo.orCr,
              nbiClearance: documentInfo.nbiClearance,
            }).filter(([, value]) => value !== null && value !== undefined)
          ),

          // Application status
          applicationStatus: 'pending',
          isApproved: false,
          isSuspended: false,
          submittedAt: Timestamp.now(),

          // Stats (initial)
          rating: 0,
          totalRides: 0,
          totalEarnings: 0,
          completionRate: 0,
          acceptanceRate: 0,
          status: 'offline',
        },

        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      // Only add photoURL if it exists (Firestore rejects undefined/null)
      if (personalInfo.profileImage) {
        driverData.photoURL = personalInfo.profileImage
      }

      // Save to users collection
      await setDoc(doc(db, 'users', user.uid), driverData, { merge: true })

      setSubmitSuccess(true)
    } catch (error) {
      console.error('Error submitting application:', error)
      setSubmitError('Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isPersonalValid = personalInfo.firstName && personalInfo.lastName && personalInfo.phone
  const isVehicleValid = vehicleInfo.make && vehicleInfo.model && vehicleInfo.plateNumber
  const isDocumentsValid = documentInfo.licenseNumber && documentInfo.licenseExpiry

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="text-center max-w-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for applying to become a GOGO driver. We'll review your application and get back to you within 2-3 business days.
          </p>
          <Button fullWidth onClick={() => navigate('/')}>
            Return Home
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Hidden file input for uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className="bg-primary-600 text-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-2 hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Become a Driver</h1>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b px-4 py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = step.key === currentStep
            const isCompleted = index < currentStepIndex

            return (
              <div key={step.key} className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span
                  className={`text-xs ${
                    isActive ? 'text-primary-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="p-4">
        {/* Personal Info Step */}
        {currentStep === 'personal' && (
          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>

              {/* Profile Photo */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => handleImageUpload('profileImage')}
                  className="relative"
                >
                  <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                    {personalInfo.profileImage ? (
                      <img
                        src={personalInfo.profileImage}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Camera className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <Upload className="h-4 w-4 text-white" />
                  </div>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First Name"
                    value={personalInfo.firstName}
                    onChange={(e) =>
                      setPersonalInfo((prev) => ({ ...prev, firstName: e.target.value }))
                    }
                    placeholder="Juan"
                    required
                  />
                  <Input
                    label="Last Name"
                    value={personalInfo.lastName}
                    onChange={(e) =>
                      setPersonalInfo((prev) => ({ ...prev, lastName: e.target.value }))
                    }
                    placeholder="Dela Cruz"
                    required
                  />
                </div>
                <Input
                  label="Phone Number"
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) =>
                    setPersonalInfo((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+63 912 345 6789"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) =>
                    setPersonalInfo((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="juan@email.com"
                />
              </div>
            </Card>

            <Button
              fullWidth
              onClick={handleNext}
              disabled={!isPersonalValid}
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Vehicle Info Step */}
        {currentStep === 'vehicle' && (
          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Vehicle Type</h3>
              <div className="grid grid-cols-2 gap-3">
                {VEHICLE_TYPES.map((vt) => (
                  <button
                    key={vt.type}
                    onClick={() => setVehicleInfo((prev) => ({ ...prev, type: vt.type }))}
                    className={`p-3 rounded-xl border-2 text-left transition ${
                      vehicleInfo.type === vt.type
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{vt.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{vt.description}</p>
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Vehicle Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Make/Brand"
                    value={vehicleInfo.make}
                    onChange={(e) =>
                      setVehicleInfo((prev) => ({ ...prev, make: e.target.value }))
                    }
                    placeholder="Honda"
                    required
                  />
                  <Input
                    label="Model"
                    value={vehicleInfo.model}
                    onChange={(e) =>
                      setVehicleInfo((prev) => ({ ...prev, model: e.target.value }))
                    }
                    placeholder="Click 125i"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Year"
                    type="number"
                    value={vehicleInfo.year}
                    onChange={(e) =>
                      setVehicleInfo((prev) => ({ ...prev, year: e.target.value }))
                    }
                    placeholder="2022"
                  />
                  <Input
                    label="Color"
                    value={vehicleInfo.color}
                    onChange={(e) =>
                      setVehicleInfo((prev) => ({ ...prev, color: e.target.value }))
                    }
                    placeholder="Black"
                  />
                </div>
                <Input
                  label="Plate Number"
                  value={vehicleInfo.plateNumber}
                  onChange={(e) =>
                    setVehicleInfo((prev) => ({ ...prev, plateNumber: e.target.value.toUpperCase() }))
                  }
                  placeholder="ABC 1234"
                  required
                />
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isVehicleValid}
                className="flex-1"
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Documents Step */}
        {currentStep === 'documents' && (
          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Driver's License</h3>
              <div className="space-y-4">
                <Input
                  label="License Number"
                  value={documentInfo.licenseNumber}
                  onChange={(e) =>
                    setDocumentInfo((prev) => ({ ...prev, licenseNumber: e.target.value }))
                  }
                  placeholder="N01-23-456789"
                  required
                />
                <Input
                  label="Expiry Date"
                  type="date"
                  value={documentInfo.licenseExpiry}
                  onChange={(e) =>
                    setDocumentInfo((prev) => ({ ...prev, licenseExpiry: e.target.value }))
                  }
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleImageUpload('licenseFront')}
                    className="aspect-video rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-primary-500 hover:bg-primary-50 transition"
                  >
                    {documentInfo.licenseFront ? (
                      <Check className="h-6 w-6 text-green-600" />
                    ) : (
                      <Upload className="h-6 w-6 text-gray-400" />
                    )}
                    <span className="text-xs text-gray-500">Front Side</span>
                  </button>
                  <button
                    onClick={() => handleImageUpload('licenseBack')}
                    className="aspect-video rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-primary-500 hover:bg-primary-50 transition"
                  >
                    {documentInfo.licenseBack ? (
                      <Check className="h-6 w-6 text-green-600" />
                    ) : (
                      <Upload className="h-6 w-6 text-gray-400" />
                    )}
                    <span className="text-xs text-gray-500">Back Side</span>
                  </button>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Additional Documents</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleImageUpload('orCr')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition ${
                    documentInfo.orCr
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-primary-500'
                  }`}
                >
                  {documentInfo.orCr ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <Upload className="h-5 w-5 text-gray-400" />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-gray-900">OR/CR</p>
                    <p className="text-xs text-gray-500">Official Receipt & Certificate of Registration</p>
                  </div>
                </button>
                <button
                  onClick={() => handleImageUpload('nbiClearance')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition ${
                    documentInfo.nbiClearance
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-primary-500'
                  }`}
                >
                  {documentInfo.nbiClearance ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <Upload className="h-5 w-5 text-gray-400" />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-gray-900">NBI Clearance</p>
                    <p className="text-xs text-gray-500">National Bureau of Investigation clearance</p>
                  </div>
                </button>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isDocumentsValid}
                className="flex-1"
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Review Step */}
        {currentStep === 'review' && (
          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Review Your Application</h3>

              <div className="space-y-4">
                {/* Personal */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Personal Info</span>
                  </div>
                  <p className="text-gray-900">{personalInfo.firstName} {personalInfo.lastName}</p>
                  <p className="text-sm text-gray-600">{personalInfo.phone}</p>
                  {personalInfo.email && (
                    <p className="text-sm text-gray-600">{personalInfo.email}</p>
                  )}
                </div>

                {/* Vehicle */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Vehicle</span>
                  </div>
                  <p className="text-gray-900 capitalize">{vehicleInfo.type}</p>
                  <p className="text-sm text-gray-600">
                    {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model} - {vehicleInfo.color}
                  </p>
                  <p className="text-sm text-gray-600">Plate: {vehicleInfo.plateNumber}</p>
                </div>

                {/* Documents */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Documents</span>
                  </div>
                  <p className="text-gray-900">License: {documentInfo.licenseNumber}</p>
                  <p className="text-sm text-gray-600">Expires: {documentInfo.licenseExpiry}</p>
                  <div className="flex gap-2 mt-2">
                    {documentInfo.licenseFront && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">License ✓</span>
                    )}
                    {documentInfo.orCr && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">OR/CR ✓</span>
                    )}
                    {documentInfo.nbiClearance && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">NBI ✓</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="!bg-yellow-50 border border-yellow-200">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Before you submit</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    By submitting this application, you agree to our Terms of Service and Driver Partner Agreement. Your documents will be verified within 2-3 business days.
                  </p>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? <Spinner size="sm" /> : 'Submit Application'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
