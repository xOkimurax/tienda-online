import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!form.email || !form.password) {
      setError('Por favor completa todos los campos')
      setLoading(false)
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Ingresa un email válido')
      setLoading(false)
      return
    }

    try {
      const data = await login(form.email, form.password)
      if (data?.user?.email_confirmed_at === null) {
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`)
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-section-padding flex items-center justify-center min-h-[calc(100vh-300px)]">
      <div className="w-full max-w-md">
        <div className="bg-surface-container-lowest border border-surface-variant p-8">
          <h1 className="text-h2 font-h2 text-primary text-center mb-2">Iniciar Sesión</h1>
          <p className="text-body-base font-body-base text-secondary text-center mb-8">
            Accedé a tu cuenta para gestionar tus pedidos
          </p>

          {error && (
            <div className="bg-error-container border border-error text-on-error-container px-4 py-3 mb-6 text-body-sm font-body-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-label font-label uppercase text-secondary">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-3 bg-transparent border border-outline-variant text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-secondary"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="text-label font-label uppercase text-secondary">Contraseña</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-3 bg-transparent border border-outline-variant text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-secondary"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-on-primary text-label font-label uppercase tracking-widest hover:bg-primary-container transition-colors duration-400 disabled:opacity-50"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-body-sm font-body-sm text-secondary">
              ¿No tenés cuenta?{' '}
              <Link to="/registro" className="text-primary font-medium border-b border-primary hover:opacity-70 transition-opacity">
                Crear cuenta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
