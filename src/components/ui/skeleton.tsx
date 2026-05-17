import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
  rounded?: string
}

export function Skeleton({ className, rounded = 'rounded-lg' }: SkeletonProps) {
  return <div className={cn('skeleton', rounded, className)} />
}

export function SkeletonCard() {
  return (
    <div className="bg-surface border border-line rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10" rounded="rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-2 w-full" rounded="rounded-full" />
    </div>
  )
}

export function SkeletonWalletCard() {
  return (
    <div className="rounded-2xl p-4 space-y-4" style={{ background: 'linear-gradient(135deg, #1C1F2E, #2A2D3E)', minWidth: 200 }}>
      <div className="flex justify-between">
        <Skeleton className="w-8 h-8" rounded="rounded-xl" />
        <Skeleton className="h-5 w-10" rounded="rounded-full" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-7 w-28" />
      </div>
    </div>
  )
}
