// generate_products_csv.mjs
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// Resolve directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build file URL for products.js
const productsPath = path.join(__dirname, 'src', 'data', 'products.js');
const { products } = await import(pathToFileURL(productsPath).href);

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphen
    .replace(/(^-|-$)/g, ''); // trim hyphens
}

const header = ['name', 'category', 'price', 'stock', 'image_url', 'active', 'slug'];
let rows = [header.join(',')];
for (const p of products) {
  const name = p.name.replace(/"/g, '""');
  const category = p.category;
  const price = p.price;
  const stock = 10; // default
  const image_url = (p.images && p.images[0]) ? p.images[0] : '';
  const active = true;
  const slug = slugify(p.name);
  // CSV escape for fields with commas or quotes
  const escape = (val) => {
    if (typeof val === 'string' && (val.includes(',') || val.includes('"'))){
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };
  rows.push([
    escape(name),
    escape(category),
    price,
    stock,
    escape(image_url),
    active,
    slug
  ].join(','));
}

const csvContent = rows.join('\n');
writeFileSync(path.join(__dirname, 'products_seed.csv'), csvContent);
console.log('CSV generated at', path.join(__dirname, 'products_seed.csv'));
