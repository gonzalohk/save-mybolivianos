'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wallet, Handshake, Settings } from 'lucide-react'
import { cn } from '@/utils/cn'

const tabs = [
  { href: '/', icon: Home, label: 'Inicio' },
  { href: '/wallets', icon: Wallet, label: 'Cuentas' },
  { href: '/loans', icon: Handshake, label: 'Préstamos' },
  { href: '/settings', icon: Settings, label: 'Ajustes' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-[430px] mx-auto">
      <div
        className="flex items-center justify-around px-2 pt-2 pb-safe"
        style={{
          background:
            'linear-gradient(to top, #0A0B14 80%, transparent)',
          borderTop: '1px solid #1E2030',
        }}
      >
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-colors min-w-[64px]',
                active ? 'text-brand' : 'text-faint'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className={cn('text-[10px] font-medium', active ? 'text-brand' : 'text-faint')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
