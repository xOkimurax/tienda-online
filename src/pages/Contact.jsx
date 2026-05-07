import { useState } from 'react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setForm({ name: '', email: '', subject: '', message: '' })
    setTimeout(() => setSubmitted(false), 3000)
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-section-padding">
      <h1 className="text-h1 font-h1 mb-stack-lg border-b border-surface-variant pb-stack-sm">Contacto</h1>

      <div className="grid lg:grid-cols-2 gap-gutter">
        {/* Form */}
        <div className="bg-surface-container-lowest border border-surface-variant p-stack-lg">
          <h2 className="text-h3 font-h3 text-primary mb-6">Enviános un mensaje</h2>

          {submitted && (
            <div className="bg-surface-container text-on-surface px-4 py-3 mb-6 text-body-sm font-body-sm border border-surface-variant">
              Mensaje enviado correctamente. Te responderemos pronto.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-label font-label uppercase text-secondary">Nombre</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-3 bg-transparent border border-outline-variant text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-secondary"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="text-label font-label uppercase text-secondary">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-3 bg-transparent border border-outline-variant text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-secondary"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="text-label font-label uppercase text-secondary">Asunto</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                className="w-full px-3 py-3 bg-transparent border border-outline-variant text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-secondary"
                placeholder="¿Sobre qué nos escribís?"
              />
            </div>
            <div>
              <label className="text-label font-label uppercase text-secondary">Mensaje</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-3 py-3 bg-transparent border border-outline-variant text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-secondary resize-none"
                placeholder="Escribí tu mensaje aquí..."
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-primary text-on-primary text-label font-label uppercase tracking-widest hover:bg-primary-container transition-colors duration-400"
            >
              Enviar Mensaje
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="space-y-gutter">
          <div className="bg-surface-container-lowest border border-surface-variant p-stack-lg">
            <h2 className="text-h3 font-h3 text-primary mb-4">También podés escribirnos por WhatsApp</h2>
            <a
              href="https://wa.me/595976436290"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 bg-[#25D366] text-white text-label font-label uppercase tracking-widest hover:opacity-90 transition-opacity duration-400"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Escribir por WhatsApp
            </a>
          </div>

          <div className="bg-surface-container-lowest border border-surface-variant p-stack-lg">
            <h2 className="text-h3 font-h3 text-primary mb-4">Información de contacto</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">mail</span>
                <div>
                  <p className="text-body-sm font-body-sm font-semibold text-on-surface">Email</p>
                  <p className="text-body-sm font-body-sm text-secondary">contacto@tiendaonline.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">location_on</span>
                <div>
                  <p className="text-body-sm font-body-sm font-semibold text-on-surface">Dirección</p>
                  <p className="text-body-sm font-body-sm text-secondary">Av. Principal 1234, Asunción, Paraguay</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">call</span>
                <div>
                  <p className="text-body-sm font-body-sm font-semibold text-on-surface">Teléfono</p>
                  <p className="text-body-sm font-body-sm text-secondary">+595 976 123 456</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
