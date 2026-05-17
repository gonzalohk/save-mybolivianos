import { cn } from '@/utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  glass?: boolean
  onClick?: () => void
}

export function Card({ children, className, glass, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl overflow-hidden',
        glass ? 'glass' : 'bg-surface border border-line',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

interface GradientCardProps {
  children: React.ReactNode
  className?: string
  gradient?: string
}

export function GradientCard({ children, className, gradient }: GradientCardProps) {
  return (
    <div
      className={cn('rounded-3xl overflow-hidden p-5', className)}
      style={{ background: gradient ?? 'linear-gradient(135deg, #6C63FF 0%, #4FACFE 100%)' }}
    >
      {children}
    </div>
  )
}
