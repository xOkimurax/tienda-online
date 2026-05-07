import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [error, setError] = useState('')
  const { user, resendVerification, checkEmailVerified } = useAuthStore()
  const navigate = useNavigate()

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/registro')
    }
  }, [email, navigate])

  // Auto-detect when user clicks the verification link in their email
  // Supabase onAuthStateChange already fires in App.jsx when email is confirmed
  useEffect(() => {
    if (user && checkEmailVerified()) {
      navigate('/')
    }
  }, [user, checkEmailVerified, navigate])

  const handleResend = async () => {
    setResending(true)
    setResendSuccess(false)
    setError('')
    try {
      await resendVerification(email)
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 5000)
    } catch (err) {
      const msg = (err.message || '').toLowerCase()
      if (msg.includes('rate') || msg.includes('limit') || msg.includes('too many') || msg.includes('429')) {
        setError('Espera unos segundos antes de reenviar. Ya te enviamos uno hace poco.')
      } else if (msg.includes('already') || msg.includes('confirmed') || msg.includes('verified')) {
        setError('Tu email ya fue verificado. Redirigiendo...')
        setTimeout(() => navigate('/'), 1500)
      } else if (msg.includes('not found') || msg.includes('user')) {
        setError('No encontramos una cuenta con ese email. Volvé a registrarte.')
      } else {
        setError('No pudimos reenviar el correo. Intentá de nuevo en unos segundos.')
      }
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12 bg-[#f5f5f7]">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#0066cc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-[#1d1d1f] mb-2 font-sf-display">
            Revisá tu correo
          </h1>
          <p className="text-[#86868b] mb-8 font-sf-text text-sm leading-relaxed">
            Te enviamos un enlace de verificación a{' '}
            <span className="font-medium text-[#1d1d1f]">{email}</span>.
            {' '}Hacé clic en el enlace para activar tu cuenta.
          </p>

          {resendSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm font-sf-text">
              ¡Correo reenviado! Revisá tu bandeja de entrada.
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm font-sf-text">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full py-3 bg-[#0066cc] text-white font-semibold rounded-full hover:bg-[#0055b3] active:scale-[0.95] transition-all disabled:opacity-50 font-sf-text"
          >
            {resending ? 'Enviando...' : 'Reenviar correo'}
          </button>
        </div>

        <p className="text-center mt-6 text-[#86868b] text-sm font-sf-text">
          <Link to="/" className="text-[#0066cc] hover:underline">
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  )
}
