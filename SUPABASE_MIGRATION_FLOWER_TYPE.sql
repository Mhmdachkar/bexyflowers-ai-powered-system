-- =====================================================
-- SUPABASE MIGRATION: Flower Type & Collection Year
-- =====================================================
-- Copy and paste this entire script into Supabase SQL Editor
-- Then click "RUN" to execute
-- =====================================================

-- Add flower_type column
ALTER TABLE collection_products
ADD COLUMN IF NOT EXISTS flower_type VARCHAR(20) CHECK (flower_type IN ('eternal', 'real', 'mixed')) DEFAULT 'real';

-- Add collection_year column
ALTER TABLE collection_products
ADD COLUMN IF NOT EXISTS collection_year INTEGER;

-- Create indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_collection_products_flower_type ON collection_products(flower_type);
CREATE INDEX IF NOT EXISTS idx_collection_products_collection_year ON collection_products(collection_year);
CREATE INDEX IF NOT EXISTS idx_collection_products_flower_type_year ON collection_products(flower_type, collection_year);

-- Add column documentation
COMMENT ON COLUMN collection_products.flower_type IS 'Type of flower: eternal (preserved), real (fresh), or mixed';
COMMENT ON COLUMN collection_products.collection_year IS 'Year of the collection (e.g., 2024, 2025, 2026)';

-- Update existing products with default values
UPDATE collection_products SET flower_type = 'real' WHERE flower_type IS NULL;
UPDATE collection_products SET collection_year = EXTRACT(YEAR FROM created_at)::INTEGER WHERE collection_year IS NULL AND created_at IS NOT NULL;
UPDATE collection_products SET collection_year = EXTRACT(YEAR FROM NOW())::INTEGER WHERE collection_year IS NULL;

-- Done! Your database is now ready for flower type management
