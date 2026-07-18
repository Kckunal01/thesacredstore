import { validateCoupon } from './couponService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { couponCode, phone, email, cart } = req.body || {};
    const result = await validateCoupon({ couponCode, phone, email, cart });
    if (!result.success) {
      return res.status(200).json({ success: false, message: result.message });
    }
    return res.status(200).json({
      success: true,
      discount_percent: result.discountPercent,
      discount_amount: result.discountAmount,
      new_total: result.newTotal
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
}
