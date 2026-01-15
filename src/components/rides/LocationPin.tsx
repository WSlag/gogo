import { cn } from '@/utils/cn'

interface LocationPinProps {
  type: 'pickup' | 'dropoff'
  animated?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: {
    container: 'w-6 h-6',
    pin: 'w-4 h-4',
    dot: 'w-2 h-2',
    tail: 'border-l-[4px] border-r-[4px] border-t-[6px]'
  },
  md: {
    container: 'w-8 h-8',
    pin: 'w-6 h-6',
    dot: 'w-3 h-3',
    tail: 'border-l-[6px] border-r-[6px] border-t-[10px]'
  },
  lg: {
    container: 'w-10 h-10',
    pin: 'w-8 h-8',
    dot: 'w-4 h-4',
    tail: 'border-l-[8px] border-r-[8px] border-t-[14px]'
  }
}

export function LocationPin({
  type,
  animated = false,
  size = 'md',
  className
}: LocationPinProps) {
  const isPickup = type === 'pickup'
  const colors = isPickup
    ? { bg: 'bg-green-500', border: 'border-t-green-500' }
    : { bg: 'bg-red-500', border: 'border-t-red-500' }

  const sizes = sizeClasses[size]

  if (isPickup) {
    // Pickup uses a circle/dot style
    return (
      <div
        className={cn(
          'relative flex items-center justify-center',
          sizes.container,
          animated && 'animate-pin-bounce',
          className
        )}
      >
        {/* Pulse ring */}
        {animated && (
          <div
            className={cn(
              'absolute rounded-full bg-green-500/20 animate-ping',
              sizes.container
            )}
          />
        )}
        {/* Main circle */}
        <div
          className={cn(
            'rounded-full border-[3px] border-white shadow-lg',
            colors.bg,
            sizes.pin
          )}
        />
        {/* Inner dot */}
        <div
          className={cn(
            'absolute rounded-full bg-white',
            sizes.dot
          )}
        />
      </div>
    )
  }

  // Dropoff uses a pin/marker style
  return (
    <div
      className={cn(
        'relative flex flex-col items-center',
        animated && 'animate-pin-bounce',
        className
      )}
    >
      {/* Pin head */}
      <div
        className={cn(
          'rounded-full border-[3px] border-white shadow-lg flex items-center justify-center',
          colors.bg,
          sizes.pin
        )}
      >
        <div className={cn('rounded-full bg-white', sizes.dot)} />
      </div>
      {/* Pin tail */}
      <div
        className={cn(
          'border-solid border-transparent -mt-0.5',
          sizes.tail,
          colors.border
        )}
        style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))' }}
      />
    </div>
  )
}

// Center pin for map dragging (fixed in center)
export function CenterPin({
  type = 'pickup',
  className
}: {
  type?: 'pickup' | 'dropoff'
  className?: string
}) {
  return (
    <div
      className={cn(
        'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full z-10',
        className
      )}
    >
      <LocationPin type={type} size="lg" />
      {/* Shadow on ground */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1 w-4 h-1 bg-black/20 rounded-full blur-sm" />
    </div>
  )
}
