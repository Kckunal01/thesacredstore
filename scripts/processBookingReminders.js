import 'dotenv/config'; // Load env variables
// This script processes booking reminder email logs and sends reminder emails via Resend.

import { supabase } from "../src/lib/supabase.js";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.error('RESEND_API_KEY is not set. Please add it to your .env file.');
  process.exit(1);
}
const FROM_EMAIL = "no-reply@ritualist.com";

/**
 * Combine date and time strings (local server time) into a Date object.
 * Stored booking times are IST local, so we omit the trailing "Z".
 */
function combineDateTime(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}`);
}

/**
 * Generate reminder logs for upcoming bookings.
 * Creates logs only when they do not already exist.
 */
async function generateReminderLogs() {
  const now = new Date();

  // 24‑hour window: now+23h to now+25h
  const win24Start = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const win24End   = new Date(now.getTime() + 25 * 60 * 60 * 1000);
  // 2‑hour window: now+1h to now+3h
  const win2Start  = new Date(now.getTime() + 1 * 60 * 60 * 1000);
  const win2End    = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  // fetch pending bookings (status = 'pending')
  const { data: bookings, error: bErr } = await supabase
    .from("bookings")
    .select("id, booking_date, booking_time, customer_id, status")
    .eq("status", "pending");

  if (bErr) {
    console.error("Failed to fetch pending bookings:", bErr);
    return 0;
  }

  let generated = 0;

  for (const bk of bookings) {
    const bookingDt = combineDateTime(bk.booking_date, bk.booking_time);

    const maybeInsert = async (type) => {
      const { data: exists } = await supabase
        .from("email_logs")
        .select("id")
        .eq("entity_id", bk.id)
        .eq("email_type", type)
        .maybeSingle(); // returns null if not found

      if (!exists) {
        const { error: iErr } = await supabase
          .from("email_logs")
          .insert({
            entity_type: "booking",
            entity_id: bk.id,
            customer_id: bk.customer_id,
            email_type: type,
            sent_at: null,
          });
        if (!iErr) {
          console.log("Generated reminder log:", type, bk.id);
          generated++;
        } else {
          console.error("Failed to insert reminder log:", iErr);
        }
      }
    };

    // 24‑hour window
    if (bookingDt >= win24Start && bookingDt <= win24End) {
      await maybeInsert("booking_reminder_24_customer");
      await maybeInsert("booking_reminder_24_admin");
    }

    // 2‑hour window
    if (bookingDt >= win2Start && bookingDt <= win2End) {
      await maybeInsert("booking_reminder_2_customer");
      await maybeInsert("booking_reminder_2_admin");
    }
  }

  return generated;
}

/**
 * Fetch pending reminder logs that have not been sent yet.
 */
async function fetchPendingReminders() {
  const { data, error } = await supabase
    .from("email_logs")
    .select("id, email_type, entity_id, customer_id")
    .is("sent_at", null)
    .in("email_type", [
      "booking_reminder_24_customer",
      "booking_reminder_24_admin",
      "booking_reminder_2_customer",
      "booking_reminder_2_admin",
    ]);
  if (error) {
    console.error("Failed to fetch reminder logs:", error);
    return [];
  }
  return data;
}

/**
 * Fetch a single booking (including its customer)
 */
async function fetchBooking(id) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, customer!inner(*)")
    .eq("id", id)
    .single();
  if (error) {
    console.error(`Failed to fetch booking ${id}:`, error);
    return null;
  }
  return data;
}

/**
 * Send an email via Resend.
 */
async function sendEmail(to, subject, html) {
  const response = await fetch("https://api.resend.com/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Resend API error: ${response.status} ${err}`);
  }
  return response.json();
}

/**
 * Mark a reminder log as sent.
 */
async function markLogSent(logId) {
  const { error } = await supabase
    .from("email_logs")
    .update({ sent_at: new Date().toISOString() })
    .eq("id", logId);
  if (error) {
    console.error(`Failed to update email_log ${logId} as sent:`, error);
  }
}

/**
 * Main driver – generate logs, then process any pending logs.
 */
async function runReminders() {
  let generatedCount = 0;
  let sentCount = 0;

  generatedCount = await generateReminderLogs();

  const logs = await fetchPendingReminders();
  for (const log of logs) {
    try {
      const booking = await fetchBooking(log.entity_id);
      if (!booking) continue;

      const isCustomer = log.email_type.endsWith("_customer");
      const to = isCustomer ? booking.customer.email : "support@thesacredstore.co.in";

      console.log("Sending:", log.email_type, to);

      const subject = "Reminder: Your Consultation is Coming Up";
      const html = `
        <p>Hi ${booking.customer.full_name},</p>
        <p>This is a friendly reminder for your upcoming private consultation scheduled on ${booking.booking_date} at ${booking.booking_time}.</p>
        <p>We look forward to our session.</p>
        <p>— Ritualist Team</p>
      `;
      await sendEmail(to, subject, html);
      await markLogSent(log.id);
    } catch (e) {
      console.error(`Error processing reminder log ${log.id}:`, e);
    }
  }
}

runReminders().then(() => console.log("Booking reminder processing completed."));
