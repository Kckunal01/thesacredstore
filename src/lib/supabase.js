// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Supabase client initialized with URL:', supabaseUrl);

// =========================
// CUSTOMER FUNCTIONS
// =========================

export async function createCustomer(data) {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error(
        "CUSTOMER INSERT ERROR:",
        JSON.stringify(error, null, 2)
      );
      throw error;
    }

    console.log("Customer inserted successfully:", customer);

    return customer;
  } catch (err) {
    console.error(
      "CUSTOMER EXCEPTION JSON:",
      JSON.stringify(err, null, 2)
    );

    throw err;
  }
}

export async function getCustomerByEmail(email) {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error(
        'Error fetching customer by email:',
        JSON.stringify(error, null, 2)
      );
      throw error;
    }

    return customer;
  } catch (err) {
    console.error('getCustomerByEmail exception:', err);
    throw err;
  }
}

// =========================
// ORDER FUNCTIONS
// =========================

export async function createOrder(data) {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }

    console.log('Order created:', order);
    return order;
  } catch (err) {
    console.error('createOrder exception:', err);
    throw err;
  }
}

export async function createOrderItems(items) {
  try {
    console.log("INSERTING ORDER ITEMS:", JSON.stringify(items, null, 2));
    const { data: createdItems, error } = await supabase
      .from('order_items')
      .insert(items)
      .select();

    if (error) {
      console.error("ORDER ITEMS ERROR:", JSON.stringify(error, null, 2));
      throw error;
    }

    console.log("ORDER ITEMS SUCCESS:", JSON.stringify(createdItems, null, 2));
    return createdItems;
  } catch (err) {
    console.error("ORDER ITEMS EXCEPTION:", JSON.stringify(err, null, 2));
    throw err;
  }
}

// =========================
// CONSULTATION FUNCTIONS
// =========================

export async function createConsultation(data) {
  try {
    const { data: consultation, error } = await supabase
      .from('consultations')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Error creating consultation:', error);
      throw error;
    }

    console.log('Consultation created:', consultation);
    return consultation;
  } catch (err) {
    console.error('createConsultation exception:', err);
    throw err;
  }
}

// =========================
// TEST CONNECTION
// =========================

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connection successful:', data);
    }
  } catch (err) {
    console.error('Unexpected error during Supabase test:', err);
  }
}

export default supabase;
