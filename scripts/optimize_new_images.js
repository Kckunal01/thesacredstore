import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const baseDir = path.resolve('public/assets/images');

const folderMap = {
  'Blue Lace Agate Bracelet': ['Blue Lasagate Bracelet', 'Blue Lace Agate Bracelet'],
  'Carnelian Bracelet': ['Carnelian Bracelet'],
  'Carnelian Crystal Tree': ['Carnelian Crystal Tree'],
  'Clear Quartz Crystal Pyramid': ['Clear Quartz Crystal Pyramid'],
  'Clear Quartz Bracelet': ['Clear Quartz Bracelet'],
  'Golden Hematite Bracelet': ['Golden Hamatite Bracelet', 'Golden Hematite Bracelet'],
  'Green Aventurine Crystal Pyramid': ['Green Aventurine Crystal Pyramid'],
  'Green Aventurine Crystal Tree': ['Green Aventurine Crystal Tree'],
  'Green Jade Bracelet': ['Green Jade Bracelet'],
  'Pink Tourmaline Bracelet': ['Pink Tourmaline Bracelet'],
  'Pyrite Bracelet': ['Pyrite Bracelet'],
  'Pyrite Crystal Pyramid': ['Pyrite Crystal Pyramid'],
  'Pyrite Crystal Tree': ['Pyrite Crystal Tree'],
  'Red Jasper Bracelet': ['Red Jasper Bracelet'],
  'Rutile Quartz Bracelet': ['Rutile Quartz Bracelet'],
  'Selenite Bracelet': ['Selenite Bracelet'],
  'Sodalite Bracelet': ['Sodalite Bracelet'],
  'Turquoise Bracelet': ['Turquoise Bracelet'],
};

async function processAll() {
  const report = {};
  for (const [prodName, candidates] of Object.entries(folderMap)) {
    let foundDir = null;
    for (const c of candidates) {
      const p = path.join(baseDir, c);
      if (fs.existsSync(p)) {
        foundDir = p;
        break;
      }
    }

    if (!foundDir) {
      console.warn(`Directory not found for ${prodName}`);
      continue;
    }

    const files = fs.readdirSync(foundDir).filter(f => !f.includes('original.webp') && !f.includes('2x.webp'));
    console.log(`Processing ${prodName} in ${foundDir}: ${files.length} images`);
    
    const createdImages = [];
    let idx = 1;
    for (const f of files) {
      const ext = path.extname(f).toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;
      
      const fullPath = path.join(foundDir, f);
      const outOriginal = path.join(foundDir, `${prodName} ${idx} original.webp`);
      const out2x = path.join(foundDir, `${prodName} ${idx} 2x.webp`);

      try {
        const img = sharp(fullPath);
        const meta = await img.metadata();

        await sharp(fullPath)
          .resize({ width: Math.min(meta.width || 800, 800), fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85, alphaQuality: 90 })
          .toFile(outOriginal);

        await sharp(fullPath)
          .resize({ width: Math.min(meta.width || 1600, 1600), fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 90, alphaQuality: 95 })
          .toFile(out2x);

        const relDir = path.relative(path.resolve('public'), foundDir).replace(/\\/g, '/');
        createdImages.push(`/${relDir}/${prodName} ${idx} original.webp`);
        idx++;
      } catch (err) {
        console.error(`Error processing ${f}:`, err);
      }
    }
    report[prodName] = createdImages;
  }
  console.log('DONE processing images.');
  fs.writeFileSync('scratch_image_report.json', JSON.stringify(report, null, 2));
}

processAll().catch(err => console.error(err));
