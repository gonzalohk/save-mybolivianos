'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Trash2, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react'
import { useWallet, useWallets, useCreateTransaction, useDeleteTransaction } from '@/hooks/use-wallets'
import { transactionsService } from '@/services/transactions.service'
import { WALLET_TYPES } from '@/types/app.types'
import { CurrencyDisplay } from '@/components/ui/currency-display'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Drawer, DrawerField, DrawerInput } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { formatRelativeTime, toInputDate } from '@/utils/date'
import { formatCurrency } from '@/utils/currency'
import { cn } from '@/utils/cn'
import type { TransactionType, Currency } from '@/types/app.types'

// ─────────────────────────────────────────────────────────────
// AddTransactionDrawer
//
// Drawer (panel inferior) que permite registrar un movimiento
// en una cuenta específica. Soporta dos tipos:
//   - 'income'  → Agregar fondos (suma al balance)
//   - 'expense' → Retirar (resta del balance)
//
// El balance de la cuenta se actualiza automáticamente en la
// base de datos a través del trigger `handle_transaction_balance`
// definido en la migración SQL. No necesitas actualizar el
// balance manualmente desde el frontend.
//
// Props:
//   open            → controla si el drawer está visible
//   onClose         → función para cerrarlo
//   walletId        → UUID de la cuenta afectada
//   walletCurrency  → moneda de la cuenta ('USD' | 'BOB')
//   defaultType     → qué tab aparece activo al abrir ('income' | 'expense')
// ─────────────────────────────────────────────────────────────
function AddTransactionDrawer({
  open,
  onClose,
  walletId,
  walletCurrency,
  defaultType,
}: {
  open: boolean
  onClose: () => void
  walletId: string
  walletCurrency: Currency
  defaultType: TransactionType
}) {
  // Hook con la mutación que llama a transactionsService.create()
  // y refresca los caches de wallets y transactions al terminar
  const createTx = useCreateTransaction()

  const today = toInputDate(new Date())

  const [form, setForm] = useState({
    type: defaultType,        // 'income' o 'expense'
    amount: '',               // monto como string para el input
    description: '',          // descripción opcional
    date: today,              // fecha en formato YYYY-MM-DD
  })

  // Valida y envía el formulario a Supabase
  const handleSubmit = async () => {
    if (!form.amount || parseFloat(form.amount) <= 0) return

    await createTx.mutateAsync({
      wallet_id: walletId,
      category_id: null,                               // sin categoría por ahora
      amount: parseFloat(form.amount),
      currency: walletCurrency,
      type: form.type,
      description: form.description || null,
      date: new Date(form.date + 'T12:00:00').toISOString(),         // convierte a ISO 8601 en hora local
    })

    // Limpia el form y cierra el drawer al guardar exitosamente
    setForm({ type: defaultType, amount: '', description: '', date: today })
    onClose()
  }

  const isIncome = form.type === 'income'

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isIncome ? 'Agregar fondos' : 'Registrar retiro'}
    >
      <div className="space-y-5">
        {/* Selector de tipo: Ingreso ↔ Retiro */}
        <DrawerField label="Tipo de movimiento">
          <div className="flex gap-3">
            {(['income', 'expense'] as TransactionType[]).map((t) => (
              <button
                key={t}
                onClick={() => setForm({ ...form, type: t })}
                className={cn(
                  'flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors',
                  form.type === t
                    ? t === 'income'
                      ? 'border-success bg-success/10 text-success'
                      : 'border-error bg-error/10 text-error'
                    : 'border-line bg-surface text-muted'
                )}
              >
                {t === 'income' ? '⬇️ Ingreso' : '⬆️ Retiro'}
              </button>
            ))}
          </div>
        </DrawerField>

        {/* Campo de monto con símbolo de la moneda */}
        <DrawerField label={`Monto (${walletCurrency})`}>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-semibold">
              {walletCurrency === 'USD' ? '$' : 'Bs'}
            </span>
            <DrawerInput
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="pl-10"
              min="0.01"
              step="0.01"
              autoFocus
            />
          </div>
        </DrawerField>

        {/* Descripción opcional — aparece en el historial */}
        <DrawerField label="Descripción (opcional)">
          <DrawerInput
            placeholder={
              isIncome
                ? 'Ej: Sueldo, transferencia recibida...'
                : 'Ej: Pago alquiler, compra mercado...'
            }
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </DrawerField>

        {/* Fecha del movimiento — por defecto hoy */}
        <DrawerField label="Fecha">
          <DrawerInput
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            style={{ colorScheme: 'dark' }}
          />
        </DrawerField>

        {/* Botón de confirmación — color según tipo */}
        <Button
          fullWidth
          variant={isIncome ? 'success' : 'danger'}
          onClick={handleSubmit}
          loading={createTx.isPending}
          disabled={!form.amount || parseFloat(form.amount) <= 0}
        >
          {isIncome ? 'Agregar fondos' : 'Registrar retiro'}
        </Button>
      </div>
    </Drawer>
  )
}

