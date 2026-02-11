# 🚀 How to Run the Flower Type Migration in Supabase

## Quick Steps

### 1. Open Supabase SQL Editor
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click on **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### 2. Copy the Migration Script
Open the file: `SUPABASE_MIGRATION_FLOWER_TYPE.sql`

Copy the entire contents (or copy from below):

```sql
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
```

### 3. Paste and Run
1. Paste the script into the SQL Editor
2. Click the **"RUN"** button (or press `Ctrl/Cmd + Enter`)
3. Wait for the success message

### 4. Verify the Migration
Run this query to verify the columns were added:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'collection_products' 
AND column_name IN ('flower_type', 'collection_year');
```

You should see both columns listed!

### 5. Check Your Data
See the distribution of flower types:

```sql
SELECT flower_type, COUNT(*) as count 
FROM collection_products 
GROUP BY flower_type;
```

## ✅ What This Migration Does

1. **Adds `flower_type` column** - Can be 'real', 'eternal', or 'mixed' (defaults to 'real')
2. **Adds `collection_year` column** - Stores the year of the collection
3. **Creates indexes** - For fast filtering by flower type and year
4. **Updates existing products** - Sets all existing products to 'real' and assigns collection years based on creation date

## 🔧 Troubleshooting

### Error: "relation collection_products does not exist"
- Make sure you've run the main collection_products table migration first
- Check that you're running the query in the correct project/database

### Error: "column already exists"
- The migration is safe to run multiple times (uses `IF NOT EXISTS`)
- This just means the columns are already there

### Need to Rollback?
If you need to remove these columns (not recommended):

```sql
ALTER TABLE collection_products DROP COLUMN IF EXISTS flower_type;
ALTER TABLE collection_products DROP COLUMN IF EXISTS collection_year;
```

## 📝 Next Steps

After running this migration:
1. Refresh your admin panel
2. Edit any product to see the new Flower Type dropdown
3. Use the Flower Type filter to organize your products
4. Your customers can now filter by Real/Eternal flowers on the collection page!

## Need Help?
If you encounter any issues, check the Supabase logs or reach out for support.
