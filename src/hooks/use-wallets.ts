'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { walletsService } from '@/services/wallets.service'
import { transactionsService } from '@/services/transactions.service'
import { useExchangeRateStore } from '@/stores/exchange-rate-store'
import { convertCurrency } from '@/utils/currency'
import type { CreateWalletInput } from '@/types/app.types'

/**
 * useWallets — Hook principal para gestionar todas las cuentas/billeteras del usuario.
 *
 * Devuelve:
 * - wallets         → lista completa de cuentas activas
 * - totalUSD        → patrimonio total convertido a USD (suma de todas las cuentas)
 * - totalBOB        → patrimonio total en BOB (totalUSD × tipo de cambio)
 * - balanceByUSD    → suma de cuentas que son en USD sin conversión
 * - balanceByBOB    → suma de cuentas que son en BOB sin conversión
 * - isLoading       → true mientras carga por primera vez
 * - create(data)    → crea una nueva cuenta en Supabase
 * - update(id,data) → actualiza campos de una cuenta existente
 * - remove(id)      → desactiva (soft-delete) una cuenta
 * - isCreating      → true mientras se está ejecutando create()
 * - isUpdating      → true mientras se está ejecutando update()
 *
 * Los datos se cachean 5 minutos y se sincronizan automáticamente con Supabase.
 */
export function useWallets() {
  const queryClient = useQueryClient()
  const { bobPerUsd } = useExchangeRateStore()

  // Obtiene todas las cuentas activas del usuario autenticado
  const query = useQuery({
    queryKey: ['wallets'],
    queryFn: walletsService.getAll,
  })

  const wallets = query.data ?? []

  // Solo las cuentas que no están excluidas del patrimonio
  const includedWallets = wallets.filter((w) => !w.exclude_from_total)

  // Convierte cada saldo a USD y suma para obtener patrimonio total
  const totalUSD = includedWallets.reduce((sum, w) => {
    return sum + convertCurrency(w.balance, w.currency, 'USD', bobPerUsd)
  }, 0)

  // Equivalente en BOB del patrimonio total
  const totalBOB = totalUSD * bobPerUsd

  // Saldo puro de cuentas incluidas en USD (sin conversión)
  const balanceByUSD = includedWallets
    .filter((w) => w.currency === 'USD')
    .reduce((sum, w) => sum + w.balance, 0)

  // Saldo puro de cuentas incluidas en BOB (sin conversión)
  const balanceByBOB = includedWallets
    .filter((w) => w.currency === 'BOB')
    .reduce((sum, w) => sum + w.balance, 0)

  // Crea una nueva cuenta y refresca la lista
  const createMutation = useMutation({
    mutationFn: walletsService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallets'] }),
  })

  // Actualiza nombre, color, icono u otros campos de una cuenta
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateWalletInput> }) =>
      walletsService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallets'] }),
  })

  // Soft-delete: marca la cuenta como inactiva en lugar de borrarla
  const deleteMutation = useMutation({
    mutationFn: walletsService.softDelete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallets'] }),
  })

  return {
    wallets,
    isLoading: query.isLoading,
    error: query.error,
    totalUSD,
    totalBOB,
    balanceByUSD,
    balanceByBOB,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}

/**
 * useWallet — Carga los datos de una sola cuenta por su ID.
 *
 * @param id  UUID de la cuenta (viene de la URL dinámica /wallets/[id])
 *
 * Solo ejecuta la query si `id` está definido (enabled: !!id).
 * Útil en la página de detalle de una cuenta.
 */
export function useWallet(id: string) {
  return useQuery({
    queryKey: ['wallets', id],
    queryFn: () => walletsService.getById(id),
    enabled: !!id,
  })
}

/**
 * useCreateTransaction — Hook para crear un movimiento (ingreso o retiro) en una cuenta.
 *
 * Cuando una transacción se inserta en Supabase, un trigger de la base de datos
 * actualiza automáticamente el saldo (balance) de la cuenta asociada:
 *   - tipo 'income'  → suma el monto al balance
 *   - tipo 'expense' → resta el monto del balance
 *
 * Al tener éxito, invalida el caché de:
 *   - ['transactions']   → refresca el feed de actividad reciente en el Dashboard
 *   - ['wallets']        → refresca la lista de cuentas (para ver el nuevo balance)
 *   - ['wallets', id]    → refresca el detalle de la cuenta específica
 *
 * Uso:
 *   const createTx = useCreateTransaction()
 *   await createTx.mutateAsync({
 *     wallet_id: '...',
 *     amount: 100,
 *     currency: 'USD',
 *     type: 'income',       // 'income' | 'expense' | 'transfer'
 *     description: 'Sueldo',
 *     date: new Date().toISOString(),
 *     category_id: null,
 *   })
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: transactionsService.create,
    onSuccess: (tx) => {
      // Refresca el historial de movimientos en todas las vistas
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      // Refresca todos los balances (el trigger ya actualizó la DB)
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      // Si la transacción tiene cuenta asociada, refresca su detalle
      if (tx.wallet_id) {
        queryClient.invalidateQueries({ queryKey: ['wallets', tx.wallet_id] })
      }
    },
  })
}

/**
 * useDeleteTransaction — Elimina un movimiento (ingreso o retiro) de una cuenta.
 * El trigger `on_transaction_deleted` en Supabase revierte automáticamente
 * el balance de la cuenta (inverso al de inserción).
 *
 * @param walletId UUID de la cuenta (para invalidar su caché de detalle)
 */
export function useDeleteTransaction(walletId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: transactionsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['wallets', walletId] })
    },
  })
}
