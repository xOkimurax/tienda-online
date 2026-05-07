import { useState, useEffect } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import useCartStore from '../../store/cartStore'
import useAuthStore from '../../store/authStore'

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const cartCount = useCartStore((state) => state.getCount())
  const { user, profile, loading, fetchSession } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchSession()
  }, [])

  const navLinks = [
    { to: '/', label: 'Tienda' },
    { to: '/productos', label: 'Colección' },
    { to: '/contacto', label: 'Contacto' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-sans antialiased">
      {/* Email verification banner */}
      {user && !user.email_confirmed_at && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
          <p className="text-body-sm font-body-sm text-amber-800">
            Verificá tu email para acceder a todas las funciones.{' '}
            <Link to="/verify-email" className="font-medium underline hover:text-amber-900">
              Verificar ahora
            </Link>
          </p>
        </div>
      )}

      {/* TopAppBar */}
      <header className="bg-surface-container-lowest border-b border-surface-variant sticky top-0 z-50 transition-colors duration-300">
        <div className="flex flex-col w-full max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link to="/" className="text-2xl font-black tracking-tighter text-primary shrink-0">
              Tienda Online
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="font-sans uppercase tracking-widest text-xs font-medium text-secondary hover:text-primary hover:opacity-70 transition-all duration-400"
                >
                  {link.label}
                </Link>
              ))}
              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="font-sans uppercase tracking-widest text-xs font-medium text-primary border-b border-primary pb-1 hover:opacity-70 transition-all duration-400"
                >
                  Admin
                </Link>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4 text-secondary">
              {/* Search */}
              <Link
                to="/productos"
                className="hover:text-primary transition-colors flex items-center justify-center"
                aria-label="Buscar"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
              </Link>

              {/* Profile / Login */}
              {user ? (
                <Link
                  to="/perfil"
                  className="hover:text-primary transition-colors flex items-center justify-center relative"
                  aria-label="Perfil"
                >
                  <span className="material-symbols-outlined text-[20px]">account_circle</span>
                  {user.email_confirmed_at && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="hover:text-primary transition-colors flex items-center justify-center"
                  aria-label="Iniciar sesión"
                >
                  <span className="material-symbols-outlined text-[20px]">account_circle</span>
                </Link>
              )}

              {/* Cart */}
              <Link
                to="/carrito"
                className="hover:text-primary transition-colors flex items-center justify-center relative"
                aria-label="Carrito"
              >
                <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-on-primary text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center leading-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Hamburger — mobile only */}
              <button
                type="button"
                className="md:hidden flex items-center justify-center text-secondary hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {mobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface-container-lowest border-t border-surface-variant">
            <div className="flex flex-col px-8 py-6 gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-body-base font-body-base text-on-surface hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-body-base font-body-base text-primary hover:opacity-70 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Panel Admin
                </Link>
              )}
              <hr className="border-surface-variant" />
              <Link
                to={user ? '/perfil' : '/login'}
                className="text-body-base font-body-base text-on-surface hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {user ? 'Mi Perfil' : 'Iniciar Sesión'}
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-surface-variant">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-16 max-w-[1200px] mx-auto px-6 w-full">
          <div className="col-span-1 md:col-span-2">
            <p className="text-lg font-bold text-primary mb-4">Tienda Online</p>
            <p className="font-sans text-xs tracking-tight leading-relaxed text-secondary max-w-xs">
              © 2026 Tienda Online. Todos los derechos reservados.
            </p>
          </div>
          <div className="col-span-1 flex flex-col gap-3">
            <span className="font-semibold text-on-surface text-xs tracking-tight mb-2">Legal</span>
            <a className="text-xs tracking-tight leading-relaxed text-secondary hover:text-primary hover:underline transition-all duration-200" href="#">Política de Privacidad</a>
            <a className="text-xs tracking-tight leading-relaxed text-secondary hover:text-primary hover:underline transition-all duration-200" href="#">Términos de Servicio</a>
          </div>
          <div className="col-span-1 flex flex-col gap-3">
            <span className="font-semibold text-on-surface text-xs tracking-tight mb-2">Atención</span>
            <a className="text-xs tracking-tight leading-relaxed text-secondary hover:text-primary hover:underline transition-all duration-200" href="#">Envíos</a>
            <a className="text-xs tracking-tight leading-relaxed text-secondary hover:text-primary hover:underline transition-all duration-200" href="#">Devoluciones</a>
            <Link to="/contacto" className="text-xs tracking-tight leading-relaxed text-secondary hover:text-primary hover:underline transition-all duration-200">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
