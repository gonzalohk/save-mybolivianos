'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Trash2, Calendar, FileText } from 'lucide-react'
import { useLoan, useLoanPayments, useLoans, useDeletePayment } from '@/hooks/use-loans'
import { ProgressRing } from '@/components/ui/progress-ring'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RecordPaymentDrawer } from '@/components/loans/record-payment-drawer'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/utils/currency'
import { formatDate, getDaysRemainingLabel, isOverdue } from '@/utils/date'
import { calculateLoanTotals } from '@/utils/loan-interest'

export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: loan, isLoading } = useLoan(id)
  const { data: payments = [] } = useLoanPayments(id)
  const { remove } = useLoans()
  const deletePayment = useDeletePayment(id)
  const [showPayment, setShowPayment] = useState(false)

  if (isLoading) {
    return (
      <div className="px-4 pt-5 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 rounded-3xl" />
      </div>
    )
  }

  if (!loan) return null

  const { totalWithInterest, interestAccrued, elapsedMonths, remaining, progress } = calculateLoanTotals(loan)
  const overdue = isOverdue(loan.due_date) && loan.status !== 'completed'
  const completed = loan.status === 'completed'

  const progressColor = completed ? '#00D4AA' : overdue ? '#FF4D4D' : '#6C63FF'

  const statusVariant = completed ? 'success' : overdue ? 'error' : 'brand'
  const statusLabel = completed ? 'Completado' : overdue ? 'Vencido' : 'Activo'

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar préstamo con ${loan.contact_name}?`)) return
    await remove(loan.id)
    router.push('/loans')
  }

  return (
    <div className="px-4 pt-5 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 bg-surface border border-line rounded-2xl flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-muted" />
        </button>
        <h1 className="text-xl font-bold text-white flex-1">Detalle</h1>
        <button
          onClick={handleDelete}
          className="w-10 h-10 bg-error/10 border border-error/20 rounded-2xl flex items-center justify-center"
        >
          <Trash2 size={16} className="text-error" />
        </button>
      </div>

      {/* Progress card */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-line rounded-3xl p-6 mb-4"
      >
        <div className="flex items-center gap-5">
          <ProgressRing value={progress} color={progressColor} size={88} strokeWidth={7}>
            <span className="text-sm font-bold" style={{ color: progressColor }}>
              {Math.round(progress)}%
            </span>
          </ProgressRing>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold text-white">{loan.contact_name}</h2>
              <Badge label={statusLabel} variant={statusVariant} />
            </div>
            <p className="text-sm text-muted mb-1">
              {loan.type === 'lent' ? 'Te debe' : 'Debes'}
            </p>
            <p className="text-2xl font-bold" style={{ color: loan.type === 'lent' ? '#00D4AA' : '#FF4D4D' }}>
              {formatCurrency(remaining, loan.currency)}
            </p>
            <p className="text-xs text-muted mt-1">
              Pagado {formatCurrency(loan.paid_amount, loan.currency)} de {formatCurrency(totalWithInterest, loan.currency)}
              {loan.interest_rate > 0 && (
                <span className="text-muted/60"> (capital + interés)</span>
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Details */}
      <div className="bg-surface border border-line rounded-2xl divide-y divide-line overflow-hidden mb-4">
        {loan.due_date && (
          <div className="flex items-center gap-3 px-4 py-3">
            <Calendar size={16} className="text-muted" />
            <span className="text-sm text-muted flex-1">Fecha límite</span>
            <span className={`text-sm font-medium ${overdue ? 'text-error' : 'text-white'}`}>
              {formatDate(loan.due_date)}
            </span>
          </div>
        )}
        {loan.due_date && (
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-sm text-muted flex-1 pl-7">{getDaysRemainingLabel(loan.due_date)}</span>
          </div>
        )}
        {loan.interest_rate > 0 && (
          <>
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-sm text-muted flex-1">Interés mensual</span>
              <span className="text-sm font-medium text-amber-400">{loan.interest_rate}% / mes</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-sm text-muted flex-1">
                Interés acumulado
                {elapsedMonths > 0 && (
                  <span className="text-muted/60 ml-1">({elapsedMonths} {elapsedMonths === 1 ? 'mes' : 'meses'})</span>
                )}
              </span>
              <span className="text-sm font-medium text-amber-400">+{formatCurrency(interestAccrued, loan.currency)}</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-sm text-muted flex-1">Total a pagar</span>
              <span className="text-sm font-semibold text-white">{formatCurrency(totalWithInterest, loan.currency)}</span>
            </div>
          </>
        )}
        {loan.notes && (
          <div className="flex items-start gap-3 px-4 py-3">
            <FileText size={16} className="text-muted mt-0.5" />
            <span className="text-sm text-muted">{loan.notes}</span>
          </div>
        )}
      </div>

      {/* Payments history */}
      {payments.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-muted mb-3">Historial de pagos</h3>
          <div className="bg-surface border border-line rounded-2xl overflow-hidden">
            {payments.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 border-b border-line last:border-0">
                <div className="w-8 h-8 bg-success/10 rounded-xl flex items-center justify-center text-xs font-bold text-success">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{formatDate(p.payment_date)}</p>
                  {p.notes && <p className="text-xs text-muted">{p.notes}</p>}
                </div>
                <p className="text-sm font-semibold text-success">
                  +{formatCurrency(p.amount, p.currency)}
                </p>
                <button
                  onClick={() => deletePayment.mutate(p.id)}
                  disabled={deletePayment.isPending}
                  className="w-7 h-7 flex items-center justify-center text-muted/40 hover:text-error transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!completed && (
        <Button fullWidth onClick={() => setShowPayment(true)}>
          Registrar pago
        </Button>
      )}

      {loan && (
        <RecordPaymentDrawer
          open={showPayment}
          onClose={() => setShowPayment(false)}
          loan={loan}
        />
      )}
    </div>
  )
}
