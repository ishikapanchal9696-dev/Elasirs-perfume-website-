-- ================================================================
-- ELASIRS Haute Parfumerie — Supabase Database Migration
-- Project: qqdeyoeizckirrycjtdj
-- Table: orders
-- ================================================================

-- 1. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id TEXT,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  shipping_cost NUMERIC DEFAULT 0,
  taxes NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'razorpay',
  payment_status TEXT DEFAULT 'pending',
  payment_id TEXT,
  status TEXT DEFAULT 'Order Confirmed',
  tracking_number TEXT,
  courier_provider TEXT DEFAULT 'Blue Dart Air Express (Insured)',
  estimated_delivery TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders (email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Policies to allow public checkout submissions and reading
-- (Allows your storefront to insert new orders and read order statuses)
DROP POLICY IF EXISTS "Allow public insert on orders" ON public.orders;
CREATE POLICY "Allow public insert on orders" 
  ON public.orders 
  FOR INSERT 
  TO public, anon, authenticated 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on orders" ON public.orders;
CREATE POLICY "Allow public select on orders" 
  ON public.orders 
  FOR SELECT 
  TO public, anon, authenticated 
  USING (true);

DROP POLICY IF EXISTS "Allow public update on orders" ON public.orders;
CREATE POLICY "Allow public update on orders" 
  ON public.orders 
  FOR UPDATE 
  TO public, anon, authenticated 
  USING (true);

-- 5. Comment on table
COMMENT ON TABLE public.orders IS 'ELASIRS luxury perfume customer orders table';
