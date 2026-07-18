import React from 'react';
import { useNavigate } from 'react-router-dom';

const BundleCard = ({ bundle }) => {
  const navigate = useNavigate();

  // includedProducts is pre-resolved by getDynamicBundles (from DB)
  const productsToRender = bundle.includedProducts || [];

  const finalTotal = bundle.price || 0;
  const originalTotal = bundle.originalPrice || finalTotal;
  const discountAmount = Math.max(0, originalTotal - finalTotal);
  const discountPercent = originalTotal > 0 ? (discountAmount / originalTotal) : 0;

  // Cover image from DB or first included product
  const coverImage = bundle.imageUrl || bundle.image_url || productsToRender[0]?.images?.[0] || productsToRender[0]?.image_url;

  const handleCardClick = () => {
    navigate(`/bundles/${bundle.slug}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="flex flex-col sm:flex-row bg-surface border border-border overflow-hidden hover:shadow-lg transition-all duration-300 rounded-lg group cursor-pointer h-full"
    >
      {/* Small cover image (dynamic or unique cover option) */}
      <div className="w-full sm:w-1/3 min-h-[160px] sm:min-h-0 relative overflow-hidden bg-background flex items-center justify-center">
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
          <span className="absolute top-3 left-3 bg-accent text-white text-[8px] font-bold tracking-widest uppercase px-2 py-1 shadow-md">
            Save {Math.round(discountPercent * 100)}%
          </span>
        )}
      </div>

      {/* Details */}
      <div className="w-full sm:w-2/3 p-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2 mb-1.5">
            <h4 className="text-base font-display font-medium text-primary group-hover:text-accent transition-colors truncate">
              {bundle.name}
            </h4>
            <div className="text-right flex-shrink-0">
              {discountPercent > 0 && (
                <span className="text-[10px] text-muted/60 line-through mr-1.5 font-light">₹{originalTotal}</span>
              )}
              <span className="text-sm font-bold text-accent">₹{finalTotal}</span>
            </div>
          </div>

          <p className="text-xs text-muted font-light leading-relaxed mb-3 line-clamp-2">
             {bundle.description}
          </p>

          <div className="mb-2">
            <div className="flex flex-wrap gap-1.5">
              {productsToRender.map((p, idx) => (
                <div key={idx} className="w-8 h-8 rounded-sm overflow-hidden border border-border/60 bg-background flex-shrink-0" title={p.name}>
                  <img 
                    src={p.images?.[0] || p.image_url} 
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
        </div>

        <div className="mt-2 pt-2 border-t border-border/50 flex justify-between items-center">
          {/* Explained briefly inside list */}
          <span className="text-[9px] text-muted tracking-wider uppercase font-semibold">
            {bundle.name.split(' ')[0]} Energetic Synergy
          </span>
          <span className="text-[9px] tracking-[0.1em] uppercase font-bold text-accent group-hover:underline">
            View Details &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};

export default BundleCard;
