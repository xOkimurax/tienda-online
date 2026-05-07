import { useState, useEffect } from 'react'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '../../components/ui/dialog'
import { supabase } from '../../lib/supabase'

function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({ name: '', slug: '', image_url: '' })

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      console.error('Categories error:', err)
      setError('Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }

  async function handleOpenModal(category = null) {
    if (category) {
      setEditingCategory(category)
      setFormData({ name: category.name, slug: category.slug, image_url: category.image_url || '' })
    } else {
      setEditingCategory(null)
      setFormData({ name: '', slug: '', image_url: '' })
    }
    setModalOpen(true)
  }

  function handleCloseModal() {
    setModalOpen(false)
    setEditingCategory(null)
    setFormData({ name: '', slug: '', image_url: '' })
  }

  function handleNameChange(name) {
    setFormData({
      ...formData,
      name,
      slug: editingCategory ? formData.slug : generateSlug(name),
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const categoryData = { ...formData }

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('categories').insert(categoryData)
        if (error) throw error
      }

      handleCloseModal()
      fetchCategories()
    } catch (err) {
      console.error('Submit error:', err)
      alert('Error al guardar categoría')
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta categoría?')) return

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
      fetchCategories()
    } catch (err) {
      console.error('Delete error:', err)
      alert('Error al eliminar')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-500">{categories.length} categorías</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="rounded-full px-5 py-2.5 text-sm font-medium"
          style={{ backgroundColor: '#0066cc', color: '#ffffff' }}
        >
          Agregar Categoría
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}

      <Card>
        {loading ? (
          <div className="p-8 space-y-4" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded animate-pulse" style={{ backgroundColor: '#f0f0f0' }} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center" style={{ color: '#7a7a7a', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px' }}>No hay categorías</div>
        ) : (
          <div className="overflow-x-auto" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#f5f5f7', borderBottom: '1px solid #e0e0e0' }}>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#7a7a7a', letterSpacing: '-0.12px' }}>Imagen</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#7a7a7a', letterSpacing: '-0.12px' }}>Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#7a7a7a', letterSpacing: '-0.12px' }}>Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#7a7a7a', letterSpacing: '-0.12px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td className="px-4 py-3">
                      {category.image_url ? (
                        <img src={category.image_url} alt={category.name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: '#f0f0f0' }} />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: '#1d1d1f' }}>{category.name}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#7a7a7a' }}>{category.slug}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(category)}
                          className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
                          style={{ backgroundColor: '#f5f5f7', color: '#1d1d1f' }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
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
          <h3 className="text-lg font-semibold">{editingCategory ? 'Editar Categoría' : 'Agregar Categoría'}</h3>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#333333' }}>Nombre</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#e0e0e0', color: '#1d1d1f' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#333333' }}>Slug</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#e0e0e0', color: '#1d1d1f' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#333333' }}>URL de Imagen</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#e0e0e0', color: '#1d1d1f' }}
                placeholder="https://..."
              />
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
              className="px-5 py-2.5 text-sm font-medium rounded-full transition-colors"
              style={{ backgroundColor: '#0066cc', color: '#ffffff' }}
            >
              {editingCategory ? 'Guardar' : 'Crear'}
            </button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  )
}

export default Categories