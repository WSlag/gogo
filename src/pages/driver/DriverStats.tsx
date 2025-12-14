import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Car,
  Clock,
  Star,
  DollarSign,
  Calendar,
  Target,
  Award,
  Zap,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Card } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/services/firebase/config'

interface DailyStats {
  date: string
  rides: number
  earnings: number
  hours: number
  rating: number
}

interface DriverStats {
  today: {
    rides: number
    earnings: number
    hours: number
    avgRating: number
    acceptanceRate: number
    completionRate: number
  }
  weekly: {
    rides: number
    earnings: number
    hours: number
    avgRating: number
    ridesByDay: DailyStats[]
  }
  monthly: {
    rides: number
    earnings: number
    hours: number
    avgRating: number
    trend: number // percentage change from last month
  }
  allTime: {
    rides: number
    earnings: number
    rating: number
    cancellations: number
    completionRate: number
  }
  goals: {
    dailyRides: { current: number; target: number }
    weeklyEarnings: { current: number; target: number }
    rating: { current: number; target: number }
  }
  achievements: Array<{
    id: string
    title: string
    description: string
    icon: string
    earnedAt?: Date
    isEarned: boolean
  }>
}

type TimeRange = 'today' | 'week' | 'month' | 'all'

export default function DriverStats() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DriverStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRange, setSelectedRange] = useState<TimeRange>('today')

  useEffect(() => {
    fetchStats()
  }, [user])

  const fetchStats = async () => {
    if (!user?.uid) {
      setStats(MOCK_STATS)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Fetch rides for the current user
      const ridesQuery = query(
        collection(db, 'rides'),
        where('driverId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(ridesQuery)
      const rides = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }))

      // Calculate stats from rides
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfWeek = new Date(startOfDay)
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const todayRides = rides.filter((r) => new Date(r.createdAt) >= startOfDay)
      const weekRides = rides.filter((r) => new Date(r.createdAt) >= startOfWeek)
      const monthRides = rides.filter((r) => new Date(r.createdAt) >= startOfMonth)

      setStats({
        today: {
          rides: todayRides.length,
          earnings: todayRides.reduce((sum, r) => sum + (r.fare || 0), 0),
          hours: todayRides.length * 0.5, // Estimate
          avgRating: calculateAvgRating(todayRides),
          acceptanceRate: 92,
          completionRate: 98,
        },
        weekly: {
          rides: weekRides.length,
          earnings: weekRides.reduce((sum, r) => sum + (r.fare || 0), 0),
          hours: weekRides.length * 0.5,
          avgRating: calculateAvgRating(weekRides),
          ridesByDay: generateWeeklyData(weekRides),
        },
        monthly: {
          rides: monthRides.length,
          earnings: monthRides.reduce((sum, r) => sum + (r.fare || 0), 0),
          hours: monthRides.length * 0.5,
          avgRating: calculateAvgRating(monthRides),
          trend: 12,
        },
        allTime: {
          rides: rides.length,
          earnings: rides.reduce((sum, r) => sum + (r.fare || 0), 0),
          rating: calculateAvgRating(rides),
          cancellations: rides.filter((r) => r.status === 'cancelled').length,
          completionRate: calculateCompletionRate(rides),
        },
        goals: MOCK_STATS.goals,
        achievements: MOCK_STATS.achievements,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats(MOCK_STATS)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Stats not available</p>
      </div>
    )
  }

  const currentStats =
    selectedRange === 'today'
      ? stats.today
      : selectedRange === 'week'
      ? stats.weekly
      : selectedRange === 'month'
      ? stats.monthly
      : stats.allTime

  return (
    <div className="min-h-screen bg-gray-100 pb-6">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/driver')} className="p-1">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold">Performance Stats</h1>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="px-4 py-4">
        <div className="flex gap-2 bg-white rounded-xl p-1">
          {(['today', 'week', 'month', 'all'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                selectedRange === range
                  ? 'bg-green-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range === 'today' ? 'Today' : range === 'week' ? 'Week' : range === 'month' ? 'Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats */}
      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-2 mb-2">
              <Car className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-500">Rides</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{currentStats.rides}</p>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-500">Earnings</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">₱{currentStats.earnings.toLocaleString()}</p>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-500">Hours</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{currentStats.hours.toFixed(1)}</p>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-gray-500">Rating</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {'avgRating' in currentStats ? currentStats.avgRating.toFixed(1) : (currentStats as typeof stats.allTime).rating.toFixed(1)}
            </p>
          </Card>
        </div>

        {/* Weekly Chart */}
        {selectedRange === 'week' && (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">This Week</h3>
            <div className="flex items-end justify-between h-32 gap-1">
              {stats.weekly.ridesByDay.map((day, index) => {
                const maxRides = Math.max(...stats.weekly.ridesByDay.map((d) => d.rides), 1)
                const height = (day.rides / maxRides) * 100
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-green-500 rounded-t-md transition-all"
                      style={{ height: `${height}%`, minHeight: day.rides > 0 ? '8px' : '2px' }}
                    />
                    <span className="text-xs text-gray-500 mt-1">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* Today's Performance */}
        {selectedRange === 'today' && (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Today's Performance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Acceptance Rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${stats.today.acceptanceRate}%` }}
                    />
                  </div>
                  <span className="font-medium">{stats.today.acceptanceRate}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Completion Rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${stats.today.completionRate}%` }}
                    />
                  </div>
                  <span className="font-medium">{stats.today.completionRate}%</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Monthly Trend */}
        {selectedRange === 'month' && (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Monthly Trend</h3>
            <div className={`flex items-center gap-2 text-lg ${stats.monthly.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.monthly.trend >= 0 ? (
                <TrendingUp className="h-6 w-6" />
              ) : (
                <TrendingDown className="h-6 w-6" />
              )}
              <span className="font-bold">{Math.abs(stats.monthly.trend)}%</span>
              <span className="text-gray-500 text-sm">vs last month</span>
            </div>
          </Card>
        )}

        {/* Goals */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Goals</h3>
            <Target className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Daily Rides</span>
                <span className="font-medium">
                  {stats.goals.dailyRides.current}/{stats.goals.dailyRides.target}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: `${Math.min((stats.goals.dailyRides.current / stats.goals.dailyRides.target) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Weekly Earnings</span>
                <span className="font-medium">
                  ₱{stats.goals.weeklyEarnings.current.toLocaleString()}/₱{stats.goals.weeklyEarnings.target.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: `${Math.min((stats.goals.weeklyEarnings.current / stats.goals.weeklyEarnings.target) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Rating Goal</span>
                <span className="font-medium">
                  {stats.goals.rating.current.toFixed(1)}/{stats.goals.rating.target.toFixed(1)}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full"
                  style={{
                    width: `${Math.min((stats.goals.rating.current / stats.goals.rating.target) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Achievements */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Achievements</h3>
            <Award className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {stats.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`text-center p-3 rounded-xl ${
                  achievement.isEarned ? 'bg-yellow-50' : 'bg-gray-50 opacity-50'
                }`}
              >
                <span className="text-2xl">{achievement.icon}</span>
                <p className="text-xs font-medium mt-1 truncate">{achievement.title}</p>
                {achievement.isEarned && (
                  <CheckCircle className="h-3 w-3 text-green-500 mx-auto mt-1" />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function calculateAvgRating(rides: Array<{ rating?: number }>) {
  const ratedRides = rides.filter((r) => r.rating && r.rating > 0)
  if (ratedRides.length === 0) return 0
  return ratedRides.reduce((sum, r) => sum + (r.rating || 0), 0) / ratedRides.length
}

function calculateCompletionRate(rides: Array<{ status: string }>) {
  if (rides.length === 0) return 100
  const completed = rides.filter((r) => r.status === 'completed' || r.status === 'delivered')
  return Math.round((completed.length / rides.length) * 100)
}

function generateWeeklyData(rides: Array<{ createdAt: Date; fare?: number; rating?: number }>): DailyStats[] {
  const days: DailyStats[] = []
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(date.getDate() + i)
    const dayRides = rides.filter((r) => {
      const rideDate = new Date(r.createdAt)
      return rideDate.toDateString() === date.toDateString()
    })

    days.push({
      date: date.toISOString().split('T')[0],
      rides: dayRides.length,
      earnings: dayRides.reduce((sum, r) => sum + (r.fare || 0), 0),
      hours: dayRides.length * 0.5,
      rating: calculateAvgRating(dayRides),
    })
  }

  return days
}

// Mock data for demo
const MOCK_STATS: DriverStats = {
  today: {
    rides: 8,
    earnings: 1250,
    hours: 4.5,
    avgRating: 4.9,
    acceptanceRate: 92,
    completionRate: 100,
  },
  weekly: {
    rides: 42,
    earnings: 6850,
    hours: 28,
    avgRating: 4.8,
    ridesByDay: [
      { date: '2024-01-07', rides: 5, earnings: 750, hours: 3, rating: 4.8 },
      { date: '2024-01-08', rides: 7, earnings: 1100, hours: 4, rating: 4.9 },
      { date: '2024-01-09', rides: 6, earnings: 950, hours: 3.5, rating: 4.7 },
      { date: '2024-01-10', rides: 8, earnings: 1300, hours: 5, rating: 4.8 },
      { date: '2024-01-11', rides: 6, earnings: 900, hours: 4, rating: 4.9 },
      { date: '2024-01-12', rides: 5, earnings: 750, hours: 3.5, rating: 4.8 },
      { date: '2024-01-13', rides: 5, earnings: 1100, hours: 5, rating: 4.8 },
    ],
  },
  monthly: {
    rides: 185,
    earnings: 28500,
    hours: 120,
    avgRating: 4.8,
    trend: 12,
  },
  allTime: {
    rides: 1250,
    earnings: 185000,
    rating: 4.8,
    cancellations: 25,
    completionRate: 98,
  },
  goals: {
    dailyRides: { current: 8, target: 10 },
    weeklyEarnings: { current: 6850, target: 8000 },
    rating: { current: 4.8, target: 4.9 },
  },
  achievements: [
    { id: '1', title: 'First Ride', description: 'Complete your first ride', icon: '🚗', isEarned: true, earnedAt: new Date() },
    { id: '2', title: '100 Rides', description: 'Complete 100 rides', icon: '💯', isEarned: true, earnedAt: new Date() },
    { id: '3', title: '5-Star Driver', description: 'Maintain 5.0 rating for a week', icon: '⭐', isEarned: true, earnedAt: new Date() },
    { id: '4', title: 'Early Bird', description: 'Complete 10 rides before 8 AM', icon: '🌅', isEarned: true, earnedAt: new Date() },
    { id: '5', title: 'Night Owl', description: 'Complete 10 rides after 10 PM', icon: '🦉', isEarned: false },
    { id: '6', title: '1000 Rides', description: 'Complete 1000 rides', icon: '🏆', isEarned: true, earnedAt: new Date() },
  ],
}
