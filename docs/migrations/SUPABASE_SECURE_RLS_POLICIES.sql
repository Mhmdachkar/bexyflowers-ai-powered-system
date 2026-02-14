-- ============================================
-- SECURE ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- This SQL script replaces the permissive RLS policies with secure ones
-- Run this after SUPABASE_VISITOR_CART_FAVORITES_SETUP.sql
--
-- SECURITY STRATEGY:
-- 1. Visitor tables: Service role only (backend proxy handles all access)
-- 2. Product tables: Read-only for anon, service role for writes
-- 3. Admin tables: Service role only
--
-- Last Updated: January 2026
-- ============================================

-- ============================================
-- DROP OLD PERMISSIVE POLICIES
-- ============================================
-- These policies had USING (true) which allowed unrestricted access

-- Drop old visitor policies
DROP POLICY IF EXISTS "Allow all operations on visitors" ON visitors;
DROP POLICY IF EXISTS "Allow all operations on visitor_carts" ON visitor_carts;
DROP POLICY IF EXISTS "Allow all operations on visitor_favorites" ON visitor_favorites;

-- ============================================
-- VISITOR TABLES - SERVICE ROLE ONLY
-- ============================================
-- All visitor operations go through backend API (Netlify functions)
-- This prevents direct frontend access and ensures proper validation

-- Visitors table: Service role only
CREATE POLICY "Service role full access on visitors"
  ON visitors FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Visitor carts: Service role only
CREATE POLICY "Service role full access on visitor_carts"
  ON visitor_carts FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Visitor favorites: Service role only
CREATE POLICY "Service role full access on visitor_favorites"
  ON visitor_favorites FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- PRODUCT TABLES - READ-ONLY FOR ANON
-- ============================================
-- Products can be viewed by anyone, but only modified via backend
-- NOTE: Uses conditional blocks - only applies policies to tables that exist

-- Collection Products
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'collection_products') THEN
    ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public read active collection products" ON collection_products;
    CREATE POLICY "Public read active collection products" ON collection_products FOR SELECT USING (is_active = true);
    DROP POLICY IF EXISTS "Service role full access on collection products" ON collection_products;
    CREATE POLICY "Service role full access on collection products" ON collection_products FOR ALL
      USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

-- Signature Collections
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'signature_collections') THEN
    ALTER TABLE signature_collections ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public read active signature collections" ON signature_collections;
    CREATE POLICY "Public read active signature collections" ON signature_collections FOR SELECT USING (is_active = true);
    DROP POLICY IF EXISTS "Service role full access on signature collections" ON signature_collections;
    CREATE POLICY "Service role full access on signature collections" ON signature_collections FOR ALL
      USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

-- Products (stores eternal/real flowers - NOT "eternal_flowers" table)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public read products" ON products;
    CREATE POLICY "Public read products" ON products FOR SELECT USING (is_active = true);
    DROP POLICY IF EXISTS "Service role full access on products" ON products;
    CREATE POLICY "Service role full access on products" ON products FOR ALL
      USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

-- Luxury Boxes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'luxury_boxes') THEN
    ALTER TABLE luxury_boxes ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public read luxury boxes" ON luxury_boxes;
    CREATE POLICY "Public read luxury boxes" ON luxury_boxes FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Service role full access on luxury boxes" ON luxury_boxes;
    CREATE POLICY "Service role full access on luxury boxes" ON luxury_boxes FOR ALL
      USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

-- Box Colors
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'box_colors') THEN
    ALTER TABLE box_colors ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public read box colors" ON box_colors;
    CREATE POLICY "Public read box colors" ON box_colors FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Service role full access on box colors" ON box_colors;
    CREATE POLICY "Service role full access on box colors" ON box_colors FOR ALL
      USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

-- Box Sizes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'box_sizes') THEN
    ALTER TABLE box_sizes ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public read box sizes" ON box_sizes;
    CREATE POLICY "Public read box sizes" ON box_sizes FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Service role full access on box sizes" ON box_sizes;
    CREATE POLICY "Service role full access on box sizes" ON box_sizes FOR ALL
      USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

-- Flower Types (actual table name - not "flowers")
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'flower_types') THEN
    ALTER TABLE flower_types ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public read flower types" ON flower_types;
    CREATE POLICY "Public read flower types" ON flower_types FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Service role full access on flower types" ON flower_types;
    CREATE POLICY "Service role full access on flower types" ON flower_types FOR ALL
      USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

-- Flower Type Categories
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'flower_type_categories') THEN
    ALTER TABLE flower_type_categories ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public read flower type categories" ON flower_type_categories;
    CREATE POLICY "Public read flower type categories" ON flower_type_categories FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Service role full access on flower type categories" ON flower_type_categories;
    CREATE POLICY "Service role full access on flower type categories" ON flower_type_categories FOR ALL
      USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

