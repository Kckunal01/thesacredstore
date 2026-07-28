import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    id: 1,
    desktop: '/assets/images/Carousel/Desktop/carousel 1.png',
    mobile: '/assets/images/Carousel/Mobile/Carosuel 1.png',
    objectPositionDesktop: 'center',
    objectPositionMobile: 'center',
  },
  {
    id: 2,
    desktop: '/assets/images/Carousel/Desktop/carousel 2.png',
    mobile: '/assets/images/Carousel/Mobile/Carosuel 2.png',
    objectPositionDesktop: 'center',
    objectPositionMobile: 'center',
  },
];

const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Breakpoint detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Autoplay — infinite loop
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) setCurrentIndex((p) => (p + 1) % slides.length);
    if (distance < -50) setCurrentIndex((p) => (p - 1 + slides.length) % slides.length);
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const slide = slides[currentIndex];

  return (
    <div
      onMouseEnter={() => { if (!isMobile) setIsPaused(true); }}
      onMouseLeave={() => { if (!isMobile) setIsPaused(false); }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full overflow-hidden bg-background border-b border-border"
      aria-label="Hero Carousel"
    >
      {/* Slide */}
      <div className="relative w-full h-[70vh] md:h-[75vh] lg:h-[80vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            <picture className="w-full h-full block">
              <source media="(max-width: 767px)" srcSet={slide.mobile} />
              <img
                src={slide.desktop}
                alt=""
                loading={currentIndex === 0 ? 'eager' : 'lazy'}
                fetchpriority={currentIndex === 0 ? 'high' : 'auto'}
                className="w-full h-full object-cover"
                style={{
                  objectPosition: isMobile ? slide.objectPositionMobile : slide.objectPositionDesktop,
                }}
              />
            </picture>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentIndex === idx ? 'w-8 bg-accent' : 'w-2 bg-muted/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
