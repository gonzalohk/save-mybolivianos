'use client'

import { motion } from 'framer-motion'

interface ProgressRingProps {
  value: number // 0-100
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  children?: React.ReactNode
}

export function ProgressRing({
  value,
  size = 96,
  strokeWidth = 8,
  color = '#6C63FF',
  trackColor = '#1E2030',
  children,
}: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 absolute">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (clamped / 100) * circumference }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