-- Flower Colors
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'flower_colors') THEN
    ALTER TABLE flower_colors ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public read flower colors" ON flower_colors;
    CREATE POLICY "Public read flower colors" ON flower_colors FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Service role full access on flower colors" ON flower_colors;
    CREATE POLICY "Service role full access on flower colors" ON flower_colors FOR ALL
      USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

-- Accessories
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'accessories') THEN
    ALTER TABLE accessories ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public read accessories" ON accessories;
    CREATE POLICY "Public read accessories" ON accessories FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Service role full access on accessories" ON accessories;
    CREATE POLICY "Service role full access on accessories" ON accessories FOR ALL
      USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

-- Wedding Creations
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'wedding_creations') THEN
    ALTER TABLE wedding_creations ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public read wedding creations" ON wedding_creations;
    CREATE POLICY "Public read wedding creations" ON wedding_creations FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Service role full access on wedding creations" ON wedding_creations;
    CREATE POLICY "Service role full access on wedding creations" ON wedding_creations FOR ALL
      USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

-- Checkout Orders (table is checkout_orders, not orders)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'checkout_orders') THEN
    ALTER TABLE checkout_orders ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Service role full access on checkout orders" ON checkout_orders;
    CREATE POLICY "Service role full access on checkout orders" ON checkout_orders FOR ALL
      USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

-- Orders and Order Items (if they exist - some setups use these)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Service role full access on orders" ON orders;
    CREATE POLICY "Service role full access on orders" ON orders FOR ALL
      USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items') THEN
    ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Service role full access on order items" ON order_items;
    CREATE POLICY "Service role full access on order items" ON order_items FOR ALL
      USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

-- ============================================
-- STORAGE POLICIES (if using Supabase Storage)
-- ============================================
-- Product images: Public read, service role write
-- This protects against unauthorized uploads while allowing image viewing

-- Note: Run these in Supabase Storage Policies UI or via RPC
-- 
-- Bucket: product-images
-- Policy: Public read
--   SELECT: true
-- 
-- Policy: Service role upload
--   INSERT: auth.role() = 'service_role'
-- 
-- Policy: Service role update
--   UPDATE: auth.role() = 'service_role'
-- 
-- Policy: Service role delete
--   DELETE: auth.role() = 'service_role'

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify policies are working

-- Test 1: Check if RLS is enabled
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' AND rowsecurity = true;

-- Test 2: List all policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, policyname;

-- Test 3: Verify anon key can read products but not write
-- (Run with anon key in Supabase SQL editor)
-- SELECT * FROM collection_products WHERE is_active = true; -- Should work
-- INSERT INTO collection_products (title, price) VALUES ('Test', 100); -- Should fail

-- Test 4: Verify anon key cannot access visitor tables
-- (Run with anon key in Supabase SQL editor)
-- SELECT * FROM visitors; -- Should fail
-- SELECT * FROM visitor_carts; -- Should fail
-- SELECT * FROM visitor_favorites; -- Should fail

-- ============================================
-- ROLLBACK (if needed)
-- ============================================
-- If you need to revert to permissive policies for testing:
-- 
-- DROP POLICY "Service role full access on visitors" ON visitors;
-- CREATE POLICY "Allow all operations on visitors" ON visitors FOR ALL USING (true) WITH CHECK (true);
-- 
-- DROP POLICY "Service role full access on visitor_carts" ON visitor_carts;
-- CREATE POLICY "Allow all operations on visitor_carts" ON visitor_carts FOR ALL USING (true) WITH CHECK (true);
-- 
-- DROP POLICY "Service role full access on visitor_favorites" ON visitor_favorites;
-- CREATE POLICY "Allow all operations on visitor_favorites" ON visitor_favorites FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- NOTES
-- ============================================
-- 
-- 1. BACKEND PROXY REQUIRED:
--    With these policies, all writes MUST go through Netlify functions
--    that use the service role key. Direct frontend writes will fail.
-- 
-- 2. ANON KEY USAGE:
--    The anon key can still be used for reading public product data.
--    For better security, consider removing direct Supabase client from frontend.
-- 
-- 3. ADMIN AUTHENTICATION:
--    Admin users should authenticate through a backend endpoint that
--    returns a JWT with proper claims, not through frontend env vars.
-- 
-- 4. TESTING:
--    After applying these policies, test all user flows:
--    - Viewing products (should work)
--    - Adding to cart (should work via backend API)
--    - Checkout (should work via backend API)
--    - Admin operations (should work via backend API with service role)
-- 
-- 5. MONITORING:
--    Watch for RLS policy violations in Supabase logs:
--    Settings > Logs > Postgres Logs > Filter for "policy"
