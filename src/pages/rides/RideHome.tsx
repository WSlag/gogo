import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MapPin, Navigation, Clock, ChevronRight, ChevronLeft, History, X, Calendar } from 'lucide-react'
import { VEHICLE_TYPES, type VehicleType } from '@/types'
import { useRideStore } from '@/store'
import { useRequireAuth } from '@/hooks'
import { cn } from '@/utils/cn'
import { VehicleIcon } from '@/components/ui/VehicleIcon'
import { Modal, Button } from '@/components/ui'

export default function RideHome() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialType = searchParams.get('type') as VehicleType | null
  const { checkAuthAndRedirect } = useRequireAuth()

  const {
    pickup,
    dropoff,
    vehicleType,
    setVehicleType,
    isScheduled,
    scheduledTime,
    setScheduledRide,
  } = useRideStore()

  const [selectedType, setSelectedType] = useState<VehicleType>(
    initialType || vehicleType
  )
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')

  // Generate available dates (today + 7 days)
  const getAvailableDates = () => {
    const dates: { value: string; label: string }[] = []
    const now = new Date()

    for (let i = 0; i < 7; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() + i)

      const value = date.toISOString().split('T')[0]
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

      dates.push({ value, label })
    }

    return dates
  }

  // Generate available time slots (30-minute intervals)
  const getAvailableTimeSlots = () => {
    const slots: { value: string; label: string }[] = []
    const now = new Date()
    const isToday = selectedDate === now.toISOString().split('T')[0]

    // Start from next available 30-min slot if today, otherwise from 5 AM
    let startHour = isToday ? now.getHours() + 1 : 5
    let startMinute = isToday && now.getMinutes() > 30 ? 0 : (now.getMinutes() <= 30 && isToday ? 30 : 0)

    if (isToday && startMinute === 0) {
      startHour = now.getHours() + 1
    }

    for (let hour = startHour; hour < 23; hour++) {
      for (const minute of [0, 30]) {
        if (hour === startHour && minute < startMinute) continue

        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const label = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`

        slots.push({ value: time, label })
      }
    }

    return slots
  }

  const handleScheduleConfirm = () => {
    if (selectedDate && selectedTime) {
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}:00`)
      setScheduledRide(true, scheduledDateTime)
      setShowScheduleModal(false)
    }
  }

  const handleClearSchedule = () => {
    setScheduledRide(false, null)
    setSelectedDate('')
    setSelectedTime('')
  }

  const formatScheduledTime = (date: Date) => {
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const isTomorrow = date.toDateString() === tomorrow.toDateString()

    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

    if (isToday) return `Today at ${timeStr}`
    if (isTomorrow) return `Tomorrow at ${timeStr}`
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ` at ${timeStr}`
  }

  const handleVehicleSelect = (type: VehicleType) => {
    setSelectedType(type)
    setVehicleType(type)
  }

  const handleLocationClick = (type: 'pickup' | 'dropoff') => {
    navigate(`/rides/location?type=${type}`)
  }

  const handleBookRide = () => {
    if (!pickup || !dropoff) return
    // Require authentication before proceeding to booking
    if (!checkAuthAndRedirect()) return
    navigate('/rides/book')
  }

  return (
    <div className="bg-white pb-36 lg:pb-8 page-content">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 lg:top-16">
        <div className="px-4 py-3 lg:px-8 lg:py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 lg:hidden"
              >
                <ChevronLeft className="h-6 w-6 text-gray-900" />
              </button>
              <h1 className="text-lg lg:text-2xl font-semibold lg:font-bold text-gray-900">Book a Ride</h1>
            </div>
            <button
              onClick={() => navigate('/rides/history')}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
              title="Ride History"
            >
              <History className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
        {/* Location Inputs */}
        <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
          {/* Pickup */}
          <button
            onClick={() => handleLocationClick('pickup')}
            className="flex w-full items-center gap-3 p-4 transition-colors hover:bg-gray-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs text-gray-500">Pickup</p>
              <p className={cn(
                'font-medium',
                pickup ? 'text-gray-900' : 'text-gray-400'
              )}>
                {pickup?.address || 'Set pickup location'}
              </p>
            </div>
            <Navigation className="h-5 w-5 text-gray-400" />
          </button>

          {/* Dropoff */}
          <button
            onClick={() => handleLocationClick('dropoff')}
            className="flex w-full items-center gap-3 p-4 transition-colors hover:bg-gray-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <MapPin className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs text-gray-500">Drop-off</p>
              <p className={cn(
                'font-medium',
                dropoff ? 'text-gray-900' : 'text-gray-400'
              )}>
                {dropoff?.address || 'Where to?'}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Vehicle Types */}
        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            Choose your ride
          </h2>

          <div className="space-y-2">
            {VEHICLE_TYPES.map((vehicle) => (
              <button
                key={vehicle.type}
                onClick={() => handleVehicleSelect(vehicle.type)}
                className={cn(
                  'flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all',
                  selectedType === vehicle.type
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-100 hover:bg-gray-50'
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                  <VehicleIcon type={vehicle.icon as 'motorcycle' | 'car' | 'van' | 'truck' | 'plane'} size="lg" className="text-gray-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {vehicle.name}
                    </h3>
                    {vehicle.type === 'motorcycle' && (
                      <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                        Fastest
                      </span>
                    )}
                    {vehicle.type === 'airport' && (
                      <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">
                        Fixed Rate
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {vehicle.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Schedule Ride */}
        {isScheduled && scheduledTime ? (
          <div className="flex w-full items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-900">Scheduled Ride</p>
              <p className="text-sm text-blue-700">
                {formatScheduledTime(scheduledTime)}
              </p>
            </div>
            <button
              onClick={handleClearSchedule}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
              title="Cancel schedule"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Change
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-gray-100 p-4 text-left transition-colors hover:bg-gray-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Schedule for later</p>
              <p className="text-sm text-gray-500">
                Book a ride up to 7 days in advance
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        )}

        </div>
      </main>

      {/* Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 border-t border-gray-100 bg-white p-4 pb-safe-fixed z-50 lg:bottom-0 lg:left-[240px]">
        <div className="max-w-3xl mx-auto">
        <button
          disabled={!pickup || !dropoff}
          onClick={handleBookRide}
          className={cn(
            'w-full rounded-xl py-4 text-base font-semibold transition-all',
            pickup && dropoff
              ? 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.99]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          {pickup && dropoff
            ? isScheduled
              ? 'Schedule Ride'
              : 'Confirm Booking'
            : 'Select locations'}
        </button>
        </div>
      </div>

      {/* Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Your Ride"
      >
        <div className="space-y-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <div className="grid grid-cols-3 gap-2">
              {getAvailableDates().map((date) => (
                <button
                  key={date.value}
                  onClick={() => {
                    setSelectedDate(date.value)
                    setSelectedTime('') // Reset time when date changes
                  }}
                  className={cn(
                    'p-3 rounded-lg border text-sm font-medium transition-colors',
                    selectedDate === date.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  )}
                >
                  {date.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Time
              </label>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {getAvailableTimeSlots().map((slot) => (
                  <button
                    key={slot.value}
                    onClick={() => setSelectedTime(slot.value)}
                    className={cn(
                      'p-2 rounded-lg border text-sm transition-colors',
                      selectedTime === slot.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    )}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowScheduleModal(false)}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={handleScheduleConfirm}
              disabled={!selectedDate || !selectedTime}
            >
              Confirm Schedule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
