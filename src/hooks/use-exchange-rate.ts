'use client'

import { useQuery } from '@tanstack/react-query'
import { useExchangeRateStore } from '@/stores/exchange-rate-store'
import { transactionsService } from '@/services/transactions.service'
import { convertCurrency, formatCurrency } from '@/utils/currency'
import type { Currency } from '@/types/app.types'

export function useExchangeRate() {
  const { bobPerUsd, lastUpdated, setRate } = useExchangeRateStore()

  return {
    bobPerUsd,
    usdPerBob: 1 / bobPerUsd,
    lastUpdated,
    setRate,
    convert: (amount: number, from: Currency, to: Currency) =>
      convertCurrency(amount, from, to, bobPerUsd),
    format: (amount: number, currency: Currency) => formatCurrency(amount, currency),
    formatConverted: (amount: number, from: Currency) => {
      const to: Currency = from === 'USD' ? 'BOB' : 'USD'
      const converted = convertCurrency(amount, from, to, bobPerUsd)
      return formatCurrency(converted, to)
    },
  }
}

export function useTransactions(limit = 10) {
  return useQuery({
    queryKey: ['transactions', 'recent', limit],
    queryFn: () => transactionsService.getRecent(limit),
  })
}
