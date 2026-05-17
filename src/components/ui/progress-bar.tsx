'use client'

import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface ProgressBarProps {
  value: number // 0-100
  color?: string
  height?: number
  className?: string
  animated?: boolean
}

export function ProgressBar({
  value,
  color = '#6C63FF',
  height = 6,
  className,
  animated = true,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div
      className={cn('rounded-full overflow-hidden bg-line-light', className)}
      style={{ height }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={animated ? { width: 0 } : { width: `${clamped}%` }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  )
}
