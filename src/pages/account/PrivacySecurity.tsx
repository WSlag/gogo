import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Lock,
  Smartphone,
  Shield,
  Eye,
  EyeOff,
  Fingerprint,
  Trash2,
  Download,
  ChevronRight,
} from 'lucide-react'
import { Card, Button, Modal } from '@/components/ui'

export default function PrivacySecurity() {
  const navigate = useNavigate()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    biometric: true,
  })

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  const toggleSecurity = (key: keyof typeof securitySettings) => {
    setSecuritySettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handlePasswordChange = () => {
    // In production, this would call an API
    setShowPasswordModal(false)
    setPasswordForm({ current: '', new: '', confirm: '' })
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
          <h1 className="text-lg font-semibold">Privacy & Security</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Password Section */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-2">Password</h3>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex w-full items-center justify-between py-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <Lock className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Change Password</p>
                <p className="text-sm text-gray-500">Last changed 30 days ago</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </Card>

        {/* Security Options */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-2">Security</h3>
          <div className="divide-y">
            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <Smartphone className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Add extra security to your account</p>
                </div>
              </div>
              <button
                onClick={() => toggleSecurity('twoFactor')}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  securitySettings.twoFactor ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    securitySettings.twoFactor ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Biometric */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <Fingerprint className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Biometric Login</p>
                  <p className="text-sm text-gray-500">Use fingerprint or face to login</p>
                </div>
              </div>
              <button
                onClick={() => toggleSecurity('biometric')}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  securitySettings.biometric ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    securitySettings.biometric ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Privacy */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-2">Privacy</h3>
          <div className="divide-y">
            <button
              onClick={() => navigate('/privacy')}
              className="flex w-full items-center justify-between py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <Shield className="h-5 w-5 text-gray-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Privacy Policy</p>
                  <p className="text-sm text-gray-500">Learn how we protect your data</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button className="flex w-full items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <Download className="h-5 w-5 text-gray-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Download My Data</p>
                  <p className="text-sm text-gray-500">Get a copy of your personal data</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card>
          <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex w-full items-center justify-between py-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-red-600">Delete Account</p>
                <p className="text-sm text-gray-500">Permanently delete your account and data</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </Card>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordForm.current}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, current: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={passwordForm.new}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, new: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirm: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Confirm new password"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowPasswordModal(false)}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={handlePasswordChange}
            >
              Update Password
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete your account? This action cannot be undone
            and all your data will be permanently removed.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => setShowDeleteModal(false)}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
