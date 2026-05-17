'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(error.includes('Invalid') ? 'Email o contraseña incorrectos' : error)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 gradient-brand rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand/30">
            <span className="text-3xl">🇧🇴</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">SaveMyBolivianos</h1>
          <p className="text-muted text-sm">Tu finanzas personales, ordenadas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-error/10 border border-error/20 rounded-2xl px-4 py-3 flex items-center gap-2"
            >
              <AlertCircle size={16} className="text-error shrink-0" />
              <p className="text-error text-sm">{error}</p>
            </motion.div>
          )}

          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-surface border border-line rounded-2xl pl-11 pr-4 py-4 text-white placeholder:text-faint focus:border-brand/60 transition-colors"
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-surface border border-line rounded-2xl pl-11 pr-12 py-4 text-white placeholder:text-faint focus:border-brand/60 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Entrar
          </Button>
        </form>

        <p className="text-center text-muted text-sm mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-brand font-semibold">
            Regístrate
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
