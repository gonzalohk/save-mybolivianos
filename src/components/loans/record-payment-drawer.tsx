'use client'

import { useState } from 'react'
import { Drawer, DrawerField, DrawerInput } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { useLoans } from '@/hooks/use-loans'
import { toInputDate } from '@/utils/date'
import { cn } from '@/utils/cn'
import type { Loan, Currency } from '@/types/app.types'

interface RecordPaymentDrawerProps {
  open: boolean
  onClose: () => void
  loan: Loan
}

export function RecordPaymentDrawer({ open, onClose, loan }: RecordPaymentDrawerProps) {
  const { addPayment, isAddingPayment } = useLoans()
  const today = toInputDate(new Date())

  const [form, setForm] = useState({
    amount: '',
    currency: loan.currency,
    payment_date: today,
    notes: '',
  })

  const remaining = loan.amount - loan.paid_amount

  const handleSubmit = async () => {
    if (!form.amount) return
    await addPayment({
      loan_id: loan.id,
      amount: parseFloat(form.amount),
      currency: form.currency,
      payment_date: new Date(form.payment_date + 'T12:00:00').toISOString(),
      notes: form.notes || undefined,
    })
    setForm({ amount: '', currency: loan.currency, payment_date: today, notes: '' })
    onClose()
  }

  return (
    <Drawer open={open} onClose={onClose} title="Registrar pago">
      <div className="space-y-5">
        {/* Loan info */}
        <div className="bg-surface border border-line rounded-2xl p-4">
          <p className="text-sm text-muted mb-1">Préstamo con</p>
          <p className="font-bold text-white">{loan.contact_name}</p>
          <p className="text-sm text-muted mt-1">
            Pendiente:{' '}
            <span className="text-error font-semibold">
              {remaining} {loan.currency}
            </span>
          </p>
        </div>

        <div className="flex gap-3">
          <DrawerField label="Monto pagado" className="flex-1">
            <DrawerInput
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              min="0"
              max={remaining.toString()}
              step="0.01"
            />
          </DrawerField>
          <DrawerField label="Moneda" className="w-28">
            <div className="flex gap-1">
              {(['USD', 'BOB'] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, currency: c })}
                  className={cn(
                    'flex-1 rounded-xl border text-xs font-bold transition-colors py-3',
                    form.currency === c
                      ? c === 'USD' ? 'border-success bg-success/10 text-success' : 'border-bob bg-bob/10 text-bob'
                      : 'border-line bg-surface text-muted'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </DrawerField>
        </div>

        <DrawerField label="Fecha de pago">
          <DrawerInput
            type="date"
            value={form.payment_date}
            onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
            style={{ colorScheme: 'dark' }}
          />
        </DrawerField>

        <DrawerField label="Notas (opcional)">
          <textarea
            placeholder="Comentario del pago..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-white text-sm resize-none"
          />
        </DrawerField>

        <Button
          fullWidth
          onClick={handleSubmit}
          loading={isAddingPayment}
          disabled={!form.amount || parseFloat(form.amount) <= 0}
        >
          Confirmar pago
        </Button>
      </div>
    </Drawer>
  )
}
