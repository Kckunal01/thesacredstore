import React from 'react';

const SectionHeader = ({
  title,
  eyebrow,
  description,
  align = 'center',
  className = '',
}) => {
  const alignmentClass =
    align === 'left'
      ? 'text-left'
      : align === 'right'
        ? 'text-right'
        : 'text-center mx-auto';

  return (
    <div className={`max-w-3xl mb-16 ${alignmentClass} ${className}`}>
      {eyebrow && (
        <span className="block text-xs uppercase tracking-[0.2em] text-accent mb-4 font-semibold">
          {eyebrow}
        </span>
      )}

      <h2 className="text-4xl md:text-[56px] leading-[1.1] mb-6 font-display font-light">
        {title}
      </h2>

      {description && (
        <p className="text-muted text-lg font-light leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;