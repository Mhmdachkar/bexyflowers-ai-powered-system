-- =====================================================
-- Migration: Add Flower Type & Collection Year
-- =====================================================
-- This migration adds flower_type and collection_year columns 
-- to the collection_products table for the admin flower type management feature
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Add flower_type column to collection_products table
ALTER TABLE collection_products
ADD COLUMN IF NOT EXISTS flower_type VARCHAR(20) CHECK (flower_type IN ('eternal', 'real', 'mixed')) DEFAULT 'real';

-- Step 2: Add collection_year column to collection_products table
ALTER TABLE collection_products
ADD COLUMN IF NOT EXISTS collection_year INTEGER;

-- Step 3: Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_collection_products_flower_type 
ON collection_products(flower_type);

CREATE INDEX IF NOT EXISTS idx_collection_products_collection_year 
ON collection_products(collection_year);

CREATE INDEX IF NOT EXISTS idx_collection_products_flower_type_year 
ON collection_products(flower_type, collection_year);

-- Step 4: Add comments for documentation
COMMENT ON COLUMN collection_products.flower_type IS 'Type of flower: eternal (preserved), real (fresh), or mixed';
COMMENT ON COLUMN collection_products.collection_year IS 'Year of the collection (e.g., 2024, 2025, 2026)';

-- Step 5: Update existing products with default values
-- Set all existing products to 'real' type if not specified
UPDATE collection_products
SET flower_type = 'real'
WHERE flower_type IS NULL;

-- Set collection year based on created_at date for existing products
UPDATE collection_products
SET collection_year = EXTRACT(YEAR FROM created_at)::INTEGER
WHERE collection_year IS NULL AND created_at IS NOT NULL;

-- Step 6: Set current year for products without created_at
UPDATE collection_products
SET collection_year = EXTRACT(YEAR FROM NOW())::INTEGER
WHERE collection_year IS NULL;

-- =====================================================
-- Verification Queries (Optional - uncomment to run)
-- =====================================================

-- Verify the columns were added
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'collection_products' 
-- AND column_name IN ('flower_type', 'collection_year');

-- Check the distribution of flower types
-- SELECT flower_type, COUNT(*) as count 
-- FROM collection_products 
-- GROUP BY flower_type;

-- Check collection years
-- SELECT collection_year, COUNT(*) as count 
-- FROM collection_products 
-- GROUP BY collection_year 
-- ORDER BY collection_year DESC;

-- =====================================================
-- Migration Complete!
-- =====================================================
