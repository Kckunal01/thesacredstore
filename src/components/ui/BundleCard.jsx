import React from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveProductImage } from '../../utils/productImageResolver';

const BundleCard = ({ bundle }) => {
  const navigate = useNavigate();

  // includedProducts is pre-resolved by getDynamicBundles (from DB)
  const productsToRender = bundle.includedProducts || [];

  const finalTotal = bundle.price || 0;
  const originalTotal = bundle.originalPrice || finalTotal;
  const discountAmount = Math.max(0, originalTotal - finalTotal);
  const discountPercent = originalTotal > 0 ? (discountAmount / originalTotal) : 0;

  // Cover image from DB or first included product
  const coverImage = bundle.imageUrl || bundle.image_url || (productsToRender[0] ? resolveProductImage(productsToRender[0]) : null);

  const handleCardClick = () => {
    navigate(`/bundles/${bundle.slug}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="flex flex-col sm:flex-row bg-surface border border-border overflow-hidden hover:shadow-lg transition-all duration-300 rounded-lg group cursor-pointer h-full"
    >
      {/* Cover image */}
      <div className="w-full sm:w-1/3 min-h-[120px] sm:min-h-0 relative overflow-hidden bg-background flex items-center justify-center">
        <img 
          src={coverImage} 
          alt={bundle.name} 
          loading="lazy"
          decoding="async"
          width="200"
          height="150"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-accent text-white text-[7px] sm:text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 sm:px-2 sm:py-1 shadow-md">
            Save {Math.round(discountPercent * 100)}%
          </span>
        )}
      </div>

      {/* Details */}
      <div className="w-full sm:w-2/3 p-3 sm:p-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2 mb-1">
            <h4 className="text-sm sm:text-base font-display font-medium text-primary group-hover:text-accent transition-colors truncate">
              {bundle.name}
            </h4>
            <div className="text-right flex-shrink-0">
              {discountPercent > 0 && (
                <span className="text-[9px] sm:text-[10px] text-muted/60 line-through mr-1 font-light">₹{originalTotal}</span>
              )}
              <span className="text-xs sm:text-sm font-bold text-accent">₹{finalTotal}</span>
            </div>
          </div>

          <p className="text-[10px] sm:text-xs text-muted font-light leading-relaxed mb-2 line-clamp-2">
             {bundle.description}
          </p>

          <div className="mb-1.5">
            <div className="flex flex-wrap gap-1">
              {productsToRender.map((p, idx) => (
                <div key={idx} className="w-6 h-6 sm:w-8 sm:h-8 rounded-sm overflow-hidden border border-border/60 bg-background flex-shrink-0" title={p.name}>
                  <img 
                    src={resolveProductImage(p)}
                    alt={p.name} 
                    loading="lazy"
                    decoding="async"
                    width="32"
                    height="32"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-border/10">
            <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-accent font-semibold block mb-0.5">Handpicked by Sacred Store</span>
            <p className="text-[9px] sm:text-[10px] text-muted font-light leading-relaxed hidden sm:block">A thoughtfully curated collection designed to work beautifully together.</p>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-border/50 flex justify-between items-center">
          <span className="text-[8px] sm:text-[9px] text-muted tracking-wider uppercase font-semibold">
            {bundle.name.split(' ')[0]} Energetic Synergy
          </span>
          <span className="text-[8px] sm:text-[9px] tracking-[0.1em] uppercase font-bold text-accent group-hover:underline">
            View Details &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};

export default BundleCard;
