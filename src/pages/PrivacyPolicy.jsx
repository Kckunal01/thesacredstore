import React from 'react';
import Container from '../components/ui/Container';

const PrivacyPolicy = () => {
  return (
    <div className="bg-background min-h-screen pt-32 pb-24 border-b border-border">
      <Container className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display text-primary mb-6">
          <span className="half-gold">Privacy Policy</span>
        </h1>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#000000] mb-12">Last Updated: June 2026</p>

        <div className="space-y-8 text-muted font-light leading-relaxed">
          <p>At The Sacred Store, we respect your privacy and are committed to protecting your personal information.</p>

          <h2 className="text-2xl font-display text-primary mt-12 mb-4">Information We Collect</h2>
          <p>We may collect:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Name</li>
            <li>Email Address</li>
            <li>Phone Number</li>
            <li>Billing and Shipping Address</li>
            <li>Order Details</li>
            <li>Consultation Booking Information</li>
          </ul>
          <p className="mt-4">We may also automatically collect basic technical information such as browser type, device information, IP address, and website usage data.</p>

          <h2 className="text-2xl font-display text-primary mt-12 mb-4">How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Process orders</li>
            <li>Deliver products and services</li>
            <li>Manage consultation bookings</li>
            <li>Provide customer support</li>
            <li>Improve our website and customer experience</li>
            <li>Send important updates regarding your orders or bookings</li>
          </ul>

          <h2 className="text-2xl font-display text-primary mt-12 mb-4">Payments</h2>
          <p>All payments are processed through secure third-party payment providers. We do not store your complete card or banking details.</p>

          <h2 className="text-2xl font-display text-primary mt-12 mb-4">Sharing of Information</h2>
          <p>We do not sell or rent your personal information.</p>
          <p className="mt-4">Information may be shared with:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Payment providers</li>
            <li>Shipping partners</li>
            <li>Service providers required to operate our business</li>
            <li>Authorities when required by law</li>
          </ul>

          <h2 className="text-2xl font-display text-primary mt-12 mb-4">Data Security</h2>
          <p>We take reasonable steps to protect your information. However, no online platform can guarantee absolute security.</p>

          <h2 className="text-2xl font-display text-primary mt-12 mb-4">Changes to This Policy</h2>
          <p>We may update this policy from time to time. Changes will be posted on this page.</p>
        </div>
      </Container>
    </div>
  );
};

export default PrivacyPolicy;
