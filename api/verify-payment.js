import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ message: 'Invalid signature' });
  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ message: 'Verification error' });
  }
}
