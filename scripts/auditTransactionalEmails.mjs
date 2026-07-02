import 'dotenv/config';
import orderHandler from '../api/complete-order.js';
import bookingHandler from '../api/complete-booking.js';
import { createClient } from '@supabase/supabase-js';

function mockRes() {
  return {
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.body = obj; console.log('Response:', obj); },
  };
}

(async () => {
  console.log('--- Testing order handler ---');
  await orderHandler(
    {
      body: {
        razorpayResponse: {
          razorpay_payment_id: `testpay_${Date.now()}`,
          razorpay_order_id: `order_${Date.now()}`,
        },
        formData: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '+1234567890',
        },
        cart: [{ name: 'Crystal', quantity: 1, price: 1000, slug: 'crystal' }],
      },
    },
    mockRes()
  );

  console.log('--- Testing booking handler ---');
  await bookingHandler(
    {
      body: {
        razorpayResponse: {
          razorpay_payment_id: `testpayb_${Date.now()}`,
          razorpay_order_id: `orderb_${Date.now()}`,
        },
        formData: {
          firstName: 'Test',
          lastName: 'User',
          email: 'testb@example.com',
          phone: '+1234567891',
        },
        consultation_type: 'Psychic',
        consultation_date: '2024-01-01',
        consultation_time: '10:00',
        consultation_fee: 5000,
        notes: '',
      },
    },
    mockRes()
  );

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase
    .from('email_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) {
    console.error('Error fetching email_logs:', error);
  } else {
    console.log('Recent email_logs (most recent first):');
    console.table(data);
  }
})();
