import { createClient } from '@/lib/supabase/client'
import type { Loan, CreateLoanInput, LoanPayment, CreatePaymentInput } from '@/types/app.types'

export const loansService = {
  async getAll(): Promise<Loan[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async getById(id: string): Promise<Loan> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async getPayments(loanId: string): Promise<LoanPayment[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('loan_payments')
      .select('*')
      .eq('loan_id', loanId)
      .order('payment_date', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async create(input: CreateLoanInput): Promise<Loan> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('loans')
      .insert({ ...input, user_id: user!.id })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, input: Partial<CreateLoanInput>): Promise<Loan> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('loans')
      .update(input)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async addPayment(input: CreatePaymentInput): Promise<LoanPayment> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('loan_payments')
      .insert(input)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from('loans').delete().eq('id', id)
    if (error) throw error
  },

  /**
   * deletePayment — Elimina un pago y actualiza paid_amount + status del préstamo.
   *
   * El trigger de INSERT ya maneja el incremento de paid_amount al agregar un pago.
   * El decremento al eliminar se hace aquí explícitamente para no depender de
   * que la migración 004 haya sido aplicada en Supabase.
   */
  async deletePayment(id: string): Promise<void> {
    const supabase = createClient()

    // 1. Lee el pago antes de eliminarlo para saber cuánto restar
    const { data: payment, error: fetchErr } = await supabase
      .from('loan_payments')
      .select('loan_id, amount')
      .eq('id', id)
      .single()
    if (fetchErr) throw fetchErr

    // 2. Elimina el pago
    const { error: deleteErr } = await supabase
      .from('loan_payments')
      .delete()
      .eq('id', id)
    if (deleteErr) throw deleteErr

    // 3. Lee el estado actual del préstamo
    const { data: loan, error: loanErr } = await supabase
      .from('loans')
      .select('paid_amount, amount, status')
      .eq('id', payment.loan_id)
      .single()
    if (loanErr) throw loanErr

    // 4. Decrementa paid_amount y revierte el status si correspondía 'completed'
    const newPaidAmount = Math.max(0, loan.paid_amount - payment.amount)
    const newStatus =
      loan.status === 'completed' && newPaidAmount < loan.amount ? 'active' : loan.status

    const { error: updateErr } = await supabase
      .from('loans')
      .update({ paid_amount: newPaidAmount, status: newStatus })
      .eq('id', payment.loan_id)
    if (updateErr) throw updateErr
  },
}
