export function formatDate(date: string | Date | null): string {
  if (!date) return '—'
  const d = new Date(date)
  return new Intl.DateTimeFormat('es-BO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

export function formatShortDate(date: string | Date | null): string {
  if (!date) return '—'
  const d = new Date(date)
  return new Intl.DateTimeFormat('es-BO', {
    day: 'numeric',
    month: 'short',
  }).format(d)
}

export function getDaysRemaining(dueDate: string | null): number | null {
  if (!dueDate) return null
  const now = new Date()
  const due = new Date(dueDate)
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export function getDaysRemainingLabel(dueDate: string | null): string {
  const days = getDaysRemaining(dueDate)
  if (days === null) return 'Sin fecha límite'
  if (days < 0) return `Vencido hace ${Math.abs(days)} días`
  if (days === 0) return 'Vence hoy'
  if (days === 1) return 'Vence mañana'
  return `${days} días restantes`
}

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

export function toInputDate(date: string | Date | null): string {
  if (!date) return ''
  const d = new Date(date)
  // Usa las partes locales (no UTC) para evitar desfase de zona horaria
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Ahora mismo'
  if (diffMins < 60) return `Hace ${diffMins}m`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`
  return formatShortDate(date)
}
