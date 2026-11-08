import fs from 'fs';
import path from 'path';
import sharp from '../node_modules/sharp/dist/index.mjs';

const images = [
  'src/assets/hero/child-care.jpg',
  'src/assets/hero/elderly-care-female.jpg',
  'src/assets/hero/elderly-care-male.jpg',
  'src/assets/hero/newborn-baby-care.jpg',
  'src/assets/hero/pregnant-woman-care.jpg',
  'src/assets/about-care.jpg',
  'src/assets/booking-bg.jpg',
];

for (const relPath of images) {
  const fullPath = path.resolve('frontend', relPath);
  if (!fs.existsSync(fullPath)) continue;

  const originalSize = fs.statSync(fullPath).size;
  const buffer = await sharp(fullPath)
    .resize({ width: 1600, withoutEnlargement: true, fit: 'inside' })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toBuffer();

  const tempPath = fullPath + '.tmp';
  fs.writeFileSync(tempPath, buffer);
  const newSize = fs.statSync(tempPath).size;

  if (newSize < originalSize) {
    fs.renameSync(tempPath, fullPath);
    console.log(`Optimized ${relPath}: ${(originalSize / 1024 / 1024).toFixed(2)} MB -> ${(newSize / 1024).toFixed(1)} KB (-${(((originalSize - newSize) / originalSize) * 100).toFixed(1)}%)`);
  } else {
    fs.unlinkSync(tempPath);
    console.log(`Skipped ${relPath}: already optimal`);
  }
}
