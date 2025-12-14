import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  Globe,
  Moon,
  Shield,
  HelpCircle,
  FileText,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { Card, Modal, Button, Spinner } from '@/components/ui'
import { useAuth, usePushNotifications } from '@/hooks'

interface SettingItem {
  id: string
  label: string
  description?: string
  icon: typeof Bell
  type: 'toggle' | 'link' | 'select'
  value?: boolean
  options?: string[]
  route?: string
}

export default function Settings() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const {
    isSupported: pushSupported,
    permission: pushPermission,
    token: pushToken,
    isLoading: pushLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications()

  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    promotions: true,
    darkMode: false,
    language: 'English',
  })

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handlePushToggle = async () => {
    if (pushToken) {
      await unsubscribe()
    } else {
      const granted = await requestPermission()
      if (granted) {
        await subscribe()
      }
    }
  }

  const handleLogout = async () => {
    await logout()
    setShowLogoutModal(false)
  }

  const notificationSettings: SettingItem[] = [
    {
      id: 'emailNotifications',
      label: 'Email Notifications',
      description: 'Receive order confirmations and receipts via email',
      icon: Bell,
      type: 'toggle',
      value: settings.emailNotifications,
    },
    {
      id: 'smsNotifications',
      label: 'SMS Notifications',
      description: 'Receive text messages for important updates',
      icon: Bell,
      type: 'toggle',
      value: settings.smsNotifications,
    },
    {
      id: 'promotions',
      label: 'Promotional Messages',
      description: 'Receive offers, discounts, and recommendations',
      icon: Bell,
      type: 'toggle',
      value: settings.promotions,
    },
  ]

  const appSettings: SettingItem[] = [
    {
      id: 'language',
      label: 'Language',
      icon: Globe,
      type: 'select',
      options: ['English', 'Filipino'],
    },
    {
      id: 'darkMode',
      label: 'Dark Mode',
      description: 'Switch to dark theme',
      icon: Moon,
      type: 'toggle',
      value: settings.darkMode,
    },
  ]

  const legalSettings: SettingItem[] = [
    {
      id: 'privacy',
      label: 'Privacy Policy',
      icon: Shield,
      type: 'link',
      route: '/privacy',
    },
    {
      id: 'terms',
      label: 'Terms of Service',
      icon: FileText,
      type: 'link',
      route: '/terms',
    },
    {
      id: 'help',
      label: 'Help Center',
      icon: HelpCircle,
      type: 'link',
      route: '/account/support',
    },
  ]

  const renderSettingItem = (item: SettingItem) => {
    return (
      <div
        key={item.id}
        className="flex items-center justify-between py-3"
        onClick={() => {
          if (item.type === 'link' && item.route) {
            navigate(item.route)
          }
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
            <item.icon className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{item.label}</p>
            {item.description && (
              <p className="text-sm text-gray-500">{item.description}</p>
            )}
          </div>
        </div>
        {item.type === 'toggle' && (
          <button
            onClick={() => toggleSetting(item.id as keyof typeof settings)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              item.value ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                item.value ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        )}
        {item.type === 'link' && (
          <ChevronRight className="h-5 w-5 text-gray-400" />
        )}
        {item.type === 'select' && (
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500">{settings.language}</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Push Notifications */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-2">Push Notifications</h3>
          <div className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <Bell className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-500">
                    {!pushSupported
                      ? 'Not supported in this browser'
                      : pushPermission === 'denied'
                      ? 'Permission denied. Enable in browser settings'
                      : pushToken
                      ? 'Enabled - receiving notifications'
                      : 'Enable to receive order updates'
                    }
                  </p>
                </div>
              </div>
              {pushLoading ? (
                <Spinner size="sm" />
              ) : (
                <button
                  onClick={handlePushToggle}
                  disabled={!pushSupported || pushPermission === 'denied'}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    pushToken ? 'bg-primary-600' : 'bg-gray-200'
                  } ${!pushSupported || pushPermission === 'denied' ? 'opacity-50' : ''}`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      pushToken ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              )}
            </div>
            {pushToken && (
              <button
                onClick={sendTestNotification}
                className="mt-3 text-sm text-primary-600 font-medium"
              >
                Send Test Notification
              </button>
            )}
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-2">Other Notifications</h3>
          <div className="divide-y">
            {notificationSettings.map(renderSettingItem)}
          </div>
        </Card>

        {/* App Settings */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-2">App Settings</h3>
          <div className="divide-y">
            {appSettings.map(renderSettingItem)}
          </div>
        </Card>

        {/* Legal */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-2">Legal</h3>
          <div className="divide-y cursor-pointer">
            {legalSettings.map(renderSettingItem)}
          </div>
        </Card>

        {/* Logout */}
        <Card>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex w-full items-center gap-3 py-2 text-red-600"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="font-medium">Log Out</span>
          </button>
        </Card>

        {/* App Version */}
        <p className="text-center text-sm text-gray-400">
          GOGO App v1.0.0
        </p>
      </div>

      {/* Logout Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Log Out"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to log out of your account?
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowLogoutModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleLogout}
            >
              Log Out
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
