import { createClient } from '@/lib/supabase/client'
import type { Transaction, TransactionWithWallet, CreateTransactionInput } from '@/types/app.types'

export const transactionsService = {
  /** Devuelve las últimas `limit` transacciones con el nombre y color de la cuenta asociada */
  async getRecent(limit = 10): Promise<TransactionWithWallet[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('transactions')
      .select('*, wallets(name, color)')
      .order('date', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data ?? []) as TransactionWithWallet[]
  },

  async getByWallet(walletId: string): Promise<Transaction[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('wallet_id', walletId)
      .order('date', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...input, user_id: user!.id })
      .select()
      .single()
    if (error) throw error
    return data
  },

  /**
   * delete — Elimina una transacción y revierte su efecto sobre el balance de la cuenta.
   *
   * El trigger de INSERT actualiza el balance al crear una transacción.
   * La reversión al eliminar se hace aquí explícitamente para no depender
   * de que la migración 004 haya sido aplicada en Supabase.
   *
   *   income eliminado  → resta el monto del balance
   *   expense eliminado → suma el monto al balance
   */
  async delete(id: string): Promise<void> {
    const supabase = createClient()

    // 1. Lee la transacción antes de borrarla (necesitamos wallet_id, amount, type)
    const { data: tx, error: fetchErr } = await supabase
      .from('transactions')
      .select('wallet_id, amount, type')
      .eq('id', id)
      .single()
    if (fetchErr) throw fetchErr

    // 2. Elimina la transacción
    const { error: deleteErr } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
    if (deleteErr) throw deleteErr

    // 3. Revierte el balance de la cuenta si estaba asociada
    if (tx.wallet_id && tx.type !== 'transfer') {
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('id', tx.wallet_id)
        .single()

      if (wallet) {
        const newBalance =
          tx.type === 'income'
            ? wallet.balance - tx.amount   // ingreso eliminado → resta
            : wallet.balance + tx.amount   // gasto eliminado → suma

        await supabase
          .from('wallets')
          .update({ balance: Math.max(0, newBalance) })
          .eq('id', tx.wallet_id)
      }
    }
  },
}
