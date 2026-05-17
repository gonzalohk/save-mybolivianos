'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  User, Shield, Eye, EyeOff, LogOut, ChevronRight,
  DollarSign, Lock, Bell
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { useExchangeRateStore } from '@/stores/exchange-rate-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

function SettingRow({
  icon: Icon,
  label,
  value,
  iconColor = '#A0A3B1',
  onClick,
  trailing,
}: {
  icon: React.ElementType
  label: string
  value?: string
  iconColor?: string
  onClick?: () => void
  trailing?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-3.5 w-full text-left active:bg-elevated transition-colors"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        <Icon size={18} style={{ color: iconColor }} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{label}</p>
        {value && <p className="text-xs text-muted mt-0.5">{value}</p>}
      </div>
      {trailing ?? <ChevronRight size={16} className="text-faint" />}
    </button>
  )
}

function SettingToggle({
  icon: Icon,
  label,
  value,
  iconColor,
  checked,
  onToggle,
}: {
  icon: React.ElementType
  label: string
  value?: string
  iconColor?: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <SettingRow
      icon={Icon}
      label={label}
      value={value}
      iconColor={iconColor}
      onClick={onToggle}
      trailing={
        <div
          className={cn(
            'w-12 h-6 rounded-full transition-all duration-300 relative',
            checked ? 'bg-brand' : 'bg-line-light'
          )}
        >
          <div
            className={cn(
              'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300',
              checked ? 'left-6' : 'left-0.5'
            )}
          />
        </div>
      }
    />
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, signOut } = useAuthStore()
  const { privacyMode, togglePrivacyMode, pinEnabled, setPinEnabled } = useUIStore()
  const { bobPerUsd } = useExchangeRateStore()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleSignOut = async () => {
    setLoggingOut(true)
    await signOut()
    router.push('/login')
  }

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Usuario'

  return (
    <div className="px-4 pt-12 pb-4">
      <h1 className="text-2xl font-bold text-white mb-6">Ajustes</h1>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-line rounded-3xl p-5 mb-5 flex items-center gap-4"
      >
        <div className="w-14 h-14 gradient-brand rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-bold text-white">{displayName}</p>
          <p className="text-sm text-muted">{user?.email}</p>
        </div>
      </motion.div>

      {/* Sections */}
      {[
        {
          title: 'Finanzas',
          items: (
            <SettingRow
              icon={DollarSign}
              label="Tipo de cambio"
              value={`1 USD = ${bobPerUsd} BOB`}
              iconColor="#F5C518"
              onClick={() => router.push('/?edit-rate=1')}
            />
          ),
        },
        {
          title: 'Privacidad y seguridad',
          items: (
            <>
              <SettingToggle
                icon={privacyMode ? EyeOff : Eye}
                label="Modo privacidad"
                value="Oculta todos los montos"
                iconColor="#6C63FF"
                checked={privacyMode}
                onToggle={togglePrivacyMode}
              />
              <div className="border-t border-line" />
              <SettingToggle
                icon={Lock}
                label="PIN de acceso"
                value="Protege la app con un PIN"
                iconColor="#FF4D4D"
                checked={pinEnabled}
                onToggle={() => setPinEnabled(!pinEnabled)}
              />
            </>
          ),
        },
        {
          title: 'Notificaciones',
          items: (
            <SettingRow
              icon={Bell}
              label="Alertas"
              value="Próximamente"
              iconColor="#FFB347"
              onClick={() => {}}
              trailing={<span className="text-xs text-warn font-medium">Pronto</span>}
            />
          ),
        },
      ].map(({ title, items }) => (
        <div key={title} className="mb-4">
          <p className="text-xs text-faint font-semibold uppercase tracking-wider mb-2 px-1">
            {title}
          </p>
          <div className="bg-surface border border-line rounded-2xl overflow-hidden divide-y divide-line">
            {items}
          </div>
        </div>
      ))}

      {/* Logout */}
      <Button
        variant="danger"
        fullWidth
        onClick={handleSignOut}
        loading={loggingOut}
        className="mt-2"
      >
        <LogOut size={18} /> Cerrar sesión
      </Button>

      <p className="text-center text-xs text-faint mt-6">SaveMyBolivianos v1.0.0</p>
    </div>
  )
}
