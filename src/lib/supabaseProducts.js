// src/lib/supabaseProducts.js
import { supabase } from './supabase';

/**
 * Fetches a map of product slugs to their stock and active status.
 * Returns an object like:
 * {
 *   "black-tourmaline": { stock: 10, active: true },
 *   "clear-quartz": { stock: 5, active: false }
 * }
 */
export async function getProductStockMap() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, slug, stock, active');
    if (error) {
      console.error('Error fetching product stock map:', error);
      throw error;
    }
    const map = {};
    if (Array.isArray(data)) {
      for (const { id, slug, stock, active } of data) {
        const entry = { id, stock, active: active !== undefined ? active : true };
        if (slug) {
          map[slug] = entry;
        }
        if (id) {
          map[id] = entry;
        }
      }
    }
    return map;
  } catch (err) {
    console.error('getProductStockMap exception:', err);
    return {};
  }
}

export async function deductProductStockBySlug(slug, quantity) {
  try {
    const { data: product, error: getErr } = await supabase
      .from('products')
      .select('stock, id, name')
      .eq('slug', slug)
      .single();
    if (getErr || !product) {
      console.error('Failed to get product to deduct stock by slug:', getErr);
      return;
    }
    const newStock = Math.max(0, (product.stock || 0) - quantity);
    const { error: updateErr } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', product.id);
    if (updateErr) {
      console.error('Failed to update product stock by slug:', updateErr);
      return;
    }

    // Low stock alert handling (<=2)
    if (newStock <= 2) {
      try {
        const { data: existing, error: existingErr } = await supabase
          .from('email_logs')
          .select('*')
          .eq('entity_id', product.id)
          .eq('email_type', 'low_stock')
          .limit(1);

        if (!existingErr && (!existing || existing.length === 0)) {
          // Insert alert log
          const alertPayload = {
            customer_id: null,
            entity_type: 'product',
            entity_id: product.id,
            email_type: 'low_stock',
            sent_at: null,
          };
          const { error: insertErr } = await supabase.from('email_logs').insert(alertPayload);
          if (insertErr) {
            console.error('[LOW STOCK] insert failed', insertErr);
          } else {

          }
        }
      } catch (alertErr) {
        console.error('Low stock alert handling error:', alertErr);
      }
    }
  } catch (err) {
    console.error('deductProductStockBySlug exception:', err);
  }
}
