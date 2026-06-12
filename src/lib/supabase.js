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

export async function getCustomerByPhone(phone) {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    if (error) {
      console.error(
        'Error fetching customer by phone:',
        JSON.stringify(error, null, 2)
      );
      throw error;
    }

    return customer;
  } catch (err) {
    console.error('getCustomerByPhone exception:', err);
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

// =========================
// BOOKING / CONSULTATION FUNCTIONS
// =========================

export async function createBooking(data) {
  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      throw error;
    }

    console.log('Booking created:', booking);
    return booking;
  } catch (err) {
    console.error('createBooking exception:', err);
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
