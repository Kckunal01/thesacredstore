// generate_products_csv.js
const fs = require('fs');
const path = require('path');
const productsFile = path.join(__dirname, 'src', 'data', 'products.js');
let content = fs.readFileSync(productsFile, 'utf-8');
// Strip export and comments
content = content.replace(/export const products =/, '').trim();
if (content.endsWith(';')) content = content.slice(0, -1);
// Replace JS style single quotes with double quotes for JSON parsing
content = content.replace(/'/g, '"');
// Remove trailing commas before closing brackets
content = content.replace(/,\s*}/g, '}');
content = content.replace(/,\s*]/g, ']');
let products = [];
try {
  products = JSON.parse(content);
} catch (e) {
  console.error('Failed to parse products.js', e);
  process.exit(1);
}
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
const rows = products.map(p => {
  const imageUrl = (p.images && p.images[0]) ? p.images[0] : '';
  const slug = slugify(p.name);
  return `${p.name},${p.category},${p.price},10,${imageUrl},true,${slug}`;
});
const header = 'name,category,price,stock,image_url,active,slug';
fs.writeFileSync('products_seed.csv', header + '\n' + rows.join('\n'));
console.log('CSV generated: products_seed.csv');
