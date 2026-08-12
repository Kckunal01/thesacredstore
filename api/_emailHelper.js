const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function sendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'support@thesacredstore.co.in',
      to,
      subject,
      html,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Resend API error (${resp.status}): ${text}`);
  }

  return await resp.json();
}

export async function sendBookingEmails(supabase, booking, customer, emailLogs) {
  for (const log of emailLogs) {
    try {
      let to = '';
      let subject = '';
      let html = '';

      if (log.email_type === 'booking_customer') {
        to = customer.email;
        subject = 'Your Consultation Booking is Confirmed';
        html = `
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #222222; background-color: #ffffff; border: 1px solid #eaeaea;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h2 style="font-family: Georgia, serif; font-size: 26px; font-weight: normal; letter-spacing: 0.1em; color: #B89968; margin: 0 0 10px 0;">THE SACRED STORE</h2>
              <p style="font-size: 12px; text-transform: uppercase; tracking: 0.15em; color: #999999; margin: 0;">Consultation Booking Confirmed</p>
            </div>
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Dear ${customer.full_name},</p>
            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">Your private consultation session is confirmed. We look forward to working with you to align your space and energy.</p>
            
            <div style="background-color: #fafafa; border: 1px solid #eaeaea; padding: 20px; margin-bottom: 30px;">
              <h4 style="margin: 0 0 12px 0; font-family: Georgia, serif; color: #B89968; font-size: 18px; font-weight: normal;">Session details</h4>
              <p style="font-size: 14px; margin: 0 0 8px 0; line-height: 1.5;"><strong>Service:</strong> ${booking.service_name}</p>
              <p style="font-size: 14px; margin: 0 0 8px 0; line-height: 1.5;"><strong>Date:</strong> ${booking.booking_date}</p>
              <p style="font-size: 14px; margin: 0; line-height: 1.5;"><strong>Time:</strong> ${booking.booking_time}</p>
            </div>
            
            <p style="font-size: 13px; line-height: 1.6; color: #666666; margin-bottom: 30px;">We will connect with you via your registered phone number/email closer to the scheduled time.</p>
            
            <p style="font-size: 14px; line-height: 1.6; color: #666666; margin: 40px 0 0 0; text-align: center;">
              Warm regards,<br>
              <strong style="color: #222222;">The Sacred Store Team</strong>
            </p>
          </div>
        `;
      } else if (log.email_type === 'booking_admin') {
        to = 'support@thesacredstore.co.in';
        subject = 'New Consultation Booked';
        html = `
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #222222; background-color: #ffffff; border: 1px solid #eaeaea;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h2 style="font-family: Georgia, serif; font-size: 24px; font-weight: normal; color: #B89968; margin: 0 0 10px 0;">New Consultation Booking</h2>
              <p style="font-size: 12px; text-transform: uppercase; tracking: 0.15em; color: #999999; margin: 0;">Admin Portal Alert</p>
            </div>
            
            <div style="background-color: #fafafa; border: 1px solid #eaeaea; padding: 20px; margin-bottom: 30px;">
              <h4 style="margin: 0 0 10px 0; font-family: Georgia, serif; color: #222222; font-size: 16px;">Booking Information</h4>
              <p style="font-size: 14px; margin: 0 0 8px 0;"><strong>Service:</strong> ${booking.service_name}</p>
              <p style="font-size: 14px; margin: 0 0 8px 0;"><strong>Date:</strong> ${booking.booking_date}</p>
              <p style="font-size: 14px; margin: 0;"><strong>Time:</strong> ${booking.booking_time}</p>
            </div>

            <div style="background-color: #ffffff; border: 1px solid #eaeaea; padding: 20px;">
              <h4 style="margin: 0 0 10px 0; font-family: Georgia, serif; color: #222222; font-size: 16px;">Customer Details</h4>
              <p style="font-size: 14px; margin: 0 0 5px 0;"><strong>Name:</strong> ${customer.full_name}</p>
              <p style="font-size: 14px; margin: 0 0 5px 0;"><strong>Email:</strong> ${customer.email}</p>
              <p style="font-size: 14px; margin: 0;"><strong>Phone:</strong> ${customer.phone}</p>
            </div>
          </div>
        `;
      }

      if (to && subject && html) {
        await sendEmail({ to, subject, html });
        // Update database log as sent
        await supabase
          .from('email_logs')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', log.id);
      }
    } catch (err) {
      console.error(`Immediate booking email sending failed for log ${log.id || 'unknown'}:`, err);
    }
  }
}

export async function sendOrderEmails(supabase, order, customer, emailLogs) {
  const itemsHtml = (order.products || []).map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #222222;">
        <span style="font-weight: 500;">${item.name}</span>
        <span style="color: #B89968; margin-left: 8px; font-weight: 600;">x${item.quantity}</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; text-align: right; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #222222; font-weight: 500;">
        ₹${(item.price * item.quantity).toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');

  for (const log of emailLogs) {
    try {
      let to = '';
      let subject = '';
      let html = '';

      if (log.email_type === 'order_customer') {
        to = customer.email;
        subject = `Your order has been placed! ${order.order_id}`;
        html = `
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #222222; background-color: #ffffff; border: 1px solid #eaeaea;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h2 style="font-family: Georgia, serif; font-size: 26px; font-weight: normal; letter-spacing: 0.1em; color: #B89968; margin: 0 0 10px 0;">THE SACRED STORE</h2>
              <p style="font-size: 12px; text-transform: uppercase; tracking: 0.15em; color: #999999; margin: 0;">Order Confirmation</p>
            </div>
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Dear ${customer.full_name},</p>
            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">Thank you for making space for meaning. Your order <strong style="color: #B89968;">${order.order_id}</strong> has been successfully placed and is now being prepared.</p>
            
            <h3 style="font-family: Georgia, serif; font-size: 18px; font-weight: normal; border-bottom: 1px solid #B89968; padding-bottom: 8px; margin: 0 0 15px 0; color: #222222;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <thead>
                <tr>
                  <th style="text-align: left; padding-bottom: 8px; border-bottom: 2px solid #222222; font-size: 12px; text-transform: uppercase; color: #999999;">Item</th>
                  <th style="text-align: right; padding-bottom: 8px; border-bottom: 2px solid #222222; font-size: 12px; text-transform: uppercase; color: #999999;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                ${order.payment_method === 'cod' ? `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #666666;">
                    <span>Cash on Delivery Fee</span>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; text-align: right; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #222222; font-weight: 500;">
                    ₹100
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 16px 0 0 0; font-family: Georgia, serif; font-size: 16px; color: #222222;">Total Amount</td>
                  <td style="padding: 16px 0 0 0; text-align: right; font-family: Georgia, serif; font-size: 18px; font-weight: bold; color: #B89968;">₹${Number(order.amount).toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
            
            <div style="background-color: #fafafa; border: 1px solid #eaeaea; padding: 20px; margin-bottom: 30px;">
                <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #B89968; font-weight: bold; display: block; margin-bottom: 8px;">Logistics Note</span>
                <p style="font-size: 12px; line-height: 1.6; color: #666666; margin: 0;">Your energy tool is being packaged carefully and cleansed with incense before shipping. You can track its shipment status directly on our website.</p>
                ${order.tracking_id ? `<a href="https://thesacredstore.co.in/track-order?tracking=${order.tracking_id}" style="background-color:#D4AF37;color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;display:inline-block;font-weight:600;font-size:16px;margin-top:20px;margin-bottom:20px;">Track Your Order</a>` : `<p style="font-size:12px;color:#666666;margin-top:20px;">We will share your tracking details as soon as your order ships.</p>`}
            </div>
            
            <p style="font-size: 14px; line-height: 1.6; color: #666666; margin: 40px 0 0 0; text-align: center;">
              Warm regards,<br>
              <strong style="color: #222222;">The Sacred Store Team</strong>
            </p>
          </div>
        `;
      } else if (log.email_type === 'order_admin') {
        to = 'support@thesacredstore.co.in';
        subject = `New Order Received: ${order.order_id}`;
        html = `
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #222222; background-color: #ffffff; border: 1px solid #eaeaea;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h2 style="font-family: Georgia, serif; font-size: 24px; font-weight: normal; color: #B89968; margin: 0 0 10px 0;">New Order Notification</h2>
              <p style="font-size: 12px; text-transform: uppercase; tracking: 0.15em; color: #999999; margin: 0;">Admin Portal Alert</p>
            </div>
            
            <div style="background-color: #fafafa; border: 1px solid #eaeaea; padding: 20px; margin-bottom: 30px;">
              <h4 style="margin: 0 0 10px 0; font-family: Georgia, serif; color: #222222; font-size: 16px;">Customer Information</h4>
              <p style="font-size: 14px; margin: 0 0 5px 0;"><strong>Name:</strong> ${customer.full_name}</p>
              <p style="font-size: 14px; margin: 0 0 5px 0;"><strong>Email:</strong> ${customer.email}</p>
              <p style="font-size: 14px; margin: 0;"><strong>Phone:</strong> ${customer.phone}</p>
            </div>

            <h3 style="font-family: Georgia, serif; font-size: 18px; font-weight: normal; border-bottom: 1px solid #B89968; padding-bottom: 8px; margin: 0 0 15px 0; color: #222222;">Order Details (${order.order_id})</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <thead>
                <tr>
                  <th style="text-align: left; padding-bottom: 8px; border-bottom: 2px solid #222222; font-size: 12px; text-transform: uppercase; color: #999999;">Item</th>
                  <th style="text-align: right; padding-bottom: 8px; border-bottom: 2px solid #222222; font-size: 12px; text-transform: uppercase; color: #999999;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr>
                  <td style="padding: 16px 0 0 0; font-family: Georgia, serif; font-size: 16px; color: #222222;">Total Collected</td>
                  <td style="padding: 16px 0 0 0; text-align: right; font-family: Georgia, serif; font-size: 18px; font-weight: bold; color: #B89968;">₹${Number(order.amount).toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
      }

      if (to && subject && html) {
        await sendEmail({ to, subject, html });
        // Update database log as sent
        await supabase
          .from('email_logs')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', log.id);
      }
    } catch (err) {
      console.error(`Immediate order email sending failed for log ${log.id || 'unknown'}:`, err);
    }
  }
}
