import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import useAuthStore from './store/authStore'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Contact from './pages/Contact'
import Cart from './pages/Cart'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminCategories from './pages/admin/Categories'
import AdminOrders from './pages/admin/Orders'
import AdminSettings from './pages/admin/Settings'
import Layout from './components/layout/Layout'
import AdminLayout from './components/admin/AdminLayout'

function App() {
  const { fetchSession, setUser } = useAuthStore()

  useEffect(() => {
    fetchSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Products />} />
          <Route path="/productos/:id" element={<ProductDetail />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/carrito" element={<Cart />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/productos" element={<AdminProducts />} />
          <Route path="/admin/categorias" element={<AdminCategories />} />
          <Route path="/admin/pedidos" element={<AdminOrders />} />
          <Route path="/admin/configuracion" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App