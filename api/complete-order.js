// api/complete-order.js
// Secure backend endpoint for post‑payment processing using Supabase Service Role Key.

import { createClient } from "@supabase/supabase-js";
import { sendOrderEmails } from "./_emailHelper.js";
 // if using SvelteKit, otherwise adapt to your framework

// Initialise Supabase admin client with service role key
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  console.log("FUNCTION STARTED");
  console.log("SUPABASE_URL:", !!process.env.SUPABASE_URL);
  console.log("SERVICE_ROLE:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  try {
    const { razorpayResponse, formData, cart, couponCode } = req.body;

    // ---------- Idempotency check ----------
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("order_id")
      .eq("razorpay_payment_id", razorpayResponse.razorpay_payment_id)
      .maybeSingle();

    if (existingPayment) {
      // Order already processed – return existing order ID
      return res.status(200).json({ success: true, orderId: existingPayment.order_id });
    }

    // ---------- Customer handling ----------
    let { data: customer } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", formData.phone)
      .maybeSingle();

    if (!customer) {
      const { data: newCustomer } = await supabase
        .from("customers")
        .insert({
          full_name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
        })
        .select()
        .single();
      customer = newCustomer;
    }

    // ---------- Order creation ----------
    let discountPercent = 0;
    let discountAmount = 0;
    let couponId = null;
    const normalizedCoupon = couponCode ? couponCode.trim().toUpperCase() : null;
    const normalizedEmail = formData.email ? formData.email.trim().toLowerCase() : '';
    
    if (normalizedCoupon) {
      const { validateCoupon } = require("./couponService.js");
      const validation = await validateCoupon({
        couponCode: normalizedCoupon,
        phone: formData.phone,
        email: normalizedEmail,
        cart
      });
      if (!validation.success) {
        return res.status(400).json({ success: false, message: validation.message });
      }
      discountPercent = validation.discountPercent;
      discountAmount = validation.discountAmount;
      couponId = validation.couponId;
    }

    const orderPayload = {
      customer_id: customer.id,
      products: cart.map((item) => ({
        name: item.name,
        slug: item.slug,
        quantity: item.quantity,
        price: item.price,
      })),
      // Apply coupon discount if any
      amount: cart.reduce((sum, i) => sum + i.price * i.quantity, 0) - discountAmount,
      payment_status: "paid",
      payment_method: "razorpay",
    };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderPayload)
      .select()
      .single();

    if (orderError) {
      console.error("Order creation failed", orderError);
      return res.status(500).json({ success: false, message: "Order creation failed" });
    }

    // ---------- Payment insertion ----------
    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: order.id,
      customer_id: customer.id,
      gateway: "razorpay",
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      amount: orderPayload.amount,
      currency: "INR",
      status: "captured",
      method: null,
      signature_verified: true,
      raw_response: razorpayResponse,
    });

    if (paymentError) {
      // Rollback order creation
      const { error: rollbackError } = await supabase.from("orders").delete().eq("id", order.id);
      if (rollbackError) {
        console.error("CRITICAL: payment insert failed and rollback failed", rollbackError);
      }
      console.error("Payment insertion failed", paymentError);
      return res.status(500).json({ success: false, message: "Payment insertion failed" });
    }

    // ---------- Coupon Redemption insertion (post‑payment) ----------
    if (normalizedCoupon) {
      const { error: redemptionError } = await supabase.from('coupon_redemptions').insert({
        coupon_code: normalizedCoupon,
        coupon_id: couponId,
        customer_id: customer.id,
        email: normalizedEmail,
        phone: formData.phone,
        order_id: order.id,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        traffic_source: null,
      });
      if (redemptionError) {
        // Detect duplicate redemption via unique constraint violation
        if (redemptionError.code === '23505') {
          // Unique constraint breach – coupon already used for this email or phone
          return res.status(400).json({ success: false, message: 'Coupon already used.' });
        }
        console.error('Coupon redemption insert failed', redemptionError);
        // Continue without failing the order for other errors
      }
    }

    // ---------- Stock deduction ----------
    for (const item of cart) {
      // Rakhi'26 products are frontend-only and have no row in the products table.
      // Skip stock deduction for them to avoid a DB exception.
      if (
        item.collection === "Rakhi'26" ||
        (item.slug && item.slug.startsWith('rakhi-')) ||
        (item.id && String(item.id).startsWith('rakhi-'))
      ) {
        continue;
      }
      const slug = item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const { error: rpcError } = await supabase.rpc('deduct_stock', { p_slug: slug, p_quantity: item.quantity });
      if (rpcError) {
        console.error('Stock deduction failed via RPC', rpcError);
      }
    }

    // ---------- Email logs (non‑critical) ----------
    const { data: emailLogsData, error: emailError } = await supabase.from("email_logs").insert([
      { customer_id: customer.id, entity_type: "order", entity_id: order.id, email_type: "order_customer" },
      { customer_id: customer.id, entity_type: "order", entity_id: order.id, email_type: "order_admin" },
    ]).select();
    if (emailError) {
      console.error("Email log insertion error (non‑critical)", emailError);
    }

    // Try immediate order confirmation email delivery (isolated to not break order success)
    if (emailLogsData && emailLogsData.length > 0) {
      try {
        await sendOrderEmails(supabase, order, customer, emailLogsData);
      } catch (emailSendErr) {
        console.error("Immediate order email failed:", emailSendErr);
      }
    }

    console.log('ORDER_SUCCESS', { order_id: order.id, razorpay_payment_id: razorpayResponse.razorpay_payment_id });

    return res.status(200).json({ success: true, orderId: order.order_id });
  } catch (error) {
    console.error("FUNCTION ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Unknown error'
    });
  }
}
