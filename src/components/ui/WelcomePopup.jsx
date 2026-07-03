import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Copy, Check } from 'lucide-react';

const WelcomePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const isCheckout = location.pathname.toLowerCase().includes('/checkout');
    const isAdmin = location.pathname.toLowerCase().includes('/admin');
    if (isCheckout || isAdmin) return;

    const hasSeen = localStorage.getItem('welcome_popup_seen');
    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const handleClose = () => {
    localStorage.setItem('welcome_popup_seen', 'true');
    setIsOpen(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('WELCOME10');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-[#FEFBF1] border border-border p-8 md:p-10 shadow-2xl text-center z-10 font-body"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-primary hover:text-accent transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>

            <span className="text-[10px] uppercase tracking-[0.3em] text-[#000000] font-bold block mb-4">
              Welcome to
            </span>
            <h2 className="font-display text-2xl md:text-3xl text-primary font-medium tracking-[0.1em] uppercase mb-8">
              The Sacred Store
            </h2>

            <div className="py-6 border-y border-border/60 my-6 space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted">
                On your first purchase
              </p>
              <p className="text-4xl md:text-5xl font-display font-semibold text-accent my-2">
                10% OFF
              </p>
              <p className="text-xs uppercase tracking-widest text-muted">
                on your first order
              </p>
            </div>

            <div className="space-y-4 mt-8">
              <div className="flex items-center justify-between bg-white border border-border p-4">
                <span className="font-mono text-sm tracking-widest font-bold text-primary select-all">
                  WELCOME10
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1.5 text-[10px] uppercase tracking-wider font-bold text-primary hover:text-accent transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleClose}
                className="w-full bg-[#000000] hover:bg-[#FFBD59] text-white hover:text-black py-4 text-xs uppercase tracking-[0.2em] font-bold transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WelcomePopup;
