-- ============================================
-- ZODIAC GENERATED IMAGE CACHE TABLE
-- ============================================
-- Caches AI-generated zodiac bouquet images so the same
-- gender + sign + bouquet combination reuses a previously
-- generated image instead of calling the AI each time.
--
-- Images are stored in Supabase Storage (zodiac-images bucket).
-- This table keeps the public URL and lookup key.
--
-- Run this in your Supabase project before deploying.
-- ============================================

-- 1. Create the zodiac-images storage bucket (public, 5 MB file limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('zodiac-images', 'zodiac-images', true, 5242880)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow anonymous reads (public bucket)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read zodiac-images" ON storage.objects;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

CREATE POLICY "Public read zodiac-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'zodiac-images');

-- 3. Allow service role to insert/update/delete
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role write zodiac-images" ON storage.objects;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

CREATE POLICY "Service role write zodiac-images"
  ON storage.objects FOR ALL
  USING (bucket_id = 'zodiac-images' AND auth.role() = 'service_role');

-- 4. Cache lookup table
CREATE TABLE IF NOT EXISTS zodiac_generated_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gender VARCHAR(10) NOT NULL,
  zodiac_sign VARCHAR(30) NOT NULL,
  bouquet_id VARCHAR(100) NOT NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_zodiac_image UNIQUE (gender, zodiac_sign, bouquet_id)
);

CREATE INDEX IF NOT EXISTS idx_zodiac_images_lookup
  ON zodiac_generated_images (gender, zodiac_sign, bouquet_id);

COMMENT ON TABLE zodiac_generated_images IS
  'Cache of AI-generated zodiac bouquet images keyed by gender + sign + bouquet.';

-- 5. RLS
ALTER TABLE zodiac_generated_images ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can read zodiac images" ON zodiac_generated_images;
  CREATE POLICY "Anyone can read zodiac images"
    ON zodiac_generated_images FOR SELECT
    USING (true);

  DROP POLICY IF EXISTS "Service role full access on zodiac_generated_images" ON zodiac_generated_images;
  CREATE POLICY "Service role full access on zodiac_generated_images"
    ON zodiac_generated_images FOR ALL
    USING (auth.role() = 'service_role');
END $$;
