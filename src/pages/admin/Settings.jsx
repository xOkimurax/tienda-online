import { useState, useEffect } from 'react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { supabase } from '../../lib/supabase'

const emptySettings = {
  store_name: '',
  contact_email: '',
  whatsapp_number: '',
  address: '',
  logo_url: '',
}

function Settings() {
  const [settings, setSettings] = useState(emptySettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('store_config').select('*')

      if (error) throw error

      const configMap = {}
      ;(data || []).forEach(row => {
        configMap[row.key] = row.value
      })

      setSettings({
        store_name: configMap.store_name || '',
        contact_email: configMap.contact_email || '',
        whatsapp_number: configMap.whatsapp_number || '',
        address: configMap.address || '',
        logo_url: configMap.logo_url || '',
      })
    } catch (err) {
      console.error('Settings error:', err)
      setError('Error al cargar configuración')
    } finally {
      setLoading(false)
    }
  }

  async function uploadLogo(file) {
    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `logo.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('store-assets').getPublicUrl(fileName)
      return data.publicUrl
    } catch (err) {
      console.error('Logo upload error:', err)
      throw err
    } finally {
      setUploading(false)
    }
  }

  async function handleLogoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const url = await uploadLogo(file)
      setSettings({ ...settings, logo_url: url })
    } catch (err) {
      alert('Error al subir logo')
    }
  }

  function handleChange(field, value) {
    setSettings({ ...settings, [field]: value })
    setSaved(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)

      const configRows = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
      }))

      for (const row of configRows) {
        const { error } = await supabase
          .from('store_config')
          .upsert(row, { onConflict: 'key' })

        if (error) throw error
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Save error:', err)
      setError('Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-500">Configura los datos de tu tienda</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500">Configura los datos de tu tienda</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6 space-y-6" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Logo de la Tienda</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden" style={{ backgroundColor: '#f0f0f0' }}>
                  {settings.logo_url ? (
                    <img src={settings.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ color: '#7a7a7a' }}>
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <label className="flex-1">
                  <span className="px-4 py-2 rounded-full cursor-pointer text-sm" style={{ backgroundColor: '#f5f5f7', color: '#333333' }}>
                    {uploading ? 'Subiendo...' : 'Cambiar logo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#333333' }}>Nombre de la Tienda</label>
              <input
                type="text"
                required
                value={settings.store_name}
                onChange={(e) => handleChange('store_name', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#e0e0e0', color: '#1d1d1f' }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#333333' }}>Email de Contacto</label>
                <input
                  type="email"
                  required
                  value={settings.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e0e0e0', color: '#1d1d1f' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#333333' }}>WhatsApp</label>
                <input
                  type="text"
                  required
                  value={settings.whatsapp_number}
                  onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e0e0e0', color: '#1d1d1f' }}
                  placeholder="+595 976 123 456"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#333333' }}>Dirección</label>
              <input
                type="text"
                required
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#e0e0e0', color: '#1d1d1f' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#333333' }}>Moneda</label>
              <input
                type="text"
                value="Gs. (Guaraní Paraguayo)"
                disabled
                className="w-full px-3 py-2 border rounded-lg cursor-not-allowed"
                style={{ borderColor: '#e0e0e0', color: '#7a7a7a', backgroundColor: '#f5f5f7' }}
              />
              <p className="text-xs mt-1" style={{ color: '#7a7a7a' }}>La moneda no se puede cambiar</p>
            </div>
          </CardContent>

          <div className="px-6 py-4 flex items-center gap-4" style={{ borderTop: '1px solid #f0f0f0' }}>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-5 py-2.5 text-sm font-medium rounded-full transition-colors"
              style={{ backgroundColor: '#0066cc', color: '#ffffff' }}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            {saved && (
              <span className="text-sm font-medium" style={{ color: '#0066cc' }}>Cambios guardados correctamente</span>
            )}
          </div>
        </Card>
      </form>
    </div>
  )
}

export default Settings