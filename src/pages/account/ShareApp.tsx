import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Copy,
  Check,
  Share2,
  MessageCircle,
  Mail,
  Facebook,
  Twitter,
  Link2,
} from 'lucide-react'
import { Card, Button } from '@/components/ui'

export default function ShareApp() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const appUrl = 'https://gogo.app/download'
  const shareMessage = 'Check out GOGO Express - your super app for rides, food, and grocery delivery! Download now:'

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareMessage} ${appUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GOGO Express - Super App',
          text: shareMessage,
          url: appUrl,
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err)
        }
      }
    }
  }

  const shareOptions = [
    {
      id: 'sms',
      label: 'Messages',
      icon: MessageCircle,
      color: 'bg-green-100 text-green-600',
      action: () => window.open(`sms:?body=${encodeURIComponent(`${shareMessage} ${appUrl}`)}`),
    },
    {
      id: 'email',
      label: 'Email',
      icon: Mail,
      color: 'bg-blue-100 text-blue-600',
      action: () => window.open(`mailto:?subject=${encodeURIComponent('Try GOGO Express!')}&body=${encodeURIComponent(`${shareMessage} ${appUrl}`)}`),
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: Facebook,
      color: 'bg-[#1877F2]/10 text-[#1877F2]',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`),
    },
    {
      id: 'twitter',
      label: 'Twitter',
      icon: Twitter,
      color: 'bg-[#1DA1F2]/10 text-[#1DA1F2]',
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(appUrl)}`),
    },
  ]

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
          <h1 className="text-lg font-semibold">Share GOGO Express</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Hero Section */}
        <Card>
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
              <span className="text-3xl font-bold text-white">G</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Share GOGO Express with Friends</h2>
            <p className="text-gray-500 max-w-xs mx-auto">
              Invite your friends to experience the best super app for rides, food, and groceries
            </p>
          </div>
        </Card>

        {/* Native Share (if supported) */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <Button
            fullWidth
            size="lg"
            onClick={handleNativeShare}
            leftIcon={<Share2 className="h-5 w-5" />}
          >
            Share via...
          </Button>
        )}

        {/* Share Options */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Share via</h3>
          <div className="grid grid-cols-4 gap-4">
            {shareOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  onClick={option.action}
                  className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${option.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-gray-600">{option.label}</span>
                </button>
              )
            })}
          </div>
        </Card>

        {/* Copy Link */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Or copy link</h3>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-3">
              <Link2 className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-600 truncate">{appUrl}</span>
            </div>
            <Button
              onClick={copyLink}
              variant={copied ? 'primary' : 'outline'}
              className="shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Info */}
        <p className="text-center text-sm text-gray-400">
          Help your friends discover GOGO Express
        </p>
      </div>
    </div>
  )
}
