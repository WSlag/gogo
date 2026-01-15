import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  Heart,
  Send,
} from 'lucide-react'
import { Card, Button } from '@/components/ui'

export default function RateApp() {
  const navigate = useNavigate()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    // In production, this would submit to an API or open app store
    setSubmitted(true)
  }

  const getRatingText = () => {
    const r = hoveredRating || rating
    if (r === 0) return 'Tap a star to rate'
    if (r === 1) return 'Poor'
    if (r === 2) return 'Fair'
    if (r === 3) return 'Good'
    if (r === 4) return 'Very Good'
    return 'Excellent!'
  }

  if (submitted) {
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
            <h1 className="text-lg font-semibold">Rate GOGO Express</h1>
          </div>
        </div>

        <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
              <Heart className="h-10 w-10 text-primary-600 fill-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-500 mb-6 max-w-xs mx-auto">
              We appreciate your feedback. It helps us improve GOGO Express for everyone.
            </p>
            <Button onClick={() => navigate('/account')}>
              Back to Account
            </Button>
          </div>
        </div>
      </div>
    )
  }

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
          <h1 className="text-lg font-semibold">Rate GOGO Express</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Rating Section */}
        <Card>
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600">
              <span className="text-2xl font-bold text-white">G</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Enjoying GOGO Express?</h2>
            <p className="text-gray-500 mb-6">Tell us what you think</p>

            {/* Star Rating */}
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className={`text-sm font-medium ${
              (hoveredRating || rating) >= 4 ? 'text-primary-600' : 'text-gray-500'
            }`}>
              {getRatingText()}
            </p>
          </div>
        </Card>

        {/* Feedback Section */}
        {rating > 0 && (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">
              {rating >= 4 ? 'What do you love about GOGO Express?' : 'How can we improve?'}
            </h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts... (optional)"
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
            <Button
              fullWidth
              onClick={handleSubmit}
              className="mt-4"
              leftIcon={<Send className="h-4 w-4" />}
            >
              Submit Rating
            </Button>
          </Card>
        )}

        {/* Info */}
        <p className="text-center text-sm text-gray-400">
          Your feedback helps us make GOGO Express better
        </p>
      </div>
    </div>
  )
}
