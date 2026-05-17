'use client'

import { useState } from 'react'
import { Drawer, DrawerField, DrawerInput } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { useLoans } from '@/hooks/use-loans'
import { useWallets } from '@/hooks/use-wallets'
import { toInputDate } from '@/utils/date'
import { cn } from '@/utils/cn'
import type { LoanType, Currency } from '@/types/app.types'

interface AddLoanDrawerProps {
  open: boolean
  onClose: () => void
  defaultType?: LoanType
}

export function AddLoanDrawer({ open, onClose, defaultType = 'lent' }: AddLoanDrawerProps) {
  const { create, isCreating } = useLoans()
  const { wallets } = useWallets()

  const today = toInputDate(new Date())

  const [form, setForm] = useState({
    type: defaultType,
    contact_name: '',
    amount: '',
    currency: 'USD' as Currency,
    due_date: '',
    interest_rate: '',
    wallet_id: '',
    notes: '',
    status: 'active' as const,
    paid_amount: 0,
    contact_avatar: null,
  })

  const handleSubmit = async () => {
    if (!form.contact_name.trim() || !form.amount) return
    await create({
      type: form.type,
      contact_name: form.contact_name.trim(),
      contact_avatar: null,
      amount: parseFloat(form.amount),
      currency: form.currency,
      paid_amount: 0,
      interest_rate: parseFloat(form.interest_rate) || 0,
      wallet_id: form.wallet_id || null,
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      notes: form.notes || null,
      status: 'active',
    })
    setForm({ type: defaultType, contact_name: '', amount: '', currency: 'USD', due_date: '', interest_rate: '', wallet_id: '', notes: '', status: 'active', paid_amount: 0, contact_avatar: null })
    onClose()
  }

  return (
    <Drawer open={open} onClose={onClose} title="Nuevo préstamo">
      <div className="space-y-5">
        {/* Loan Type */}
        <DrawerField label="Tipo">
          <div className="flex gap-3">
            <button
              onClick={() => setForm({ ...form, type: 'lent' })}
              className={cn(
                'flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors',
                form.type === 'lent'
                  ? 'border-success bg-success/10 text-success'
                  : 'border-line bg-surface text-muted'
              )}
            >
              💚 Presté
            </button>
            <button
              onClick={() => setForm({ ...form, type: 'borrowed' })}
              className={cn(
                'flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors',
                form.type === 'borrowed'
                  ? 'border-error bg-error/10 text-error'
                  : 'border-line bg-surface text-muted'
              )}
            >
              🔴 Me prestaron
            </button>
          </div>
        </DrawerField>

        <DrawerField label="Nombre del contacto">
          <DrawerInput
            placeholder="Ej: Juan Quispe"
            value={form.contact_name}
            onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
          />
        </DrawerField>

        <div className="flex gap-3">
          <DrawerField label="Monto" className="flex-1">
            <DrawerInput
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              min="0"
              step="0.01"
            />
          </DrawerField>
          <DrawerField label="Moneda" className="w-28">
            <div className="flex gap-1 h-full">
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

        <DrawerField label="Fecha límite (opcional)">
          <DrawerInput
            type="date"
            value={form.due_date}
            min={today}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            style={{ colorScheme: 'dark' }}
          />
        </DrawerField>

        <DrawerField label="Interés % (opcional)">
          <DrawerInput
            type="number"
            placeholder="0"
            value={form.interest_rate}
            onChange={(e) => setForm({ ...form, interest_rate: e.target.value })}
            min="0"
            max="100"
            step="0.1"
          />
        </DrawerField>

        {wallets.length > 0 && (
          <DrawerField label="Cuenta origen (opcional)">
            <select
              value={form.wallet_id}
              onChange={(e) => setForm({ ...form, wallet_id: e.target.value })}
              className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-white text-sm"
              style={{ colorScheme: 'dark' }}
            >
              <option value="">Sin cuenta asociada</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} — {w.currency}
                </option>
              ))}
            </select>
          </DrawerField>
        )}

        <DrawerField label="Notas (opcional)">
          <textarea
            placeholder="Agrega un comentario..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-white text-sm resize-none"
          />
        </DrawerField>

        <Button
          fullWidth
          onClick={handleSubmit}
          loading={isCreating}
          disabled={!form.contact_name.trim() || !form.amount}
        >
          Registrar préstamo
        </Button>
      </div>
    </Drawer>
  )
}
