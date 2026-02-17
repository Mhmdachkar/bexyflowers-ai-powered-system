#!/usr/bin/env node

/**
 * Generate dynamic sitemaps for Bexy Flowers
 * Runs during build to create:
 * - sitemap.xml (index)
 * - sitemap-static.xml (static pages)
 * - sitemap-products.xml (all products from Supabase)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = process.env.VITE_SITE_URL || 'https://bexyflowers.shop';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Generating static sitemap only.');
}

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

const staticPages = [
  { url: '/', changefreq: 'daily', priority: '1.0' },
  { url: '/collection', changefreq: 'daily', priority: '0.9' },
  { url: '/customize', changefreq: 'weekly', priority: '0.9' },
  { url: '/wedding-and-events', changefreq: 'weekly', priority: '0.9' },
  { url: '/about', changefreq: 'monthly', priority: '0.8' },
];

function formatDate(date) {
  return date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
}

function generateStaticSitemap() {
  const urls = staticPages.map(page => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

async function generateProductsSitemap() {
  if (!supabase) {
    console.log('⚠️  Skipping products sitemap - no Supabase connection');
    return null;
  }

  try {
    const { data: products, error } = await supabase
      .from('collection_products')
      .select('id, updated_at, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching products:', error);
      return null;
    }

    if (!products || products.length === 0) {
      console.log('⚠️  No products found');
      return null;
    }

    const urls = products.map(product => `  <url>
    <loc>${SITE_URL}/product/${product.id}</loc>
    <lastmod>${formatDate(product.updated_at || product.created_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');

    console.log(`✅ Generated sitemap for ${products.length} products`);

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  } catch (err) {
    console.error('❌ Error generating products sitemap:', err);
    return null;
  }
}

function generateSitemapIndex(hasProducts) {
  const sitemaps = [
    `  <sitemap>
    <loc>${SITE_URL}/sitemap-static.xml</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
  </sitemap>`
  ];

  if (hasProducts) {
    sitemaps.push(`  <sitemap>
    <loc>${SITE_URL}/sitemap-products.xml</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
  </sitemap>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.join('\n')}
</sitemapindex>`;
}

async function main() {
  const distDir = path.join(__dirname, '..', 'dist');
  const publicDir = path.join(__dirname, '..', 'public');

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  console.log('🗺️  Generating sitemaps...');

  const staticSitemap = generateStaticSitemap();
  const productsSitemap = await generateProductsSitemap();

  fs.writeFileSync(path.join(distDir, 'sitemap-static.xml'), staticSitemap);
  fs.writeFileSync(path.join(publicDir, 'sitemap-static.xml'), staticSitemap);
  console.log('✅ Static sitemap generated');

  let hasProducts = false;
  if (productsSitemap) {
    fs.writeFileSync(path.join(distDir, 'sitemap-products.xml'), productsSitemap);
    fs.writeFileSync(path.join(publicDir, 'sitemap-products.xml'), productsSitemap);
    console.log('✅ Products sitemap generated');
    hasProducts = true;
  }

  const sitemapIndex = generateSitemapIndex(hasProducts);
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapIndex);
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapIndex);
  console.log('✅ Sitemap index generated');

  console.log('🎉 All sitemaps generated successfully!');
}

main().catch(console.error);
