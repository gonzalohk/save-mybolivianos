'use client'

import { useState } from 'react'
import { Drawer, DrawerField, DrawerInput } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { useWallets } from '@/hooks/use-wallets'
import { WALLET_TYPES, WALLET_COLORS, type WalletType, type Currency } from '@/types/app.types'
import { cn } from '@/utils/cn'

interface AddWalletDrawerProps {
  open: boolean
  onClose: () => void
}

export function AddWalletDrawer({ open, onClose }: AddWalletDrawerProps) {
  const { create, isCreating } = useWallets()
  const [form, setForm] = useState({
    name: '',
    type: 'cash' as WalletType,
    currency: 'USD' as Currency,
    balance: '',
    color: WALLET_COLORS[0],
    icon: '💰',
    is_active: true,
  })

  const handleSubmit = async () => {
    if (!form.name.trim()) return
    const typeConfig = WALLET_TYPES.find((t) => t.type === form.type)
    await create({
      name: form.name.trim(),
      type: form.type,
      currency: form.currency,
      balance: parseFloat(form.balance) || 0,
      color: form.color,
      icon: typeConfig?.icon ?? '💰',
      is_active: true,
      exclude_from_total: false,
    })
    setForm({ name: '', type: 'cash', currency: 'USD', balance: '', color: WALLET_COLORS[0], icon: '💰', is_active: true })
    onClose()
  }

  return (
    <Drawer open={open} onClose={onClose} title="Nueva cuenta">
      <div className="space-y-5">
        <DrawerField label="Nombre">
          <DrawerInput
            placeholder="Ej: Banco BCP, Efectivo USD..."
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </DrawerField>

        <DrawerField label="Tipo">
          <div className="grid grid-cols-3 gap-2">
            {WALLET_TYPES.map((t) => (
              <button
                key={t.type}
                onClick={() => setForm({ ...form, type: t.type })}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors',
                  form.type === t.type
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'border-line bg-surface text-muted'
                )}
              >
                <span className="text-xl">{t.icon}</span>
                <span className="text-xs font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </DrawerField>

        <DrawerField label="Moneda">
          <div className="flex gap-3">
            {(['USD', 'BOB'] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setForm({ ...form, currency: c })}
                className={cn(
                  'flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors',
                  form.currency === c
                    ? c === 'USD'
                      ? 'border-success bg-success/10 text-success'
                      : 'border-bob bg-bob/10 text-bob'
                    : 'border-line bg-surface text-muted'
                )}
              >
                {c === 'USD' ? '$ USD' : 'Bs BOB'}
              </button>
            ))}
          </div>
        </DrawerField>

        <DrawerField label="Balance inicial">
          <DrawerInput
            type="number"
            placeholder="0.00"
            value={form.balance}
            onChange={(e) => setForm({ ...form, balance: e.target.value })}
            min="0"
            step="0.01"
          />
        </DrawerField>

        <DrawerField label="Color">
          <div className="flex gap-2 flex-wrap">
            {WALLET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setForm({ ...form, color })}
                className={cn(
                  'w-9 h-9 rounded-full transition-all',
                  form.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-elevated scale-110' : ''
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </DrawerField>

        <Button fullWidth onClick={handleSubmit} loading={isCreating} disabled={!form.name.trim()}>
          Crear cuenta
        </Button>
      </div>
    </Drawer>
  )
}
