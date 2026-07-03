import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email, status: 'active' }]);

      if (error) {
        if (error.code === '23505') { // Unique key constraint in Postgres
          setStatus({ type: 'error', message: "You're already subscribed." });
        } else {
          setStatus({ type: 'error', message: error.message });
        }
      } else {
        setStatus({ type: 'success', message: '✓ Successfully subscribed' });
        setEmail('');
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubscribe} className="space-y-3 font-body">
      <div className="flex flex-col space-y-2">
        <input
          type="email"
          required
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-background border border-border px-3 py-2 text-xs focus:outline-none focus:border-accent text-primary placeholder-muted/60"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#000000] hover:bg-[#FFBD59] text-white hover:text-black py-2.5 text-[9px] uppercase tracking-[0.2em] font-bold transition-all"
        >
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </div>
      {status.message && (
        <p className={`text-[10px] font-semibold tracking-wider uppercase ${status.type === 'success' ? 'text-green-600' : 'text-amber-600'}`}>
          {status.message}
        </p>
      )}
    </form>
  );
};

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-border pt-20 pb-12">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 lg:gap-16">

          {/* Column 1: Brand */}
          <div className="flex flex-col">
            <Link to="/" className="font-display text-2xl tracking-[0.15em] uppercase font-medium text-black mb-4">THE <span className="text-[#ffbd59]">SACRED</span> STORE</Link>
            <p className="text-muted text-base tracking-widest uppercase font-semibold mb-8">
              Make Space for Meaning.
            </p>
            {/* Instagram Icon (SVG) */}
            <a href="#" className="text-primary hover:text-accent transition-colors" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>

          {/* Column 2: Main Menu */}
          <div className="flex flex-col">
            <h4 className="text-base uppercase tracking-[0.2em] font-bold text-[#ffbd59] mb-6 font-body">Main Menu</h4>
            <nav className="flex flex-col space-y-4 text-sm font-semibold tracking-widest uppercase text-muted">
               <Link to="/" className="text-primary hover:text-primary transition-colors cursor-pointer">Home</Link>
               <Link to="/shop-crystals" className="text-primary hover:text-primary transition-colors cursor-pointer">Shop</Link>
               <Link to="/book-a-call" className="text-primary hover:text-primary transition-colors cursor-pointer">Book Now</Link>
               <Link to="/blogs" className="text-primary hover:text-primary transition-colors cursor-pointer">Blogs</Link>
               <Link to="/aboutus" className="text-primary hover:text-primary transition-colors cursor-pointer">About Us</Link>
            </nav>
          </div>

          {/* Column 3: Quick Links */}
          <div className="flex flex-col">
            <h4 className="text-base uppercase tracking-[0.2em] font-bold text-[#ffbd59] mb-6 font-body">Quick Links</h4>
            <nav className="flex flex-col space-y-4 text-sm font-medium tracking-widest uppercase text-muted">
               <Link to="/track-order" className="text-primary hover:text-primary transition-colors cursor-pointer">Track Order</Link>
               <Link to="/privacy-policy" className="text-primary hover:text-primary transition-colors cursor-pointer">Privacy Policy</Link>
               <Link to="/refund-policy" className="text-primary hover:text-primary transition-colors cursor-pointer">Refund Policy</Link>
               <Link to="/terms-conditions" className="text-primary hover:text-primary transition-colors cursor-pointer">Terms & Conditions</Link>
            </nav>
          </div>

          {/* Column 4: Contact Us */}
          <div className="flex flex-col">
            <h4 className="text-base uppercase tracking-[0.2em] font-bold text-[#ffbd59] mb-6 font-body">Contact Us</h4>
            <div className="flex flex-col space-y-4">
              <div>
                <p className="text-base uppercase tracking-[0.15em] text-muted font-bold mb-1">Email</p>
                <p className="text-sm text-muted font-light">support@thesacredstore.co.in</p>
              </div>
              <div>
                <p className="text-base uppercase tracking-[0.15em] text-muted font-bold mb-1">Phone</p>
                <p className="text-sm text-muted font-light">+91 95549 30456</p>
              </div>
            </div>
          </div>

          {/* Column 5: Stay Connected Newsletter */}
          <div className="flex flex-col col-span-1 md:col-span-1">
            <h4 className="text-base uppercase tracking-[0.2em] font-bold text-[#ffbd59] mb-6 font-body">Stay Connected</h4>
            <p className="text-xs text-muted leading-relaxed font-light mb-4 font-body">
              Be the first to know about new collections, exclusive offers, and spiritual insights.
            </p>
            <NewsletterForm />
          </div>

        </div>

        <div className="mt-20 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center text-base uppercase tracking-widest text-muted font-semibold">
           <p className="text-sm text-muted">&copy; {new Date().getFullYear()} THE SACRED STORE. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
             <span className="text-primary">Ethically Sourced</span>
             <span className="text-primary mx-2">·</span>
             <span className="text-primary">Intentionally Crafted</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
