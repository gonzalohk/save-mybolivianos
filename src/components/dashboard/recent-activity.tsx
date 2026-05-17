'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react'
import { transactionsService } from '@/services/transactions.service'
import { formatCurrency } from '@/utils/currency'
import { formatRelativeTime } from '@/utils/date'
import { SkeletonCard } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import type { TransactionWithWallet } from '@/types/app.types'

function TransactionItem({ tx, index }: { tx: TransactionWithWallet; index: number }) {
  const isIncome = tx.type === 'income'
  const isTransfer = tx.type === 'transfer'

  const Icon = isTransfer ? ArrowLeftRight : isIncome ? ArrowDownLeft : ArrowUpRight
  const iconColor = isTransfer ? '#6C63FF' : isIncome ? '#00D4AA' : '#FF4D4D'
  const amountColor = isTransfer ? 'text-brand' : isIncome ? 'text-success' : 'text-error'
  const prefix = isIncome ? '+' : isTransfer ? '' : '-'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 py-3 border-b border-line last:border-0"
    >
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        <Icon size={18} style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {tx.description ?? (isIncome ? 'Ingreso' : isTransfer ? 'Transferencia' : 'Gasto')}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {tx.wallets && (
            <>
              <span
                className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: tx.wallets.color }}
              />
              <span className="text-xs text-muted truncate">{tx.wallets.name}</span>
              <span className="text-xs text-muted/40">·</span>
            </>
          )}
          <span className="text-xs text-muted shrink-0">{formatRelativeTime(tx.date)}</span>
        </div>
      </div>
      <p className={`text-sm font-semibold tabular-nums ${amountColor}`}>
        {prefix}{formatCurrency(tx.amount, tx.currency)}
      </p>
    </motion.div>
  )
}

export function RecentActivity() {
  const { data, isLoading } = useQuery({
    queryKey: ['transactions', 'recent', 10],
    queryFn: () => transactionsService.getRecent(10),
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (!data?.length) {
    return (
      <EmptyState
        icon="💸"
        title="Sin actividad reciente"
        description="Tus transacciones aparecerán aquí"
      />
    )
  }

  return (
    <div className="bg-surface border border-line rounded-2xl overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-sm font-semibold text-muted">Actividad reciente</h3>
      </div>
      <div className="px-4">
        {data.map((tx, i) => (
          <TransactionItem key={tx.id} tx={tx} index={i} />
        ))}
      </div>
    </div>
  )
}
