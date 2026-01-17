import { useNavigate } from 'react-router-dom'
import { Car, Store, Sparkles } from 'lucide-react'
import { Modal, ModalFooter, Button } from '@/components/ui'

interface OnboardingDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function OnboardingDialog({ isOpen, onClose }: OnboardingDialogProps) {
  const navigate = useNavigate()

  const handleGoToAccount = () => {
    onClose()
    navigate('/account')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Welcome to GOGO Express!"
      size="sm"
      closeOnOverlayClick={false}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Sparkles className="h-5 w-5 text-primary-500" />
          <p className="text-sm">Thanks for joining! Here's how you can get started:</p>
        </div>

        {/* Driver Card */}
        <div className="rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 p-4 border border-primary-200">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 shrink-0">
              <Car className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Want to earn as a Driver?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Register as a Driver in the Account page and start earning today!
              </p>
            </div>
          </div>
        </div>

        {/* Merchant Card */}
        <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 p-4 border border-orange-200">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 shrink-0">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Have a business?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Register as a Merchant in the Account page to sell your products!
              </p>
            </div>
          </div>
        </div>
      </div>

      <ModalFooter className="mt-4">
        <Button variant="outline" onClick={onClose}>
          Got it
        </Button>
        <Button onClick={handleGoToAccount}>
          Go to Account
        </Button>
      </ModalFooter>
    </Modal>
  )
}
