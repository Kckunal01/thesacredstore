import React, { useState } from 'react';

const faqs = [
  { q: "Are your crystals real?", a: "Yes. Every crystal at The Sacred Store is naturally sourced and carefully selected. No two pieces are exactly the same—that's what makes them special." },
  { q: "I'm completely new to crystals. Where do I start?", a: "We built this for beginners. Each product explains its associations, suitability, and simple usage—no prior knowledge needed." },
  { q: "How do I choose the right crystal?", a: "There's no wrong choice. Some pick by intention—confidence, focus, love—others follow what resonates with them." },
  { q: "Will crystals magically change my life?", a: "No. Crystals are tools for intention and mindfulness; your mindset and actions matter more." },
  { q: "Why does my crystal look different from the photos?", a: "Each crystal is unique—color, patterns, and inclusions vary slightly, making it one‑of‑a‑kind." },
  { q: "Do I need to cleanse my crystal?", a: "Cleansing is a personal spiritual practice, not a requirement, though many enjoy it before use." },
  { q: "Can I cleanse my crystals with a Selenite plate?", a: "Yes. A Selenite charging plate is a simple, popular way to cleanse and recharge most crystals." },
  { q: "Can I cleanse my crystals using salt?", a: "Salt can damage some crystals; unless care instructions say it's safe, we don't recommend it." },
  { q: "Do I need to charge my crystal?", a: "Charging is optional—some enjoy it as a practice, others simply use the crystal as‑is." },
  { q: "Can I wear my crystal every day?", a: "Absolutely—just avoid harsh chemicals, prolonged water, or rough handling." },
  { q: "Is this a good gift?", a: "Definitely—our premium signature packaging is ready to gift without extra wrapping." },
  { q: "What if my order arrives damaged?", a: "Contact us within 48 hours with photos; we'll arrange a replacement or suitable resolution." },
  { q: "Can I return my order?", a: "We don't accept returns for change of mind, but will make it right for wrong or damaged items." },
  { q: "Do you offer Cash on Delivery?", a: "Yes, COD is available for most serviceable PIN codes and appears at checkout when eligible." },
  { q: "Why should I trust The Sacred Store?", a: "We earn trust through natural crystals, honest info, secure payments, premium packaging, and responsive support." },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="w-full pt-16 pb-0 px-4" style={{ background: 'transparent' }}>
      <div className="max-w-2xl mx-auto text-center pb-8">
        {/* Heading */}
        <span
          className="inline-block text-[10px] font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: '#c9a84c' }}
        >
          Got Questions?
        </span>
        <h2
          className="text-2xl md:text-3xl font-display mb-3 font-medium"
          style={{ color: '#1a1a1a' }}
        >
          Frequently Asked Questions
        </h2>
        <div className="w-12 h-[1px] mx-auto mb-8" style={{ background: 'linear-gradient(90deg, #c9a84c, #e8d48b, #c9a84c)' }} />

        {/* FAQ Items */}
        <div className="space-y-2 text-left">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                onClick={() => toggle(i)}
                className="cursor-pointer border transition-all duration-300 rounded-lg"
                style={{
                  borderColor: isOpen ? '#c9a84c' : '#e8e0d0',
                  background: isOpen ? '#fffef9' : '#ffffff',
                  boxShadow: isOpen ? '0 4px 12px rgba(201,168,76,0.06)' : 'none',
                }}
              >
                <div className="flex items-center justify-between px-5 py-4">
                  <span
                    className="font-normal text-sm pr-4 font-body"
                    style={{ color: isOpen ? '#c9a84c' : '#222222' }}
                  >
                    {faq.q}
                  </span>
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300"
                    style={{
                      background: isOpen ? '#c9a84c' : '#f5f0e4',
                      color: isOpen ? '#fff' : '#c9a84c',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}
                  >
                    +
                  </span>
                </div>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: isOpen ? '150px' : '0',
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <p className="px-5 pb-4 text-xs leading-relaxed font-body" style={{ color: '#666666' }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
