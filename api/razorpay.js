const Razorpay = require('razorpay');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Use test keys or env variables if available, otherwise mock test keys
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret'
  });

  const { amount } = req.body;

  const options = {
    amount: amount * 100, // amount in smallest currency unit
    currency: "INR",
    receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`
  };

  try {
    // Note: In a real environment with mock keys, this might fail unless valid test keys are provided.
    // For the sake of this commercial demo on vercel without actual keys yet, if key is 'rzp_test_mock_key', we mock the response.
    if (options.amount && razorpay.key_id === 'rzp_test_mock_key') {
      return res.status(200).json({
        id: `order_mock_${Math.floor(Math.random() * 1000000)}`,
        currency: options.currency,
        amount: options.amount
      });
    }

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong", error: err });
  }
}
