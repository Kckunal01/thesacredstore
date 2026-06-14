// scripts/sendLowStockAlerts.js
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error('RESEND_API_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  // Fetch low stock email logs that have not been processed yet.
  const { data: logs, error } = await supabase
    .from('email_logs')
    .select('id, entity_id, entity_type, email_type, recipient, subject, body')
    .eq('entity_type', 'product')
    .eq('email_type', 'low_stock');

  if (error) {
    console.error('Failed to fetch low stock email logs:', error);
    process.exit(1);
  }

  if (!logs || logs.length === 0) {
    console.log('No low stock alerts to process.');
    return;
  }

  for (const log of logs) {
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'support@thesacredstore.co.in',
          to: log.recipient,
          subject: log.subject,
          html: `<p>${log.body.replace(/\n/g, '<br/>')}</p>`,
        }),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        console.error(`Failed to send low stock email for log ${log.id}:`, txt);
        continue;
      }

      // Delete log after successful send to avoid duplicate notifications.
      const { error: delErr } = await supabase.from('email_logs').delete().eq('id', log.id);
      if (delErr) {
        console.error(`Failed to delete email_log ${log.id}:`, delErr);
      } else {
        console.log(`Low stock alert sent and log ${log.id} removed.`);
      }
    } catch (e) {
      console.error(`Error processing low stock log ${log.id}:`, e);
    }
  }
})();
