import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../components/products/ProductCard'

const statusConfig = {
  pending: { label: 'Pendiente', class: 'bg-surface-container text-secondary' },
  confirmed: { label: 'Confirmado', class: 'bg-surface-container text-primary font-medium' },
  delivered: { label: 'Entregado', class: 'bg-surface-container text-primary font-medium' },
  cancelled: { label: 'Cancelado', class: 'bg-error-container text-on-error-container' },
}

export default function Profile() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', address: '' })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchProfile()
    fetchOrders()
  }, [user, navigate])

  async function fetchProfile() {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (data) {
        setProfile(data)
        setForm({ full_name: data.full_name || '', phone: data.phone || '', address: data.address || '' })
      }
    } catch (err) {
      console.error('Error al cargar perfil:', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchOrders() {
    try {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (data) setOrders(data)
    } catch (err) {
      console.error('Error al cargar pedidos:', err)
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault()
    try {
      await supabase
        .from('profiles')
        .update(form)
        .eq('id', user.id)
      setProfile((prev) => ({ ...prev, ...form }))
      setEditing(false)
    } catch (err) {
      console.error('Error al actualizar perfil:', err)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (!user) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-section-padding text-center">
        <h1 className="text-h1 font-h1 text-primary mb-stack-md">
          Inicia sesión para ver tu perfil
        </h1>
        <p className="text-body-base font-body-base text-secondary mb-10">
          Accedé a tu información e historial de pedidos
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center bg-primary text-on-primary px-8 py-4 font-label text-label uppercase tracking-widest hover:bg-primary-container transition-colors duration-400"
        >
          Iniciar Sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-section-padding">
      <h1 className="text-h1 font-h1 mb-stack-lg border-b border-surface-variant pb-stack-sm">Mi Perfil</h1>

      <div className="grid lg:grid-cols-3 gap-gutter">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-surface-container-lowest border border-surface-variant p-stack-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center text-h4 text-primary font-semibold">
                {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-body-base font-body-base font-semibold text-primary">
                  {profile?.full_name || 'Usuario'}
                </p>
                <p className="text-body-sm font-body-sm text-secondary">Cliente</p>
              </div>
            </div>

            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="text-label font-label uppercase text-secondary">Nombre</label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                    className="w-full px-3 py-2 bg-transparent border border-surface-variant text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-label font-label uppercase text-secondary">Teléfono</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-transparent border border-surface-variant text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-label font-label uppercase text-secondary">Dirección</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    className="w-full px-3 py-2 bg-transparent border border-surface-variant text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-3 bg-primary text-on-primary text-label font-label uppercase tracking-widest hover:bg-primary-container transition-colors">
                    Guardar
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="flex-1 py-3 border border-outline-variant text-label font-label uppercase tracking-widest text-on-surface hover:bg-surface-container-low transition-colors">
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-label font-label uppercase text-secondary">Email</p>
                  <p className="text-body-sm font-body-sm text-on-surface">{user.email}</p>
                </div>
                <div>
                  <p className="text-label font-label uppercase text-secondary">Teléfono</p>
                  <p className="text-body-sm font-body-sm text-on-surface">{profile?.phone || 'No registrado'}</p>
                </div>
                <div>
                  <p className="text-label font-label uppercase text-secondary">Dirección</p>
                  <p className="text-body-sm font-body-sm text-on-surface">{profile?.address || 'No registrada'}</p>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="w-full py-3 text-label font-label uppercase tracking-widest text-primary border border-surface-variant hover:bg-surface-container-low transition-colors"
                >
                  Editar perfil
                </button>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="w-full mt-6 py-3 border border-outline-variant text-label font-label uppercase tracking-widest text-on-surface hover:bg-surface-container-low transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Orders */}
        <div className="lg:col-span-2">
          <div className="bg-surface-container-lowest border border-surface-variant p-stack-lg">
            <h2 className="text-h3 font-h3 text-primary mb-6">Historial de Pedidos</h2>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-surface-container" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-body-base font-body-base text-secondary">Aún no tenés pedidos</p>
                <Link
                  to="/productos"
                  className="text-label font-label text-primary uppercase tracking-widest mt-2 inline-block hover:opacity-70 transition-opacity"
                >
                  Ver productos
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.pending
                  return (
                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-surface-variant"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-on-surface text-body-sm font-body-sm">
                            #{order.id.slice(0, 8)}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${status.class}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-body-sm font-body-sm text-secondary">
                          {new Date(order.created_at).toLocaleDateString('es-ES')} • {order.order_items?.length || 0} productos
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-h4 font-h4 text-primary">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
