import {
  forwardRef,
  type ReactNode,
  useEffect,
  useCallback,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from './Button'

export interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  showHandle?: boolean
  showCloseButton?: boolean
  snapPoints?: number[]
  defaultSnapPoint?: number
  closeOnOverlayClick?: boolean
  className?: string
}

const BottomSheet = forwardRef<HTMLDivElement, BottomSheetProps>(
  (
    {
      isOpen,
      onClose,
      children,
      title,
      showHandle = true,
      showCloseButton = false,
      snapPoints = [0.5, 0.9],
      defaultSnapPoint = 0,
      closeOnOverlayClick = true,
      className,
    },
    ref
  ) => {
    const sheetRef = useRef<HTMLDivElement>(null)
    const [currentHeight, setCurrentHeight] = useState(snapPoints[defaultSnapPoint])
    const [isDragging, setIsDragging] = useState(false)
    const startY = useRef(0)
    const startHeight = useRef(0)

    // Handle drag start
    const handleDragStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
      setIsDragging(true)
      startY.current = 'touches' in e ? e.touches[0].clientY : e.clientY
      startHeight.current = currentHeight
    }, [currentHeight])

    // Handle drag move
    const handleDragMove = useCallback((e: TouchEvent | MouseEvent) => {
      if (!isDragging) return

      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      const deltaY = startY.current - clientY
      const windowHeight = window.innerHeight
      const newHeight = startHeight.current + (deltaY / windowHeight)

      // Clamp between min and max snap points
      const clampedHeight = Math.max(0.1, Math.min(0.95, newHeight))
      setCurrentHeight(clampedHeight)
    }, [isDragging])

    // Handle drag end
    const handleDragEnd = useCallback(() => {
      if (!isDragging) return
      setIsDragging(false)

      // Snap to closest snap point
      const closest = snapPoints.reduce((prev, curr) =>
        Math.abs(curr - currentHeight) < Math.abs(prev - currentHeight) ? curr : prev
      )

      // Close if dragged below minimum threshold
      if (currentHeight < 0.15) {
        onClose()
      } else {
        setCurrentHeight(closest)
      }
    }, [isDragging, currentHeight, snapPoints, onClose])

    useEffect(() => {
      if (isDragging) {
        window.addEventListener('touchmove', handleDragMove)
        window.addEventListener('mousemove', handleDragMove)
        window.addEventListener('touchend', handleDragEnd)
        window.addEventListener('mouseup', handleDragEnd)

        return () => {
          window.removeEventListener('touchmove', handleDragMove)
          window.removeEventListener('mousemove', handleDragMove)
          window.removeEventListener('touchend', handleDragEnd)
          window.removeEventListener('mouseup', handleDragEnd)
        }
      }
    }, [isDragging, handleDragMove, handleDragEnd])

    // Reset height when opening
    useEffect(() => {
      if (isOpen) {
        setCurrentHeight(snapPoints[defaultSnapPoint])
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }

      return () => {
        document.body.style.overflow = ''
      }
    }, [isOpen, snapPoints, defaultSnapPoint])

    if (!isOpen) return null

    return createPortal(
      <div className="fixed inset-0 z-50">
        {/* Overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-black/50 transition-opacity',
            isDragging ? 'opacity-50' : 'opacity-100'
          )}
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />

        {/* Bottom Sheet */}
        <div
          ref={ref || sheetRef}
          role="dialog"
          aria-modal="true"
          className={cn(
            'absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white shadow-xl',
            !isDragging && 'transition-all duration-300 ease-out',
            className
          )}
          style={{ height: `${currentHeight * 100}vh` }}
        >
          {/* Handle */}
          {showHandle && (
            <div
              className="flex cursor-grab items-center justify-center py-3 active:cursor-grabbing"
              onTouchStart={handleDragStart}
              onMouseDown={handleDragStart}
            >
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>
          )}

          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between border-b border-gray-100 px-4 pb-3">
              {title && (
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              )}
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="h-full overflow-y-auto px-4 pb-safe">
            {children}
          </div>
        </div>
      </div>,
      document.body
    )
  }
)

BottomSheet.displayName = 'BottomSheet'

export { BottomSheet }
