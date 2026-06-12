// scripts/optimize-images.js
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGE_DIR = path.resolve(__dirname, '../public/assets/images');

function isConvertible(ext) {
  return ['.jpg', '.jpeg', '.png'].includes(ext.toLowerCase());
}

function getWebPPath(originalPath) {
  const dir = path.dirname(originalPath);
  const base = path.basename(originalPath, path.extname(originalPath));
  return path.join(dir, `${base}.webp`);
}

function getWebP2xPath(originalPath) {
  const dir = path.dirname(originalPath);
  const base = path.basename(originalPath, path.extname(originalPath));
  return path.join(dir, `${base}@2x.webp`);
}

async function processImage(filePath) {
  const ext = path.extname(filePath);
  if (!isConvertible(ext)) return;
  const webpPath = getWebPPath(filePath);
  const webp2xPath = getWebP2xPath(filePath);
  try {
    // Standard quality conversion
    await sharp(filePath)
      .webp({ quality: 75 })
      .toFile(webpPath);
    // Generate a double‑resolution version (2x) by scaling 2×
    const metadata = await sharp(filePath).metadata();
    if (metadata.width) {
      await sharp(filePath)
        .resize({ width: Math.round(metadata.width * 2) })
        .webp({ quality: 75 })
        .toFile(webp2xPath);
    }
    console.log(`Converted ${filePath} → ${webpPath} & ${webp2xPath}`);
  } catch (e) {
    console.error(`Failed converting ${filePath}:`, e);
  }
}

async function walk(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
    } else {
      await processImage(fullPath);
    }
  }
}

(async () => {
  await walk(IMAGE_DIR);
})();
