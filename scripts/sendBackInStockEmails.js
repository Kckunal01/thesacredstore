// scripts/sendBackInStockEmails.js

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Startup logs
console.log('SUPABASE URL:', !!supabaseUrl);
console.log('SERVICE ROLE:', !!supabaseKey);
console.log('RESEND:', !!RESEND_API_KEY);

if (!supabaseUrl || !supabaseKey || !RESEND_API_KEY) {
  console.error('Required environment variables missing.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  try {
    // Automation run tracking
    let runId = null;
    let sentCount = 0;
    // Insert automation run record
    const { data: run, error: runErr } = await supabase
      .from("automation_runs")
      .insert({
        automation_name: "restock_notifications",
        status: "running",
      })
      .select()
      .single();
    if (runErr) {
      console.error("AUTOMATION RUN INSERT FAILED:", runErr);
    } else {
      runId = run.id;
      console.log("AUTOMATION RUN CREATED:", runId);
    }
    // Fetch all pending back‑in‑stock notifications
    const { data: requests, error } = await supabase
      .from('stock_requests')
      .select('id,email,product_id')
      .eq('notified', false);

    if (error) {
      console.error('Failed to fetch stock_requests:', error);
      process.exit(1);
    }

    if (!requests || requests.length === 0) {
      console.log('No pending back‑in‑stock notifications.');
      return;
    }

    console.log('Pending requests:', requests);
    console.log('Pending count:', requests.length);

    // Process each request individually
    for (const req of requests) {
      try {
        // Fetch product details to check stock and name
        const { data: product, error: prodErr } = await supabase
          .from('products')
          .select('name,stock')
          .eq('id', req.product_id)
          .single();

        if (prodErr) {
          console.error(`Failed to fetch product ${req.product_id}:`, prodErr);
          continue; // skip this request
        }

        if ((product?.stock ?? 0) <= 0) {
          console.log(
            `Product ${product?.name || req.product_id} still out of stock, skipping request ${req.id}`
          );
          continue; // do not notify
        }

        const productName = product.name;

        // Send email via Resend
        const resp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'support@thesacredstore.co.in',
            to: req.email,
            subject: `${productName} is back in stock ✨`,
            html: `
              <h2>✨ The Sacred Store</h2>
              <p>Hello,</p>
              <p>The product you requested is finally back in stock.</p>
              <p><strong>${productName}</strong></p>
              <p>Shop now before it sells out again:</p>
              <p><a href="https://thesacredstore.co.in">https://thesacredstore.co.in</a></p>
              <p>Love,<br>The Sacred Store Team</p>
            `,
          }),
        });

        if (!resp.ok) {
          const txt = await resp.text();
          console.error(`Resend email failed for request ${req.id}:`, txt);
          continue; // do not mark as notified
        }

        // Mark request as notified
        const { error: updErr } = await supabase
          .from('stock_requests')
          .update({ notified: true })
          .eq('id', req.id);

        if (updErr) {
          console.error(`Failed to mark request ${req.id} as notified:`, updErr);
        } else {
          console.log(`Successfully notified ${req.email} (request ${req.id})`);
          // Increment sent count for successful notification
          sentCount++;
        }
      } catch (e) {
        console.error(`Unexpected error processing request ${req.id}:`, e);
      }
    }

    console.log('Back-in-stock email processing completed.');
  } catch (err) {
    // Failure handling for automation run
    if (runId) {
      await supabase
        .from("automation_runs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          error_message: err.message,
        })
        .eq("id", runId);
      console.error("AUTOMATION RUN FAILURE:", runId, err);
    }
    console.error('Unexpected fatal error:', err);
    process.exit(1);
  }

  // Success handling after processing all requests
  if (runId) {
    await supabase
      .from("automation_runs")
      .update({
        status: "success",
        completed_at: new Date().toISOString(),
        processed_count: sentCount,
      })
      .eq("id", runId);
    console.log("AUTOMATION RUN SUCCESS:", runId);
  }
})();