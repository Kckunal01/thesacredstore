// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';


// Vite automatically injects env variables via import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


export const supabase = createClient(supabaseUrl, supabaseAnonKey);
/**
 * Fetch stock for a single product slug (optional helper).
 */
export async function getProductStock(slug) {
  const { data, error } = await supabase
    .from('products')
    .select('stock')
    .eq('slug', slug)
    .single();
  if (error) {
    console.error('Error fetching product stock:', error);
    return null;
  }
  return data?.stock ?? null;
}

/**
 * Check if a stock‑waitlist request already exists for a given product & email.
 */
export async function checkStockRequestExists(productId, email) {
  const { data, error } = await supabase
    .from('stock_requests')
    .select('id')
    .eq('product_id', productId)
    .eq('email', email)
    .single();
  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found – treat as not existing
    console.error('Error checking stock request existence:', error);
    return false;
  }
  return !!data;
}

/**
 * Create a new stock‑waitlist request.
 */
export async function createStockRequest(productId, email) {
  const { error } = await supabase
    .from('stock_requests')
    .insert({ product_id: productId, email });
  if (error) {
    console.error('Error creating stock request:', error);
    throw error;
  }
  return true;
}
export async function getCustomerByPhone(phone) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', phone)
    .single();
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching customer by phone:', error);
    return null;
  }
  return data ?? null;
}

// Create a new customer
export async function createCustomer(customer) {
  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single();
  if (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
  return data;
}

// Create a new booking
export async function createBooking(booking) {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();
  if (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
  return data;
}

// Create a new order
export async function createOrder(order) {
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single();
  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }
  return data;
}