// ─────────────────────────────────────────────────────────────
// WalletDetailPage
//
// Página de detalle de una cuenta. Muestra:
//   1. Balance actual con gradiente del color de la cuenta
//   2. Botones de acción: "Agregar fondos" y "Retirar"
//   3. Historial de movimientos ordenados por fecha desc
//
// El parámetro `params` es una Promise en Next.js 15 (Turbopack).
// Se desenvuelve con el hook `use()` de React.
// ─────────────────────────────────────────────────────────────
export default function WalletDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  // Carga los datos de la cuenta por su ID
  const { data: wallet, isLoading } = useWallet(id)

  // Función remove y update para gestionar la cuenta
  const { remove, update } = useWallets()

  // Alterna si la cuenta se incluye o excluye del patrimonio total
  const handleToggleExclude = () =>
    update({ id: wallet!.id, data: { exclude_from_total: !wallet!.exclude_from_total } })

  // Estado del input para el umbral de alerta de saldo bajo
  const [thresholdInput, setThresholdInput] = useState('')

  // Sincroniza el input cuando la cuenta carga por primera vez
  useEffect(() => {
    if (wallet) setThresholdInput(wallet.low_balance_threshold?.toString() ?? '')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.id])

  /**
   * handleSaveThreshold — Guarda el umbral de alerta de saldo bajo.
   * Si el valor es 0 o inválido, desactiva la alerta (guarda null).
   */
  const handleSaveThreshold = () => {
    const value = parseFloat(thresholdInput)
    update({
      id: wallet!.id,
      data: { low_balance_threshold: isNaN(value) || value <= 0 ? null : value },
    })
  }

  // drawer: null = cerrado | 'income' = agregar | 'expense' = retirar
  const [drawer, setDrawer] = useState<'income' | 'expense' | null>(null)

  // Hook para eliminar transacciones (el trigger revierte el balance en la DB)
  const deleteTx = useDeleteTransaction(id)

  // Carga el historial de movimientos de esta cuenta
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', 'wallet', id],
    queryFn: () => transactionsService.getByWallet(id),
    enabled: !!id,
  })

  // Estado de carga — muestra skeletons mientras se obtienen los datos
  if (isLoading) {
    return (
      <div className="px-4 pt-12 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-12 rounded-2xl" />
      </div>
    )
  }

  if (!wallet) {
    return <EmptyState icon="🔍" title="Cuenta no encontrada" />
  }

  const typeConfig = WALLET_TYPES.find((t) => t.type === wallet.type)

  // Elimina la cuenta (soft-delete) y regresa a la lista
  const handleDelete = async () => {
    if (!confirm(`¿Eliminar la cuenta "${wallet.name}"?`)) return
    await remove(wallet.id)
    router.push('/wallets')
  }

  return (
    <div className="px-4 pt-12 pb-4">
      {/* Cabecera con botón atrás y eliminar */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 bg-surface border border-line rounded-2xl flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-muted" />
        </button>
        <h1 className="text-xl font-bold text-white flex-1">{wallet.name}</h1>
        <button
          onClick={handleDelete}
          className="w-10 h-10 bg-error/10 border border-error/20 rounded-2xl flex items-center justify-center"
        >
          <Trash2 size={16} className="text-error" />
        </button>
      </div>

      {/* Tarjeta de balance — usa el color personalizado de la cuenta */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 mb-4"
        style={{
          background: `linear-gradient(135deg, ${wallet.color}33, ${wallet.color}11)`,
          border: `1px solid ${wallet.color}44`,
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${wallet.color}20` }}
          >
            {typeConfig?.icon ?? '💰'}
          </div>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ backgroundColor: `${wallet.color}20`, color: wallet.color }}
          >
            {wallet.currency}
          </span>
        </div>
        <p className="text-sm text-muted mb-1">{typeConfig?.label ?? 'Cuenta'}</p>
        {/* CurrencyDisplay respeta el modo privacidad (muestra •••• si está activo) */}
        <CurrencyDisplay
          amount={wallet.balance}
          currency={wallet.currency}
          className="text-3xl font-bold text-white"
        />
      </motion.div>

      {/* Toggle: contar en patrimonio total */}
      <button
        onClick={handleToggleExclude}
        className="w-full flex items-center justify-between bg-surface border border-line rounded-2xl px-4 py-3 mb-4 active:scale-[0.99] transition-transform"
      >
        <div>
          <p className="text-sm font-semibold text-white text-left">Contar en patrimonio total</p>
          <p className="text-xs text-muted text-left mt-0.5">
            {wallet.exclude_from_total
              ? 'Excluida — no suma al balance general'
              : 'Incluida — suma al balance general'}
          </p>
        </div>
        {/* Toggle visual */}
        <div
          className={`w-12 h-6 rounded-full transition-colors duration-200 relative shrink-0 ${
            wallet.exclude_from_total ? 'bg-elevated border border-line' : 'bg-success/70'
          }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
              wallet.exclude_from_total ? 'translate-x-0.5' : 'translate-x-6'
            }`}
          />
        </div>
      </button>

      {/* Umbral de alerta de saldo bajo */}
      <div className="bg-surface border border-line rounded-2xl px-4 py-3.5 mb-4">
        <p className="text-sm font-semibold text-white mb-0.5">Alerta de saldo bajo</p>
        <p className="text-xs text-muted mb-3">
          Notificación cuando el saldo baje de este monto. Deja en 0 o vacío para desactivar.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-medium">
              {wallet.currency === 'USD' ? '$' : 'Bs'}
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={thresholdInput}
              onChange={(e) => setThresholdInput(e.target.value)}
              placeholder="0.00"
              className="w-full bg-elevated border border-line rounded-xl py-2.5 pl-8 pr-3 text-sm text-white placeholder:text-muted focus:outline-none focus:border-brand/50"
            />
          </div>
          <button
            onClick={handleSaveThreshold}
            className="px-4 py-2 bg-brand/10 border border-brand/20 text-brand text-sm font-semibold rounded-xl active:scale-95 transition-transform"
          >
            Guardar
          </button>
        </div>
      </div>

      {/* Botones de acción rápida */}
      <div className="flex gap-3 mb-6">
        {/* Abre el drawer en modo "income" para sumar al balance */}
        <button
          onClick={() => setDrawer('income')}
          className="flex-1 bg-success/10 border border-success/25 rounded-2xl py-3.5 flex items-center justify-center gap-2 text-success font-semibold text-sm active:scale-95 transition-transform"
        >
          <ArrowDownLeft size={18} />
          Agregar fondos
        </button>
        {/* Abre el drawer en modo "expense" para restar del balance */}
        <button
          onClick={() => setDrawer('expense')}
          className="flex-1 bg-error/10 border border-error/25 rounded-2xl py-3.5 flex items-center justify-center gap-2 text-error font-semibold text-sm active:scale-95 transition-transform"
        >
          <ArrowUpRight size={18} />
          Retirar
        </button>
      </div>

      {/* Historial de movimientos */}
      <h2 className="text-base font-semibold text-muted mb-3">
        Movimientos
        {transactions.length > 0 && (
          <span className="ml-2 text-xs bg-elevated px-2 py-0.5 rounded-full text-faint">
            {transactions.length}
          </span>
        )}
      </h2>

      {transactions.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Sin movimientos aún"
          description="Usa los botones de arriba para registrar ingresos o retiros"
        />
      ) : (
        <div className="bg-surface border border-line rounded-2xl overflow-hidden">
          {transactions.map((tx) => {
            // Determina icono y color según el tipo de transacción
            const isIncome = tx.type === 'income'
            const isTransfer = tx.type === 'transfer'
            const Icon = isTransfer ? ArrowLeftRight : isIncome ? ArrowDownLeft : ArrowUpRight
            const color = isTransfer ? '#6C63FF' : isIncome ? '#00D4AA' : '#FF4D4D'

            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-line last:border-0"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon size={16} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {tx.description ?? (isIncome ? 'Ingreso' : isTransfer ? 'Transferencia' : 'Retiro')}
                  </p>
                  {/* formatRelativeTime muestra "Hace 2h", "Hace 3d", etc. */}
                  <p className="text-xs text-muted">{formatRelativeTime(tx.date)}</p>
                </div>
                <p className="text-sm font-semibold tabular-nums" style={{ color }}>
                  {isIncome ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                </p>
                <button
                  onClick={() => deleteTx.mutate(tx.id)}
                  disabled={deleteTx.isPending}
                  className="w-7 h-7 flex items-center justify-center text-muted/40 hover:text-error transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Drawer de movimiento — solo se monta cuando drawer !== null */}
      {drawer && (
        <AddTransactionDrawer
          open={true}
          onClose={() => setDrawer(null)}
          walletId={wallet.id}
          walletCurrency={wallet.currency}
          defaultType={drawer}
        />
      )}
    </div>
  )
}


