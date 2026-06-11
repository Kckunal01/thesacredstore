import React from 'react';

const QuoteBlock = ({ quote, author, location, className = '' }) => {
  return (
    <div className={`flex flex-col items-center text-center max-w-4xl mx-auto ${className}`}>
      <div className="text-accent mb-6 flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
      </div>
      <p className="text-2xl md:text-4xl font-display font-light leading-relaxed mb-8 italic text-primary">
        "{quote}"
      </p>
      <div className="flex flex-col items-center">
        <span className="text-sm font-semibold uppercase tracking-widest text-primary mb-1">{author}</span>
        <span className="text-xs text-muted tracking-wider">{location}</span>
      </div>
    </div>
  );
};

export default QuoteBlock;
