import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  BellOff,
  Car,
  ShoppingBag,
  Gift,
  AlertCircle,
  CheckCircle,
  Trash2,
  Settings,
  Check,
  MoreVertical,
} from 'lucide-react'
import { Card, Badge, Button, Modal } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc, writeBatch, Timestamp } from 'firebase/firestore'
import { db } from '@/services/firebase/config'

interface Notification {
  id: string
  type: 'ride' | 'order' | 'promo' | 'system' | 'wallet'
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  data?: {
    rideId?: string
    orderId?: string
    promoCode?: string
    actionUrl?: string
  }
}

type FilterType = 'all' | 'unread' | 'ride' | 'order' | 'promo'

export default function Notifications() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [user])

  const fetchNotifications = async () => {
    if (!user?.uid) {
      setNotifications(MOCK_NOTIFICATIONS)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const q = query(
        collection(db, 'users', user.uid, 'notifications'),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      const notifs: Notification[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Notification[]
      setNotifications(notifs)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setNotifications(MOCK_NOTIFICATIONS)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notifId: string) => {
    if (!user?.uid) return
    try {
      await updateDoc(doc(db, 'users', user.uid, 'notifications', notifId), {
        isRead: true,
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
      )
    } catch (error) {
      console.error('Error marking as read:', error)
    }
    setShowActionMenu(null)
  }

  const markAllAsRead = async () => {
    if (!user?.uid) return
    try {
      const batch = writeBatch(db)
      notifications
        .filter((n) => !n.isRead)
        .forEach((n) => {
          batch.update(doc(db, 'users', user.uid, 'notifications', n.id), {
            isRead: true,
          })
        })
      await batch.commit()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
      // For demo, just update state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    }
  }

  const deleteNotification = async (notifId: string) => {
    if (!user?.uid) return
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'notifications', notifId))
      setNotifications((prev) => prev.filter((n) => n.id !== notifId))
    } catch (error) {
      console.error('Error deleting notification:', error)
      // For demo, just update state
      setNotifications((prev) => prev.filter((n) => n.id !== notifId))
    }
    setShowActionMenu(null)
  }

  const clearAll = async () => {
    if (!user?.uid) return
    try {
      const batch = writeBatch(db)
      notifications.forEach((n) => {
        batch.delete(doc(db, 'users', user.uid, 'notifications', n.id))
      })
      await batch.commit()
      setNotifications([])
    } catch (error) {
      console.error('Error clearing notifications:', error)
      setNotifications([])
    }
  }

  const handleNotificationClick = (notif: Notification) => {
    markAsRead(notif.id)
    if (notif.data?.rideId) {
      navigate(`/rides/tracking/${notif.data.rideId}`)
    } else if (notif.data?.orderId) {
      navigate(`/orders/${notif.data.orderId}`)
    } else if (notif.data?.actionUrl) {
      navigate(notif.data.actionUrl)
    }
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ride':
        return <Car className="h-5 w-5 text-blue-600" />
      case 'order':
        return <ShoppingBag className="h-5 w-5 text-orange-600" />
      case 'promo':
        return <Gift className="h-5 w-5 text-purple-600" />
      case 'wallet':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getIconBg = (type: Notification['type']) => {
    switch (type) {
      case 'ride':
        return 'bg-blue-100'
      case 'order':
        return 'bg-orange-100'
      case 'promo':
        return 'bg-purple-100'
      case 'wallet':
        return 'bg-green-100'
      default:
        return 'bg-gray-100'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000)
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    if (diff < 2880) return 'Yesterday'
    return date.toLocaleDateString()
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.isRead
    return n.type === filter
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="min-h-screen bg-gray-100 pb-6">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="primary">{unreadCount}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary-600 font-medium"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Settings className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread' },
            { key: 'ride', label: 'Rides' },
            { key: 'order', label: 'Orders' },
            { key: 'promo', label: 'Promos' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as FilterType)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                filter === tab.key
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <BellOff className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No notifications</p>
            <p className="text-sm text-gray-500">
              {filter === 'unread' ? "You're all caught up!" : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notif) => (
              <Card
                key={notif.id}
                className={`!p-4 cursor-pointer transition ${
                  !notif.isRead ? 'bg-primary-50 border-primary-100' : ''
                }`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconBg(notif.type)}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`font-medium ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notif.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                      <div className="relative ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowActionMenu(showActionMenu === notif.id ? null : notif.id)
                          }}
                          className="p-1 rounded-lg hover:bg-gray-100"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-400" />
                        </button>
                        {showActionMenu === notif.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border z-10 py-1 min-w-[140px]">
                            {!notif.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(notif.id)
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Check className="h-4 w-4" />
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notif.id)
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400">{formatTime(notif.createdAt)}</span>
                      {!notif.isRead && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Clear All Button */}
      {notifications.length > 0 && (
        <div className="px-4 mt-4">
          <Button
            variant="outline"
            fullWidth
            onClick={clearAll}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Notifications
          </Button>
        </div>
      )}

      {/* Settings Modal */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Notification Settings"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Manage what notifications you receive
          </p>
          {[
            { key: 'rides', label: 'Ride Updates', desc: 'Driver arrival, ride completion' },
            { key: 'orders', label: 'Order Updates', desc: 'Order status, delivery updates' },
            { key: 'promos', label: 'Promotions', desc: 'Discounts and special offers' },
            { key: 'wallet', label: 'Wallet', desc: 'Top-up confirmations, transactions' },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">{setting.label}</p>
                <p className="text-xs text-gray-500">{setting.desc}</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
              />
            </div>
          ))}
          <Button fullWidth onClick={() => setShowSettingsModal(false)}>
            Save Settings
          </Button>
        </div>
      </Modal>
    </div>
  )
}

// Mock data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'ride',
    title: 'Ride Completed',
    message: 'Your ride to SM City Manila has been completed. Rate your driver Juan D.',
    isRead: false,
    createdAt: new Date(Date.now() - 300000),
    data: { rideId: '123' },
  },
  {
    id: '2',
    type: 'order',
    title: 'Order Delivered',
    message: 'Your order from Jollibee has been delivered. Enjoy your meal!',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000),
    data: { orderId: '456' },
  },
  {
    id: '3',
    type: 'promo',
    title: '50% Off Your Next Ride!',
    message: 'Use code GOGO50 to get 50% off your next ride. Valid until Dec 31.',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000),
    data: { promoCode: 'GOGO50', actionUrl: '/promos' },
  },
  {
    id: '4',
    type: 'wallet',
    title: 'Top-up Successful',
    message: 'Your wallet has been topped up with ₱500. Current balance: ₱750',
    isRead: true,
    createdAt: new Date(Date.now() - 172800000),
    data: { actionUrl: '/wallet' },
  },
  {
    id: '5',
    type: 'order',
    title: 'Order On The Way',
    message: 'Your order from McDonald\'s is on the way! Driver Mark is delivering.',
    isRead: true,
    createdAt: new Date(Date.now() - 259200000),
    data: { orderId: '789' },
  },
  {
    id: '6',
    type: 'system',
    title: 'Welcome to GOGO!',
    message: 'Thanks for joining GOGO. Enjoy ₱100 off your first ride with code NEWUSER.',
    isRead: true,
    createdAt: new Date(Date.now() - 604800000),
    data: { promoCode: 'NEWUSER' },
  },
]
