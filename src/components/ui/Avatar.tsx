import { forwardRef, type ImgHTMLAttributes, useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { User } from 'lucide-react'
import { cn } from '@/utils/cn'

const avatarVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl',
        '2xl': 'h-20 w-20 text-2xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface AvatarProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'size'>,
    VariantProps<typeof avatarVariants> {
  name?: string
  showBadge?: boolean
  badgeColor?: string
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt, name, showBadge, badgeColor = 'bg-success', ...props }, ref) => {
    const [hasError, setHasError] = useState(false)

    // Get initials from name
    const getInitials = (name: string) => {
      const parts = name.trim().split(' ')
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      }
      return name.slice(0, 2).toUpperCase()
    }

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="h-full w-full object-cover"
            onError={() => setHasError(true)}
            {...props}
          />
        ) : name ? (
          <span className="font-medium text-gray-600">
            {getInitials(name)}
          </span>
        ) : (
          <User className="h-1/2 w-1/2 text-gray-400" />
        )}

        {showBadge && (
          <span
            className={cn(
              'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
              size === 'xs' && 'h-1.5 w-1.5',
              size === 'sm' && 'h-2 w-2',
              size === 'md' && 'h-2.5 w-2.5',
              size === 'lg' && 'h-3 w-3',
              size === 'xl' && 'h-3.5 w-3.5',
              size === '2xl' && 'h-4 w-4',
              badgeColor
            )}
          />
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

export { Avatar, avatarVariants }
