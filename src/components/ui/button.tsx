'use client'

import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'gradient-brand text-white shadow-lg shadow-brand/20',
    secondary: 'bg-elevated border border-line-light text-white',
    ghost: 'bg-transparent text-muted hover:bg-elevated',
    danger: 'bg-error/10 text-error border border-error/20',
    success: 'bg-success/10 text-success border border-success/20',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-5 py-3 text-base gap-2',
    lg: 'px-6 py-4 text-lg gap-2',
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </motion.button>
  )
}
