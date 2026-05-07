import { useState, useEffect } from 'react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '../../components/ui/dialog'
import { supabase } from '../../lib/supabase'

function formatPrice(value) {
  return `Gs. ${(value || 0).toLocaleString('es-PY')}`
}

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category_id: '',
  images: [],
  featured: false,
  active: true,
}

function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState(emptyProduct)

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  async function fetchCategories() {
    try {
      const { data } = await supabase.from('categories').select('*').order('name')
      setCategories(data || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error('Products error:', err)
      setError('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  async function uploadImage(file) {
    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
      return data.publicUrl
    } catch (err) {
      console.error('Upload error:', err)
      throw err
    } finally {
      setUploading(false)
    }
  }

  async function handleImageChange(e, field) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const url = await uploadImage(file)
      setFormData({ ...formData, [field]: [...(formData[field] || []), url] })
    } catch (err) {
      alert('Error al subir imagen')
    }
  }

  function removeImage(field, index) {
    const newImages = [...formData[field]]
    newImages.splice(index, 1)
    setFormData({ ...formData, [field]: newImages })
  }

  async function handleOpenModal(product = null) {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || '',
        category_id: product.category_id || '',
        images: product.images || [],
        featured: product.featured || false,
        active: product.active !== false,
      })
    } else {
      setEditingProduct(null)
      setFormData(emptyProduct)
    }
    setModalOpen(true)
  }

  function handleCloseModal() {
    setModalOpen(false)
    setEditingProduct(null)
    setFormData(emptyProduct)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock),
        category_id: formData.category_id || null,
        images: formData.images,
        featured: formData.featured,
        active: formData.active,
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('products').insert(productData)
        if (error) throw error
      }

      handleCloseModal()
      fetchProducts()
    } catch (err) {
      console.error('Submit error:', err)
      alert('Error al guardar producto')
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este producto?')) return

    try {
      const { error } = await supabase
        .from('products')
        .update({ active: false })
        .eq('id', id)
      if (error) throw error
      fetchProducts()
    } catch (err) {
      console.error('Delete error:', err)
      alert('Error al eliminar')
    }
  }

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500">{products.filter(p => p.active).length} productos activos</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="rounded-full px-5 py-2.5 text-sm font-medium"
          style={{ backgroundColor: '#0066cc', color: '#ffffff' }}
        >
          Agregar Producto
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}

      <Card>
        <CardContent className="p-4" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 rounded-full focus:outline-none"
              style={{ border: '1px solid #e0e0e0', color: '#1d1d1f', backgroundColor: '#ffffff' }}
            />
            <svg className="absolute left-3.5 top-2.5 w-5 h-5" style={{ color: '#7a7a7a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </CardContent>
      </Card>

      <Card>
        {loading ? (
          <div className="p-8 space-y-4" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded animate-pulse" style={{ backgroundColor: '#f0f0f0' }} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center" style={{ color: '#7a7a7a', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px' }}>No hay productos{search ? ' que coincidan con la búsqueda' : ''}</div>
        ) : (
          <div className="overflow-x-auto" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#f5f5f7', borderBottom: '1px solid #e0e0e0' }}>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#7a7a7a', letterSpacing: '-0.12px' }}>Imagen</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#7a7a7a', letterSpacing: '-0.12px' }}>Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#7a7a7a', letterSpacing: '-0.12px' }}>Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#7a7a7a', letterSpacing: '-0.12px' }}>Precio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#7a7a7a', letterSpacing: '-0.12px' }}>Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#7a7a7a', letterSpacing: '-0.12px' }}>Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#7a7a7a', letterSpacing: '-0.12px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td className="px-4 py-3">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: '#f0f0f0' }} />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium" style={{ color: '#1d1d1f' }}>{product.name}</p>
                        {product.featured && (
                          <span className="inline-flex px-1.5 py-0.5 text-xs rounded-full" style={{ backgroundColor: 'rgba(255, 159, 0, 0.15)', color: '#333333' }}>Destacado</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#333333' }}>{product.categories?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: '#1d1d1f' }}>{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm`} style={{ color: product.stock === 0 ? '#7a7a7a' : '#333333' }}>
                        {product.stock === 0 ? 'Sin stock' : product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        product.active ? 'text-green-800' : 'text-gray-600'
                      }`} style={{ backgroundColor: product.active ? 'rgba(0, 102, 204, 0.1)' : '#f0f0f0' }}>
                        {product.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
                          style={{ backgroundColor: '#f5f5f7', color: '#1d1d1f' }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
                          style={{ backgroundColor: '#f0f0f0', color: '#7a7a7a' }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={modalOpen} onClose={handleCloseModal}>
        <DialogHeader>
          <h3 className="text-lg font-semibold" style={{ color: '#1d1d1f' }}>{editingProduct ? 'Editar Producto' : 'Agregar Producto'}</h3>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#333333' }}>Nombre</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#e0e0e0', color: '#1d1d1f' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#333333' }}>Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#e0e0e0', color: '#1d1d1f' }}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#333333' }}>Precio (Gs.)</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e0e0e0', color: '#1d1d1f' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#333333' }}>Stock</label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e0e0e0', color: '#1d1d1f' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#333333' }}>Categoría</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#e0e0e0', color: '#1d1d1f' }}
              >
                <option value="">Sin categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#333333' }}>Imágenes</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(formData.images || []).map((url, idx) => (
                  <div key={idx} className="relative">
                    <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage('images', idx)}
                      className="absolute -top-1 -right-1 rounded-full w-5 h-5 text-xs flex items-center justify-center"
                      style={{ backgroundColor: '#1d1d1f', color: '#ffffff' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <label className="block">
                <span className="px-3 py-2 rounded-full cursor-pointer text-sm" style={{ backgroundColor: '#f5f5f7', color: '#333333' }}>
                  {uploading ? 'Subiendo...' : 'Agregar imagen'}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'images')} disabled={uploading} />
              </label>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm" style={{ color: '#333333' }}>Producto destacado</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm" style={{ color: '#333333' }}>Activo</span>
              </label>
            </div>
          </DialogContent>
          <DialogFooter>
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-5 py-2.5 text-sm font-medium rounded-full transition-colors"
              style={{ backgroundColor: '#f5f5f7', color: '#1d1d1f' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2.5 text-sm font-medium rounded-full transition-colors"
              style={{ backgroundColor: '#0066cc', color: '#ffffff' }}
            >
              {editingProduct ? 'Guardar' : 'Crear'}
            </button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  )
}

export default Products