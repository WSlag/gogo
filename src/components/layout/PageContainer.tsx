import { type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface PageContainerProps {
  children: ReactNode
  className?: string
  noPadding?: boolean
  noBottomPadding?: boolean
}

export function PageContainer({
  children,
  className,
  noPadding = false,
  noBottomPadding = false,
}: PageContainerProps) {
  return (
    <main
      className={cn(
        'flex-1',
        !noPadding && 'px-4',
        !noBottomPadding && 'pb-20', // Account for bottom nav
        className
      )}
    >
      {children}
    </main>
  )
}
