import { useEffect, useRef } from 'react'

function Dialog({ open, onClose, children, className = '' }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className={`max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto ${className}`}
        style={{ backgroundColor: '#ffffff', borderRadius: '18px' }}
      >
        {children}
      </div>
    </div>
  )
}

function DialogHeader({ className = '', children, ...props }) {
  return (
    <div className={`px-6 py-4 flex items-center justify-between ${className}`} style={{ borderBottom: '1px solid #f0f0f0' }} {...props}>
      {children}
    </div>
  )
}

function DialogContent({ className = '', children, ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  )
}

function DialogFooter({ className = '', children, ...props }) {
  return (
    <div className={`px-6 py-4 flex justify-end gap-3 ${className}`} style={{ borderTop: '1px solid #f0f0f0' }} {...props}>
      {children}
    </div>
  )
}

export { Dialog, DialogHeader, DialogContent, DialogFooter }