import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import orderHandler from './api/complete-order.js';
import bookingHandler from './api/complete-booking.js';

function createMockRes() {
  const res = {};
  res.statusCode = 200;
  res.status = function (code) { this.statusCode = code; return this; };
  res.json = function (obj) { this.body = obj; return this; };
  return res;
}

async function runAudit() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, serviceKey);

  const testEmail = 'test@example.com';

  async function clean(email) {
    await supabase.from('email_logs').delete().eq('customer_id', email);
    await supabase.from('orders').delete().eq('customer_id', email);
    await supabase.from('bookings').delete().eq('customer_id', email);
    await supabase.from('customers').delete().eq('email', email);
    await supabase.from('payments').delete().eq('customer_id', email);
  }

  await clean(testEmail);

  // Order test
  const orderReq = {
    body: {
      razorpayResponse: {
        razorpay_payment_id: 'test_pay_' + Date.now(),
        razorpay_order_id: 'test_ord_' + Date.now(),
      },
      formData: { firstName: 'Test', lastName: 'User', email: testEmail, phone: '9999999999' },
      cart: [{ name: 'Test Product', quantity: 1, price: 1000, slug: 'test-product' }],
    },
  };
  const orderRes = createMockRes();
  await orderHandler(orderReq, orderRes);
  const orderSuccess = orderRes.statusCode === 200 && orderRes.body?.success;
  const { data: orderLog } = await supabase
    .from('email_logs')
    .select('sent_at')
    .eq('entity_type', 'order')
    .eq('email_type', 'order_customer')
    .order('created_at', { ascending: false })
    .limit(1);
  const orderLogOk = orderLog && orderLog.length === 1 && orderLog[0].sent_at;

  // Booking test
  const bookingReq = {
    body: {
      razorpayResponse: {
        razorpay_payment_id: 'test_book_pay_' + Date.now(),
        razorpay_order_id: 'test_book_ord_' + Date.now(),
      },
      formData: { firstName: 'Test', lastName: 'User', email: testEmail, phone: '9999999999' },
      consultation_type: 'Astrology',
      consultation_date: new Date().toISOString().split('T')[0],
      consultation_time: '10:00',
      consultation_fee: 5000,
      notes: '',
    },
  };
  const bookingRes = createMockRes();
  await bookingHandler(bookingReq, bookingRes);
  const bookingSuccess = bookingRes.statusCode === 200 && bookingRes.body?.success;
  const { data: bookingLog } = await supabase
    .from('email_logs')
    .select('sent_at')
    .eq('entity_type', 'booking')
    .eq('email_type', 'booking_customer')
    .order('created_at', { ascending: false })
    .limit(1);
  const bookingLogOk = bookingLog && bookingLog.length === 1 && bookingLog[0].sent_at;

  await clean(testEmail);

  console.log('Order customer email:', orderSuccess && orderLogOk ? 'PASS' : 'FAIL');
  console.log('Booking customer email:', bookingSuccess && bookingLogOk ? 'PASS' : 'FAIL');
}

runAudit().catch(err => { console.error('Audit error:', err); process.exit(1); });
