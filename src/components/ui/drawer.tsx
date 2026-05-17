'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Drawer({ open, onClose, title, children, className }: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50 bg-elevated rounded-t-3xl max-h-[92vh] overflow-y-auto pb-safe',
              'max-w-[430px] mx-auto',
              className
            )}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-line-light rounded-full" />
            </div>

            {title && (
              <div className="flex items-center justify-between px-5 pt-2 pb-4">
                <h2 className="text-xl font-bold">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-muted"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="px-5 pb-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface DrawerFieldProps {
  label: string
  children: React.ReactNode
  className?: string
}

export function DrawerField({ label, children, className }: DrawerFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm text-muted font-medium">{label}</label>
      {children}
    </div>
  )
}

export function DrawerInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full bg-surface border border-line rounded-xl px-4 py-3 text-white text-base',
        'focus:border-brand/60 focus:ring-0 transition-colors',
        className
      )}
      {...props}
    />
  )
}
