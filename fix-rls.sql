-- Ejecutar en Supabase SQL Editor: https://supabase.com/dashboard/project/htaaqofifqzhwqldezgu/sql/new

-- 1. Habilitar RLS en order_items (si no está habilitado)
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;

-- 2. Permitir INSERT a usuarios autenticados en sus propios order_items
--    (verifica que el usuario sea el dueño del pedido)
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
CREATE POLICY "Users can insert own order items" ON order_items
  FOR INSERT
  WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM orders WHERE id = order_items.order_id
    )
  );

-- 3. Permitir SELECT a usuarios autenticados sobre sus propios order_items
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT
  USING (
    auth.uid() = (
      SELECT user_id FROM orders WHERE id = order_items.order_id
    )
  );

-- 4. Permitir UPDATE/DELETE a usuarios sobre sus propios order items
DROP POLICY IF EXISTS "Users can update own order items" ON order_items;
CREATE POLICY "Users can update own order items" ON order_items
  FOR UPDATE
  USING (
    auth.uid() = (
      SELECT user_id FROM orders WHERE id = order_items.order_id
    )
  );

DROP POLICY IF EXISTS "Users can delete own order items" ON order_items;
CREATE POLICY "Users can delete own order items" ON order_items
  FOR DELETE
  USING (
    auth.uid() = (
      SELECT user_id FROM orders WHERE id = order_items.order_id
    )
  );

-- 5. Hacer lo mismo para la tabla orders
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  USING (auth.uid() = user_id);
