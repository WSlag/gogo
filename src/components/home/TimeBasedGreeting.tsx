import { useState, useEffect } from 'react'
import { X, Clock, Sparkles } from 'lucide-react'
import { cn } from '@/utils/cn'

interface TimeBasedGreetingProps {
  userName?: string
  className?: string
}

type TimeOfDay = 'morning' | 'lunch' | 'merienda' | 'evening' | 'night'

interface TimeConfig {
  greeting: string
  subtitle: string
  promo?: {
    text: string
    discount: string
    gradient: string
    icon: typeof Sparkles
  }
}

const getTimeOfDay = (hour: number): TimeOfDay => {
  if (hour >= 5 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 14) return 'lunch'
  if (hour >= 14 && hour < 18) return 'merienda'
  if (hour >= 18 && hour < 21) return 'evening'
  return 'night'
}

const timeConfigs: Record<TimeOfDay, TimeConfig> = {
  morning: {
    greeting: 'Good morning',
    subtitle: 'Where are you going today?',
    promo: {
      text: 'Start your day right!',
      discount: '15% off breakfast orders',
      gradient: 'from-orange-400 to-yellow-400',
      icon: Sparkles
    }
  },
  lunch: {
    greeting: 'Good afternoon',
    subtitle: 'Ready for lunch?',
    promo: {
      text: 'Lunch time deals!',
      discount: '20% off until 2PM',
      gradient: 'from-red-500 to-orange-500',
      icon: Clock
    }
  },
  merienda: {
    greeting: 'Merienda time',
    subtitle: 'Craving a snack?',
    promo: {
      text: 'Merienda specials!',
      discount: '25% off snacks & drinks',
      gradient: 'from-amber-400 to-orange-400',
      icon: Sparkles
    }
  },
  evening: {
    greeting: 'Good evening',
    subtitle: 'Where to for dinner?',
    promo: {
      text: 'Dinner deals!',
      discount: 'Free delivery on orders ₱500+',
      gradient: 'from-purple-500 to-pink-500',
      icon: Sparkles
    }
  },
  night: {
    greeting: 'Good evening',
    subtitle: 'Late night cravings?',
    promo: {
      text: 'Night owl special!',
      discount: '10% off all orders',
      gradient: 'from-indigo-500 to-purple-500',
      icon: Sparkles
    }
  }
}

export function TimeBasedGreeting({ userName = 'there', className }: TimeBasedGreetingProps) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => getTimeOfDay(new Date().getHours()))
  const [showPromo, setShowPromo] = useState(true)

  useEffect(() => {
    // Update time of day every minute
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay(new Date().getHours()))
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const config = timeConfigs[timeOfDay]
  const PromoIcon = config.promo?.icon || Sparkles

  return (
    <div className={cn('', className)}>
      {/* Greeting text */}
      <div className="mb-3">
        <h1 className="text-xl font-bold text-gray-900">
          {config.greeting}, {userName}!
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{config.subtitle}</p>
      </div>

      {/* Promo banner */}
      {showPromo && config.promo && (
        <div
          className={cn(
            'relative overflow-hidden rounded-xl bg-gradient-to-r p-4',
            config.promo.gradient
          )}
        >
          {/* Dismiss button */}
          <button
            onClick={() => setShowPromo(false)}
            className="absolute top-2 right-2 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Dismiss promotion"
          >
            <X className="h-4 w-4 text-white" />
          </button>

          {/* Content */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <PromoIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{config.promo.text}</p>
              <p className="text-sm text-white/90">{config.promo.discount}</p>
            </div>
          </div>

          {/* Decorative circles */}
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
          <div className="absolute -right-2 -bottom-6 h-16 w-16 rounded-full bg-white/5" />
        </div>
      )}
    </div>
  )
}

// Ride-focused greeting variant
export function RideGreeting({ userName = 'there', className }: TimeBasedGreetingProps) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => getTimeOfDay(new Date().getHours()))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay(new Date().getHours()))
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const greetings: Record<TimeOfDay, string> = {
    morning: 'Good morning',
    lunch: 'Good afternoon',
    merienda: 'Good afternoon',
    evening: 'Good evening',
    night: 'Good evening'
  }

  return (
    <div className={cn('', className)}>
      <h1 className="text-xl font-bold text-gray-900">
        {greetings[timeOfDay]}, {userName}!
      </h1>
      <p className="text-sm text-gray-500 mt-0.5">
        Where are you going today?
      </p>
    </div>
  )
}
