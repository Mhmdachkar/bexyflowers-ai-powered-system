# Admin Flower Type Management

## Overview
Admins can now manage the flower type (Real, Eternal, or Mixed) for each product directly from the Admin Products page.

## Features Added

### 1. Flower Type Selection in Product Form
When creating or editing a product, admins can select from three flower types:
- 🌸 **Real (Fresh Flowers)** - Fresh, natural flowers
- ✨ **Eternal (Preserved Flowers)** - Long-lasting preserved flowers
- 🌺 **Mixed (Both Types)** - Products that contain both real and eternal flowers

### 2. Collection Year Field
Products now include a collection year field to track when the collection was created. Defaults to the current year.

### 3. Visual Indicators
Products in the admin product list now display colored badges showing their flower type:
- Purple badge with sparkles (✨) for Eternal flowers
- Green badge with flower icon (🌸) for Real flowers
- Blue badge (🌺) for Mixed flowers

### 4. Flower Type Filter
A new filter dropdown allows admins to filter products by flower type:
- View all products
- Filter by Real flowers only
- Filter by Eternal flowers only
- Filter by Mixed flowers only

## Database Fields

The following fields have been added to the `collection_products` table:

```sql
-- flower_type: Type of flower
flower_type VARCHAR(20) CHECK (flower_type IN ('eternal', 'real', 'mixed')) DEFAULT 'real'

-- collection_year: Year of the collection
collection_year INTEGER
```

## How to Use

### Creating/Editing Products
1. Navigate to Admin → Products
2. Click "Create New Product" or edit an existing product
3. In the "Basic Information" section, you'll find:
   - **Flower Type** dropdown - Select between Real, Eternal, or Mixed
   - **Collection Year** input - Enter the year (e.g., 2025, 2026)
4. Save the product

### Filtering Products
1. Navigate to Admin → Products
2. Use the filter dropdowns at the top:
   - Search by name/description
   - Filter by category
   - Filter by status (active/inactive)
   - **NEW:** Filter by flower type (All, Real, Eternal, Mixed)

## Client-Side Integration

This feature integrates with the client-side Flower Type Toggle implemented in the Collection page, allowing customers to filter products by flower type within each category.

See `docs/FLOWER_TYPE_TOGGLE_FEATURE.md` for more details on the client-side implementation.

## Migration Required

Before using this feature, run the database migration:

```sql
-- See: docs/migrations/ADD_FLOWER_TYPE_TO_COLLECTION_PRODUCTS.sql
```

This migration adds the necessary columns and indexes to the database.

## Notes

- Products default to "Real" flower type if not specified
- Collection year defaults to the current year
- Existing products without a flower_type will be treated as "real" in filters
- The flower type badges appear on all product cards in the admin interface
