import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface StickySearchBarProps {
  className?: string
  onSearch?: (query: string) => void
}

export function StickySearchBar({
  className,
  onSearch
}: StickySearchBarProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY

          // Show on scroll up, hide on scroll down
          // Only trigger after scrolling past 100px
          if (currentScrollY > 100) {
            if (currentScrollY < lastScrollY.current) {
              setIsVisible(true)
            } else if (currentScrollY > lastScrollY.current + 10) {
              setIsVisible(false)
            }
          } else {
            setIsVisible(true)
          }

          lastScrollY.current = currentScrollY
          ticking.current = false
        })
        ticking.current = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    onSearch?.(e.target.value)
  }

  const handleClear = () => {
    setSearchQuery('')
    onSearch?.('')
  }

  return (
    <div
      className={cn(
        'sticky z-30 bg-white/95 backdrop-blur-sm transition-all duration-300 ease-out lg:hidden',
        isVisible ? 'top-14 translate-y-0 opacity-100' : 'top-14 -translate-y-full opacity-0 pointer-events-none',
        className
      )}
    >
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleChange}
            placeholder="Search..."
            className="h-12 w-full rounded-full bg-gray-100 px-5 pr-10 text-sm text-gray-900 placeholder-gray-500 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-300 border border-transparent"
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
