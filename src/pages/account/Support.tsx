import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ShoppingBag,
  Car,
  CreditCard,
  User,
} from 'lucide-react'
import { Button, Card } from '@/components/ui'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

const FAQS: FAQ[] = [
  // Orders
  {
    id: '1',
    category: 'Orders',
    question: 'How do I track my order?',
    answer: 'You can track your order by going to the Orders tab and selecting your active order. You\'ll see real-time updates on your order status and driver location.',
  },
  {
    id: '2',
    category: 'Orders',
    question: 'How do I cancel an order?',
    answer: 'You can cancel your order within 5 minutes of placing it by going to the Orders tab, selecting your order, and tapping "Cancel Order". Cancellation fees may apply after the order is confirmed.',
  },
  {
    id: '3',
    category: 'Orders',
    question: 'What if my order is wrong or missing items?',
    answer: 'Please contact our support team immediately through the app. Go to the order details and tap "Report Issue". We\'ll help resolve the problem and may offer a refund or redelivery.',
  },
  // Rides
  {
    id: '4',
    category: 'Rides',
    question: 'How do I book a ride?',
    answer: 'Tap on "Rides" from the home screen, enter your pickup and drop-off locations, select a vehicle type, and confirm your booking. A driver will be assigned to you shortly.',
  },
  {
    id: '5',
    category: 'Rides',
    question: 'How is the fare calculated?',
    answer: 'Fares are calculated based on base fare + distance + time. The exact fare is shown before you confirm the booking. Surge pricing may apply during peak hours.',
  },
  // Payments
  {
    id: '6',
    category: 'Payments',
    question: 'What payment methods are accepted?',
    answer: 'We accept Cash on Delivery, GCash, Maya, and GOGO Express Wallet. You can also link your credit or debit card for wallet top-ups.',
  },
  {
    id: '7',
    category: 'Payments',
    question: 'How do I top up my GOGO Express Wallet?',
    answer: 'Go to the Wallet tab, tap "Top Up", select an amount, choose your payment method (GCash, Maya, or Card), and complete the payment.',
  },
  // Account
  {
    id: '8',
    category: 'Account',
    question: 'How do I change my phone number?',
    answer: 'For security reasons, please contact our support team to change your registered phone number. We\'ll verify your identity before making the change.',
  },
  {
    id: '9',
    category: 'Account',
    question: 'How do I delete my account?',
    answer: 'You can request account deletion by contacting our support team. Please note that this action is irreversible and all your data will be permanently deleted.',
  },
]

const CATEGORIES = [
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'rides', label: 'Rides', icon: Car },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'account', label: 'Account', icon: User },
]

export default function Support() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesSearch = !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory ||
      faq.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 lg:top-16 bg-white shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Help Center</h1>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-gray-100 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick Contact */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Contact Us</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/account/support')}
              className="flex flex-col items-center gap-2 rounded-lg bg-primary-50 p-4 hover:bg-primary-100 transition"
            >
              <MessageCircle className="h-6 w-6 text-primary-600" />
              <span className="text-xs font-medium text-primary-600">Live Chat</span>
            </button>
            <a
              href="tel:+639171234567"
              className="flex flex-col items-center gap-2 rounded-lg bg-green-50 p-4 hover:bg-green-100 transition"
            >
              <Phone className="h-6 w-6 text-green-600" />
              <span className="text-xs font-medium text-green-600">Call Us</span>
            </a>
            <a
              href="mailto:support@gogo.ph"
              className="flex flex-col items-center gap-2 rounded-lg bg-blue-50 p-4 hover:bg-blue-100 transition"
            >
              <Mail className="h-6 w-6 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">Email</span>
            </a>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Available 24/7 for urgent issues
          </p>
        </Card>

        {/* Categories */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Browse by Topic</h3>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
                className={`flex items-center gap-2 rounded-lg p-3 transition ${
                  selectedCategory === category.id
                    ? 'bg-primary-50 ring-2 ring-primary-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <category.icon className={`h-5 w-5 ${
                  selectedCategory === category.id
                    ? 'text-primary-600'
                    : 'text-gray-500'
                }`} />
                <span className={`text-sm font-medium ${
                  selectedCategory === category.id
                    ? 'text-primary-600'
                    : 'text-gray-600'
                }`}>
                  {category.label}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* FAQs */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">
            Frequently Asked Questions
            {selectedCategory && (
              <span className="text-primary-600 ml-1 capitalize">
                - {selectedCategory}
              </span>
            )}
          </h3>
          <div className="divide-y">
            {filteredFaqs.length === 0 ? (
              <div className="py-8 text-center">
                <HelpCircle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No results found</p>
                <p className="text-sm text-gray-400">Try a different search term</p>
              </div>
            ) : (
              filteredFaqs.map((faq) => (
                <div key={faq.id} className="py-3">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="flex w-full items-start justify-between text-left"
                  >
                    <span className="font-medium text-gray-900 pr-4">
                      {faq.question}
                    </span>
                    {expandedFaq === faq.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === faq.id && (
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Still Need Help */}
        <Card className="text-center">
          <HelpCircle className="h-10 w-10 text-primary-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900">Still need help?</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Our support team is here to assist you
          </p>
          <Button fullWidth onClick={() => window.open('mailto:support@gogo.ph', '_blank')}>
            <MessageCircle className="h-5 w-5 mr-2" />
            Start a Conversation
          </Button>
        </Card>
      </div>
    </div>
  )
}
