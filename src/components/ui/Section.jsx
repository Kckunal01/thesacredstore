import React from 'react';

const Section = ({ children, className = '' }) => {
  return (
    <section className={`py-24 md:py-32 ${className}`}>
      {children}
    </section>
  );
};

export default Section;
