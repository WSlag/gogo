import { useState } from 'react'
import { Star, ThumbsUp, ThumbsDown, X } from 'lucide-react'
import { Button, Modal, Avatar } from '@/components/ui'

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rating: number, review: string, tags: string[]) => Promise<void>
  type: 'ride' | 'order' | 'merchant'
  recipientName: string
  recipientImage?: string
  serviceDetails?: string
}

const POSITIVE_TAGS = {
  ride: ['Safe driving', 'Friendly', 'Clean vehicle', 'On time', 'Good navigation', 'Professional'],
  order: ['Fast delivery', 'Food quality', 'Packaging', 'Friendly rider', 'Accurate order', 'Hot food'],
  merchant: ['Great food', 'Fast prep', 'Good portions', 'Value for money', 'Fresh ingredients', 'Excellent taste'],
}

const NEGATIVE_TAGS = {
  ride: ['Late', 'Rude', 'Dirty vehicle', 'Unsafe driving', 'Wrong route', 'Unprofessional'],
  order: ['Late delivery', 'Cold food', 'Spilled', 'Wrong order', 'Missing items', 'Rude rider'],
  merchant: ['Slow prep', 'Small portions', 'Poor quality', 'Overpriced', 'Wrong order', 'Bad taste'],
}

export function RatingModal({
  isOpen,
  onClose,
  onSubmit,
  type,
  recipientName,
  recipientImage,
  serviceDetails,
}: RatingModalProps) {
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const tags = rating >= 4 ? POSITIVE_TAGS[type] : NEGATIVE_TAGS[type]

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit(rating, review, selectedTags)
      onClose()
    } catch (error) {
      console.error('Failed to submit rating:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRatingLabel = (r: number) => {
    if (r === 5) return 'Excellent!'
    if (r === 4) return 'Very Good'
    if (r === 3) return 'Good'
    if (r === 2) return 'Fair'
    return 'Poor'
  }

  const displayRating = hoverRating ?? rating

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="text-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>

        {/* Recipient info */}
        <Avatar
          name={recipientName}
          src={recipientImage}
          size="xl"
          className="mx-auto mb-3"
        />
        <h3 className="text-lg font-semibold text-gray-900">{recipientName}</h3>
        {serviceDetails && (
          <p className="text-sm text-gray-500 mt-1">{serviceDetails}</p>
        )}

        {/* Rating prompt */}
        <p className="text-gray-600 mt-4 mb-2">
          {type === 'ride'
            ? 'How was your ride?'
            : type === 'order'
            ? 'How was your delivery?'
            : 'How was the food?'}
        </p>

        {/* Star rating */}
        <div className="flex justify-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => {
                setRating(star)
                setSelectedTags([]) // Reset tags when rating changes
              }}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`h-10 w-10 transition-colors ${
                  star <= displayRating
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Rating label */}
        <p
          className={`font-medium mb-4 ${
            displayRating >= 4
              ? 'text-green-600'
              : displayRating >= 3
              ? 'text-yellow-600'
              : 'text-red-600'
          }`}
        >
          {getRatingLabel(displayRating)}
        </p>

        {/* Quick tags */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">
            {rating >= 4 ? 'What went well?' : 'What could be improved?'}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  selectedTags.includes(tag)
                    ? rating >= 4
                      ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
                      : 'bg-red-100 text-red-700 ring-2 ring-red-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {rating >= 4 ? (
                  <ThumbsUp className="h-3 w-3 inline mr-1" />
                ) : (
                  <ThumbsDown className="h-3 w-3 inline mr-1" />
                )}
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Review textarea */}
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share more details about your experience (optional)"
          className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
          rows={3}
        />

        {/* Tip suggestion for good ratings */}
        {rating >= 4 && type === 'ride' && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">
              💝 Consider leaving a tip to show your appreciation!
            </p>
            <div className="flex justify-center gap-2 mt-2">
              {[10, 20, 50].map((amount) => (
                <button
                  key={amount}
                  className="px-4 py-1.5 bg-white rounded-full text-sm font-medium text-green-600 border border-green-200 hover:bg-green-100"
                >
                  +₱{amount}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit button */}
        <div className="mt-6">
          <Button
            fullWidth
            size="lg"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Submit Rating
          </Button>
        </div>

        {/* Skip option */}
        <button
          onClick={onClose}
          className="mt-3 text-sm text-gray-500 hover:text-gray-700"
        >
          Skip for now
        </button>
      </div>
    </Modal>
  )
}

export default RatingModal
