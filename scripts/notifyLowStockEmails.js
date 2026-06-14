// scripts/notifyLowStockEmails.js
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase configuration missing.');
  process.exit(1);
}
if (!RESEND_API_KEY) {
  console.error('RESEND_API_KEY not set in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Send a low‑stock alert email via Resend.
 * @param {Object} log - email_logs row
 * @param {string} log.id - log identifier
 * @param {string} log.entity_id - product id
 */
async function sendLowStockEmail(log) {
  const { id, entity_id } = log;
  // Fetch product details
  const { data: product, error: prodErr } = await supabase
    .from('products')
    .select('name,stock')
    .eq('id', entity_id)
    .single();
  if (prodErr) {
    console.error(`Failed to fetch product ${entity_id} for log ${id}:`, prodErr);
    return; // skip sending
  }

  const subject = `Low Stock Alert – ${product.name}`;
  const body = `THE SACRED STORE\n\nLow Stock Alert\n\nProduct: ${product.name}\nCurrent Stock: ${product.stock}\n\nPlease replenish inventory.`;

  const payload = {
    from: 'support@thesacredstore.co.in',
    to: 'support@thesacredstore.co.in',
    subject,
    html: `<p>${body.replace(/\n/g, '<br/>')}</p>`,
  };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Resend API error ${response.status}: ${errText}`);
    }
    // Mark log as sent (update sent_at)
    const { error: updErr } = await supabase
      .from('email_logs')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', id);
    if (updErr) {
      console.error('Failed to update sent_at for email_logs id', id, updErr);
    } else {
      console.log(`Low stock alert email sent for log id ${id}`);
    }
  } catch (err) {
    console.error('Error sending low stock email for log id', id, err);
    // continue processing other logs
  }
}

async function main() {
// Print the existing query being used
console.log('Existing query: select id,entity_id where email_type=low_stock and sent_at is null');

const { data: logs, error } = await supabase
  .from('email_logs')
  .select('*')
  .eq('email_type', 'low_stock')
  .is('sent_at', null);

if (error) {
  console.error('Failed to fetch low stock email logs:', error);
  process.exit(1);
}
console.log('Pending low stock logs:', logs);
console.log('Pending count:', logs?.length || 0);
if (!logs || logs.length === 0) {
  console.log('No pending low stock email alerts.');
  return;
}
for (const log of logs) {
  await sendLowStockEmail(log);
}
}

main();
