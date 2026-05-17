'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Scale } from 'lucide-react'
import { useLoans } from '@/hooks/use-loans'
import { useExchangeRateStore } from '@/stores/exchange-rate-store'
import { useUIStore } from '@/stores/ui-store'
import { formatCurrency } from '@/utils/currency'
import { Skeleton } from '@/components/ui/skeleton'

export function QuickStats() {
  const { totalLentUSD, totalBorrowedUSD, isLoading } = useLoans()
  const { bobPerUsd } = useExchangeRateStore()
  const { privacyMode } = useUIStore()

  const lentBOB = totalLentUSD * bobPerUsd
  const borrowedBOB = totalBorrowedUSD * bobPerUsd
  const netBOB = lentBOB - borrowedBOB

  const stats = [
    {
      label: 'Me deben',
      value: lentBOB,
      icon: TrendingUp,
      color: '#00D4AA',
      style: { background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.18)' },
    },
    {
      label: 'Debo',
      value: borrowedBOB,
      icon: TrendingDown,
      color: '#FF4D4D',
      style: { background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.18)' },
    },
    {
      label: 'Saldo Neto',
      value: netBOB,
      icon: Scale,
      color: netBOB >= 0 ? '#94A3B8' : '#FF4D4D',
      style: { background: 'rgba(148,163,184,0.07)', border: '1px solid rgba(148,163,184,0.14)' },
    },
  ]

  if (isLoading) {
    return (
      <div className="flex gap-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 bg-surface border border-line rounded-2xl p-3.5 space-y-2">
            <Skeleton className="w-7 h-7 bg-elevated" />
            <Skeleton className="h-2.5 w-10 bg-elevated" />
            <Skeleton className="h-4 w-14 bg-elevated" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-2.5">
      {stats.map(({ label, value, icon: Icon, color, style }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="flex-1 rounded-2xl p-3.5"
          style={style}
        >
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center mb-2.5"
            style={{ backgroundColor: `${color}1A` }}
          >
            <Icon size={14} style={{ color }} />
          </div>
          <p className="text-[11px] font-medium text-muted leading-none mb-1.5">{label}</p>
          <p className="text-[13px] font-bold leading-tight" style={{ color }}>
            {privacyMode ? '••••' : formatCurrency(value, 'BOB')}
          </p>
        </motion.div>
      ))}
    </div>
  )
}

