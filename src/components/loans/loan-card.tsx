'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Avatar } from '@/components/ui/avatar'
import { CurrencyDisplay } from '@/components/ui/currency-display'
import { getDaysRemainingLabel, isOverdue } from '@/utils/date'
import { formatCurrency } from '@/utils/currency'
import type { Loan } from '@/types/app.types'

interface LoanCardProps {
  loan: Loan
  index?: number
}

export function LoanCard({ loan, index = 0 }: LoanCardProps) {
  const progress = loan.amount > 0 ? (loan.paid_amount / loan.amount) * 100 : 0
  const remaining = loan.amount - loan.paid_amount
  const overdue = isOverdue(loan.due_date) && loan.status !== 'completed'
  const completed = loan.status === 'completed'

  const progressColor = completed ? '#00D4AA' : overdue ? '#FF4D4D' : '#6C63FF'

  const StatusIcon = completed ? CheckCircle : overdue ? AlertCircle : Clock
  const statusColor = completed ? 'text-success' : overdue ? 'text-error' : 'text-warn'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link href={`/loans/${loan.id}`}>
        <div className="bg-surface border border-line rounded-2xl p-4 active:opacity-80 transition-opacity">
          <div className="flex items-center gap-3 mb-3">
            <Avatar name={loan.contact_name} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{loan.contact_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <StatusIcon size={12} className={statusColor} />
                <p className={`text-xs ${statusColor}`}>
                  {completed ? 'Completado' : getDaysRemainingLabel(loan.due_date)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <CurrencyDisplay
                amount={remaining}
                currency={loan.currency}
                className={`text-base font-bold ${loan.type === 'lent' ? 'text-success' : 'text-error'}`}
              />
              <p className="text-xs text-muted mt-0.5">
                de {formatCurrency(loan.amount, loan.currency)}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <ProgressBar value={progress} color={progressColor} height={5} />
            <div className="flex justify-between text-xs text-muted">
              <span>Pagado {Math.round(progress)}%</span>
              <span>
                {formatCurrency(loan.paid_amount, loan.currency)} de{' '}
                {formatCurrency(loan.amount, loan.currency)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
