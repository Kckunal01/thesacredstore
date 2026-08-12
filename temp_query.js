import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  // Let's create a dummy customer first
  const { data: customer, error: custErr } = await supabase.from('customers').insert({
    full_name: 'Test Customer',
    email: 'test@example.com',
    phone: '9999999990'
  }).select().single();
  console.log('CUSTOMER:', customer, custErr);

  if (!customer) return;

  // Let's create a dummy order
  const { data: order, error: orderErr } = await supabase.from('orders').insert({
    customer_id: customer.id,
    products: [{ name: 'Test', price: 100, quantity: 1 }],
    amount: 200,
    payment_status: 'pending',
    payment_method: 'cod'
  }).select().single();
  console.log('ORDER:', order, orderErr);

  if (!order) return;

  // Let's create a payment
  const { data: payment, error: paymentErr } = await supabase.from('payments').insert({
    order_id: order.id,
    customer_id: customer.id,
    gateway: 'cod',
    razorpay_order_id: null,
    razorpay_payment_id: `cod_${order.id}`,
    amount: 200,
    currency: 'INR',
    status: 'pending',
    method: 'cod',
    signature_verified: false,
    raw_response: { method: 'cod' }
  }).select();
  console.log('PAYMENT:', payment, paymentErr);

  // Rollback/Cleanup
  await supabase.from('payments').delete().eq('razorpay_payment_id', `cod_${order.id}`);
  await supabase.from('orders').delete().eq('id', order.id);
  await supabase.from('customers').delete().eq('id', customer.id);
}

run();
