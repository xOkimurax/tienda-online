# Tienda Online - Especificación Completa

## Stack Tecnológico
- **Frontend:** React 19 + Vite + React Router v7
- **Estilos:** Tailwind CSS v4 + shadcn/ui (copiar componentes manualmente)
- **Estado:** Zustand para carrito y estado global
- **Backend/DB:** Supabase (project_ref: htaaqofifqzhwqldezgu)
  - Auth: Supabase Auth (email/password)
  - DB: PostgreSQL via Supabase
  - Storage: Supabase Storage para imágenes de productos
  - Realtime: para notificaciones de pedidos
- **Docker:** Nginx sirviendo build estático de Vite

## Estructura del Proyecto
```
src/
  components/
    layout/        → Navbar, Footer, Layout
    ui/            → Botones, inputs, cards (estilo shadcn)
    products/      → ProductCard, ProductGrid, ProductFilters
    cart/          → CartDrawer, CartItem
    admin/         → AdminSidebar, DashboardCards, DataTable
  pages/
    Home.jsx
    Products.jsx
    ProductDetail.jsx
    Contact.jsx
    Cart.jsx
    Profile.jsx
    admin/
      Dashboard.jsx
      Products.jsx
      Categories.jsx
      Orders.jsx
      Settings.jsx
  store/
    cartStore.js    → Zustand carrito
    authStore.js    → Zustand auth
  lib/
    supabase.js     → Cliente Supabase
    utils.js        → Formateo Gs., helpers
  App.jsx           → Router principal
  main.jsx          → Entry point
```

## Base de Datos (Supabase)

### Tablas:
```sql
-- users (manejado por Supabase Auth, extender con trigger)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- en Guaraníes (entero, sin decimales)
  stock INTEGER DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  images TEXT[] DEFAULT '{}', -- URLs de Supabase Storage
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL
);

CREATE TABLE store_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT
);
```

### Storage Buckets:
- `product-images/` — imágenes de productos (público)

### Row Level Security:
- products: lectura pública, escritura solo admin
- categories: lectura pública, escritura solo admin
- orders: lectura/escritura usuario dueño, lectura admin
- store_config: lectura pública, escritura admin

## Rutas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | Home | Hero, categorías, productos destacados |
| `/productos` | Products | Grid con filtros (categoría, precio, búsqueda) |
| `/productos/:id` | ProductDetail | Galería, descripción, precio, agregar al carrito |
| `/contacto` | Contact | Formulario + botón WhatsApp |
| `/carrito` | Cart | Items, cantidades, total, solicitar pedido |
| `/perfil` | Profile | Datos usuario + historial de pedidos |
| `/admin` | Dashboard | KPIs: ventas hoy/mes, pedidos pendientes, top productos |
| `/admin/productos` | AdminProducts | Tabla CRUD, formulario modal |
| `/admin/categorias` | AdminCategories | CRUD categorías |
| `/admin/pedidos` | AdminOrders | Lista, cambiar estado |
| `/admin/configuracion` | AdminSettings | Editar datos tienda |

## Funcionalidades

### Home
- Hero banner con mensaje de bienvenida
- Grid de categorías (imagen + nombre)
- Productos destacados (featured=true)

### Catálogo
- Grid de ProductCards (imagen, nombre, precio en Gs., categoría)
- Sidebar/barra de filtros: búsqueda texto, categoría, rango precio
- Ordenar por: precio asc/desc, más reciente
- Paginación o infinite scroll

### Detalle Producto
- Galería de imágenes (swipe/carrusel)
- Nombre, descripción, precio en Gs.
- Stock disponible
- Selector de cantidad + botón "Agregar al carrito"
- Categoría

### Carrito
- Slide-over drawer o página completa
- Items con imagen, nombre, precio unitario, cantidad, subtotal
- Ajustar cantidades, eliminar items
- Total en Gs.
- Botón "Solicitar pedido" → crea orden en Supabase
- Si no está autenticado → redirigir a login/registro

### Perfil
- Datos personales (nombre, email, teléfono, dirección)
- Historial de pedidos con estado (color-coded)

### Admin Dashboard
- Cards: ventas del día, ventas del mes, pedidos pendientes, total productos
- Gráfico simple de ventas (últimos 7/30 días)
- Últimos pedidos

### Admin Productos
- Tabla: nombre, categoría, precio, stock, activo
- Buscar/filtrar
- Modal crear/editar: nombre, descripción, precio, stock, categoría, imágenes (upload a Supabase Storage), destacado, activo
- Eliminar (soft: active=false)

### Admin Pedidos
- Tabla: ID, cliente, fecha, total, estado
- Cambiar estado (dropdown)
- Ver detalle (items)

### Admin Configuración
- Nombre de la tienda
- Logo (upload)
- Moneda (por defecto Gs.)
- WhatsApp de contacto
- Email de contacto

## Precios
- TODOS los precios en Guaraníes (Gs.)
- Formato: Gs. 50.000 (sin decimales)
- Precio guardado como INTEGER
- Formatear con separador de miles: 50000 → "Gs. 50.000"

## Auth
- Supabase Auth con email/password
- Registro: nombre, email, password, teléfono (opcional)
- Login: email, password
- Recuperar contraseña
- Proteger rutas admin: solo role=admin
- Proteger perfil y checkout: usuario autenticado

## Estilo Visual
- Diseño limpio, moderno, estilo catálogo
- Colores: paleta profesional (azul/indigo como acento, blanco/gris como base)
- Responsive: mobile-first
- Cards con hover effect sutil
- Imágenes optimizadas
- Loading skeletons
- Toast notifications para acciones (éxito/error)

## Docker
```dockerfile
# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:80"
    restart: unless-stopped
```

## Prioridad de Implementación
1. Setup: Vite + Tailwind + Router + Supabase client + shadcn/ui
2. DB: Crear tablas en Supabase, RLS policies
3. Auth: Login, registro, protección rutas
4. Layout: Navbar, Footer, estructura base
5. Home + Catálogo + Detalle producto
6. Carrito + Checkout
7. Perfil usuario
8. Admin completo (dashboard + CRUDs)
9. Docker + deploy
10. Pruebas finales

## Notas Importantes
- Usar Supabase MCP para gestionar la DB (crear tablas, RLS, etc.)
- Subir imágenes a Supabase Storage, guardar URLs públicas
- El carrito persiste en localStorage Y se sincroniza al hacer login
- Admin: crear al menos un usuario admin inicial (puede ser manual via Supabase dashboard)
- Los precios NUNCA deben tener decimales
- Formatear Gs. con punto como separador de miles
