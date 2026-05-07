import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useCartStore from '../store/cartStore'
import { formatPrice } from '../components/products/ProductCard'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        setError(null)
        setSelectedImage(0)
        setQuantity(1)

        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('id', id)
          .single()

        if (error || !data) {
          setError('Producto no encontrado')
          setProduct(null)
        } else {
          setProduct(data)
        }
      } catch (err) {
        setError('Error al cargar producto: ' + err.message)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (product && quantity > 0 && quantity <= product.stock) {
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.categories?.name,
          image: product.images?.[0] || product.images,
        })
      }
      navigate('/carrito')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment py-8 px-4">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-xl" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-24 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-parchment py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-ink mb-2 font-sf-display">
            {error || 'Producto no encontrado'}
          </h2>
          <Link
            to="/productos"
            className="text-primary hover:text-primary-focus font-medium font-sf-text"
          >
            Volver a productos
          </Link>
        </div>
      </div>
    )
  }

  const images = Array.isArray(product.images) ? product.images : [product.images]

  return (
    <div className="min-h-screen bg-parchment py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/productos"
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary mb-6 font-sf-text"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a productos
        </Link>

        <div className="bg-white rounded-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6">
            <div className="space-y-4">
              <div className="aspect-square bg-parchment overflow-hidden">
                <img
                  src={images[selectedImage] || 'https://placehold.co/600x600/e2e8f0/64748b?text=Sin+imagen'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  style={{ boxShadow: 'rgba(0,0,0,0.22) 3px 5px 30px' }}
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 rounded-lg overflow-hidden transition-colors ${
                        selectedImage === idx
                          ? 'ring-2 ring-primary'
                          : 'hover:opacity-80'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-sm font-medium text-primary uppercase tracking-wide font-sf-text">
                  {product.categories?.name}
                </span>
                <h1 className="mt-2 text-2xl font-bold text-ink font-sf-display">
                  {product.name}
                </h1>
                <p className="mt-4 text-3xl font-bold text-ink font-sf-display">
                  {formatPrice(product.price)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full font-sf-text ${
                    product.stock > 5
                      ? 'bg-green-100 text-green-700'
                      : product.stock > 0
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} en stock` : 'Sin stock'}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-medium text-ink mb-2 font-sf-text">
                  Descripción
                </h3>
                <p className="text-ink-muted text-sm leading-relaxed font-sf-text">
                  {product.description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2 font-sf-text">
                  Cantidad
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full border border-hairline flex items-center justify-center text-ink hover:bg-parchment transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))
                    }
                    className="w-20 h-10 rounded-full border border-hairline text-center font-sf-text"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 rounded-full border border-hairline flex items-center justify-center text-ink hover:bg-parchment transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full py-3 px-6 bg-primary text-white font-semibold rounded-full hover:bg-primary-focus disabled:opacity-50 transition-colors font-sf-text"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
