#!/usr/bin/env node

/**
 * Image Optimization Script for Bexy Flowers
 * 
 * Creates optimized versions of images for different display sizes:
 * - Mobile: 400px width
 * - Desktop: 800px width
 * 
 * This significantly reduces page load time by serving appropriately sized images.
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target sizes for responsive images
const SIZES = [
  { suffix: '-sm', width: 400, quality: 80 },   // Mobile
  { suffix: '-md', width: 800, quality: 85 },   // Tablet/Desktop cards
];

// Directories to process
const IMAGE_DIRS = [
  'public/assets/birthday',
  'public/assets/valentine',
  'public/assets/mother day',
  'public/assets/graduation',
  'public/assets/hand band',
  'public/assets/red roses',
  'public/assets/wedding-events/wedding',
  'public/assets/wedding-events/events',
];

const projectRoot = path.resolve(__dirname, '..');

async function optimizeImage(inputPath, outputPath, width, quality) {
  try {
    const metadata = await sharp(inputPath).metadata();
    
    // Only resize if image is larger than target
    if (metadata.width && metadata.width > width) {
      await sharp(inputPath)
        .resize(width, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality })
        .toFile(outputPath);
      
      const inputStats = fs.statSync(inputPath);
      const outputStats = fs.statSync(outputPath);
      const savings = ((inputStats.size - outputStats.size) / inputStats.size * 100).toFixed(1);
      
      console.log(`  ✅ ${path.basename(outputPath)} (${(outputStats.size / 1024).toFixed(0)}KB, -${savings}%)`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`  ❌ Error processing ${inputPath}:`, error.message);
    return false;
  }
}

async function processDirectory(dirPath) {
  const fullPath = path.join(projectRoot, dirPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    return;
  }
  
  console.log(`\n📁 Processing: ${dirPath}`);
  
  const files = fs.readdirSync(fullPath);
  const imageFiles = files.filter(f => 
    /\.(webp|jpg|jpeg|png)$/i.test(f) && 
    !/-sm\.|--md\./.test(f) // Skip already optimized files
  );
  
  for (const file of imageFiles) {
    const inputPath = path.join(fullPath, file);
    const baseName = path.basename(file, path.extname(file));
    
    console.log(`  📷 ${file}`);
    
    for (const size of SIZES) {
      const outputName = `${baseName}${size.suffix}.webp`;
      const outputPath = path.join(fullPath, outputName);
      
      // Skip if optimized version already exists and is newer
      if (fs.existsSync(outputPath)) {
        const inputStats = fs.statSync(inputPath);
        const outputStats = fs.statSync(outputPath);
        if (outputStats.mtime > inputStats.mtime) {
          console.log(`  ⏭️  ${outputName} (already optimized)`);
          continue;
        }
      }
      
      await optimizeImage(inputPath, outputPath, size.width, size.quality);
    }
  }
}

async function main() {
  console.log('🖼️  Bexy Flowers Image Optimizer');
  console.log('================================\n');
  console.log('Creating optimized image variants for faster page loads...\n');
  
  let totalProcessed = 0;
  
  for (const dir of IMAGE_DIRS) {
    await processDirectory(dir);
    totalProcessed++;
  }
  
  console.log('\n================================');
  console.log(`✅ Processed ${totalProcessed} directories`);
  console.log('\n💡 Tip: Update your components to use the -sm.webp versions for mobile');
  console.log('   Example: /assets/birthday/IMG_3730 (1)-sm.webp');
}

main().catch(console.error);
