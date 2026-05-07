import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/products/ProductCard'

const categoryIcons = {
  Electrónica: '📱',
  Ropa: '👕',
  Hogar: '🏠',
  Deportes: '⚽',
}

function ProductSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="aspect-[3/4] bg-surface-container border border-surface-variant mb-4" />
      <div className="h-3 bg-surface-container rounded w-1/3 mb-2" />
      <div className="h-4 bg-surface-container rounded w-3/4" />
    </div>
  )
}

export default function Home() {
  const [categories, setCategories] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const [catResult, featResult] = await Promise.all([
          supabase.from('categories').select('*').order('name'),
          supabase.from('products').select('*, categories(name)').eq('featured', true).eq('active', true),
        ])

        if (catResult.error) setError('Error al cargar categorías')
        else setCategories(catResult.data || [])

        if (featResult.error) setError('Error al cargar productos')
        else setFeaturedProducts(featResult.data || [])
      } catch (err) {
        setError('Error al cargar datos: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden bg-surface-container">
        <div className="relative z-10 text-center flex flex-col items-center bg-surface-container-lowest/90 backdrop-blur-sm p-10 md:p-12 border border-surface-variant max-w-[600px] mx-4">
          <h1 className="text-h1 font-h1 text-primary mb-stack-md uppercase tracking-tight">
            Tu Tienda Online
          </h1>
          <p className="text-body-base font-body-base text-on-surface-variant max-w-md mb-stack-lg">
            Encontrá los mejores productos en electrónica, ropa, hogar y más. Calidad garantizada a precios increíbles.
          </p>
          <Link
            to="/productos"
            className="inline-flex items-center justify-center bg-primary text-on-primary px-8 py-4 font-label text-label uppercase tracking-widest hover:bg-primary-container transition-colors duration-400"
          >
            Ver Productos
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-section-padding">
        <div className="flex items-end justify-between mb-stack-lg border-b border-surface-variant pb-stack-sm">
          <h2 className="text-h2 font-h2 text-primary tracking-tight">Productos Destacados</h2>
          <Link
            to="/productos"
            className="font-label text-label text-primary uppercase tracking-widest hover:opacity-70 transition-opacity"
          >
            Ver Todo
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : featuredProducts.length === 0 ? (
          <p className="text-center text-body-base font-body-base text-secondary py-12">
            No hay productos destacados
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={{
                ...product,
                image: product.images?.[0] || product.images,
                category: product.categories?.name,
              }} />
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="w-full bg-surface-container-low border-t border-surface-variant py-section-padding">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <h2 className="text-h2 font-h2 text-primary tracking-tight text-center mb-stack-lg">
            Categorías
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-[800px] mx-auto">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-8 animate-pulse bg-surface-container rounded-lg" />
              ))
            ) : categories.length === 0 ? (
              <p className="col-span-4 text-center text-body-base font-body-base text-secondary">
                No hay categorías disponibles
              </p>
            ) : (
              categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/productos?categoria=${cat.slug || cat.name.toLowerCase()}`}
                  className="flex flex-col items-center p-8 bg-surface-container-lowest border border-surface-variant hover:bg-surface-container-low transition-colors duration-300"
                >
                  <span className="text-4xl mb-4 leading-none">{categoryIcons[cat.name] || '📦'}</span>
                  <span className="text-body-base font-body-base font-medium text-primary">
                    {cat.name}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
