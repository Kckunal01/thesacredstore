import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { couponCode, email } = req.body || {};
    if (!couponCode) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required to validate coupon' });
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('discount_percent, active')
      .eq('code', couponCode.trim().toUpperCase())
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, message: 'Database error fetching coupon' });
    }

    if (!coupon || !coupon.active) {
      return res.status(200).json({
        success: false,
        message: 'Invalid coupon'
      });
    }

    // Check prior redemption by email
    const { data: priorUse } = await supabase
      .from('coupon_redemptions')
      .select('id')
      .eq('coupon_code', couponCode.trim().toUpperCase())
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (priorUse) {
      return res.status(200).json({
        success: false,
        reason: 'already_used',
        message: 'This coupon has already been used with this email.'
      });
    }

    return res.status(200).json({
      success: true,
      discount_percent: coupon.discount_percent
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
}
