import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Gift,
  Copy,
  CheckCircle,
  Share2,
  Users,
  Ticket,
  ChevronRight,
  MessageCircle,
  Facebook,
  Twitter,
} from 'lucide-react'
import { PesoSign } from '@/components/icons'
import { Card, Badge, Button, Modal } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

interface ReferralStats {
  totalReferrals: number
  pendingReferrals: number
  completedReferrals: number
  totalEarnings: number
  referralCode: string
}

interface ReferralHistory {
  id: string
  name: string
  date: Date
  status: 'pending' | 'completed' | 'expired'
  reward: number
}

export default function Referral() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [history, setHistory] = useState<ReferralHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    setLoading(true)
    try {
      // In real app, fetch from Firestore
      setStats(MOCK_STATS)
      setHistory(MOCK_HISTORY)
    } catch (error) {
      console.error('Error fetching referral data:', error)
      setStats(MOCK_STATS)
      setHistory(MOCK_HISTORY)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = () => {
    if (!stats) return
    navigator.clipboard.writeText(stats.referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (platform: string) => {
    if (!stats) return
    const shareText = `Join GOGO Express and get ₱50 off your first ride! Use my referral code: ${stats.referralCode}\n\nDownload now: https://gogo.app`

    switch (platform) {
      case 'sms':
        window.open(`sms:?body=${encodeURIComponent(shareText)}`)
        break
      case 'messenger':
        window.open(`fb-messenger://share/?link=${encodeURIComponent('https://gogo.app')}&app_id=123`)
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`)
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`)
        break
      default:
        if (navigator.share) {
          navigator.share({
            title: 'Join GOGO Express',
            text: shareText,
            url: 'https://gogo.app',
          })
        }
    }
    setShowShareModal(false)
  }

  const getStatusBadge = (status: ReferralHistory['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="min-h-screen bg-gray-100 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold">Refer & Earn</h1>
        </div>

        {/* Hero Section */}
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Invite Friends, Earn Rewards</h2>
          <p className="text-white/90">
            Share your code and both you and your friend get ₱50!
          </p>
        </div>
      </div>

      {/* Referral Code Card */}
      <div className="px-4 -mt-6">
        <Card className="!p-6">
          <p className="text-center text-gray-500 mb-2">Your Referral Code</p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <code className="text-3xl font-mono font-bold tracking-wider text-gray-900">
              {stats.referralCode}
            </code>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={handleCopyCode}
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>
            <Button
              fullWidth
              onClick={() => setShowShareModal(true)}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </Card>
      </div>

      {/* Stats */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="!p-4 text-center">
            <Users className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
            <p className="text-xs text-gray-500">Total Referrals</p>
          </Card>
          <Card className="!p-4 text-center">
            <PesoSign className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">₱{stats.totalEarnings}</p>
            <p className="text-xs text-gray-500">Total Earnings</p>
          </Card>
        </div>
      </div>

      {/* How It Works */}
      <div className="px-4 mt-4">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">How It Works</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <span className="font-bold text-green-600">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Share your code</p>
                <p className="text-sm text-gray-500">Send your referral code to friends</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <span className="font-bold text-green-600">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Friend signs up</p>
                <p className="text-sm text-gray-500">They register using your code</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <span className="font-bold text-green-600">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Both earn rewards</p>
                <p className="text-sm text-gray-500">You both get ₱50 after their first ride!</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Referral History */}
      <div className="px-4 mt-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Referral History</h3>
            <Badge variant="secondary">{stats.totalReferrals} total</Badge>
          </div>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No referrals yet</p>
              <p className="text-sm text-gray-400">Share your code to start earning!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.date.toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(item.status)}
                    {item.status === 'completed' && (
                      <p className="text-sm font-medium text-green-600 mt-1">+₱{item.reward}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Terms */}
      <div className="px-4 mt-4">
        <Card className="!p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-2">Terms & Conditions</h4>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Reward is credited after referee completes their first ride</li>
            <li>• Referral code expires 30 days after sharing</li>
            <li>• Maximum of 50 referrals per month</li>
            <li>• GOGO Express reserves the right to modify or cancel this program</li>
          </ul>
        </Card>
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Your Code"
      >
        <div className="space-y-4">
          <p className="text-center text-gray-600">
            Share your referral code with friends
          </p>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <code className="text-2xl font-mono font-bold text-gray-900">
              {stats.referralCode}
            </code>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleShare('sms')}
              className="flex items-center justify-center gap-2 p-4 bg-gray-100 rounded-xl hover:bg-gray-200"
            >
              <MessageCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">SMS</span>
            </button>
            <button
              onClick={() => handleShare('messenger')}
              className="flex items-center justify-center gap-2 p-4 bg-gray-100 rounded-xl hover:bg-gray-200"
            >
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Messenger</span>
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="flex items-center justify-center gap-2 p-4 bg-gray-100 rounded-xl hover:bg-gray-200"
            >
              <Facebook className="h-5 w-5 text-blue-700" />
              <span className="font-medium">Facebook</span>
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center justify-center gap-2 p-4 bg-gray-100 rounded-xl hover:bg-gray-200"
            >
              <Twitter className="h-5 w-5 text-sky-500" />
              <span className="font-medium">Twitter</span>
            </button>
          </div>

          <Button
            variant="outline"
            fullWidth
            onClick={() => handleShare('native')}
          >
            <Share2 className="h-4 w-4 mr-2" />
            More Options
          </Button>
        </div>
      </Modal>
    </div>
  )
}

// Mock data
const MOCK_STATS: ReferralStats = {
  totalReferrals: 12,
  pendingReferrals: 3,
  completedReferrals: 9,
  totalEarnings: 450,
  referralCode: 'GOGO' + Math.random().toString(36).substring(2, 6).toUpperCase(),
}

const MOCK_HISTORY: ReferralHistory[] = [
  { id: '1', name: 'Maria S.', date: new Date(Date.now() - 86400000), status: 'completed', reward: 50 },
  { id: '2', name: 'Juan D.', date: new Date(Date.now() - 172800000), status: 'pending', reward: 50 },
  { id: '3', name: 'Pedro R.', date: new Date(Date.now() - 259200000), status: 'completed', reward: 50 },
  { id: '4', name: 'Ana G.', date: new Date(Date.now() - 345600000), status: 'completed', reward: 50 },
  { id: '5', name: 'Carlos T.', date: new Date(Date.now() - 604800000), status: 'expired', reward: 0 },
]
