import { useState, useEffect } from 'react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const statusBadge = {
  pending: { label: 'Pendiente', bg: 'rgba(255, 159, 0, 0.15)', color: '#333333' },
  confirmed: { label: 'Confirmado', bg: 'rgba(0, 102, 204, 0.15)', color: '#0066cc' },
  shipped: { label: 'Enviado', bg: 'rgba(128, 0, 128, 0.15)', color: '#333333' },
  delivered: { label: 'Entregado', bg: 'rgba(0, 128, 0, 0.15)', color: '#333333' },
  cancelled: { label: 'Cancelado', bg: 'rgba(255, 0, 0, 0.15)', color: '#333333' },
}

function formatPrice(value) {
  return `Gs. ${(value || 0).toLocaleString('es-PY')}`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gray-100 animate-pulse h-12 w-12" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState({ salesToday: 0, salesMonth: 0, pendingOrders: 0, totalProducts: 0 })
  const [salesData, setSalesData] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      setError(null)

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

      const [salesTodayRes, salesMonthRes, pendingRes, productsRes, ordersRes, chartRes] = await Promise.all([
        supabase.from('orders').select('total').gte('created_at', today.toISOString()),
        supabase.from('orders').select('total').gte('created_at', monthStart.toISOString()),
        supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('products').select('id', { count: 'exact' }).eq('active', true),
        supabase.from('orders')
          .select('*, profiles(full_name)')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.from('orders')
          .select('created_at, total')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      ])

      setKpis({
        salesToday: salesTodayRes.data?.reduce((sum, o) => sum + (o.total || 0), 0) || 0,
        salesMonth: salesMonthRes.data?.reduce((sum, o) => sum + (o.total || 0), 0) || 0,
        pendingOrders: pendingRes.count || 0,
        totalProducts: productsRes.count || 0,
      })

      setRecentOrders(ordersRes.data || [])

      const last7Days = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const dayLabel = date.toLocaleDateString('es-PY', { weekday: 'short' }).replace('.', '')
        const daySales = (chartRes.data || [])
          .filter(o => o.created_at.startsWith(dateStr))
          .reduce((sum, o) => sum + (o.total || 0), 0)
        last7Days.push({ day: dayLabel, sales: daySales })
      }
      setSalesData(last7Days)
    } catch (err) {
      console.error('Dashboard error:', err)
      setError('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const maxSales = Math.max(...salesData.map(d => d.sales), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Resumen de tu tienda</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Card>
              <CardContent className="p-4" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: '#f5f5f7' }}>
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#7a7a7a' }}>Ventas Hoy</p>
                    <p className="text-xl font-bold" style={{ color: '#1d1d1f' }}>{formatPrice(kpis.salesToday)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: '#f5f5f7' }}>
                    <span className="text-2xl">📈</span>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#7a7a7a' }}>Ventas Mes</p>
                    <p className="text-xl font-bold" style={{ color: '#1d1d1f' }}>{formatPrice(kpis.salesMonth)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: '#f5f5f7' }}>
                    <span className="text-2xl">⏳</span>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#7a7a7a' }}>Pedidos Pendientes</p>
                    <p className="text-xl font-bold" style={{ color: '#1d1d1f' }}>{kpis.pendingOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: '#f5f5f7' }}>
                    <span className="text-2xl">📦</span>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#7a7a7a' }}>Total Productos</p>
                    <p className="text-xl font-bold" style={{ color: '#1d1d1f' }}>{kpis.totalProducts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Ventas últimos 7 días</h2>
        </div>
        <CardContent className="p-4" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          {loading ? (
            <div className="h-40 flex items-end justify-between gap-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex-1 rounded-t-md animate-pulse h-full" style={{ backgroundColor: '#f0f0f0' }} />
              ))}
            </div>
          ) : (
            <div className="flex items-end justify-between gap-2 h-40">
              {salesData.map((data) => {
                const height = (data.sales / maxSales) * 100
                return (
                  <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full h-full relative">
                      <div
                        className="absolute bottom-0 inset-x-0 rounded-t-md transition-all"
                        style={{ height: `${Math.max(height, 4)}%`, minHeight: '8px', backgroundColor: 'rgba(0, 102, 204, 0.15)' }}
                      />
                      <div
                        className="absolute bottom-0 inset-x-0 rounded-t-md"
                        style={{ height: `${Math.max(height, 4)}%`, minHeight: '8px', backgroundColor: '#0066cc' }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 capitalize">{data.day}</span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <h2 className="font-semibold" style={{ color: '#1d1d1f' }}>Últimos pedidos</h2>
          <Link to="/admin/pedidos">
            <button
              className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
              style={{ backgroundColor: '#f5f5f7', color: '#1d1d1f' }}
            >
              Ver todos
            </button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No hay pedidos aún</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#f5f5f7', borderBottom: '1px solid #e0e0e0' }}>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#7a7a7a', letterSpacing: '-0.12px' }}>ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#7a7a7a', letterSpacing: '-0.12px' }}>Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#7a7a7a', letterSpacing: '-0.12px' }}>Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#7a7a7a', letterSpacing: '-0.12px' }}>Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#7a7a7a', letterSpacing: '-0.12px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: '#1d1d1f' }}>#{order.id.slice(-6)}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#333333' }}>{order.profiles?.full_name || 'Cliente'}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#7a7a7a' }}>{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: '#1d1d1f' }}>{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: statusBadge[order.status]?.bg || '#f0f0f0', color: statusBadge[order.status]?.color || '#333333' }}>
                        {statusBadge[order.status]?.label || order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  )
}

export default Dashboard