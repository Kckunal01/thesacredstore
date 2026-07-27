// api/complete-booking.js
// Secure backend endpoint for post‑payment processing of a booking using Supabase Service Role Key.

import { createClient } from '@supabase/supabase-js';
import { sendBookingEmails } from './_emailHelper.js';

// Service role key – must be set in environment variables.
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Supabase URL or Service Role Key not configured');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

/** Helper functions */
async function getCustomerByPhone(phone) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', phone)
    .single();
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching customer by phone:', error);
    return null;
  }
  return data ?? null;
}

async function createCustomer(customer) {
  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single();
  if (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
  return data;
}

async function createBooking(booking) {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();
  if (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
  return data;
}

async function insertPayment(payment) {
  const { error } = await supabase.from('payments').insert(payment);
  return error;
}

async function insertEmailLogs(logs) {
  const { data, error } = await supabase.from('email_logs').insert(logs).select();
  return { data, error };
}

export default async function handler(req, res) {
  console.log("FUNCTION STARTED");
  console.log("SUPABASE_URL:", !!process.env.SUPABASE_URL);
  console.log("SERVICE_ROLE:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  try {
    const { razorpayResponse, formData, consultation_type, consultation_date, consultation_time, consultation_fee, notes } = req.body;

    // ---------- Idempotency check ----------
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('booking_id')
      .eq('razorpay_payment_id', razorpayResponse.razorpay_payment_id)
      .maybeSingle();

    if (existingPayment) {
      return res.status(200).json({ success: true, bookingId: existingPayment.booking_id });
    }

    // ---------- Customer handling ----------
    let customer = await getCustomerByPhone(formData.phone);
    if (!customer) {
      customer = await createCustomer({
        full_name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
      });
    }

    // ---------- Booking creation ----------
    const bookingPayload = {
      customer_id: customer.id,
      service_name: consultation_type,
      booking_date: consultation_date,
      booking_time: consultation_time,
      phone: formData.phone,
      status: 'pending'
    };

    const booking = await createBooking(bookingPayload);

    // ---------- Payment insertion ----------
    const paymentError = await insertPayment({
      booking_id: booking.id,
      customer_id: customer.id,
      gateway: 'razorpay',
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      amount: consultation_fee,
      currency: 'INR',
      status: 'captured',
      method: null,
      signature_verified: true,
      raw_response: razorpayResponse,
    });

    if (paymentError) {
      console.error('Payment insertion failed, rolling back booking', paymentError);
      const { error: rollbackErr } = await supabase.from('bookings').delete().eq('id', booking.id);
      if (rollbackErr) {
        console.error('Rollback of booking also failed', rollbackErr);
      }
      return res.status(500).json({ message: 'Payment processing failed' });
    }

    // ---------- Email logs (non‑critical) ----------
    const emailLogs = [
      { customer_id: customer.id, entity_type: 'booking', entity_id: booking.id, email_type: 'booking_customer' },
      { customer_id: customer.id, entity_type: 'booking', entity_id: booking.id, email_type: 'booking_admin' },
    ];
    const { data: emailLogsData, error: emailError } = await insertEmailLogs(emailLogs);
    if (emailError) {
      console.error('Email log insertion failed', emailError);
    }

    // Try immediate booking confirmation email delivery (isolated to not break booking success)
    if (emailLogsData && emailLogsData.length > 0) {
      try {
        await sendBookingEmails(supabase, booking, customer, emailLogsData);
      } catch (emailSendErr) {
        console.error("Immediate booking email failed:", emailSendErr);
      }
    }

    console.log('BOOKING_SUCCESS', { booking_id: booking.id, razorpay_payment_id: razorpayResponse.razorpay_payment_id });

    return res.status(200).json({ success: true, bookingId: booking.id });
  } catch (error) {
    console.error("FUNCTION ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Unknown error'
    });
  }
}
