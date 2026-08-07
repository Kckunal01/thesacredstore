import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getSmartRecommendations } from '../lib/recommendations';

const ProductRecommendations = ({ currentProduct, products }) => {
  const recommendations = useMemo(() => {
    return getSmartRecommendations({ currentProduct, allProducts: products });
  }, [currentProduct, products]);

  if (recommendations.length === 0) return null;

  return (
    <div className="mt-20 pt-16 max-w-6xl mx-auto px-4">
      <h3 className="font-display text-2xl md:text-3xl text-primary font-medium tracking-[0.2em] uppercase mb-12 text-center">
        Our Customers also Bought
      </h3>
      <div className={`flex overflow-x-auto md:grid gap-6 pb-6 scrollbar-thin snap-x snap-mandatory justify-start ${
        recommendations.length === 1 ? 'md:grid-cols-1 max-w-sm mx-auto' :
        recommendations.length === 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' :
        recommendations.length === 3 ? 'md:grid-cols-3 max-w-4xl mx-auto' : 'md:grid-cols-2 lg:grid-cols-4'
      }`}>
        {recommendations.map((product) => {
          const mainImage = product.images && product.images.length > 0 ? product.images[0] : null;
          return (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group flex flex-col bg-[#FEFBF1]/10 p-5 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 rounded-md snap-start shrink-0 w-[260px] xs:w-[290px] md:w-auto"
            >
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#FEFBF1] mb-5 rounded-sm">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    width="230"
                    height="288"
                    className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105 p-2"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted text-xs uppercase tracking-widest font-semibold">
                    {product.name}
                  </div>
                )}
              </div>
              <span className="text-[9px] uppercase tracking-[0.2em] text-muted/80 font-bold mb-2 block">
                {product.category}
              </span>
              <h4 className="font-display text-base md:text-lg text-primary font-medium mb-2 line-clamp-1 transition-colors duration-300 group-hover:text-accent">
                {product.name}
              </h4>
              <span className="text-sm font-semibold text-accent mt-auto">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ProductRecommendations;
