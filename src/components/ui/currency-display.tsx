'use client'

import { useUIStore } from '@/stores/ui-store'
import { formatCurrency } from '@/utils/currency'
import type { Currency } from '@/types/app.types'
import { cn } from '@/utils/cn'

interface CurrencyDisplayProps {
  amount: number
  currency: Currency
  className?: string
  privacyChar?: string
}

export function CurrencyDisplay({
  amount,
  currency,
  className,
  privacyChar = '••••',
}: CurrencyDisplayProps) {
  const { privacyMode } = useUIStore()

  return (
    <span className={cn('tabular-nums', className)}>
      {privacyMode ? privacyChar : formatCurrency(amount, currency)}
    </span>
  )
}
