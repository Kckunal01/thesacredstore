import 'dotenv/config'; // Load environment variables

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.error('RESEND_API_KEY is not set. Please add it to your .env file.');
  process.exit(1);
}
const FROM_EMAIL = "support@thesacredstore.co.in";

/**
 * Combine date and time strings (local server time) into a Date object.
 * Booking times are stored in IST without a trailing "Z".
 */
function combineDateTime(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}`);
}

/**
 * Generate reminder logs for upcoming bookings.
 * Creates logs only when they do not already exist.
 * Returns the number of logs generated.
 */
async function generateReminderLogs() {
  const now = new Date();
  console.log("NOW:", now.toISOString());

  // 24‑hour window: now+23h to now+25h
  const win24Start = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const win24End = new Date(now.getTime() + 25 * 60 * 60 * 1000);
  // 2‑hour: now+1h to now+3h
  const win2Start = new Date(now.getTime() + 1 * 60 * 60 * 1000);
  const win2End = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  // Fetch pending bookings (status = 'pending')
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
 * Fetch a single booking together with its customer details.
 */
async function fetchBooking(id) {
  const { data: booking, error: bookingErr } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (bookingErr) {
    console.error(`Failed to fetch booking ${id}:`, bookingErr);
    return null;
  }

  const { data: customer, error: customerErr } = await supabase
    .from("customers")
    .select("*")
    .eq("id", booking.customer_id)
    .single();

  if (customerErr) {
    console.error(`Failed to fetch customer ${booking.customer_id}:`, customerErr);
    return null;
  }

  return {
    ...booking,
    customer,
  };
}
// stray block removed

/**
 * Send an email via Resend.
 */
async function sendEmail(to, subject, html) {
  const response = await fetch("https://api.resend.com/emails", {
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
  const {
    data: run,
    error: runErr,
  } = await supabase
    .from("automation_runs")
    .insert({
      automation_name: "booking_reminders",
      status: "running",
    })
    .select()
    .single();

  if (runErr) {
    console.error("AUTOMATION RUN INSERT FAILED:", runErr);
  } else {
    console.log("AUTOMATION RUN CREATED:", run.id);
  }

  let runId = run?.id;
  try {
    // Insert automation run record
    const { data: run } = await supabase
      .from("automation_runs")
      .insert({
        automation_name: "booking_reminders",
        status: "running",
      })
      .select()
      .single();
    runId = run?.id;

    let generatedCount = await generateReminderLogs();
    console.log("Reminder logs generated:", generatedCount);

    const logs = await fetchPendingReminders();
    let sentCount = 0;

    for (const log of logs) {
      try {
        const booking = await fetchBooking(log.entity_id);
        if (!booking) continue;

        const isCustomer = log.email_type.endsWith("_customer");
        const to = isCustomer ? booking.customer.email : "support@thesacredstore.co.in";

        const subject = "Reminder: Your Consultation is Coming Up";
        const html = `
  <div style="background:#F8F5EF;padding:20px;font-family:'Georgia',serif;color:#333;">
    <div style="background:#fff;border-radius:12px;padding:20px;max-width:600px;margin:auto;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color:#D4AF37;font-family:'Georgia',serif;">The Sacred Store</h2>
      <p>Hi ${booking.customer.full_name},</p>
      <p>This is a friendly reminder for your upcoming private consultation scheduled on <strong>${booking.booking_date}</strong> at <strong>${booking.booking_time}</strong>.</p>
      <div style="background:#F8F5EF;border-radius:8px;padding:15px;margin:20px 0;">
        <h3 style="margin:0;color:#333;">Consultation Details</h3>
        <p><strong>Date:</strong> ${booking.booking_date}<br><strong>Time:</strong> ${booking.booking_time}</p>
      </div>
      <a href="https://thesacredstore.co.in" style="display:inline-block;background:#D4AF37;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">View Your Booking</a>
      <p style="margin-top:30px;">— The Sacred Store Team</p>
      <hr style="margin:30px 0;border:none;border-top:1px solid #ccc;">
      <p style="font-size:12px;color:#777;">The Sacred Store<br>Make Space for Meaning</p>
    </div>
  </div>
`;

        await sendEmail(to, subject, html);
        await markLogSent(log.id);
        sentCount++;
        console.log("Sent:", log.email_type, "to", to);
      } catch (e) {
        console.error(`Error processing reminder log ${log.id}:`, e);
      }
    }

    console.log("Emails sent:", sentCount);
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
    console.log('Transactional email processing completed.');

  } catch (err) {
    if (runId) {
      await supabase
        .from("automation_runs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          error_message: err.message,
        })
        .eq("id", runId);
      console.error("AUTOMATION RUN FAILURE:", err);
    }
    console.error('Fatal transactional email process error:', err);
    process.exit(1);
  }
}

runReminders();
