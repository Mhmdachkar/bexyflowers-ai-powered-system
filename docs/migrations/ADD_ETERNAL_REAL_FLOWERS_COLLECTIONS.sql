-- Migration: Add Eternal and Real Flowers Collections with Year Support
-- This migration adds support for categorizing flowers as eternal or real
-- and organizing them by collection year (2024, 2025, 2026, etc.)

-- Step 1: Add flower_type column to products table
-- This distinguishes between eternal (preserved) and real (fresh) flowers
ALTER TABLE products
ADD COLUMN IF NOT EXISTS flower_type VARCHAR(20) CHECK (flower_type IN ('eternal', 'real', 'mixed')) DEFAULT 'real';

-- Step 2: Add collection_year column to products table
-- This allows organizing products by year (2024, 2025, 2026, etc.)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS collection_year INTEGER;

-- Step 3: Create index for efficient filtering by flower type and year
CREATE INDEX IF NOT EXISTS idx_products_flower_type ON products(flower_type);
CREATE INDEX IF NOT EXISTS idx_products_collection_year ON products(collection_year);
CREATE INDEX IF NOT EXISTS idx_products_flower_type_year ON products(flower_type, collection_year);

-- Step 4: Add comments for documentation
COMMENT ON COLUMN products.flower_type IS 'Type of flower: eternal (preserved), real (fresh), or mixed';
COMMENT ON COLUMN products.collection_year IS 'Year of the collection (e.g., 2024, 2025, 2026)';

-- Step 5: Create a view for eternal flowers by year
CREATE OR REPLACE VIEW eternal_flowers_by_year AS
SELECT 
  collection_year,
  COUNT(*) as product_count,
  AVG(price) as avg_price,
  MIN(price) as min_price,
  MAX(price) as max_price
FROM products
WHERE flower_type = 'eternal' AND is_active = true
GROUP BY collection_year
ORDER BY collection_year DESC;

-- Step 6: Create a view for real flowers by year
CREATE OR REPLACE VIEW real_flowers_by_year AS
SELECT 
  collection_year,
  COUNT(*) as product_count,
  AVG(price) as avg_price,
  MIN(price) as min_price,
  MAX(price) as max_price
FROM products
WHERE flower_type = 'real' AND is_active = true
GROUP BY collection_year
ORDER BY collection_year DESC;

-- Step 7: Update existing products to have default values
-- Set all existing products to 'real' type and current year if not specified
UPDATE products
SET 
  flower_type = COALESCE(flower_type, 'real'),
  collection_year = COALESCE(collection_year, EXTRACT(YEAR FROM created_at)::INTEGER)
WHERE flower_type IS NULL OR collection_year IS NULL;

-- Step 8: Create function to get products by flower type and year
CREATE OR REPLACE FUNCTION get_products_by_type_and_year(
  p_flower_type VARCHAR(20),
  p_collection_year INTEGER DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  description TEXT,
  price DECIMAL,
  category VARCHAR,
  display_category VARCHAR,
  flower_type VARCHAR,
  collection_year INTEGER,
  image_urls TEXT[],
  featured BOOLEAN,
  is_out_of_stock BOOLEAN,
  discount_percentage INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.price,
    p.category,
    p.display_category,
    p.flower_type,
    p.collection_year,
    p.image_urls,
    p.featured,
    p.is_out_of_stock,
    p.discount_percentage,
    p.created_at
  FROM products p
  WHERE 
    p.is_active = true
    AND p.flower_type = p_flower_type
    AND (p_collection_year IS NULL OR p.collection_year = p_collection_year)
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Grant permissions
GRANT SELECT ON eternal_flowers_by_year TO anon, authenticated;
GRANT SELECT ON real_flowers_by_year TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_products_by_type_and_year TO anon, authenticated;

-- Step 10: Create sample data (optional - comment out if not needed)
-- Uncomment the following lines to add sample eternal flowers

/*
INSERT INTO products (
  title, 
  description, 
  price, 
  category, 
  display_category, 
  flower_type, 
  collection_year,
  image_urls,
  featured,
  is_active
) VALUES
  (
    'Eternal Red Rose Bouquet',
    'Preserved red roses that last forever. Perfect for special occasions.',
    89.99,
    'eternal-roses',
    'Eternal Roses',
    'eternal',
    2024,
    ARRAY['https://example.com/eternal-red-roses.jpg'],
    true,
    true
  ),
  (
    'Eternal Pink Rose Arrangement',
    'Beautiful preserved pink roses in an elegant arrangement.',
    79.99,
    'eternal-roses',
    'Eternal Roses',
    'eternal',
    2024,
    ARRAY['https://example.com/eternal-pink-roses.jpg'],
    false,
    true
  ),
  (
    'Eternal White Rose Collection',
    'Pure white preserved roses for timeless elegance.',
    99.99,
    'eternal-roses',
    'Eternal Roses',
    'eternal',
    2025,
    ARRAY['https://example.com/eternal-white-roses.jpg'],
    true,
    true
  );
*/

-- Migration complete!
-- To rollback this migration, run the following:
/*
DROP FUNCTION IF EXISTS get_products_by_type_and_year;
DROP VIEW IF EXISTS eternal_flowers_by_year;
DROP VIEW IF EXISTS real_flowers_by_year;
DROP INDEX IF EXISTS idx_products_flower_type_year;
DROP INDEX IF EXISTS idx_products_collection_year;
DROP INDEX IF EXISTS idx_products_flower_type;
ALTER TABLE products DROP COLUMN IF EXISTS collection_year;
ALTER TABLE products DROP COLUMN IF EXISTS flower_type;
*/
