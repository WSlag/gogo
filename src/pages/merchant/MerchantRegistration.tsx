import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Check,
  User,
  Store,
  FileText,
  Camera,
  AlertCircle,
  MapPin,
} from 'lucide-react'
import { Button, Card, Input, Spinner } from '@/components/ui'
import type { MerchantType } from '@/types'

type Step = 'owner' | 'business' | 'documents' | 'review'

interface OwnerInfo {
  firstName: string
  lastName: string
  phone: string
  email: string
}

interface BusinessInfo {
  name: string
  type: MerchantType
  description: string
  address: string
  phone: string
  logo: string | null
}

interface DocumentInfo {
  businessPermit: string | null
  sanitaryPermit: string | null
  birRegistration: string | null
}

const BUSINESS_TYPES: { type: MerchantType; label: string; description: string }[] = [
  { type: 'restaurant', label: 'Restaurant', description: 'Food & beverages' },
  { type: 'grocery', label: 'Grocery Store', description: 'Groceries & essentials' },
  { type: 'convenience', label: 'Convenience Store', description: 'Quick items & snacks' },
  { type: 'pharmacy', label: 'Pharmacy', description: 'Medicine & health products' },
]

export default function MerchantRegistration() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<Step>('owner')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const [ownerInfo, setOwnerInfo] = useState<OwnerInfo>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  })

  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: '',
    type: 'restaurant',
    description: '',
    address: '',
    phone: '',
    logo: null,
  })

  const [documentInfo, setDocumentInfo] = useState<DocumentInfo>({
    businessPermit: null,
    sanitaryPermit: null,
    birRegistration: null,
  })

  const steps: { key: Step; label: string; icon: typeof User }[] = [
    { key: 'owner', label: 'Owner', icon: User },
    { key: 'business', label: 'Business', icon: Store },
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
    field: 'logo' | 'businessPermit' | 'sanitaryPermit' | 'birRegistration'
  ) => {
    const placeholder = 'https://via.placeholder.com/300x200?text=Uploaded'

    if (field === 'logo') {
      setBusinessInfo((prev) => ({ ...prev, logo: placeholder }))
    } else {
      setDocumentInfo((prev) => ({ ...prev, [field]: placeholder }))
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    setSubmitSuccess(true)
  }

  const isOwnerValid = ownerInfo.firstName && ownerInfo.lastName && ownerInfo.phone && ownerInfo.email
  const isBusinessValid = businessInfo.name && businessInfo.address && businessInfo.phone
  const isDocumentsValid = documentInfo.businessPermit

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="text-center max-w-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for applying to become a GOGO merchant partner. We'll review your application and get back to you within 3-5 business days.
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
      {/* Header */}
      <div className="bg-primary-600 text-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-2 hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Become a Partner</h1>
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
        {/* Owner Info Step */}
        {currentStep === 'owner' && (
          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Owner Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First Name"
                    value={ownerInfo.firstName}
                    onChange={(e) =>
                      setOwnerInfo((prev) => ({ ...prev, firstName: e.target.value }))
                    }
                    placeholder="Juan"
                    required
                  />
                  <Input
                    label="Last Name"
                    value={ownerInfo.lastName}
                    onChange={(e) =>
                      setOwnerInfo((prev) => ({ ...prev, lastName: e.target.value }))
                    }
                    placeholder="Dela Cruz"
                    required
                  />
                </div>
                <Input
                  label="Phone Number"
                  type="tel"
                  value={ownerInfo.phone}
                  onChange={(e) =>
                    setOwnerInfo((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+63 912 345 6789"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={ownerInfo.email}
                  onChange={(e) =>
                    setOwnerInfo((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="juan@email.com"
                  required
                />
              </div>
            </Card>

            <Button
              fullWidth
              onClick={handleNext}
              disabled={!isOwnerValid}
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Business Info Step */}
        {currentStep === 'business' && (
          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Business Type</h3>
              <div className="grid grid-cols-2 gap-3">
                {BUSINESS_TYPES.map((bt) => (
                  <button
                    key={bt.type}
                    onClick={() => setBusinessInfo((prev) => ({ ...prev, type: bt.type }))}
                    className={`p-3 rounded-xl border-2 text-left transition ${
                      businessInfo.type === bt.type
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{bt.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{bt.description}</p>
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Business Details</h3>

              {/* Logo Upload */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => handleImageUpload('logo')}
                  className="relative"
                >
                  <div className="h-24 w-24 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                    {businessInfo.logo ? (
                      <img
                        src={businessInfo.logo}
                        alt="Logo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Store className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <Camera className="h-4 w-4 text-white" />
                  </div>
                </button>
              </div>
              <p className="text-center text-xs text-gray-500 mb-4">Upload your business logo</p>

              <div className="space-y-4">
                <Input
                  label="Business Name"
                  value={businessInfo.name}
                  onChange={(e) =>
                    setBusinessInfo((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Your Business Name"
                  required
                />
                <Input
                  label="Description"
                  value={businessInfo.description}
                  onChange={(e) =>
                    setBusinessInfo((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Brief description of your business"
                />
                <div>
                  <Input
                    label="Business Address"
                    value={businessInfo.address}
                    onChange={(e) =>
                      setBusinessInfo((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="Complete address"
                    required
                  />
                  <button className="flex items-center gap-1 text-sm text-primary-600 mt-2">
                    <MapPin className="h-4 w-4" />
                    Set on map
                  </button>
                </div>
                <Input
                  label="Business Phone"
                  type="tel"
                  value={businessInfo.phone}
                  onChange={(e) =>
                    setBusinessInfo((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+63 912 345 6789"
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
                disabled={!isBusinessValid}
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
              <h3 className="font-semibold text-gray-900 mb-4">Required Documents</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleImageUpload('businessPermit')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition ${
                    documentInfo.businessPermit
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-primary-500'
                  }`}
                >
                  {documentInfo.businessPermit ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <Upload className="h-5 w-5 text-gray-400" />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Business Permit *</p>
                    <p className="text-xs text-gray-500">Mayor's permit or business registration</p>
                  </div>
                </button>

                <button
                  onClick={() => handleImageUpload('sanitaryPermit')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition ${
                    documentInfo.sanitaryPermit
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-primary-500'
                  }`}
                >
                  {documentInfo.sanitaryPermit ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <Upload className="h-5 w-5 text-gray-400" />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Sanitary Permit</p>
                    <p className="text-xs text-gray-500">Required for food businesses</p>
                  </div>
                </button>

                <button
                  onClick={() => handleImageUpload('birRegistration')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition ${
                    documentInfo.birRegistration
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-primary-500'
                  }`}
                >
                  {documentInfo.birRegistration ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <Upload className="h-5 w-5 text-gray-400" />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-gray-900">BIR Registration</p>
                    <p className="text-xs text-gray-500">Certificate of registration</p>
                  </div>
                </button>
              </div>
            </Card>

            <Card className="!bg-blue-50 border border-blue-200">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Document Requirements</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Please upload clear images of your documents. All documents must be valid and not expired. Business permit is required, others are optional but recommended.
                  </p>
                </div>
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
                {/* Owner */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Owner Info</span>
                  </div>
                  <p className="text-gray-900">{ownerInfo.firstName} {ownerInfo.lastName}</p>
                  <p className="text-sm text-gray-600">{ownerInfo.phone}</p>
                  <p className="text-sm text-gray-600">{ownerInfo.email}</p>
                </div>

                {/* Business */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Store className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Business Info</span>
                  </div>
                  <p className="text-gray-900">{businessInfo.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{businessInfo.type}</p>
                  <p className="text-sm text-gray-600">{businessInfo.address}</p>
                  <p className="text-sm text-gray-600">{businessInfo.phone}</p>
                </div>

                {/* Documents */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Documents</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {documentInfo.businessPermit && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Business Permit
                      </span>
                    )}
                    {documentInfo.sanitaryPermit && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Sanitary Permit
                      </span>
                    )}
                    {documentInfo.birRegistration && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        BIR Registration
                      </span>
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
                    By submitting this application, you agree to our Terms of Service and Merchant Partner Agreement. Your application will be reviewed within 3-5 business days.
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
