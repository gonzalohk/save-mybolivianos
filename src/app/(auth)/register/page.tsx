'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  const router = useRouter()
  const { signUp } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    const { error } = await signUp(form.email, form.password, form.name)
    setLoading(false)
    if (error) {
      setError(error.includes('already') ? 'Este email ya está registrado' : error)
    } else {
      router.push('/')
    }
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value })

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 gradient-brand rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand/30">
            <span className="text-2xl">🇧🇴</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Crear cuenta</h1>
          <p className="text-muted text-sm">Empieza a controlar tus finanzas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-error/10 border border-error/20 rounded-2xl px-4 py-3 flex items-center gap-2"
            >
              <AlertCircle size={16} className="text-error shrink-0" />
              <p className="text-error text-sm">{error}</p>
            </motion.div>
          )}

          {[
            { key: 'name', icon: User, placeholder: 'Tu nombre', type: 'text' },
            { key: 'email', icon: Mail, placeholder: 'tu@email.com', type: 'email' },
          ].map(({ key, icon: Icon, placeholder, type }) => (
            <div key={key} className="relative">
              <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type={type}
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={set(key)}
                required
                className="w-full bg-surface border border-line rounded-2xl pl-11 pr-4 py-4 text-white placeholder:text-faint focus:border-brand/60 transition-colors"
              />
            </div>
          ))}

          {['password', 'confirm'].map((key) => (
            <div key={key} className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={key === 'password' ? 'Contraseña' : 'Confirmar contraseña'}
                value={form[key as keyof typeof form]}
                onChange={set(key)}
                required
                className="w-full bg-surface border border-line rounded-2xl pl-11 pr-12 py-4 text-white placeholder:text-faint focus:border-brand/60 transition-colors"
              />
              {key === 'password' && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            </div>
          ))}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Crear cuenta
          </Button>
        </form>

        <p className="text-center text-muted text-sm mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-brand font-semibold">
            Inicia sesión
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
