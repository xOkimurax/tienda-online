import { useState, useEffect } from 'react'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '../../components/ui/dialog'
import { supabase } from '../../lib/supabase'

const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

const statusConfig = {
  pending: { label: 'Pendiente', class: 'bg-amber-100 text-amber-800' },
  confirmed: { label: 'Confirmado', class: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Enviado', class: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Entregado', class: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelado', class: 'bg-red-100 text-red-800' },
}

const statusApple = {
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

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles(full_name, email, phone)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      console.error('Orders error:', err)
      setError('Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }

  async function fetchOrderItems(orderId) {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*, products(name)')
        .eq('order_id', orderId)

      if (error) throw error
      setOrderItems(data || [])
    } catch (err) {
      console.error('Order items error:', err)
      setOrderItems([])
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      fetchOrders()
    } catch (err) {
      console.error('Status change error:', err)
      alert('Error al cambiar estado')
    }
  }

  async function openDetailModal(order) {
    setSelectedOrder(order)
    setDetailModalOpen(true)
    await fetchOrderItems(order.id)
  }

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-500">{orders.length} pedidos en total</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}

      <Card>
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <label className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todos</option>
              {statuses.map(status => (
                <option key={status} value={status}>{statusConfig[status].label}</option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="p-8 space-y-4" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded animate-pulse" style={{ backgroundColor: '#f0f0f0' }} />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center" style={{ color: '#7a7a7a', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px' }}>No hay pedidos{filterStatus !== 'all' ? ' con ese estado' : ''}</div>
        ) : (
          <div className="overflow-x-auto" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#f5f5f7', borderBottom: '1px solid #e0e0e0' }}>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#7a7a7a', letterSpacing: '-0.12px' }}>ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#7a7a7a', letterSpacing: '-0.12px' }}>Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#7a7a7a', letterSpacing: '-0.12px' }}>Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#7a7a7a', letterSpacing: '-0.12px' }}>Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#7a7a7a', letterSpacing: '-0.12px' }}>Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#7a7a7a', letterSpacing: '-0.12px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: '#1d1d1f' }}>#{order.id.slice(-6)}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#333333' }}>{order.profiles?.full_name || 'Cliente'}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#7a7a7a' }}>{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: '#1d1d1f' }}>{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer"
                        style={{ backgroundColor: statusApple[order.status]?.bg, color: statusApple[order.status]?.color }}
                      >
                        {statuses.map(status => (
                          <option key={status} value={status}>{statusApple[status]?.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDetailModal(order)}
                        className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
                        style={{ backgroundColor: '#f5f5f7', color: '#1d1d1f' }}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} className="max-w-xl">
        <DialogHeader>
          <h3 className="text-lg font-semibold" style={{ color: '#1d1d1f' }}>Detalle del Pedido #{selectedOrder?.id?.slice(-6)}</h3>
        </DialogHeader>
        <DialogContent>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs" style={{ color: '#7a7a7a' }}>Cliente</p>
                  <p className="font-medium" style={{ color: '#1d1d1f' }}>{selectedOrder.profiles?.full_name || 'Cliente'}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#7a7a7a' }}>Fecha</p>
                  <p className="font-medium" style={{ color: '#1d1d1f' }}>{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#7a7a7a' }}>Email</p>
                  <p className="text-sm" style={{ color: '#333333' }}>{selectedOrder.profiles?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#7a7a7a' }}>Teléfono</p>
                  <p className="text-sm" style={{ color: '#333333' }}>{selectedOrder.profiles?.phone || '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs" style={{ color: '#7a7a7a' }}>Dirección</p>
                <p className="text-sm" style={{ color: '#333333' }}>{selectedOrder.shipping_address || '-'}</p>
              </div>

              <div className="pt-4" style={{ borderTop: '1px solid #e0e0e0' }}>
                <h4 className="font-medium mb-2" style={{ color: '#1d1d1f' }}>Productos</h4>
                <div className="space-y-2">
                  {orderItems.length === 0 ? (
                    <p className="text-sm" style={{ color: '#7a7a7a' }}>Cargando productos...</p>
                  ) : (
                    orderItems.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm" style={{ color: '#333333' }}>
                        <span>{item.quantity}x {item.products?.name || 'Producto'}</span>
                        <span style={{ color: '#7a7a7a' }}>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-between" style={{ borderTop: '1px solid #e0e0e0' }}>
                <span className="font-medium" style={{ color: '#1d1d1f' }}>Total</span>
                <span className="font-bold" style={{ color: '#0066cc' }}>{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <button
            onClick={() => setDetailModalOpen(false)}
            className="px-5 py-2.5 text-sm font-medium rounded-full transition-colors"
            style={{ backgroundColor: '#f5f5f7', color: '#1d1d1f' }}
          >
            Cerrar
          </button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}

export default Orders