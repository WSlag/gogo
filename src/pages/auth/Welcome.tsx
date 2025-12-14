import { useNavigate } from 'react-router-dom'
import { ArrowRight, Car, UtensilsCrossed, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui'

export default function Welcome() {
  const navigate = useNavigate()

  const features = [
    { icon: Car, title: 'Book Rides', description: 'Fast and affordable transportation' },
    { icon: UtensilsCrossed, title: 'Order Food', description: 'From your favorite restaurants' },
    { icon: ShoppingBag, title: 'Shop Groceries', description: 'Delivered to your doorstep' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary-600 text-4xl font-bold text-white shadow-lg">
          G
        </div>

        <h1 className="text-3xl font-bold text-gray-900 text-center">Welcome to GOGO</h1>
        <p className="mt-3 text-gray-500 text-center max-w-xs">
          Your all-in-one app for rides, food delivery, and grocery shopping in the Philippines
        </p>

        {/* Features */}
        <div className="mt-10 w-full max-w-sm space-y-4">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                <feature.icon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 space-y-4">
        <Button
          size="lg"
          fullWidth
          onClick={() => navigate('/auth/login')}
          rightIcon={<ArrowRight className="h-5 w-5" />}
        >
          Get Started
        </Button>

        <p className="text-center text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-primary-600 font-medium">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-primary-600 font-medium">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
