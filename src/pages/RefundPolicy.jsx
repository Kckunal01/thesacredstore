import React from 'react';
import Container from '../components/ui/Container';

const RefundPolicy = () => {
  return (
    <div className="bg-background min-h-screen pt-32 pb-24 border-b border-border">
      <Container className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display text-primary mb-6">
          <span className="half-gold">Refund & Cancellation Policy</span>
        </h1>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent mb-12">Last Updated: June 2026</p>

        <div className="space-y-8 text-muted font-light leading-relaxed">
          <h2 className="text-2xl font-display text-primary mt-12 mb-4">Physical Products</h2>
          <p>Replacement requests are accepted only if:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>The product arrives damaged</li>
            <li>The wrong item is delivered</li>
            <li>The product is defective upon arrival</li>
          </ul>
          <p className="mt-4 text-primary font-medium">Requests must be submitted within <strong>7 days of delivery</strong> along with clear photographs.</p>

          <h2 className="text-2xl font-display text-primary mt-12 mb-4">Non-Returnable Items</h2>
          <p>We do not accept returns or refunds for:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Used products</li>
            <li>Opened products</li>
            <li>Customized products</li>
            <li>Digital products</li>
          </ul>

          <h2 className="text-2xl font-display text-primary mt-12 mb-4">Consultation Bookings</h2>
          <p>Consultations may be cancelled up to <strong>24 hours before the scheduled session</strong>.</p>
          <p className="mt-4">Refunds will not be issued for:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Missed appointments</li>
            <li>No-shows</li>
            <li>Late cancellations</li>
          </ul>

          <h2 className="text-2xl font-display text-primary mt-12 mb-4">Refund Processing</h2>
          <p>Approved refunds will be processed through the original payment method within <strong>7–10 business days</strong>.</p>
        </div>
      </Container>
    </div>
  );
};

export default RefundPolicy;
