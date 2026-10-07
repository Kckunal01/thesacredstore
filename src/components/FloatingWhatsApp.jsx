import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const FloatingWhatsApp = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [startX, setStartX] = useState(null);

  const handleTouchStart = (e) => setStartX(e.touches[0].clientX);

  const handleTouchMove = (e) => {
    if (!startX) return;
    const currentX = e.touches[0].clientX;
    // Hide if swiped left or right by 50px
    if (Math.abs(startX - currentX) > 50) {
      setIsVisible(false); 
    }
  };

  const handleTouchEnd = () => setStartX(null);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-6 right-6 z-[100] flex flex-col items-center gap-1.5"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button 
        onClick={() => setIsVisible(false)} 
        className="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-gray-600 rounded-full p-0.5 shadow-md border border-gray-100 z-10 md:hidden"
      >
        <X className="w-3 h-3" />
      </button>
      <a 
        href="https://wa.me/919554930456" 
        target="_blank" 
        rel="noopener noreferrer"
        className="bg-[#25D366] text-white p-3.5 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
      >
        <MessageCircle className="w-7 h-7" />
      </a>
    </div>
  );
};

export default FloatingWhatsApp;
