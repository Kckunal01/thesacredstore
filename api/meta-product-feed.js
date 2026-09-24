// api/meta-product-feed.js
// Public endpoint for Meta Commerce Manager / Facebook Catalog feed
// Outputs a tab-separated values (TSV) feed of all active products.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const BASE_URL = 'https://www.thesacredstore.co.in';
const DEFAULT_BRAND = 'The Sacred Store';

function cleanFieldValue(val) {
  if (val === null || val === undefined) return '';
  let str = String(val);
  str = str.replace(/[\r\n\t]+/g, ' ').trim();
  return str;
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials for meta-product-feed');
    return res.status(500).json({ error: 'Server configuration error: Database credentials missing' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, description, price, stock, active, slug, image_url, brand')
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase query error in meta-product-feed:', error);
      return res.status(502).json({ error: 'Failed to retrieve products from database' });
    }

    if (!Array.isArray(products)) {
      return res.status(502).json({ error: 'Invalid product data from database' });
    }

    const activeProducts = products.filter(
      (p) => p && p.active !== false && p.id && p.name
    );

    const headers = [
      'id',
      'title',
      'description',
      'availability',
      'condition',
      'price',
      'link',
      'image_link',
      'brand'
    ];

    const rows = [headers.join('\t')];

    for (const p of activeProducts) {
      const id = cleanFieldValue(p.id);
      const title = cleanFieldValue(p.name);
      const desc = cleanFieldValue(p.description) || title;
      const isAvailable = p.stock === null || p.stock === undefined || Number(p.stock) > 0;
      const availability = isAvailable ? 'in stock' : 'out of stock';
      const condition = 'new';
      const numPrice = Number(p.price) || 0;
      const price = numPrice.toFixed(2) + ' INR';
      const slugOrId = p.slug ? p.slug.trim() : p.id;
      const link = BASE_URL + '/product/' + encodeURIComponent(slugOrId);
      const imageLink = cleanFieldValue(p.image_url);
      const brand = cleanFieldValue(p.brand) || DEFAULT_BRAND;

      const row = [
        id,
        title,
        desc,
        availability,
        condition,
        price,
        link,
        imageLink,
        brand
      ];

      rows.push(row.join('\t'));
    }

    const tsvContent = rows.join('\n');

    res.setHeader('Content-Type', 'text/tab-separated-values; charset=utf-8');
    return res.status(200).send(tsvContent);

  } catch (err) {
    console.error('Unhandled error in meta-product-feed:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
