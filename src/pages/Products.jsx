import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/products/ProductCard'

function ProductSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="aspect-[3/4] bg-surface-container border border-surface-variant mb-4" />
      <div className="h-3 bg-surface-container rounded w-1/3 mb-2" />
      <div className="h-4 bg-surface-container rounded w-3/4" />
    </div>
  )
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(['Todas'])
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data } = await supabase.from('categories').select('name').order('name')
        if (data) {
          setCategories(['Todas', ...data.map(c => c.name)])
        }
      } catch (err) {
        console.error('Error al cargar categorías:', err)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const categoryParam = searchParams.get('categoria')
    if (categoryParam) {
      const found = categories.find(
        (c) => c.toLowerCase() === categoryParam.toLowerCase()
      )
      if (found) setSelectedCategory(found)
    }
  }, [searchParams, categories])

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        setError(null)

        let query = supabase
          .from('products')
          .select('*, categories(name)')
          .eq('active', true)

        if (searchTerm) {
          query = query.ilike('name', `%${searchTerm}%`)
        }

        if (selectedCategory !== 'Todas') {
          query = query.eq('categories.name', selectedCategory)
        }

        if (minPrice) {
          query = query.gte('price', parseInt(minPrice))
        }

        if (maxPrice) {
          query = query.lte('price', parseInt(maxPrice))
        }

        const { data, error } = await query.order('name')

        if (error) {
          setError('Error al cargar productos')
          setProducts([])
        } else {
          setProducts(data || [])
        }
      } catch (err) {
        setError('Error al cargar productos: ' + err.message)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetchProducts, 300)
    return () => clearTimeout(debounce)
  }, [searchTerm, selectedCategory, minPrice, maxPrice])

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat)
    if (cat === 'Todas') {
      setSearchParams({})
    } else {
      setSearchParams({ categoria: cat.toLowerCase() })
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('Todas')
    setMinPrice('')
    setMaxPrice('')
    setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-section-padding">
        {/* Page Header */}
        <div className="mb-stack-lg">
          <h1 className="text-h1 font-h1 mb-stack-md">Productos</h1>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-stack-sm border-b border-surface-variant gap-4">
            <div className="text-body-sm font-body-sm text-secondary">
              {products.length} productos
            </div>
            {/* Search bar */}
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" style={{ fontSize: '18px' }}>search</span>
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-transparent border border-surface-variant text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-secondary"
              />
            </div>
          </div>
        </div>

        {/* Content with Sidebar */}
        <div className="flex flex-col md:flex-row gap-gutter">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 shrink-0">
            {/* Categories */}
            <div className="mb-stack-lg border-b border-surface-variant pb-stack-lg">
              <h3 className="text-label font-label uppercase mb-stack-md">Categorías</h3>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => handleCategoryChange(cat)}
                      className={`text-body-base font-body-base w-full text-left transition-colors ${
                        selectedCategory === cat
                          ? 'text-primary font-medium'
                          : 'text-secondary hover:text-primary'
                      }`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div className="mb-stack-lg border-b border-surface-variant pb-stack-lg">
              <h3 className="text-label font-label uppercase mb-stack-md">Precio</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Mín"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-transparent border border-surface-variant text-body-sm font-body-sm py-2 px-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-center placeholder:text-secondary"
                />
                <span className="text-secondary text-sm">-</span>
                <input
                  type="number"
                  placeholder="Máx"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-transparent border border-surface-variant text-body-sm font-body-sm py-2 px-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-center placeholder:text-secondary"
                />
              </div>
            </div>

            {/* Clear filters */}
            {(searchTerm || selectedCategory !== 'Todas' || minPrice || maxPrice) && (
              <button
                onClick={clearFilters}
                className="text-body-sm font-body-sm text-secondary hover:text-primary underline w-full text-left"
              >
                Limpiar filtros
              </button>
            )}
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-error mb-2 text-body-base font-body-base">Error al cargar productos</p>
                <p className="text-secondary text-body-sm font-body-sm">{error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-secondary text-body-base font-body-base">No se encontraron productos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {products.map((product) => (
                  <ProductCard key={product.id} product={{
                    ...product,
                    image: product.images?.[0] || product.images,
                    category: product.categories?.name,
                  }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
