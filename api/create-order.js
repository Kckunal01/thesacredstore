const Razorpay = require('razorpay');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { amount } = req.body;
  if (!amount || amount < 100) {
    return res.status(400).json({ message: 'Invalid amount. Minimum is 100 paise.' });
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const razorpay = new Razorpay({
    key_id: process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });

  const options = {
    amount: Math.round(amount * 100), // amount in smallest currency unit
    currency: "INR",
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (err) {
    console.error('Razorpay Error:', err);
    if (err.statusCode === 401) {
      return res.status(401).json({ message: "Authentication failure", error: err });
    }
    res.status(500).json({ message: "Something went wrong", error: err });
  }
}
