import type { SVGProps } from 'react'

interface PesoSignProps extends SVGProps<SVGSVGElement> {
  size?: number | string
}

export function PesoSign({ size = 24, className, ...props }: PesoSignProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fontSize="16"
        fontWeight="bold"
        fill="currentColor"
        stroke="none"
      >
        ₱
      </text>
    </svg>
  )
}

export default PesoSign
