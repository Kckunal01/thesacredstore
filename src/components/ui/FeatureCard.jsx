import React from 'react';

const FeatureCard = ({ title, description, imagePlaceholder, className = '' }) => {
  return (
    <div className={`group bg-surface border border-border flex flex-col hover:-translate-y-1 transition-transform duration-500 ${className}`}>
      <div className="w-full aspect-[4/3] bg-background relative overflow-hidden">
        {/* Placeholder for actual image/gradient */}
        {imagePlaceholder ? (
          <div className="absolute inset-0 bg-gradient-to-br from-surface to-background flex items-center justify-center text-muted text-xs uppercase tracking-widest">
            {imagePlaceholder}
          </div>
        ) : null}
      </div>
      <div className="p-8 md:p-10 flex flex-col flex-grow">
        <h3 className="text-2xl font-display text-primary mb-3">{title}</h3>
        <p className="text-muted text-sm font-light leading-relaxed flex-grow">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;
