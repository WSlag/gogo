import { useRef, useEffect } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'
import { VEHICLE_TYPES, type VehicleType, type VehicleTypeInfo } from '@/types'
import { VehicleIcon } from '@/components/ui/VehicleIcon'

interface VehicleTypeSelectorProps {
  selected: VehicleType
  onSelect: (type: VehicleType) => void
  className?: string
  compact?: boolean
}

// Filter to only show ride-related vehicle types on home page
const RIDE_VEHICLE_TYPES = VEHICLE_TYPES.filter(
  (v) => !['delivery', 'happy_move'].includes(v.type)
)

export function VehicleTypeSelector({
  selected,
  onSelect,
  className,
  compact = false
}: VehicleTypeSelectorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLButtonElement>(null)

  // Scroll selected item into view on mount
  useEffect(() => {
    if (selectedRef.current && scrollContainerRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  }, [])

  if (compact) {
    return (
      <div
        ref={scrollContainerRef}
        className={cn(
          'flex gap-2 overflow-x-auto hide-scrollbar snap-x snap-mandatory',
          className
        )}
      >
        {RIDE_VEHICLE_TYPES.map((vehicle) => (
          <VehicleTypeChip
            key={vehicle.type}
            vehicle={vehicle}
            isSelected={selected === vehicle.type}
            onSelect={() => onSelect(vehicle.type)}
            ref={selected === vehicle.type ? selectedRef : undefined}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      ref={scrollContainerRef}
      className={cn(
        'flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-1',
        className
      )}
    >
      {RIDE_VEHICLE_TYPES.map((vehicle) => (
        <VehicleTypeCard
          key={vehicle.type}
          vehicle={vehicle}
          isSelected={selected === vehicle.type}
          onSelect={() => onSelect(vehicle.type)}
          ref={selected === vehicle.type ? selectedRef : undefined}
        />
      ))}
    </div>
  )
}

// Compact chip style for inline display
interface VehicleTypeChipProps {
  vehicle: VehicleTypeInfo
  isSelected: boolean
  onSelect: () => void
}

const VehicleTypeChip = ({
  vehicle,
  isSelected,
  onSelect,
  ref
}: VehicleTypeChipProps & { ref?: React.Ref<HTMLButtonElement> }) => (
  <button
    ref={ref}
    onClick={onSelect}
    className={cn(
      'flex items-center gap-2 px-3 py-2 rounded-full transition-all snap-start shrink-0',
      isSelected
        ? 'border-2 border-primary-600 bg-primary-50 text-primary-700'
        : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300'
    )}
  >
    <VehicleIcon type={vehicle.icon as 'motorcycle' | 'car' | 'van' | 'truck' | 'plane'} size="sm" />
    <span className="text-sm font-medium whitespace-nowrap">{vehicle.name}</span>
    {isSelected && <Check className="h-4 w-4 text-primary-600" />}
  </button>
)

// Full card style for detailed selection
interface VehicleTypeCardProps {
  vehicle: VehicleTypeInfo
  isSelected: boolean
  onSelect: () => void
}

const VehicleTypeCard = ({
  vehicle,
  isSelected,
  onSelect,
  ref
}: VehicleTypeCardProps & { ref?: React.Ref<HTMLButtonElement> }) => (
  <button
    ref={ref}
    onClick={onSelect}
    className={cn(
      'relative flex flex-col items-center p-3 rounded-xl transition-all snap-start shrink-0 min-w-[100px]',
      isSelected
        ? 'border-2 border-primary-600 bg-primary-50'
        : 'border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
    )}
  >
    {/* Selected checkmark */}
    {isSelected && (
      <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary-600 flex items-center justify-center">
        <Check className="h-2.5 w-2.5 text-white" />
      </div>
    )}

    {/* Icon */}
    <VehicleIcon type={vehicle.icon as 'motorcycle' | 'car' | 'van' | 'truck' | 'plane'} size="lg" className="mb-1 text-gray-700" />

    {/* Name */}
    <span
      className={cn(
        'text-sm font-semibold',
        isSelected ? 'text-primary-700' : 'text-gray-900'
      )}
    >
      {vehicle.name}
    </span>
  </button>
)

// Display-only vehicle type badge
export function VehicleTypeBadge({
  type,
  className
}: {
  type: VehicleType
  className?: string
}) {
  const vehicle = VEHICLE_TYPES.find((v) => v.type === type)
  if (!vehicle) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700',
        className
      )}
    >
      <VehicleIcon type={vehicle.icon as 'motorcycle' | 'car' | 'van' | 'truck' | 'plane'} size="sm" />
      <span>{vehicle.name}</span>
    </span>
  )
}
