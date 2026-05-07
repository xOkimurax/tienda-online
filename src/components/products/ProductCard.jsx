import { Link } from 'react-router-dom'
import useCartStore from '../../store/cartStore'

const formatPrice = (price) => `Gs. ${price.toLocaleString('es-ES')}`

export default function ProductCard({ product }) {
  const { id, name, price, category, image } = product
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id,
      name,
      price,
      image: image || 'https://placehold.co/400x400/e2e8f0/64748b?text=Sin+imagen',
      quantity: 1,
    })
  }

  return (
    <Link
      to={`/productos/${id}`}
      className="group relative flex flex-col bg-surface hover:bg-surface-container-low transition-colors duration-300"
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-surface-container border border-surface-variant mb-4">
        <img
          src={image || 'https://placehold.co/400x400/e2e8f0/64748b?text=Sin+imagen'}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Tag — "Nuevo" */}
        <div className="absolute top-3 left-3 bg-primary text-on-primary px-2 py-1 text-[10px] font-bold tracking-widest uppercase">
          Nuevo
        </div>
        {/* Hover overlay — "Añadir al carrito" slides up */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-in-out z-20">
          <button
            onClick={handleAddToCart}
            className="w-full bg-primary text-on-primary py-4 font-sans text-label font-label uppercase tracking-widest hover:bg-primary-container transition-colors"
          >
            Añadir al carrito
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 px-1">
        {category && (
          <span className="text-label font-label text-secondary uppercase tracking-widest">
            {category}
          </span>
        )}
        <h3 className="text-body-base font-body-base font-medium text-primary group-hover:underline decoration-1 underline-offset-4">
          {name}
        </h3>
        <div className="flex items-center gap-3 text-body-sm font-body-sm mt-1">
          <span className="text-primary font-medium">{formatPrice(price)}</span>
        </div>
      </div>
    </Link>
  )
}

export { formatPrice }