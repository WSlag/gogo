import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-current border-t-transparent',
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
      spinnerColor: {
        primary: 'text-primary-600',
        white: 'text-white',
        gray: 'text-gray-400',
        current: 'text-current',
      },
    },
    defaultVariants: {
      size: 'md',
      spinnerColor: 'primary',
    },
  }
)

export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  label?: string
  className?: string
}

const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, spinnerColor, label = 'Loading...' }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        className={cn(spinnerVariants({ size, spinnerColor }), className)}
      >
        <span className="sr-only">{label}</span>
      </div>
    )
  }
)

Spinner.displayName = 'Spinner'

// Full page loading spinner
export interface LoadingScreenProps {
  message?: string
}

const LoadingScreen = ({ message = 'Loading...' }: LoadingScreenProps) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Spinner size="xl" />
      <p className="text-gray-500">{message}</p>
    </div>
  )
}

export { Spinner, LoadingScreen, spinnerVariants }
