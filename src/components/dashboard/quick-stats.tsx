'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { useLoans } from '@/hooks/use-loans'
import { useWallets } from '@/hooks/use-wallets'
import { useUIStore } from '@/stores/ui-store'
import { formatCurrency } from '@/utils/currency'
import { Skeleton } from '@/components/ui/skeleton'

export function QuickStats() {
  const { totalLentUSD, totalBorrowedUSD, isLoading: loansLoading } = useLoans()
  const { totalUSD, isLoading: walletsLoading } = useWallets()
  const { privacyMode } = useUIStore()
  const isLoading = loansLoading || walletsLoading

  const stats = [
    {
      label: 'Me deben',
      value: totalLentUSD,
      icon: TrendingUp,
      color: '#00D4AA',
      bg: 'bg-success/10',
    },
    {
      label: 'Debo',
      value: totalBorrowedUSD,
      icon: TrendingDown,
      color: '#FF4D4D',
      bg: 'bg-error/10',
    },
    {
      label: 'Saldo total',
      value: totalUSD,
      icon: DollarSign,
      color: '#6C63FF',
      bg: 'bg-brand/10',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 bg-surface border border-line rounded-2xl p-3 space-y-2">
            <Skeleton className="w-6 h-6 bg-line-light" rounded="rounded-lg" />
            <Skeleton className="h-3 w-10 bg-line-light" />
            <Skeleton className="h-5 w-16 bg-line-light" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      {stats.map(({ label, value, icon: Icon, color, bg }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`flex-1 ${bg} rounded-2xl p-3 border border-line`}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon size={16} style={{ color }} />
          </div>
          <p className="text-xs text-muted mb-1">{label}</p>
          <p className="text-sm font-bold" style={{ color }}>
            {privacyMode ? '••••' : formatCurrency(value, 'USD')}
          </p>
        </motion.div>
      ))}
    </div>
  )
}
