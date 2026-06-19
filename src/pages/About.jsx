import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';

const About = () => {
  return (
    <div className="bg-background min-h-screen pt-20">
      <Section>
        <Container>


          {/* Image & Text Split */}
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center mb-32">
            <div className="w-full lg:w-1/2 overflow-hidden rounded-lg border border-border flex items-center justify-center">
              <img src="/assets/images/AboutUs.webp" alt="About Us" className="w-full h-24 md:h-32 lg:h-full object-cover" />
            </div>
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <span className="font-display text-2xl tracking-[0.15em] uppercase font-medium text-[#ffbd59] mb-4 block">THE FOUNDER</span>
            <h3 className="text-4xl md:text-5xl font-display text-primary mb-6">
                <span className="text-primary">Guided by Energy</span>
            </h3>
              <p className="text-muted font-light leading-relaxed mb-6">
                The Sacred Store was born from a deep connection to the Earth's energy, founded by a master Reiki healer dedicated to bringing authentic, potent healing into your everyday life.
              </p>
              <p className="text-muted font-light leading-relaxed mb-8">
                As a certified Reiki master, our founder believes that true healing begins when we align our external environment with our internal intentions. Every crystal is chosen not just for its beauty, but for its energetic signature.
              </p>
              <p className="text-muted font-light leading-relaxed mb-10">
                We bridge the gap between ancient wisdom and modern living, ensuring that every tool you bring into your space is ethically sourced, spiritually cleansed, and ready to elevate your journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button to="/shop-crystals" variant="primary">Explore Collection</Button>
                <Button to="/book-a-call" variant="secondary">Book Consultation</Button>
              </div>
            </div>
          </div>

          {/* Metrics Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-surface border border-border p-10 flex flex-col items-center text-center group hover:-translate-y-1 hover:border-accent transition-all duration-300">
              <h4 className="text-5xl font-display text-primary mb-4">100%</h4>
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#000000] mb-2">Ethically Sourced</p>
              <p className="text-xs text-muted">&copy; {new Date().getFullYear()} THE SACRED STORE. All rights reserved.</p>
            </div>
            <div className="bg-surface border border-border p-10 flex flex-col items-center text-center group hover:-translate-y-1 hover:border-accent transition-all duration-300">
              <h4 className="text-5xl font-display text-primary mb-4">10k+</h4>
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#000000] mb-2">Spaces Elevated</p>
              <p className="text-muted text-sm font-light">Homes and offices worldwide.</p>
            </div>
            <div className="bg-surface border border-border p-10 flex flex-col items-center text-center group hover:-translate-y-1 hover:border-accent transition-all duration-300">
              <h4 className="text-5xl font-display text-primary mb-4">500+</h4>
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#000000] mb-2">Consultations</p>
              <p className="text-muted text-sm font-light">1-on-1 personalized guidance.</p>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default About;
