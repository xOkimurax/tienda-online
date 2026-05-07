import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'
import { formatPrice } from '../components/products/ProductCard'

export default function Cart() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const total = getTotal()

  const handleCheckout = async () => {
    setError('')
    setLoading(true)

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (!currentUser) {
        navigate('/login')
        return
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ user_id: currentUser.id, total, status: 'pending' })
        .select()
        .single()

      if (orderError) {
        setError('Error al crear el pedido')
        setLoading(false)
        return
      }

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        setError('Error al guardar los productos: ' + itemsError.message)
        setLoading(false)
        return
      }

      clearCart()
      navigate('/perfil')
    } catch (err) {
      setError('Error al procesar el pedido: ' + err.message)
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-section-padding text-center">
        <h1 className="text-h1 font-h1 text-primary mb-stack-md">Tu carrito está vacío</h1>
        <p className="text-body-base font-body-base text-secondary mb-10">
          Agregá productos para comenzar tu pedido
        </p>
        <Link
          to="/productos"
          className="inline-flex items-center justify-center bg-primary text-on-primary px-8 py-4 font-label text-label uppercase tracking-widest hover:bg-primary-container transition-colors duration-400"
        >
          Ver Productos
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-section-padding">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-baseline mb-stack-lg border-b border-outline-variant pb-stack-sm">
        <h1 className="text-h1 font-h1 text-on-surface tracking-tighter">Carrito de Compras</h1>
        <Link
          to="/productos"
          className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors underline decoration-1 underline-offset-4 mt-4 sm:mt-0"
        >
          Seguir Comprando
        </Link>
      </div>

      {/* Cart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-stack-lg items-start">
        {/* Items List */}
        <div className="lg:col-span-8 flex flex-col w-full">
          {/* Table Header — hidden on mobile */}
          <div className="hidden md:grid grid-cols-12 gap-stack-md text-label font-label text-on-surface-variant uppercase tracking-widest pb-stack-sm border-b border-outline-variant">
            <div className="col-span-6">Producto</div>
            <div className="col-span-2 text-right">Precio</div>
            <div className="col-span-2 text-center">Cantidad</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {/* Cart Items */}
          <div className="flex flex-col">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-stack-md items-center py-stack-lg border-b border-outline-variant"
              >
                {/* Product Info */}
                <div className="col-span-6 flex gap-stack-md items-start">
                  <div className="w-24 md:w-28 shrink-0 aspect-[3/4] bg-surface-container-low overflow-hidden">
                    <img
                      src={item.image || 'https://placehold.co/80x80/e2e8f0/64748b?text=IMG'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-stack-xs pt-1">
                    <Link
                      to={`/productos/${item.id}`}
                      className="text-body-base font-body-base text-primary hover:underline underline-offset-2"
                    >
                      {item.name}
                    </Link>
                    <span className="text-body-sm font-body-sm text-on-surface-variant">{formatPrice(item.price)} c/u</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-label font-label text-on-surface-variant flex items-center gap-1 mt-2 w-max hover:text-error transition-colors md:hidden"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span> Eliminar
                    </button>
                  </div>
                </div>

                {/* Price — desktop */}
                <div className="hidden md:block col-span-2 md:text-right">
                  <span className="text-body-base font-body-base text-on-surface-variant">{formatPrice(item.price)}</span>
                </div>

                {/* Quantity */}
                <div className="col-span-2 flex justify-start md:justify-center mt-4 md:mt-0">
                  <div className="flex items-center border border-outline-variant overflow-hidden h-10 w-28">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <input
                      className="w-12 h-full text-center border-none text-body-sm font-body-sm p-0 focus:ring-0 text-on-surface bg-transparent"
                      readOnly
                      type="text"
                      value={item.quantity}
                    />
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                </div>

                {/* Subtotal & Remove */}
                <div className="col-span-2 flex justify-between md:justify-end items-center mt-4 md:mt-0">
                  <span className="text-body-base font-body-base text-primary md:hidden block">Total:</span>
                  <div className="flex items-center gap-stack-md">
                    <span className="text-body-base font-body-base text-primary">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-on-surface-variant hover:text-error transition-colors hidden md:flex items-center justify-center w-8 h-8 rounded-full hover:bg-error-container"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 w-full sticky top-24">
          <div className="bg-surface-container-lowest border border-outline-variant p-stack-lg flex flex-col gap-stack-md">
            <h2 className="text-h3 font-h3 text-on-surface mb-2">Resumen del Pedido</h2>

            {error && (
              <div className="bg-error-container border border-error text-on-error-container px-4 py-3 text-body-sm font-body-sm">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center text-body-base font-body-base text-on-surface-variant">
              <span>Subtotal</span>
              <span className="text-on-surface">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between items-center text-body-base font-body-base text-on-surface-variant">
              <span>Envío Estimado</span>
              <span className="text-on-surface">A confirmar</span>
            </div>

            <div className="h-px bg-outline-variant w-full my-stack-sm"></div>

            <div className="flex justify-between items-end text-h4 font-h4 text-primary">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <p className="text-body-sm font-body-sm text-on-surface-variant mt-2 mb-4 leading-relaxed">
              Los gastos de envío y los impuestos se calcularán durante el paso final de la compra.
            </p>

            <button
              onClick={handleCheckout}
              disabled={loading || !user}
              className="w-full bg-primary text-on-primary h-14 flex items-center justify-center text-label font-label uppercase tracking-widest hover:bg-inverse-surface transition-colors duration-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'FINALIZAR COMPRA'}
            </button>

            <div className="flex justify-center items-center gap-2 mt-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">lock</span>
              <span className="text-label font-label tracking-widest uppercase">{user ? 'Serás redirigido' : 'Iniciá sesión para continuar'}</span>
            </div>

            <Link
              to="/productos"
              className="w-full text-center py-3 border border-outline-variant text-body-sm font-body-sm text-on-surface hover:bg-surface-container-low transition-colors"
            >
              Seguir Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
