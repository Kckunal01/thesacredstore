// scripts/processBookingEvents.js
// This script processes pending booking email logs and sends transactional emails via Resend.

import { supabase } from "../src/lib/supabase.js";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "no-reply@ritualist.com"; // adjust as needed

async function fetchPendingLogs() {
  const { data, error } = await supabase
    .from("email_logs")
    .select("id, email_type, entity_id, customer_id")
    .eq("sent_at", null)
    .in("email_type", ["booking_customer", "booking_admin"]);
  if (error) {
    console.error("Failed to fetch email logs:", error);
    return [];
  }
  return data;
}

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

async function markLogSent(logId) {
  const { error } = await supabase
    .from("email_logs")
    .update({ sent_at: new Date().toISOString() })
    .eq("id", logId);
  if (error) {
    console.error(`Failed to update email_log ${logId}:`, error);
  }
}

async function process() {
  const logs = await fetchPendingLogs();
  for (const log of logs) {
    try {
      const booking = await fetchBooking(log.entity_id);
      if (!booking) continue;

      const customerEmail = booking.customer.email;
      let subject = "";
      let html = "";

      if (log.email_type === "booking_customer") {
        subject = "Your Consultation Booking Confirmation";
        html = `<p>Hi ${booking.customer.full_name},</p>` +
          `<p>Thank you for booking a private consultation on ${booking.booking_date} at ${booking.booking_time}.</p>` +
          `<p>We look forward to guiding you.</p>` +
          `<p>– Ritualist Team</p>`;
      } else if (log.email_type === "booking_admin") {
        subject = "New Consultation Booking Received";
        html = `<p>A new booking has been made:</p>` +
          `<ul>` +
          `<li>Customer: ${booking.customer.full_name} (${customerEmail})</li>` +
          `<li>Date: ${booking.booking_date}</li>` +
          `<li>Time: ${booking.booking_time}</li>` +
          `</ul>`;
      }

      await sendEmail(log.email_type === "booking_customer" ? customerEmail : "admin@ritualist.com", subject, html);
      await markLogSent(log.id);
    } catch (e) {
      console.error(`Error processing email_log ${log.id}:`, e);
      // Continue with next log
    }
  }
}

process().then(() => console.log("Booking email processing completed."));
