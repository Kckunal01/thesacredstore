import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { couponCode } = req.body || {};
    if (!couponCode) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
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

    if (coupon && coupon.active) {
      return res.status(200).json({
        success: true,
        discount_percent: coupon.discount_percent
      });
    }

    return res.status(200).json({
      success: false,
      message: 'Invalid coupon'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
}
