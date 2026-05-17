import type { Currency } from '@/types/app.types'

export function formatCurrency(amount: number, currency: Currency): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }
  return `Bs ${new Intl.NumberFormat('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
  bobPerUsd: number
): number {
  if (from === to) return amount
  if (from === 'USD' && to === 'BOB') return amount * bobPerUsd
  if (from === 'BOB' && to === 'USD') return amount / bobPerUsd
  return amount
}

export function getCurrencySymbol(currency: Currency): string {
  return currency === 'USD' ? '$' : 'Bs'
}

export function getCurrencyColor(currency: Currency): string {
  return currency === 'USD' ? '#00D4AA' : '#F5C518'
}

export function parseAmount(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}
