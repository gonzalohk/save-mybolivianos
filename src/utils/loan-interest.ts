import type { Loan } from '@/types/app.types'

/**
 * getElapsedMonths — Calcula los meses transcurridos desde una fecha hasta hoy.
 *
 * Compara año y mes (no días exactos), lo que es lo estándar para interés mensual.
 * Ejemplo: del 15 enero al 16 marzo = 2 meses.
 */
function getElapsedMonths(dateStr: string): number {
  const start = new Date(dateStr)
  const now = new Date()
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth())
  return Math.max(0, months)
}

/**
 * calculateLoanTotals — Calcula los totales de un préstamo con interés simple mensual.
 *
 * Fórmula (interés simple):
 *   interésAcumulado = capital × (tasa / 100) × meses
 *   totalADebes = capital + interésAcumulado
 *   restante = totalADebes - pagado
 *   progreso = pagado / totalADebes × 100
 *
 * Si interest_rate es 0, el cálculo es igual que sin interés.
 *
 * @returns
 *   totalWithInterest  → monto total a pagar (capital + interés acumulado hasta hoy)
 *   interestAccrued    → interés generado hasta hoy en la misma moneda del préstamo
 *   elapsedMonths      → meses transcurridos desde la creación del préstamo
 *   remaining          → lo que queda por pagar (nunca negativo)
 *   progress           → porcentaje pagado sobre el total (0-100, nunca supera 100)
 */
export function calculateLoanTotals(loan: Pick<Loan, 'amount' | 'interest_rate' | 'created_at' | 'paid_amount'>) {
  const { amount: principal, interest_rate: rate, created_at, paid_amount: paidAmount } = loan

  if (rate === 0) {
    const remaining = Math.max(0, principal - paidAmount)
    const progress = principal > 0 ? Math.min(100, (paidAmount / principal) * 100) : 0
    return {
      totalWithInterest: principal,
      interestAccrued: 0,
      elapsedMonths: 0,
      remaining,
      progress,
    }
  }

  const elapsedMonths = getElapsedMonths(created_at)
  const interestAccrued = principal * (rate / 100) * elapsedMonths
  const totalWithInterest = principal + interestAccrued
  const remaining = Math.max(0, totalWithInterest - paidAmount)
  const progress = totalWithInterest > 0 ? Math.min(100, (paidAmount / totalWithInterest) * 100) : 0

  return { totalWithInterest, interestAccrued, elapsedMonths, remaining, progress }
}
