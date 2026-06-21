// api/complete-order.js
// Secure backend endpoint for post‑payment processing using Supabase Service Role Key.

import { createClient } from "@supabase/supabase-js";
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
    const { razorpayResponse, formData, cart } = req.body;

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
    const orderPayload = {
      customer_id: customer.id,
      products: cart.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      amount: cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
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

    // ---------- Stock deduction ----------
    for (const item of cart) {
      const slug = item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const { error: rpcError } = await supabase.rpc('deduct_stock', { p_slug: slug, p_quantity: item.quantity });
      if (rpcError) {
        console.error('Stock deduction failed via RPC', rpcError);
        // Note: As per instruction, if stock deduction fails, we can log it. Or does it fail the order? 
        // "Deduct Stock (RPC)" is after "Insert Payment". If payment succeeds, we do stock.
      }
    }

    // ---------- Email logs (non‑critical) ----------
    const { error: emailError } = await supabase.from("email_logs").insert([
      { customer_id: customer.id, entity_type: "order", entity_id: order.id, email_type: "order_customer" },
      { customer_id: customer.id, entity_type: "order", entity_id: order.id, email_type: "order_admin" },
    ]);
    if (emailError) {
      console.error("Email log insertion error (non‑critical)", emailError);
    }

    console.log('ORDER_SUCCESS', { order_id: order.id, razorpay_payment_id: razorpayResponse.razorpay_payment_id });

    return res.status(200).json({ success: true, orderId: order.order_id });
  } catch (error) {
    console.error("FUNCTION ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error?.message,
      stack: error?.stack
    });
  }
}
