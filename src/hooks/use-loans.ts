'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { loansService } from '@/services/loans.service'
import { useExchangeRateStore } from '@/stores/exchange-rate-store'
import { convertCurrency } from '@/utils/currency'
import { isOverdue } from '@/utils/date'
import { calculateLoanTotals } from '@/utils/loan-interest'
import type { CreateLoanInput, CreatePaymentInput } from '@/types/app.types'

export function useLoans() {
  const queryClient = useQueryClient()
  const { bobPerUsd } = useExchangeRateStore()

  const query = useQuery({
    queryKey: ['loans'],
    queryFn: loansService.getAll,
  })

  const loans = query.data ?? []

  // Auto-detect overdue
  const loansWithStatus = loans.map((l) => ({
    ...l,
    status: l.status !== 'completed' && isOverdue(l.due_date) ? ('overdue' as const) : l.status,
  }))

  const lentLoans = loansWithStatus.filter((l) => l.type === 'lent')
  const borrowedLoans = loansWithStatus.filter((l) => l.type === 'borrowed')

  // El total pendiente incluye el interés acumulado hasta hoy
  const totalLentUSD = lentLoans.reduce((sum, l) => {
    const { remaining } = calculateLoanTotals(l)
    return sum + convertCurrency(remaining, l.currency, 'USD', bobPerUsd)
  }, 0)

  const totalBorrowedUSD = borrowedLoans.reduce((sum, l) => {
    const { remaining } = calculateLoanTotals(l)
    return sum + convertCurrency(remaining, l.currency, 'USD', bobPerUsd)
  }, 0)

  const createMutation = useMutation({
    mutationFn: loansService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loans'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateLoanInput> }) =>
      loansService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loans'] }),
  })

  const addPaymentMutation = useMutation({
    mutationFn: loansService.addPayment,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['loans', vars.loan_id] })
      queryClient.invalidateQueries({ queryKey: ['loan-payments', vars.loan_id] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: loansService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loans'] }),
  })

  return {
    loans: loansWithStatus,
    lentLoans,
    borrowedLoans,
    isLoading: query.isLoading,
    error: query.error,
    totalLentUSD,
    totalBorrowedUSD,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    addPayment: addPaymentMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isAddingPayment: addPaymentMutation.isPending,
  }
}

export function useLoan(id: string) {
  return useQuery({
    queryKey: ['loans', id],
    queryFn: () => loansService.getById(id),
    enabled: !!id,
  })
}

export function useLoanPayments(loanId: string) {
  return useQuery({
    queryKey: ['loan-payments', loanId],
    queryFn: () => loansService.getPayments(loanId),
    enabled: !!loanId,
  })
}

/**
 * useDeletePayment — Elimina un pago de préstamo.
 * El trigger `on_loan_payment_deleted` en Supabase revierte automáticamente
 * el paid_amount del préstamo. Si estaba 'completed' y ya no alcanza, vuelve a 'active'.
 *
 * @param loanId UUID del préstamo al que pertenece el pago (para invalidar su caché)
 */
export function useDeletePayment(loanId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: loansService.deletePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan-payments', loanId] })
      queryClient.invalidateQueries({ queryKey: ['loans', loanId] })
      queryClient.invalidateQueries({ queryKey: ['loans'] })
    },
  })
}
