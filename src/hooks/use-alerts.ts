'use client'

import { useWallets } from '@/hooks/use-wallets'
import { useLoans } from '@/hooks/use-loans'
import { formatCurrency } from '@/utils/currency'
import type { AppAlert } from '@/types/app.types'

/**
 * useAlerts — Calcula alertas en el cliente a partir de los datos ya cacheados.
 *
 * No realiza queries adicionales a Supabase. Lee los datos de wallets y loans
 * directamente desde el caché de TanStack Query (mismos datos que usan las
 * páginas de cuentas y préstamos).
 *
 * Tipos de alerta generadas:
 *   - loan_overdue   → préstamo vencido (due_date ya pasó, status activo)
 *   - loan_due_soon  → préstamo vence en ≤ 7 días
 *   - low_balance    → balance de una cuenta por debajo de su umbral configurado
 *
 * Retorna:
 *   alerts → lista ordenada: errores primero, luego warnings
 *   count  → total de alertas activas (útil para el badge del ícono)
 */
export function useAlerts() {
  const { wallets } = useWallets()
  const { lentLoans, borrowedLoans } = useLoans()

  // Combina préstamos prestados y recibidos en una sola lista
  const allLoans = [...lentLoans, ...borrowedLoans]

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const alerts: AppAlert[] = []

  // ── Préstamos ────────────────────────────────────────────
  for (const loan of allLoans) {
    // Los préstamos completados nunca generan alertas
    if (loan.status === 'completed') continue

    if (loan.status === 'overdue') {
      // Préstamo vencido: due_date ya pasó y sigue activo
      alerts.push({
        id: `loan_overdue_${loan.id}`,
        type: 'loan_overdue',
        severity: 'error',
        title: 'Préstamo vencido',
        description:
          loan.type === 'lent'
            ? `Le prestaste a ${loan.contact_name} y no ha pagado`
            : `Debes pagarle a ${loan.contact_name}`,
        entityId: loan.id,
        entityType: 'loan',
      })
    } else if (loan.due_date) {
      // Préstamo por vencer: dentro de los próximos 7 días
      const dueDate = new Date(loan.due_date)
      dueDate.setHours(0, 0, 0, 0)
      const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / 86_400_000)

      if (daysLeft >= 0 && daysLeft <= 7) {
        const whenText =
          daysLeft === 0 ? 'hoy' : `en ${daysLeft} día${daysLeft > 1 ? 's' : ''}`

        alerts.push({
          id: `loan_due_soon_${loan.id}`,
          type: 'loan_due_soon',
          severity: 'warning',
          title: 'Préstamo por vencer',
          description: `${loan.contact_name} — vence ${whenText}`,
          entityId: loan.id,
          entityType: 'loan',
        })
      }
    }
  }

  // ── Saldo bajo ───────────────────────────────────────────
  for (const wallet of wallets) {
    // Solo genera alerta si el umbral está configurado (no null) y el balance lo supera
    if (
      wallet.low_balance_threshold != null &&
      wallet.balance < wallet.low_balance_threshold
    ) {
      alerts.push({
        id: `low_balance_${wallet.id}`,
        type: 'low_balance',
        severity: 'warning',
        title: 'Saldo bajo',
        description: `${wallet.name} — ${formatCurrency(wallet.balance, wallet.currency)} (mínimo: ${formatCurrency(wallet.low_balance_threshold, wallet.currency)})`,
        entityId: wallet.id,
        entityType: 'wallet',
      })
    }
  }

  // Ordena: errores primero, luego warnings
  alerts.sort((a, b) => {
    if (a.severity === b.severity) return 0
    return a.severity === 'error' ? -1 : 1
  })

  return { alerts, count: alerts.length }
}
