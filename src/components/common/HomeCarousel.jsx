import React, { useRef, useState, useEffect } from 'react';

const HomeCarousel = ({ items, renderItem, className = '', trackClassName = '' }) => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Horizontal mouse wheel scrolling — only intercept when cursor is inside the carousel
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e) => {
      const { scrollWidth, clientWidth } = el;
      if (scrollWidth <= clientWidth) return;

      if (e.deltaY !== 0) {
        const atStart = el.scrollLeft <= 0 && e.deltaY < 0;
        const atEnd = Math.ceil(el.scrollLeft + clientWidth) >= scrollWidth && e.deltaY > 0;
        if (atStart || atEnd) return;

        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Mouse Dragging logic
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = 'grabbing';
    scrollRef.current.style.scrollSnapType = 'none';
  };

  const handleMouseLeave = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
      scrollRef.current.style.scrollSnapType = 'x mandatory';
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
      scrollRef.current.style.scrollSnapType = 'x mandatory';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  if (!items || items.length === 0) return null;

  return (
    <div className={`home-carousel-wrapper relative ${className}`}>
      <div
        ref={scrollRef}
        className={`home-carousel-track flex overflow-x-auto cursor-grab ${trackClassName}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{
          scrollBehavior: isDragging ? 'auto' : 'smooth',
        }}
      >
        {items.map((item, index) => (
          <div key={item.id || index} className="home-carousel-slide">
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeCarousel;
