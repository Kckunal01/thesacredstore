import React, { useState, useEffect } from 'react';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import {
  createCustomer,
  createBooking,
  getCustomerByPhone,
  supabase
} from '../lib/supabase';


// Temporary flag to disable real Razorpay integration
const TEST_MODE = true; // Set to false to enable actual payment flow

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const BookCall = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [focusArea, setFocusArea] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const sessionPrice = 699;
  const navigate = useNavigate();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const allTimeSlots = [
    '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  const [availableSlots, setAvailableSlots] = useState(allTimeSlots);

  useEffect(() => {
    if (selectedDate) {
      const booked = JSON.parse(localStorage.getItem('bookedSlots') || '{}');
      const bookedForDate = booked[selectedDate] || [];
      setAvailableSlots(allTimeSlots.filter(slot => !bookedForDate.includes(slot)));
    } else {
      setAvailableSlots(allTimeSlots);
    }
  }, [selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isProcessing) return; // Prevent duplicate submissions
    setIsProcessing(true);
    // Verify timeslot availability
    const bookedSlotsCheck = JSON.parse(localStorage.getItem('bookedSlots') || '{}');
    if (selectedDate && bookedSlotsCheck[selectedDate] && bookedSlotsCheck[selectedDate].includes(selectedTime)) {
      // Timeslot already booked – show message instead of alert
      setErrorMessage('Selected time slot is already booked. Please choose another.');
      setIsProcessing(false);
      return;
    }
    if (TEST_MODE) {
      try {
        let customer = await getCustomerByPhone(phone);

        if (!customer) {
          customer = await createCustomer({
            full_name: name,
            email,
            phone
          });
        }

        console.log('Using customer:', customer);

        const bookingData = {
          customer_id: customer.id,
          service_name: 'Private Consultation',
          booking_date: selectedDate,
          booking_time: selectedTime,
          phone: phone,
          status: 'pending'
        };

        console.log(
          'Booking payload:',
          bookingData
        );

        const booking =
          await createBooking(
            bookingData
          );

        console.log(
          'Booking response:',
          booking
        );

        // Insert email log entries (booking_customer, booking_admin)
        const { data: emailLogData, error: emailLogError } = await supabase
  .from('email_logs')
  .insert([
    {
      customer_id: customer.id,
      entity_type: 'booking',
      entity_id: booking.id,
      email_type: 'booking_customer',
    },
    {
      customer_id: customer.id,
      entity_type: 'booking',
      entity_id: booking.id,
      email_type: 'booking_admin',
    },
  ])
  .select();

console.log('BOOKING EMAIL LOG DATA:', emailLogData);

if (emailLogError) {
  console.error('BOOKING EMAIL LOG INSERT FAILED:', emailLogError);
} else {
  console.log('BOOKING EMAIL LOGS INSERTED');
}

        // Store booked slot to prevent future selection
        const booked = JSON.parse(localStorage.getItem('bookedSlots') || '{}');
        if (!booked[selectedDate]) booked[selectedDate] = [];
        booked[selectedDate].push(selectedTime);
        localStorage.setItem('bookedSlots', JSON.stringify(booked));

        // Show success message
        setIsSubmitted(true);

      } catch (err) {
        console.error(
          'Error in test mode flow:',
          err
        );

        alert(
          'An error occurred while creating consultation.'
        );
      }

      setIsProcessing(false);
      return;
    }

    const res = await loadRazorpayScript();

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setIsProcessing(false);
      return;
    }

    try {
      // Attempt to call the Serverless function
      let orderId = `order_mock_${Math.floor(Math.random() * 1000000)}`;
      try {
        const result = await fetch('/api/razorpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: sessionPrice })
        });
        if (result.ok) {
          const data = await result.json();
          if (data.id) orderId = data.id;
        }
      } catch (err) {
        console.log("Using mock order ID due to local environment.");
      }

      const options = {
        key: "rzp_test_mock_key", // Enter the Key ID generated from the Dashboard
        amount: sessionPrice * 100,
        currency: "INR",
        name: "RITUALIST",
        description: "Private Consultation Session",
        image: "https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?q=80&w=200&auto=format&fit=crop",
        order_id: orderId,
        handler: function (response) {
          // Payment successful
          const booked = JSON.parse(localStorage.getItem('bookedSlots') || '{}');
          if (!booked[selectedDate]) booked[selectedDate] = [];
          booked[selectedDate].push(selectedTime);
          localStorage.setItem('bookedSlots', JSON.stringify(booked));

          setIsSubmitted(true);
          setIsProcessing(false);
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#111111"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        alert("Payment failed. Please try again.");
        setIsProcessing(false);
      });
      paymentObject.open();

    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-background min-h-screen pt-20">
      <Section className="border-b border-border">
        <Container>
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">

            {/* Left: Info & Metrics */}
            <div className="w-full lg:w-5/12 flex flex-col justify-center">
              <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold block mb-6">Private Consultation</span>
              <h1 className="text-4xl md:text-6xl font-display font-medium text-primary mb-8 leading-tight">
                Align Your Space & Energy.
              </h1>
              <p className="text-muted font-light leading-relaxed mb-12">
                A 30-minute private session to analyze your current energetic needs and curate a tailored selection of minerals and practices. No pseudo-spirituality, just clear guidance.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-border">
                <div className="bg-surface border border-border p-6 flex flex-col items-center text-center group hover:-translate-y-1 hover:border-accent transition-all duration-300">
                  <h4 className="text-4xl font-display text-primary mb-2">10+</h4>
                  <p className="text-[9px] uppercase tracking-widest font-bold text-accent">Years Exp.</p>
                </div>
                <div className="bg-surface border border-border p-6 flex flex-col items-center text-center group hover:-translate-y-1 hover:border-accent transition-all duration-300">
                  <h4 className="text-4xl font-display text-primary mb-2">500+</h4>
                  <p className="text-[9px] uppercase tracking-widest font-bold text-accent">Consultations</p>
                </div>
                <div className="bg-surface border border-border p-6 flex flex-col items-center text-center group hover:-translate-y-1 hover:border-accent transition-all duration-300">
                  <h4 className="text-4xl font-display text-primary mb-2">4.8★</h4>
                  <p className="text-[9px] uppercase tracking-widest font-bold text-accent">Rating</p>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="w-full lg:w-7/12">
              <div className="bg-surface border border-border p-8 md:p-12 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#F8F5EF] to-[#EAE5D9] transition-transform duration-1000 group-hover:scale-105 pointer-events-none" />

                <div className="relative z-10">
                  {isSubmitted ? (
                    <div className="text-center py-20">
                      <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-3xl font-display text-primary mb-4">Request Received</h3>
                      <p className="text-muted mb-8">Your payment was successful. We will contact you shortly to confirm your consultation time.</p>
                      <Button onClick={() => { navigate('/shop-jewellery'); window.location.reload(); }} variant="ghost">Explore more</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                    {errorMessage && (<p className="text-red-600 text-sm mb-4">{errorMessage}</p>)}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary block">First Name</label>
                          <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-background border border-border p-4 text-sm focus:outline-none focus:border-accent transition-colors text-primary placeholder-muted"
                            placeholder="Enter your name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary block">Email Address</label>
                          <input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-background border border-border p-4 text-sm focus:outline-none focus:border-accent transition-colors text-primary placeholder-muted"
                            placeholder="you@example.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary block">Phone Number</label>
                        <input
                          required
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-background border border-border p-4 text-sm focus:outline-none focus:border-accent transition-colors text-primary placeholder-muted"
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary block">Preferred Date</label>
                          <input required type="date" min={minDate} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-background border border-border p-4 text-sm focus:outline-none focus:border-accent transition-colors text-primary" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary block">Preferred Time</label>
                          <select required value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} disabled={!selectedDate} className="w-full bg-background border border-border p-4 text-sm focus:outline-none focus:border-accent transition-colors text-primary appearance-none">
                            <option value="">Select a time</option>
                            {availableSlots.map(slot => (
                              <option key={slot} value={slot}>{slot}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary block">What are you looking to focus on?</label>
                        <textarea required rows="4" className="w-full bg-background border border-border p-4 text-sm focus:outline-none focus:border-accent transition-colors text-primary placeholder-muted resize-none" placeholder="E.g., grounding, focus, sleep quality..." value={focusArea} onChange={(e) => setFocusArea(e.target.value)} />
                      </div>

                      <div className="pt-4 flex items-center justify-between">
                        <Button type="submit" variant="primary" className="w-full" disabled={isProcessing}>
                          {isProcessing ? 'Processing...' : `Request Session — ₹${sessionPrice}`}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>

          </div>
        </Container>
      </Section>
    </div>
  );
};

export default BookCall;
