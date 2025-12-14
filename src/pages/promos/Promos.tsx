import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Gift,
  Tag,
  Clock,
  Copy,
  CheckCircle,
  Ticket,
  Percent,
  Car,
  ShoppingBag,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { Card, Badge, Button, Modal, Input } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/services/firebase/config'

interface Promo {
  id: string
  code: string
  title: string
  description: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderValue?: number
  maxDiscount?: number
  validFrom: Date
  validUntil: Date
  applicableTo: 'ride' | 'food' | 'grocery' | 'all'
  usageLimit?: number
  usedCount: number
  isActive: boolean
  terms: string[]
}

interface UserPromo {
  id: string
  promoId: string
  code: string
  usedAt?: Date
  isUsed: boolean
}

export default function Promos() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [promos, setPromos] = useState<Promo[]>([])
  const [userPromos, setUserPromos] = useState<UserPromo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRedeemModal, setShowRedeemModal] = useState(false)
  const [redeemCode, setRedeemCode] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [redeemError, setRedeemError] = useState('')
  const [redeeming, setRedeeming] = useState(false)

  useEffect(() => {
    fetchPromos()
  }, [])

  const fetchPromos = async () => {
    setLoading(true)
    try {
      // Fetch active promos
      const promosQuery = query(
        collection(db, 'promos'),
        where('isActive', '==', true),
        where('validUntil', '>=', Timestamp.now())
      )
      const promosSnapshot = await getDocs(promosQuery)
      const promosData: Promo[] = promosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        validFrom: doc.data().validFrom?.toDate() || new Date(),
        validUntil: doc.data().validUntil?.toDate() || new Date(),
      })) as Promo[]
      setPromos(promosData.length > 0 ? promosData : MOCK_PROMOS)
    } catch (error) {
      console.error('Error fetching promos:', error)
      setPromos(MOCK_PROMOS)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleRedeemCode = async () => {
    if (!redeemCode.trim()) {
      setRedeemError('Please enter a promo code')
      return
    }

    setRedeeming(true)
    setRedeemError('')

    try {
      // Check if code exists and is valid
      const code = redeemCode.toUpperCase().trim()
      const promo = promos.find((p) => p.code === code)

      if (!promo) {
        setRedeemError('Invalid promo code')
        setRedeeming(false)
        return
      }

      if (new Date() > promo.validUntil) {
        setRedeemError('This promo code has expired')
        setRedeeming(false)
        return
      }

      // Add to user's promos
      if (user?.uid) {
        await addDoc(collection(db, 'users', user.uid, 'promos'), {
          promoId: promo.id,
          code: promo.code,
          addedAt: Timestamp.now(),
          isUsed: false,
        })
      }

      setShowRedeemModal(false)
      setRedeemCode('')
      // Show success
      setSelectedPromo(promo)
      setShowDetailModal(true)
    } catch (error) {
      console.error('Error redeeming code:', error)
      setRedeemError('Failed to redeem code. Please try again.')
    } finally {
      setRedeeming(false)
    }
  }

  const getApplicableIcon = (type: Promo['applicableTo']) => {
    switch (type) {
      case 'ride':
        return <Car className="h-4 w-4" />
      case 'food':
        return <ShoppingBag className="h-4 w-4" />
      case 'grocery':
        return <ShoppingBag className="h-4 w-4" />
      default:
        return <Sparkles className="h-4 w-4" />
    }
  }

  const getApplicableLabel = (type: Promo['applicableTo']) => {
    switch (type) {
      case 'ride':
        return 'Rides'
      case 'food':
        return 'Food'
      case 'grocery':
        return 'Grocery'
      default:
        return 'All Services'
    }
  }

  const getDaysRemaining = (date: Date) => {
    const diff = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (diff <= 0) return 'Expired'
    if (diff === 1) return '1 day left'
    if (diff <= 7) return `${diff} days left`
    return `Until ${date.toLocaleDateString()}`
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold">Promos & Vouchers</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Ticket className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Available Vouchers</p>
                <p className="text-2xl font-bold">{promos.length}</p>
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowRedeemModal(true)}
            className="!bg-white !text-purple-600"
          >
            <Tag className="h-4 w-4 mr-2" />
            Redeem
          </Button>
        </div>
      </div>

      {/* Promo List */}
      <div className="px-4 py-4 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading promos...</div>
        ) : promos.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No promos available</p>
            <p className="text-sm text-gray-500">Check back later for new offers!</p>
          </div>
        ) : (
          promos.map((promo) => (
            <Card
              key={promo.id}
              className="!p-0 overflow-hidden cursor-pointer hover:shadow-md transition"
              onClick={() => {
                setSelectedPromo(promo)
                setShowDetailModal(true)
              }}
            >
              <div className="flex">
                {/* Left side - discount */}
                <div className={`w-24 flex flex-col items-center justify-center p-4 ${
                  promo.applicableTo === 'ride' ? 'bg-blue-500' :
                  promo.applicableTo === 'food' ? 'bg-orange-500' :
                  promo.applicableTo === 'grocery' ? 'bg-green-500' : 'bg-purple-500'
                } text-white`}>
                  {promo.discountType === 'percentage' ? (
                    <>
                      <span className="text-3xl font-bold">{promo.discountValue}</span>
                      <span className="text-lg font-semibold">%</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">₱</span>
                      <span className="text-3xl font-bold">{promo.discountValue}</span>
                    </>
                  )}
                  <span className="text-xs opacity-90 mt-1">OFF</span>
                </div>

                {/* Right side - details */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{promo.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{promo.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                      promo.applicableTo === 'ride' ? 'bg-blue-100 text-blue-700' :
                      promo.applicableTo === 'food' ? 'bg-orange-100 text-orange-700' :
                      promo.applicableTo === 'grocery' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {getApplicableIcon(promo.applicableTo)}
                      <span>{getApplicableLabel(promo.applicableTo)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{getDaysRemaining(promo.validUntil)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed">
                    <code className="text-sm font-mono font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                      {promo.code}
                    </code>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopyCode(promo.code)
                      }}
                      className="flex items-center gap-1 text-sm text-primary-600 font-medium"
                    >
                      {copiedCode === promo.code ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Referral Banner */}
      <div className="px-4 mt-4">
        <Card
          className="!p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white !border-0 cursor-pointer"
          onClick={() => navigate('/referral')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Gift className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Refer & Earn</h3>
              <p className="text-sm opacity-90">Invite friends and get ₱50 for each referral!</p>
            </div>
            <ChevronRight className="h-6 w-6 opacity-75" />
          </div>
        </Card>
      </div>

      {/* Promo Detail Modal */}
      {selectedPromo && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Promo Details"
        >
          <div className="space-y-4">
            <div className={`text-center p-6 rounded-xl ${
              selectedPromo.applicableTo === 'ride' ? 'bg-blue-500' :
              selectedPromo.applicableTo === 'food' ? 'bg-orange-500' :
              selectedPromo.applicableTo === 'grocery' ? 'bg-green-500' : 'bg-purple-500'
            } text-white`}>
              {selectedPromo.discountType === 'percentage' ? (
                <p className="text-5xl font-bold">{selectedPromo.discountValue}%</p>
              ) : (
                <p className="text-5xl font-bold">₱{selectedPromo.discountValue}</p>
              )}
              <p className="text-lg mt-1">OFF</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900">{selectedPromo.title}</h3>
              <p className="text-gray-600 mt-2">{selectedPromo.description}</p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <code className="text-lg font-mono font-bold bg-gray-100 px-4 py-2 rounded-lg">
                {selectedPromo.code}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyCode(selectedPromo.code)}
              >
                {copiedCode === selectedPromo.code ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Valid until</span>
                <span className="font-medium">{selectedPromo.validUntil.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Applicable to</span>
                <span className="font-medium capitalize">{selectedPromo.applicableTo === 'all' ? 'All Services' : selectedPromo.applicableTo}</span>
              </div>
              {selectedPromo.minOrderValue && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Min. order</span>
                  <span className="font-medium">₱{selectedPromo.minOrderValue}</span>
                </div>
              )}
              {selectedPromo.maxDiscount && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Max. discount</span>
                  <span className="font-medium">₱{selectedPromo.maxDiscount}</span>
                </div>
              )}
            </div>

            {selectedPromo.terms.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Terms & Conditions</h4>
                <ul className="text-sm text-gray-500 space-y-1">
                  {selectedPromo.terms.map((term, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button fullWidth onClick={() => setShowDetailModal(false)}>
              Got it!
            </Button>
          </div>
        </Modal>
      )}

      {/* Redeem Code Modal */}
      <Modal
        isOpen={showRedeemModal}
        onClose={() => {
          setShowRedeemModal(false)
          setRedeemCode('')
          setRedeemError('')
        }}
        title="Redeem Promo Code"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Enter your promo code to redeem</p>
          <Input
            placeholder="Enter code"
            value={redeemCode}
            onChange={(e) => {
              setRedeemCode(e.target.value.toUpperCase())
              setRedeemError('')
            }}
            className="text-center font-mono text-lg uppercase"
          />
          {redeemError && (
            <p className="text-sm text-red-500 text-center">{redeemError}</p>
          )}
          <Button
            fullWidth
            onClick={handleRedeemCode}
            isLoading={redeeming}
          >
            Redeem Code
          </Button>
        </div>
      </Modal>
    </div>
  )
}

// Mock data
const MOCK_PROMOS: Promo[] = [
  {
    id: '1',
    code: 'GOGO50',
    title: '50% Off Your Ride',
    description: 'Get 50% off your next ride booking. Maximum discount of ₱100.',
    discountType: 'percentage',
    discountValue: 50,
    minOrderValue: 100,
    maxDiscount: 100,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    applicableTo: 'ride',
    usedCount: 0,
    isActive: true,
    terms: [
      'Valid for one-time use only',
      'Cannot be combined with other promotions',
      'Applicable to all ride types',
    ],
  },
  {
    id: '2',
    code: 'FOODIE100',
    title: '₱100 Off Food Orders',
    description: 'Enjoy ₱100 off your food delivery order. Min. order ₱300.',
    discountType: 'fixed',
    discountValue: 100,
    minOrderValue: 300,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    applicableTo: 'food',
    usedCount: 0,
    isActive: true,
    terms: [
      'Valid for food orders only',
      'Minimum order of ₱300 required',
      'One use per customer',
    ],
  },
  {
    id: '3',
    code: 'NEWUSER',
    title: 'Welcome Bonus',
    description: 'New users get ₱50 off their first order on any service!',
    discountType: 'fixed',
    discountValue: 50,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    applicableTo: 'all',
    usedCount: 0,
    isActive: true,
    terms: [
      'For new users only',
      'Valid on first order only',
      'Applicable to all services',
    ],
  },
  {
    id: '4',
    code: 'GROCERY20',
    title: '20% Off Groceries',
    description: 'Save 20% on your grocery shopping. Max discount ₱200.',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 500,
    maxDiscount: 200,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    applicableTo: 'grocery',
    usedCount: 0,
    isActive: true,
    terms: [
      'Valid for grocery orders only',
      'Minimum order of ₱500',
      'Maximum discount of ₱200',
    ],
  },
]
