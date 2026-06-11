import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import ProductCard from '../components/ui/ProductCard';
import { products } from '../data/products';

const Home = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  // Curated featured: 2 crystals, 1 gemstone, 1 bracelet
  const featuredIds = ['c3', 'c4', 'g6', 'b7'];
  const bestSellers = featuredIds.map(id => products.find(p => p.id === id)).filter(Boolean);

  const heroImages = [
    'https://images.unsplash.com/photo-1596700777174-da97ec0b2b8c?q=80&w=2000&auto=format&fit=crop', // Abstract neutral/mineral feel
    'https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520690214124-2405c5217036?q=80&w=2000&auto=format&fit=crop'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const testimonials = [
    { quote: "They didn't just tell me my root chakra was blocked. They explained why I felt so ungrounded at work, and the black tourmaline actually shifted things.", author: "Priya K." },
    { quote: "Zero pseudo-spirituality. Just a calm, clear reading of where my energy was stuck. The simplest 30 minutes that brought so much clarity.", author: "Rahul S." },
    { quote: "I was skeptical, but the practitioner picked up on my solar plexus exhaustion immediately. I ordered the citrine and followed their simple practice.", author: "Ananya T." },
    { quote: "The packaging, the quality of the stones, the philosophy. Everything about Ritualist screams intentionality.", author: "Kunal M." },
    { quote: "My space feels completely different after placing the amethyst clusters as recommended. A brilliant service.", author: "Neha V." }
  ];

  const nextTestimonial = () => setCurrentTestimonial((prev) => (prev + 1) % (testimonials.length - 2));
  const prevTestimonial = () => setCurrentTestimonial((prev) => (prev - 1 + (testimonials.length - 2)) % (testimonials.length - 2));

  return (
    <div className="w-full bg-background overflow-hidden">
      
      {/* 1. Hero Sections */}
      {/* Top Hero: Rolling Images Carousel */}


      {/* Shorter Hero: Text/CTA Left, Image Right */}
      <section className="flex flex-col md:flex-row border-b border-border bg-background min-h-[80vh]">
        <div className="w-full md:w-7/12 p-8 md:p-16 lg:p-24 flex flex-col justify-center">
          <h2 className="text-5xl md:text-7xl lg:text-8xl leading-[1.1] font-display font-medium text-primary mb-6">
            <span className="text-primary block">Make Space</span> <span className="half-gold">for Meaning.</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted font-light mb-10 leading-relaxed max-w-xl">
            Reiki‑healing crystals, gems, and simple life‑changing rituals.
          </p>
          <div className="flex gap-4">
            <Button to="/shop-crystals" variant="primary">Shop Collection</Button>
            <Button to="/book-a-call" variant="ghost">Book Consultation</Button>
          </div>
        </div>
        <div className="w-full md:w-5/12 h-[50vh] md:h-auto bg-surface border-l border-border relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#F8F5EF] to-[#EAE5D9] transition-transform duration-1000 group-hover:scale-105" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-32 h-32 rounded-full border border-accent/40 flex items-center justify-center">
                <span className="font-display text-accent tracking-widest uppercase text-[10px]">Explore</span>
             </div>
          </div>
        </div>
      </section>

      {/* 2. Rolling Text Marquee - Seamless infinite loop */}
      <div className="bg-accent py-4 overflow-hidden flex whitespace-nowrap">
        <div className="animate-marquee inline-flex flex-shrink-0" aria-hidden="true">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="text-sm font-semibold tracking-widest text-background mx-8 uppercase flex-shrink-0">
              PAN-INDIA DELIVERY <span className="text-primary mx-4">·</span> 7 DAY RETURN <span className="text-primary mx-4">·</span> ASSURED GUARANTEE <span className="text-primary mx-4">·</span>
            </span>
          ))}
        </div>
        <div className="animate-marquee inline-flex flex-shrink-0" aria-hidden="true">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="text-sm font-semibold tracking-widest text-background mx-8 uppercase flex-shrink-0">
              PAN-INDIA DELIVERY <span className="text-primary mx-4">·</span> 7 DAY RETURN <span className="text-primary mx-4">·</span> ASSURED GUARANTEE <span className="text-primary mx-4">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* 3. Best Sellers: Featured Collection */}
      <Section className="border-b border-border">
        <Container>
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-display font-medium text-primary">
              <span className="text-primary">Featured</span> <span className="half-gold">Collection</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 mb-12">
            {bestSellers.map(product => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Button to="/shop-crystals" variant="gold" className="text-[10px] px-6 py-3">View Complete Collection</Button>
          </div>
        </Container>
      </Section>

      {/* 4. Social Reels: Watch Us More */}
      <section className="bg-surface border-b border-border overflow-hidden py-12 md:py-16">
        <Container>
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-display font-medium text-primary">
              <span className="text-primary">Watch Us</span> <span className="half-gold">More</span>
            </h3>
            <p className="text-muted mt-2 text-sm font-light">Integrating ethically sourced tools into daily routines.</p>
          </div>
          <div className="flex overflow-x-auto pb-6 gap-6 snap-x justify-start md:justify-center">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex-none w-64 aspect-[9/16] bg-background border border-border relative group flex items-center justify-center cursor-pointer overflow-hidden snap-center">
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-10 h-10 rounded-full border border-accent bg-background/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-accent text-sm">▶</span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 5. Consultation Section */}
      <section className="flex flex-col md:flex-row border-b border-border bg-background">
        <div className="w-full md:w-1/2 p-8 md:p-16 lg:p-24 flex flex-col justify-center">
          <h3 className="text-4xl md:text-5xl font-display font-medium text-primary mb-6">
             <span className="text-primary">Book your</span> <span className="half-gold">call</span>
          </h3>
          <p className="text-base text-muted font-light mb-8 leading-relaxed max-w-md">
            Unsure which mineral aligns with your current focus? Book a private 1-on-1 reading to map your space and energy accurately.
          </p>
          <div>
            <Button to="/book-a-call" variant="primary" className="text-[10px] px-6 py-3">Book Your Session — ₹699</Button>
          </div>
        </div>
        <div className="w-full md:w-1/2 h-[40vh] md:h-auto bg-surface border-l border-border relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-bl from-[#F8F5EF] to-[#EAE5D9] transition-transform duration-1000 group-hover:scale-105" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-24 h-24 text-accent/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2v20 M2 12h20"/>
            </svg>
          </div>
        </div>
      </section>

      {/* 6. Testimonials (Reduced height, 3 visible, slider out of 5) */}
      <Section className="bg-surface border-b border-border py-16">
        <Container>
          <div className="text-center mb-10">
            <h3 className="text-3xl md:text-4xl font-display font-medium text-primary">
              <span className="text-primary">Loved By the</span> <span className="half-gold">Community</span>
            </h3>
          </div>
          
          <div className="relative flex items-center max-w-7xl mx-auto">
            <button onClick={prevTestimonial} className="absolute left-0 z-10 p-2 text-muted hover:text-accent bg-background rounded-full border border-border -ml-4 shadow-sm">&larr;</button>
            
            <div className="w-full overflow-hidden">
              <motion.div 
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentTestimonial * (100 / 3)}%)` }}
              >
                {testimonials.map((test, idx) => (
                  <div key={idx} className="w-full md:w-1/3 flex-shrink-0 px-4">
                    <div className="bg-background border border-border p-6 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex text-accent mb-4 text-xs">
                          ★★★★★
                        </div>
                        <p className="text-sm font-light font-body leading-relaxed mb-6 text-primary">
                          "{test.quote}"
                        </p>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.1em] text-muted font-bold block">
                        — {test.author}
                      </span>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
            
            <button onClick={nextTestimonial} className="absolute right-0 z-10 p-2 text-muted hover:text-accent bg-background rounded-full border border-border -mr-4 shadow-sm">&rarr;</button>
          </div>
        </Container>
      </Section>

      {/* 7. Blog Section: Learn More */}
      <Section className="border-b border-border py-16 bg-background">
        <Container>
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-display font-medium text-primary">
              <span className="text-primary">Learn</span> <span className="half-gold">More</span>
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-10">
            {/* Sample Blog 1 */}
            <Link to="/blogs?id=1" className="group cursor-pointer block border border-border bg-surface p-6 hover:-translate-y-1 transition-all duration-300">
              <span className="text-[9px] uppercase tracking-[0.2em] text-accent font-bold">Deep Dive</span>
              <h4 className="text-xl font-display text-primary mt-2 mb-3 group-hover:text-accent transition-colors">Which Crystal for Anxiety — The Honest Guide</h4>
              <p className="text-xs text-muted font-light leading-relaxed">We break down the minerals that actually ground your nervous system, free of pseudo-science.</p>
            </Link>
            {/* Sample Blog 2 */}
            <Link to="/blogs?id=3" className="group cursor-pointer block border border-border bg-surface p-6 hover:-translate-y-1 transition-all duration-300">
              <span className="text-[9px] uppercase tracking-[0.2em] text-accent font-bold">Practices</span>
              <h4 className="text-xl font-display text-primary mt-2 mb-3 group-hover:text-accent transition-colors">The 7-Day Root Reset: Grounding Guide</h4>
              <p className="text-xs text-muted font-light leading-relaxed">A simple, actionable guide to building stability from the ground up using Red Jasper.</p>
            </Link>
            {/* Sample Blog 3 */}
            <Link to="/blogs?id=4" className="group cursor-pointer block border border-border bg-surface p-6 hover:-translate-y-1 transition-all duration-300">
              <span className="text-[9px] uppercase tracking-[0.2em] text-accent font-bold">Lifestyle</span>
              <h4 className="text-xl font-display text-primary mt-2 mb-3 group-hover:text-accent transition-colors">Creating Your Sacred Space</h4>
              <p className="text-xs text-muted font-light leading-relaxed">How to arrange your crystals for maximum energetic flow and aesthetic balance in any room.</p>
            </Link>
          </div>
          
          <div className="flex justify-center">
            <Button to="/blogs" variant="gold" className="text-[10px] px-6 py-3">Discover more</Button>
          </div>
        </Container>
      </Section>

    </div>
  );
};

export default Home;
