import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  Mail,
  MessageSquare,
  ShoppingBag,
  Car,
  Gift,
  Megaphone,
} from 'lucide-react'
import { Card } from '@/components/ui'

interface NotificationSetting {
  id: string
  label: string
  description: string
  icon: typeof Bell
  enabled: boolean
}

export default function AccountNotifications() {
  const navigate = useNavigate()

  const [pushSettings, setPushSettings] = useState<NotificationSetting[]>([
    {
      id: 'orders',
      label: 'Order Updates',
      description: 'Get notified about order status changes',
      icon: ShoppingBag,
      enabled: true,
    },
    {
      id: 'rides',
      label: 'Ride Updates',
      description: 'Driver arrival and trip status',
      icon: Car,
      enabled: true,
    },
    {
      id: 'promos',
      label: 'Promotions',
      description: 'Exclusive deals and discounts',
      icon: Gift,
      enabled: true,
    },
    {
      id: 'announcements',
      label: 'Announcements',
      description: 'New features and app updates',
      icon: Megaphone,
      enabled: false,
    },
  ])

  const [channelSettings, setChannelSettings] = useState([
    {
      id: 'push',
      label: 'Push Notifications',
      description: 'Notifications on your device',
      icon: Bell,
      enabled: true,
    },
    {
      id: 'email',
      label: 'Email',
      description: 'Order receipts and updates',
      icon: Mail,
      enabled: true,
    },
    {
      id: 'sms',
      label: 'SMS',
      description: 'Important alerts via text',
      icon: MessageSquare,
      enabled: false,
    },
  ])

  const togglePushSetting = (id: string) => {
    setPushSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    )
  }

  const toggleChannelSetting = (id: string) => {
    setChannelSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    )
  }

  const renderToggle = (enabled: boolean, onToggle: () => void) => (
    <button
      onClick={onToggle}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        enabled ? 'bg-primary-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )

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
          <h1 className="text-lg font-semibold">Notifications</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Notification Channels */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-2">Notification Channels</h3>
          <p className="text-sm text-gray-500 mb-4">Choose how you want to receive notifications</p>
          <div className="divide-y">
            {channelSettings.map((setting) => {
              const Icon = setting.icon
              return (
                <div
                  key={setting.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                      <Icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{setting.label}</p>
                      <p className="text-sm text-gray-500">{setting.description}</p>
                    </div>
                  </div>
                  {renderToggle(setting.enabled, () => toggleChannelSetting(setting.id))}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Notification Types */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-2">Notification Types</h3>
          <p className="text-sm text-gray-500 mb-4">Select what you want to be notified about</p>
          <div className="divide-y">
            {pushSettings.map((setting) => {
              const Icon = setting.icon
              return (
                <div
                  key={setting.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                      <Icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{setting.label}</p>
                      <p className="text-sm text-gray-500">{setting.description}</p>
                    </div>
                  </div>
                  {renderToggle(setting.enabled, () => togglePushSetting(setting.id))}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Info */}
        <p className="text-center text-sm text-gray-400">
          You can change these settings at any time
        </p>
      </div>
    </div>
  )
}
