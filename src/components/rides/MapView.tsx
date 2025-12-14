import { useRef, useState } from 'react'
import { cn } from '@/utils/cn'
import type { GeoPoint } from 'firebase/firestore'

interface MapViewProps {
  pickup?: { coordinates: GeoPoint | null; address?: string } | null
  dropoff?: { coordinates: GeoPoint | null; address?: string } | null
  className?: string
  showRoute?: boolean
  interactive?: boolean
  onMapClick?: () => void
}

// Cotabato City center coordinates
const COTABATO_CENTER = { lat: 7.2236, lng: 124.2464 }

export function MapView({
  pickup,
  dropoff,
  className,
  showRoute = true,
  interactive = false,
  onMapClick
}: MapViewProps) {
  const [imageError, setImageError] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)

  // Build Mapbox static map URL
  const buildMapUrl = () => {
    const center = pickup?.coordinates
      ? `${pickup.coordinates.longitude},${pickup.coordinates.latitude}`
      : `${COTABATO_CENTER.lng},${COTABATO_CENTER.lat}`

    const markers: string[] = []

    // Add pickup marker (green)
    if (pickup?.coordinates) {
      markers.push(
        `pin-s-circle+22c55e(${pickup.coordinates.longitude},${pickup.coordinates.latitude})`
      )
    }

    // Add dropoff marker (red)
    if (dropoff?.coordinates) {
      markers.push(
        `pin-s-marker+ef4444(${dropoff.coordinates.longitude},${dropoff.coordinates.latitude})`
      )
    }

    const markersStr = markers.length > 0 ? `${markers.join(',')}/` : ''
    const zoom = pickup?.coordinates && dropoff?.coordinates ? 'auto' : '13'

    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${markersStr}${center},${zoom},0/800x400@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`
  }

  return (
    <div
      ref={mapRef}
      className={cn('relative overflow-hidden bg-gray-100', className)}
      onClick={interactive ? onMapClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {/* Map Image */}
      {!imageError && (
        <img
          src={buildMapUrl()}
          alt="Map"
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}

      {/* SVG Fallback Map */}
      {imageError && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #e8f4e8 0%, #d4e8d4 50%, #c5dff0 100%)'
          }}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 800 400"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Water bodies */}
            <ellipse
              cx="650"
              cy="320"
              rx="180"
              ry="120"
              fill="#a8d5f2"
              opacity="0.6"
            />
            <ellipse
              cx="150"
              cy="380"
              rx="100"
              ry="60"
              fill="#a8d5f2"
              opacity="0.4"
            />

            {/* Major roads */}
            <path
              d="M 0 150 Q 200 130 400 150 T 800 140"
              stroke="#ffffff"
              strokeWidth="12"
              fill="none"
            />
            <path
              d="M 0 250 Q 300 230 600 250 T 800 240"
              stroke="#ffffff"
              strokeWidth="10"
              fill="none"
            />
            <path
              d="M 200 0 Q 180 200 200 400"
              stroke="#ffffff"
              strokeWidth="10"
              fill="none"
            />
            <path
              d="M 500 0 Q 520 200 500 400"
              stroke="#ffffff"
              strokeWidth="12"
              fill="none"
            />

            {/* Secondary roads */}
            <path
              d="M 0 80 L 800 80"
              stroke="#e8e8e8"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M 0 320 L 800 320"
              stroke="#e8e8e8"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M 350 0 L 350 400"
              stroke="#e8e8e8"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M 650 0 L 650 400"
              stroke="#e8e8e8"
              strokeWidth="4"
              fill="none"
            />

            {/* Land blocks */}
            <rect x="220" y="100" width="110" height="80" fill="#d4e6d4" rx="4" />
            <rect x="520" y="160" width="100" height="70" fill="#d4e6d4" rx="4" />
            <rect x="60" y="260" width="120" height="50" fill="#d4e6d4" rx="4" />
            <rect x="380" y="280" width="90" height="60" fill="#d4e6d4" rx="4" />

            {/* Location labels - Cotabato City */}
            <text
              x="100"
              y="200"
              fill="#666"
              fontSize="10"
              fontFamily="sans-serif"
            >
              Poblacion VIII
            </text>
            <text
              x="300"
              y="120"
              fill="#666"
              fontSize="10"
              fontFamily="sans-serif"
            >
              Rosary Heights
            </text>
            <text
              x="520"
              y="100"
              fill="#666"
              fontSize="10"
              fontFamily="sans-serif"
            >
              KCC Mall
            </text>
            <text
              x="620"
              y="280"
              fill="#666"
              fontSize="10"
              fontFamily="sans-serif"
            >
              Rio Grande
            </text>
            <text
              x="400"
              y="340"
              fill="#666"
              fontSize="10"
              fontFamily="sans-serif"
            >
              Mega Square
            </text>

            {/* Pickup marker */}
            {pickup?.coordinates && (
              <>
                <circle cx="280" cy="180" r="20" fill="#22c55e" opacity="0.2" />
                <circle cx="280" cy="180" r="8" fill="#22c55e" />
                <circle cx="280" cy="180" r="4" fill="#ffffff" />
              </>
            )}

            {/* Dropoff marker */}
            {dropoff?.coordinates && (
              <g transform="translate(480, 220)">
                <path
                  d="M 0 -20 C -10 -20 -16 -10 -16 0 C -16 10 0 24 0 24 C 0 24 16 10 16 0 C 16 -10 10 -20 0 -20"
                  fill="#ef4444"
                />
                <circle cx="0" cy="-6" r="5" fill="#ffffff" />
              </g>
            )}

            {/* Route line */}
            {showRoute && pickup?.coordinates && dropoff?.coordinates && (
              <path
                d="M 280 180 Q 350 160 400 180 Q 450 200 480 220"
                stroke="#3b82f6"
                strokeWidth="4"
                strokeDasharray="8,6"
                fill="none"
                opacity="0.8"
              />
            )}
          </svg>
        </div>
      )}

      {/* Map overlay gradient for better visibility at edges */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

      {/* Interactive overlay */}
      {interactive && (
        <div className="absolute inset-0 cursor-pointer hover:bg-black/5 transition-colors" />
      )}
    </div>
  )
}
