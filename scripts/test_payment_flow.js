// scripts/test_payment_flow.js
// Run with: node scripts/test_payment_flow.js
// This script performs end‑to‑end test of booking and checkout flows using Razorpay test mode.
// It creates a Razorpay order, then calls the complete‑booking / complete‑order endpoints with a mocked Razorpay response.

import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5173'; // adjust if needed

async function testBookingFlow() {
  console.log('--- Testing Booking Flow ---');
  // Step 1: Create booking order
  const orderRes = await fetch(`${baseUrl}/api/create-booking-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 1 }) // minimal amount for test
  });
  const orderData = await orderRes.json();
  console.log('Create booking order response:', orderData);

  // Mock Razorpay response (as would be returned by Razorpay checkout)
  const mockRazorpayResponse = {
    razorpay_order_id: orderData.order_id,
    razorpay_payment_id: 'pay_test_' + Date.now(),
    razorpay_signature: 'test_signature'
  };

  // Step 2: Complete booking
  const completeRes = await fetch(`${baseUrl}/api/complete-booking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpayResponse: mockRazorpayResponse,
      formData: { firstName: 'Test', lastName: '', email: 'test@example.com', phone: '1234567890' },
      consultation_type: 'Test Consultation',
      consultation_date: '2026-07-01',
      consultation_time: '10:00',
      consultation_fee: 1,
      notes: 'Test booking'
    })
  });
  const completeData = await completeRes.json();
  console.log('Complete booking response:', completeData);
}

async function testCheckoutFlow() {
  console.log('--- Testing Checkout Flow ---');
  // Step 1: Create order (checkout)
  const orderRes = await fetch(`${baseUrl}/api/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 1 })
  });
  const orderData = await orderRes.json();
  console.log('Create checkout order response:', orderData);

  const mockRazorpayResponse = {
    razorpay_order_id: orderData.order_id,
    razorpay_payment_id: 'pay_test_' + Date.now(),
    razorpay_signature: 'test_signature'
  };

  // Step 2: Complete order
  const completeRes = await fetch(`${baseUrl}/api/complete-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpayResponse: mockRazorpayResponse,
      formData: { firstName: 'Test', lastName: '', email: 'test@example.com', phone: '1234567890' },
      cart: [] // empty cart for test; adjust as needed
    })
  });
  const completeData = await completeRes.json();
  console.log('Complete checkout response:', completeData);
}

(async () => {
  try {
    await testBookingFlow();
    await testCheckoutFlow();
    console.log('✅ All test flows completed');
  } catch (err) {
    console.error('❌ Test flow error:', err);
  }
})();
