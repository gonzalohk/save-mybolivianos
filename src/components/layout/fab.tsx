'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Wallet, Handshake } from 'lucide-react'
import Link from 'next/link'

export function FAB() {
  const [open, setOpen] = useState(false)

  const actions = [
    { href: '/wallets?new=1', icon: Wallet, label: 'Nueva cuenta', color: '#00D4AA' },
    { href: '/loans?new=1', icon: Handshake, label: 'Nuevo préstamo', color: '#6C63FF' },
  ]

  return (
    <div className="fixed bottom-20 right-4 z-40 max-w-[430px]" style={{ right: 'max(16px, calc(50vw - 215px + 16px))' }}>
      <AnimatePresence>
        {open && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-3 items-end">
            {actions.map((action, i) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                <span className="bg-elevated px-3 py-1.5 rounded-xl text-sm font-medium text-white shadow-lg">
                  {action.label}
                </span>
                <Link
                  href={action.href}
                  onClick={() => setOpen(false)}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: action.color }}
                >
                  <action.icon size={20} className="text-white" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full gradient-brand flex items-center justify-center shadow-xl shadow-brand/30 text-white"
      >
        {open ? <X size={24} /> : <Plus size={24} />}
      </motion.button>
    </div>
  )
}
