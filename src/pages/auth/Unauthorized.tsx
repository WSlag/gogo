import { useNavigate } from 'react-router-dom'
import { ShieldX, Home, ArrowLeft } from 'lucide-react'
import { Button, Card } from '@/components/ui'

export default function Unauthorized() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card padding="lg" className="text-center max-w-md w-full">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mx-auto mb-4">
          <ShieldX className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. If you believe this is an error, please contact support.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            fullWidth
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="h-5 w-5" />}
          >
            Go Back
          </Button>
          <Button
            fullWidth
            onClick={() => navigate('/')}
            leftIcon={<Home className="h-5 w-5" />}
          >
            Home
          </Button>
        </div>
      </Card>
    </div>
  )
}
