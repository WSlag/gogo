import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { useWallet } from '@/hooks'

const PRESET_AMOUNTS = [100, 200, 500, 1000, 2000, 5000]

const PAYMENT_METHODS = [
  { id: 'gcash', name: 'GCash', icon: Smartphone, color: 'bg-blue-500' },
  { id: 'maya', name: 'Maya', icon: CreditCard, color: 'bg-green-500' },
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, color: 'bg-gray-700' },
]

export default function TopUp() {
  const navigate = useNavigate()
  const { balance, topUp, isLoading, error } = useWallet()

  const [amount, setAmount] = useState<number>(500)
  const [customAmount, setCustomAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('gcash')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleAmountSelect = (value: number) => {
    setAmount(value)
    setCustomAmount('')
  }

  const handleCustomAmount = (value: string) => {
    const numValue = parseInt(value.replace(/\D/g, ''), 10) || 0
    setCustomAmount(value)
    setAmount(numValue)
  }

  const handleTopUp = async () => {
    if (amount < 100) return

    const success = await topUp(amount, selectedMethod)
    if (success) {
      setIsSuccess(true)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-6">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Top Up Successful!</h1>
        <p className="mt-2 text-center text-gray-500">
          ₱{amount.toFixed(2)} has been added to your wallet
        </p>
        <p className="mt-4 text-sm text-gray-400">
          New balance: ₱{(balance + amount).toFixed(2)}
        </p>
        <div className="mt-8 space-y-3 w-full max-w-sm">
          <Button
            fullWidth
            size="lg"
            onClick={() => navigate('/wallet')}
          >
            Back to Wallet
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Top Up Wallet</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Current Balance */}
        <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white">
          <p className="text-sm opacity-80">Current Balance</p>
          <p className="text-3xl font-bold mt-1">₱{balance.toFixed(2)}</p>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Amount Selection */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Select Amount</h3>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_AMOUNTS.map((value) => (
              <button
                key={value}
                onClick={() => handleAmountSelect(value)}
                className={`rounded-lg py-3 text-center font-medium transition ${
                  amount === value && !customAmount
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ₱{value}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or enter custom amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                ₱
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={customAmount}
                onChange={(e) => handleCustomAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full rounded-lg border border-gray-200 py-3 pl-8 pr-4 text-right text-lg font-medium focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            {amount > 0 && amount < 100 && (
              <p className="mt-2 text-sm text-red-500">Minimum top up is ₱100</p>
            )}
          </div>
        </Card>

        {/* Payment Method */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`flex w-full items-center gap-3 rounded-lg p-3 transition ${
                  selectedMethod === method.id
                    ? 'bg-primary-50 ring-2 ring-primary-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${method.color}`}>
                  <method.icon className="h-5 w-5 text-white" />
                </div>
                <span className={`font-medium ${
                  selectedMethod === method.id ? 'text-primary-600' : 'text-gray-900'
                }`}>
                  {method.name}
                </span>
                {selectedMethod === method.id && (
                  <div className="ml-auto h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Summary */}
        <Card>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Top up amount</span>
              <span className="font-medium">₱{amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Processing fee</span>
              <span className="font-medium text-green-600">Free</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
              <span className="text-gray-900">Total</span>
              <span className="text-primary-600">₱{amount.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-safe">
        <Button
          size="lg"
          fullWidth
          onClick={handleTopUp}
          isLoading={isLoading}
          disabled={isLoading || amount < 100}
        >
          Top Up ₱{amount.toFixed(2)}
        </Button>
      </div>
    </div>
  )
}
