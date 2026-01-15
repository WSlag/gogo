import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  ChevronRight,
  ChevronDown,
  MessageCircle,
  Phone,
  Mail,
  Car,
  UtensilsCrossed,
  ShoppingCart,
  Wallet,
  User,
  CreditCard,
  HelpCircle,
  ExternalLink,
} from 'lucide-react'
import { Card, Button } from '@/components/ui'

interface FAQItem {
  question: string
  answer: string
}

interface FAQCategory {
  id: string
  title: string
  icon: typeof Car
  faqs: FAQItem[]
}

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: 'rides',
    title: 'Rides & Transportation',
    icon: Car,
    faqs: [
      {
        question: 'How do I book a ride?',
        answer: 'Open the app, enter your pickup and drop-off locations, select your preferred vehicle type, and tap "Book Ride". You\'ll be matched with a nearby driver.',
      },
      {
        question: 'How is the fare calculated?',
        answer: 'Fares are calculated based on base fare + distance traveled + time. During peak hours, surge pricing may apply. You can see the estimated fare before booking.',
      },
      {
        question: 'Can I schedule a ride in advance?',
        answer: 'Yes! When booking, tap on "Schedule for Later" and select your preferred date and time. You can schedule rides up to 7 days in advance.',
      },
      {
        question: 'How do I cancel a ride?',
        answer: 'You can cancel a ride by tapping the "Cancel" button on the tracking screen. Note that cancellation fees may apply if cancelled after a driver has been assigned.',
      },
      {
        question: 'What if I left something in the vehicle?',
        answer: 'Go to your ride history, find the trip, and tap "Report Issue" > "Lost Item". We\'ll help you connect with the driver to retrieve your belongings.',
      },
    ],
  },
  {
    id: 'food',
    title: 'Food Delivery',
    icon: UtensilsCrossed,
    faqs: [
      {
        question: 'How long does food delivery take?',
        answer: 'Delivery times vary based on restaurant preparation time and distance. Estimated delivery time is shown before you place your order, typically 30-45 minutes.',
      },
      {
        question: 'Can I modify my order after placing it?',
        answer: 'Once an order is confirmed, modifications may not be possible. Contact our support immediately if you need to make changes.',
      },
      {
        question: 'What if my food arrives cold or damaged?',
        answer: 'Report the issue through your order details within 24 hours. Take photos of the items and we\'ll process a refund or replacement.',
      },
      {
        question: 'How do I track my food order?',
        answer: 'After placing an order, you can track it in real-time from the Orders tab. You\'ll see status updates from preparation to delivery.',
      },
    ],
  },
  {
    id: 'grocery',
    title: 'Grocery Shopping',
    icon: ShoppingCart,
    faqs: [
      {
        question: 'What stores are available?',
        answer: 'We partner with local supermarkets, convenience stores, and specialty shops in your area. Browse the Grocery section to see available stores.',
      },
      {
        question: 'What if an item is out of stock?',
        answer: 'You can set substitution preferences when ordering. Our shopper will contact you if a replacement is needed, or you can allow automatic substitutions.',
      },
      {
        question: 'Can I schedule grocery delivery?',
        answer: 'Yes! You can schedule grocery delivery for a specific date and time slot that works best for you.',
      },
    ],
  },
  {
    id: 'wallet',
    title: 'Wallet & Payments',
    icon: Wallet,
    faqs: [
      {
        question: 'How do I add money to my wallet?',
        answer: 'Go to Wallet > Top Up and choose your preferred payment method (GCash, Maya, or card). Enter the amount and follow the prompts to complete the transaction.',
      },
      {
        question: 'What payment methods are accepted?',
        answer: 'We accept GOGO Express Wallet, GCash, Maya, credit/debit cards, and cash on delivery (for applicable services).',
      },
      {
        question: 'How do I get a refund?',
        answer: 'Refunds are processed automatically for cancelled orders. For other issues, contact support and refunds will be credited to your original payment method within 5-7 business days.',
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Yes, we use industry-standard encryption and never store your full card details. All transactions are processed through secure payment gateways.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account & Profile',
    icon: User,
    faqs: [
      {
        question: 'How do I change my phone number?',
        answer: 'Go to Profile > Edit Profile. You\'ll need to verify your new number via OTP before the change takes effect.',
      },
      {
        question: 'How do I delete my account?',
        answer: 'Contact our support team to request account deletion. Note that this action is permanent and you\'ll lose all order history and wallet balance.',
      },
      {
        question: 'How do I update my saved addresses?',
        answer: 'Go to Profile > Saved Addresses. You can add, edit, or delete addresses from there.',
      },
    ],
  },
]

export default function HelpCenter() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string | null>('rides')
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  // Filter FAQs based on search
  const filteredCategories = searchQuery.length > 0
    ? FAQ_CATEGORIES.map(category => ({
        ...category,
        faqs: category.faqs.filter(
          faq =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(category => category.faqs.length > 0)
    : FAQ_CATEGORIES

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 lg:top-16 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Help Center</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Contact Support</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/support')}
              className="flex flex-col items-center gap-2 rounded-lg bg-primary-50 p-3 transition hover:bg-primary-100"
            >
              <MessageCircle className="h-6 w-6 text-primary-600" />
              <span className="text-xs font-medium text-primary-600">Live Chat</span>
            </button>
            <a
              href="tel:+639171234567"
              className="flex flex-col items-center gap-2 rounded-lg bg-green-50 p-3 transition hover:bg-green-100"
            >
              <Phone className="h-6 w-6 text-green-600" />
              <span className="text-xs font-medium text-green-600">Call Us</span>
            </a>
            <a
              href="mailto:support@gogo.ph"
              className="flex flex-col items-center gap-2 rounded-lg bg-blue-50 p-3 transition hover:bg-blue-100"
            >
              <Mail className="h-6 w-6 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">Email</span>
            </a>
          </div>
        </Card>

        {/* FAQs */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 px-1">
            Frequently Asked Questions
          </h3>

          {filteredCategories.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No results found for "{searchQuery}"</p>
                <p className="text-sm text-gray-400 mt-1">Try different keywords</p>
              </div>
            </Card>
          ) : (
            filteredCategories.map((category) => {
              const Icon = category.icon
              const isExpanded = expandedCategory === category.id || searchQuery.length > 0

              return (
                <Card key={category.id} className="overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                    className="flex w-full items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                        <Icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-900">{category.title}</span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* FAQs */}
                  {isExpanded && (
                    <div className="mt-4 space-y-2 border-t pt-4">
                      {category.faqs.map((faq, index) => {
                        const faqId = `${category.id}-${index}`
                        const isFaqExpanded = expandedFaq === faqId

                        return (
                          <div
                            key={faqId}
                            className="rounded-lg border border-gray-100 bg-gray-50"
                          >
                            <button
                              onClick={() => setExpandedFaq(isFaqExpanded ? null : faqId)}
                              className="flex w-full items-center justify-between p-3 text-left"
                            >
                              <span className="text-sm font-medium text-gray-900 pr-4">
                                {faq.question}
                              </span>
                              <ChevronDown
                                className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${
                                  isFaqExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                            {isFaqExpanded && (
                              <div className="border-t border-gray-100 px-3 py-3">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Card>
              )
            })
          )}
        </div>

        {/* Additional Resources */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">More Resources</h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/terms')}
              className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-gray-50"
            >
              <span className="text-sm text-gray-700">Terms of Service</span>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </button>
            <button
              onClick={() => navigate('/privacy')}
              className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-gray-50"
            >
              <span className="text-sm text-gray-700">Privacy Policy</span>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
