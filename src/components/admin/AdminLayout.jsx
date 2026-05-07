import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/productos', label: 'Productos', icon: '📦' },
  { path: '/admin/categorias', label: 'Categorías', icon: '🏷️' },
  { path: '/admin/pedidos', label: 'Pedidos', icon: '📋' },
  { path: '/admin/configuracion', label: 'Configuración', icon: '⚙️' },
]

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [checking, setChecking] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading, fetchProfile, profile } = useAuthStore()

  useEffect(() => {
    async function checkAuth() {
      if (loading) return
      if (!user) {
        navigate('/login')
        return
      }
      await fetchProfile()
      const currentProfile = useAuthStore.getState().profile
      if (currentProfile?.role !== 'admin') {
        navigate('/', { replace: true })
      } else {
        setChecking(false)
      }
    }
    checkAuth()
  }, [loading, user, navigate, fetchProfile])

  if (checking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f5f7' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#0066cc' }}></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f5f5f7' }}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ backgroundColor: '#1d1d1f' }}
      >
        <div className="flex flex-col h-full">
          <div className="px-4 py-5" style={{ borderBottom: '1px solid #333333' }}>
            <h1 className="text-xl font-semibold" style={{ color: '#ffffff' }}>Admin Panel</h1>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-colors
                    ${isActive
                      ? 'font-medium'
                      : ''
                    }
                  `}
                  style={{
                    color: isActive ? '#0066cc' : '#ffffff',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  }}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4" style={{ borderTop: '1px solid #333333' }}>
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
              style={{ color: '#cccccc' }}
            >
              <span>←</span>
              <span>Volver a la tienda</span>
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-4 py-4 lg:px-6 flex items-center gap-4" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: '#1d1d1f' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-semibold" style={{ color: '#1d1d1f' }}>Panel de Administración</h2>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout