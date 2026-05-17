import { cn } from '@/utils/cn'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

function getAvatarColor(name: string): string {
  const colors = [
    'linear-gradient(135deg, #6C63FF, #4FACFE)',
    'linear-gradient(135deg, #00D4AA, #00F5D4)',
    'linear-gradient(135deg, #FF4D4D, #FF6B6B)',
    'linear-gradient(135deg, #FFB347, #FFD700)',
    'linear-gradient(135deg, #FF6B9D, #FF8E9E)',
    'linear-gradient(135deg, #845EC2, #D65DB1)',
    'linear-gradient(135deg, #F5C518, #FFB347)',
    'linear-gradient(135deg, #4FACFE, #00D4AA)',
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-16 h-16 text-xl',
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-white shrink-0',
        sizes[size],
        className
      )}
      style={{ background: getAvatarColor(name) }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}
