import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
  const [cursorType, setCursorType] = useState('default');
  const [cursorText, setCursorText] = useState('');
  
  // Use springs for smooth, fluid movement rather than instant jumps
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 30, stiffness: 250, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const updateMousePosition = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      // Inputs and textareas
      if (target.tagName.toLowerCase() === 'input' || target.tagName.toLowerCase() === 'textarea') {
        setCursorType('input');
        return;
      }

      // Check for product cards or main image container
      const productCard = target.closest('.group');
      if (productCard && (target.closest('.aspect-\\[4\\/5\\]') || target.closest('.aspect-\\[16\\/10\\]'))) {
        setCursorType('view');
        setCursorText('VIEW');
        return;
      }

      // Links and buttons
      if (
        target.tagName.toLowerCase() === 'a' || 
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') || 
        target.closest('button')
      ) {
        setCursorType('hover');
        return;
      }

      setCursorType('default');
      setCursorText('');
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    // Hide default cursor in CSS (handled in index.css, but this double checks)
    document.body.style.cursor = 'none';

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      document.body.style.cursor = 'auto';
    };
  }, [mouseX, mouseY]);

  // Design sizes and scales for different cursor types
  const getVariants = () => {
    switch (cursorType) {
      case 'hover':
        return {
          width: 40,
          height: 40,
          backgroundColor: 'rgba(200, 164, 90, 0.2)', // Accent gold tint
          border: '1px solid #c8a45a',
          borderRadius: '50%',
        };
      case 'input':
        return {
          width: 8,
          height: 24,
          backgroundColor: '#c8a45a',
          border: 'none',
          borderRadius: '2px',
        };
      case 'view':
        return {
          width: 60,
          height: 60,
          backgroundColor: '#111111',
          border: 'none',
          borderRadius: '50%',
        };
      case 'default':
      default:
        return {
          width: 12,
          height: 12,
          backgroundColor: '#111111',
          border: '1px solid rgba(17, 17, 17, 0.3)',
          borderRadius: '50%',
        };
    }
  };

  const currentVariant = getVariants();

  return (
    <>
      {/* Outer smoothing ring cursor */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center mix-blend-normal"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={currentVariant}
        transition={{ type: 'spring', ...springConfig }}
      >
        {cursorType === 'view' && (
          <span className="text-[8px] font-bold tracking-[0.2em] text-[#F8F5EF] font-body">
            {cursorText}
          </span>
        )}
      </motion.div>
    </>
  );
};

export default CustomCursor;
