// api/create-booking-order.js
// Secure backend endpoint to create a Razorpay order for a consultation booking.
// Uses environment variables RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.
// Returns { order_id, amount, currency }

import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { amount } = req.body;
  const amountNum = Number(amount);
  if (isNaN(amountNum) || amountNum < 1) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  const orderOptions = {
    amount: amountNum * 100, // amount in paisa
    currency: 'INR',
    receipt: `booking_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(orderOptions);
    return res.status(200).json({ order_id: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error('create-booking-order error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
