import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'BUNDLE BUILDER',
    subtitle: 'Build your custom crystal grid and set intentions with combined energetic frequencies.',
    imageDesktop: '/assets/images/Carousel/carousel 1.png',
    imageMobile: '/assets/images/Carousel/carousel 1.png',
    ctaText: 'Build Your Bundle',
    ctaLink: '/bundles',
    ctaScroll: null,
    secondaryText: 'Explore Crystals',
    secondaryLink: '/shop-crystals',
    secondaryScroll: null,
  },
  {
    id: 2,
    title: 'BEST SELLERS',
    subtitle: 'Discover our most-loved Reiki-charged raw crystals and intentional tools.',
    imageDesktop: '/assets/images/Carousel/carousel 2.png',
    imageMobile: '/assets/images/Carousel/carousel 2.png',
    ctaText: 'Shop Best Sellers',
    ctaLink: null,
    ctaScroll: 'best-sellers',
    secondaryText: 'Book Private Call',
    secondaryLink: '/book-a-call',
    secondaryScroll: null,
  },
];

const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) handleNext();
    if (distance < -50) handlePrev();
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
  };

  const handleScrollCTA = (scrollTarget) => {
    const el = document.getElementById(scrollTarget);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSlideClick = (slide) => {
    if (slide.ctaScroll) {
      handleScrollCTA(slide.ctaScroll);
    } else if (slide.ctaLink) {
      navigate(slide.ctaLink);
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full overflow-hidden bg-background border-b border-border outline-none focus:ring-1 focus:ring-accent"
      aria-label="Hero Carousel"
    >
      {/* Slide Container */}
      <div className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            onClick={() => handleSlideClick(currentSlide)}
            className="w-full h-full cursor-pointer overflow-hidden absolute inset-0"
          >
            <picture className="w-full h-full">
              <source media="(max-width: 767px)" srcSet={currentSlide.imageMobile} />
              <img
                src={currentSlide.imageDesktop}
                alt={currentSlide.title}
                loading={currentIndex === 0 ? 'eager' : 'lazy'}
                // @ts-ignore
                fetchpriority={currentIndex === 0 ? 'high' : 'auto'}
                className="w-full h-full object-cover object-center"
              />
            </picture>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Navigation Buttons */}
      <button
        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
        aria-label="Previous Slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/80 hover:bg-background text-primary border border-border flex items-center justify-center shadow-md transition-all duration-200"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); handleNext(); }}
        aria-label="Next Slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/80 hover:bg-background text-primary border border-border flex items-center justify-center shadow-md transition-all duration-200"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Pagination Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
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
