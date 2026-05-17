'use client'

import { useRouter } from 'next/navigation'
import { AlertTriangle, XCircle, ChevronRight } from 'lucide-react'
import { useAlerts } from '@/hooks/use-alerts'
import { Drawer } from '@/components/ui/drawer'
import type { AppAlert } from '@/types/app.types'

/**
 * Configuración visual por severidad de alerta.
 * Define el ícono, colores de texto, fondo y borde para cada nivel.
 */
const SEVERITY_CONFIG = {
  error: {
    Icon: XCircle,
    color: 'text-error',
    bg: 'bg-error/10',
    border: 'border-error/20',
  },
  warning: {
    Icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
  },
  info: {
    Icon: AlertTriangle,
    color: 'text-brand',
    bg: 'bg-brand/10',
    border: 'border-brand/20',
  },
} as const

/**
 * AlertsPanel — Drawer (panel inferior) que muestra todas las alertas activas.
 *
 * Las alertas se calculan en tiempo real desde el hook useAlerts(), que lee
 * el caché de wallets y loans sin hacer queries adicionales a Supabase.
 *
 * Al tocar una alerta, navega directamente a la entidad relacionada
 * (página de detalle del préstamo o de la cuenta).
 *
 * Props:
 *   open    → controla visibilidad del panel
 *   onClose → función para cerrar el panel
 */
export function AlertsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { alerts } = useAlerts()
  const router = useRouter()

  /**
   * handleTap — Cierra el panel y navega a la entidad de la alerta.
   * Los préstamos van a /loans/[id] y las cuentas a /wallets/[id].
   */
  const handleTap = (alert: AppAlert) => {
    onClose()
    router.push(
      alert.entityType === 'loan'
        ? `/loans/${alert.entityId}`
        : `/wallets/${alert.entityId}`
    )
  }

  return (
    <Drawer open={open} onClose={onClose} title={`Alertas${alerts.length > 0 ? ` (${alerts.length})` : ''}`}>
      {alerts.length === 0 ? (
        // Estado vacío — todo está en orden
        <div className="py-10 text-center">
          <p className="text-5xl mb-4">✅</p>
          <p className="text-white font-semibold text-lg">Todo en orden</p>
          <p className="text-muted text-sm mt-1">No hay alertas pendientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const { Icon, color, bg, border } = SEVERITY_CONFIG[alert.severity]

            return (
              <button
                key={alert.id}
                onClick={() => handleTap(alert)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border ${bg} ${border} text-left active:scale-[0.99] transition-transform`}
              >
                {/* Ícono de severidad */}
                <Icon size={20} className={`${color} shrink-0`} />

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${color}`}>{alert.title}</p>
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">{alert.description}</p>
                </div>

                {/* Flecha — indica que es navegable */}
                <ChevronRight size={16} className="text-muted shrink-0" />
              </button>
            )
          })}
        </div>
      )}
    </Drawer>
  )
}
