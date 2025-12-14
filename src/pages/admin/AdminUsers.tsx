import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  Filter,
  MoreVertical,
  User,
  Mail,
  Phone,
  Calendar,
  Ban,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button, Card, Modal } from '@/components/ui'

interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string
  status: 'active' | 'suspended' | 'banned'
  totalOrders: number
  totalSpent: number
  joinedAt: Date
  lastActive: Date
}

const MOCK_USERS: UserData[] = [
  {
    id: '1',
    firstName: 'Maria',
    lastName: 'Santos',
    email: 'maria.santos@email.com',
    phone: '+639123456789',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    status: 'active',
    totalOrders: 45,
    totalSpent: 12500,
    joinedAt: new Date('2024-01-15'),
    lastActive: new Date(),
  },
  {
    id: '2',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    email: 'juan.delacruz@email.com',
    phone: '+639987654321',
    status: 'active',
    totalOrders: 23,
    totalSpent: 8750,
    joinedAt: new Date('2024-02-20'),
    lastActive: new Date(Date.now() - 86400000),
  },
  {
    id: '3',
    firstName: 'Ana',
    lastName: 'Lopez',
    email: 'ana.lopez@email.com',
    phone: '+639555666777',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    status: 'suspended',
    totalOrders: 12,
    totalSpent: 3200,
    joinedAt: new Date('2024-03-10'),
    lastActive: new Date(Date.now() - 604800000),
  },
  {
    id: '4',
    firstName: 'Carlos',
    lastName: 'Martinez',
    email: 'carlos.martinez@email.com',
    phone: '+639111222333',
    status: 'active',
    totalOrders: 67,
    totalSpent: 25000,
    joinedAt: new Date('2023-11-05'),
    lastActive: new Date(),
  },
  {
    id: '5',
    firstName: 'Lisa',
    lastName: 'Reyes',
    email: 'lisa.reyes@email.com',
    phone: '+639444555666',
    status: 'banned',
    totalOrders: 5,
    totalSpent: 1200,
    joinedAt: new Date('2024-04-01'),
    lastActive: new Date(Date.now() - 2592000000),
  },
]

export default function AdminUsers() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserData[]>(MOCK_USERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredUsers = users.filter((user) => {
    if (statusFilter !== 'all' && user.status !== statusFilter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.includes(query)
      )
    }
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'suspended':
        return 'bg-yellow-100 text-yellow-700'
      case 'banned':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleStatusChange = (userId: string, newStatus: UserData['status']) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: newStatus } : user
      )
    )
    setShowActionModal(false)
    setSelectedUser(null)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-900 text-white px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 rounded-lg hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">User Management</h1>
            <p className="text-gray-400 text-sm">{filteredUsers.length} users</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        <Card>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Spent</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.firstName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{user.totalOrders}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">P{user.totalSpent.toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">{formatDate(user.joinedAt)}</p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowActionModal(true)
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100"
                      >
                        <MoreVertical className="h-5 w-5 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">
              Showing {filteredUsers.length} of {users.length} users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-600">Page {currentPage}</span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={filteredUsers.length < itemsPerPage}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => {
          setShowActionModal(false)
          setSelectedUser(null)
        }}
        title="User Actions"
      >
        {selectedUser && (
          <div className="space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-3 pb-4 border-b">
              {selectedUser.avatar ? (
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.firstName}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-500" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {selectedUser.status !== 'active' && (
                <button
                  onClick={() => handleStatusChange(selectedUser.id, 'active')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">Activate Account</span>
                </button>
              )}
              {selectedUser.status === 'active' && (
                <button
                  onClick={() => handleStatusChange(selectedUser.id, 'suspended')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                >
                  <XCircle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-gray-900">Suspend Account</span>
                </button>
              )}
              {selectedUser.status !== 'banned' && (
                <button
                  onClick={() => handleStatusChange(selectedUser.id, 'banned')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                >
                  <Ban className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-gray-900">Ban Account</span>
                </button>
              )}
            </div>

            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setShowActionModal(false)
                setSelectedUser(null)
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
