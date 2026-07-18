import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseInstance = null;
function getSupabase() {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables are missing on the backend.");
    }
    supabaseInstance = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabaseInstance;
}

/**
 * Normalizes email address.
 */
export function normalizeEmail(email) {
  if (!email) return "";
  return email.trim().toLowerCase();
}

/**
 * Normalizes phone number (removes spaces, dashes, + and leading 91/0).
 */
export function normalizePhone(phone) {
  if (!phone) return "";
  let cleaned = phone.toString().replace(/[\s\-+]/g, "");
  // Strip country code if it is 91 and the resulting length is 10 digits
  if (cleaned.startsWith("91") && cleaned.length > 10) {
    cleaned = cleaned.substring(2);
  }
  return cleaned.trim();
}

/**
 * Normalizes coupon code.
 */
export function normalizeCouponCode(code) {
  if (!code) return "";
  return code.trim().toUpperCase();
}

/**
 * Validates a coupon entirely on the backend.
 * Recalculates subtotal using database product prices to avoid trust issues.
 * Returns: { success: true, discountPercent, discountAmount, newTotal, couponId } or { success: false, message }
 */
export async function validateCoupon({ couponCode, phone, email, cart }) {
  if (!couponCode) {
    return { success: false, message: "Coupon code is required" };
  }
  if (!phone) {
    return { success: false, message: "Mobile number is required to validate coupon" };
  }
  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return { success: false, message: "Cart details are required" };
  }

  const normalizedCoupon = normalizeCouponCode(couponCode);
  const normalizedPhone = normalizePhone(phone);
  const normalizedEmail = normalizeEmail(email);

  const supabase = getSupabase();

  // 1. Fetch Coupon details
  const { data: coupon, error: couponError } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", normalizedCoupon)
    .maybeSingle();

  if (couponError) {
    return { success: false, message: "Database error fetching coupon details" };
  }
  if (!coupon || !coupon.active) {
    return { success: false, message: "Invalid or inactive coupon" };
  }

  // Check expiration if expires_at exists
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { success: false, message: "Coupon has expired" };
  }

  // 2. Fetch current prices of items from the database to recalculate the subtotal
  const productSlugs = cart.map((item) => item.slug).filter(Boolean);
  if (productSlugs.length === 0) {
    return { success: false, message: "Invalid cart products" };
  }

  const { data: dbProducts, error: dbProductsError } = await supabase
    .from("products")
    .select("slug, price, active")
    .in("slug", productSlugs);

  if (dbProductsError || !dbProducts) {
    return { success: false, message: "Database error verifying cart product prices" };
  }

  // Map database prices for quick lookup
  const priceMap = {};
  for (const prod of dbProducts) {
    if (prod.active) {
      priceMap[prod.slug] = Number(prod.price);
    }
  }

  // Recalculate subtotal using database prices
  let recalculatedSubtotal = 0;
  for (const item of cart) {
    const dbPrice = priceMap[item.slug];
    if (dbPrice === undefined) {
      return { success: false, message: `Product ${item.name} is no longer active or available` };
    }
    recalculatedSubtotal += dbPrice * item.quantity;
  }

  // Check minimum order amount requirement
  if (coupon.min_order_amount && recalculatedSubtotal < Number(coupon.min_order_amount)) {
    return {
      success: false,
      message: `Minimum order amount of ₹${coupon.min_order_amount} required to use this coupon`,
    };
  }

  // 3. Check customer has not already redeemed the coupon
  // Look up coupon redemptions for this normalized phone or email
  const query = supabase
    .from("coupon_redemptions")
    .select("id")
    .eq("coupon_code", normalizedCoupon);

  let orClause = `phone.eq.${normalizedPhone}`;
  if (normalizedEmail) {
    orClause += `,email.eq.${normalizedEmail}`;
  }

  const { data: priorUse, error: priorUseError } = await query.or(orClause).maybeSingle();

  if (priorUseError) {
    return { success: false, message: "Database error checking coupon usage history" };
  }
  if (priorUse) {
    return { success: false, message: "This coupon has already been used with this contact info." };
  }

  // 4. Check global usage limit if present
  if (coupon.usage_limit) {
    const { count, error: countError } = await supabase
      .from("coupon_redemptions")
      .select("id", { count: "exact", head: true })
      .eq("coupon_code", normalizedCoupon);

    if (countError) {
      return { success: false, message: "Database error checking global coupon usage" };
    }
    if (count !== null && count >= coupon.usage_limit) {
      return { success: false, message: "Coupon usage limit has been reached" };
    }
  }

  const discountPercent = coupon.discount_percent || 0;
  const discountAmount = Math.round((recalculatedSubtotal * discountPercent) / 100);
  const newTotal = recalculatedSubtotal - discountAmount;

  return {
    success: true,
    discountPercent,
    discountAmount,
    recalculatedSubtotal,
    newTotal,
    couponId: coupon.id,
  };
}
