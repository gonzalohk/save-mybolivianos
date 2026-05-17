import { cn } from '@/utils/cn'

interface BadgeProps {
  label: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'brand' | 'muted'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ label, variant = 'default', size = 'sm', className }: BadgeProps) {
  const variants = {
    default: 'bg-line-light text-muted',
    success: 'bg-success/15 text-success',
    error: 'bg-error/15 text-error',
    warning: 'bg-warn/15 text-warn',
    brand: 'bg-brand/15 text-brand',
    muted: 'bg-elevated text-faint',
  }
  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {label}
    </span>
  )
}
