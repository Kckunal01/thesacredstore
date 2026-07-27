import Razorpay from 'razorpay';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { amount } = req.body;
  if (!amount || amount < 1) {
    return res.status(400).json({ message: 'Invalid amount. Minimum is 1 Rupee.' });
  }

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const razorpay = new Razorpay({ key_id, key_secret });

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
    });

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (err) {
    console.error('Razorpay Error:', err);
    if (err.statusCode === 401) {
      return res.status(401).json({ message: 'Authentication failure' });
    }
    return res.status(500).json({ message: 'Failed to create order' });
  }
}
