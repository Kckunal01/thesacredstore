import React from 'react';
import Container from '../components/ui/Container';

const TermsConditions = () => {
  return (
    <div className="bg-background min-h-screen pt-32 pb-24 border-b border-border">
      <Container className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display text-primary mb-6">
          <span className="half-gold">Terms & Conditions</span>
        </h1>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent mb-12">Last Updated: June 2026</p>

        <div className="space-y-8 text-muted font-light leading-relaxed">
          <p>By using the The Sacred Store website, purchasing products, or booking consultations, you agree to these Terms & Conditions.</p>

          <h2 className="text-2xl font-display text-primary mt-12 mb-4">Products & Services</h2>
          <p>The Sacred Store offers wellness products, ritual tools, crystals, educational content, and consultation services.</p>
          <p className="mt-4">All products and services are subject to availability.</p>

          <h2 className="text-2xl font-display text-primary mt-12 mb-4">Consultation & Product Disclaimer</h2>
          <p>Our products, consultations, recommendations, and wellness guidance are intended for personal growth, mindfulness, and spiritual exploration.</p>
          <p className="mt-4">They are not medical, psychological, legal, or financial advice and should not be considered a substitute for professional services.</p>
          <p className="mt-4">We do not guarantee specific outcomes from the use of our products or consultations.</p>

          <h2 className="text-2xl font-display text-primary mt-12 mb-4">Pricing</h2>
          <p>Prices may be updated at any time without prior notice.</p>

          <h2 className="text-2xl font-display text-primary mt-12 mb-4">Intellectual Property</h2>
          <p>All content, branding, designs, logos, text, and images on this website are the property of Ritualist and may not be copied or reproduced without permission.</p>

          <h2 className="text-2xl font-display text-primary mt-12 mb-4">Limitation of Liability</h2>
          <p>Ritualist shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website, products, consultations, or services.</p>
        </div>
      </Container>
    </div>
  );
};

export default TermsConditions;
