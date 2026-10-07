import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check, ArrowRight } from 'lucide-react';
import { ProductsContext } from '../../context/ProductsContext';
import { CartContext } from '../../context/CartContext';
import { trackAddToCart } from '../../utils/metaPixel';

const ConciergeRecommendationCard = ({ productId, reason, onCloseChat, onAddToCart }) => {
  const { products } = useContext(ProductsContext);
  const { addToCart } = useContext(CartContext);
  const [added, setAdded] = useState(false);

  // Authoritative product retrieval from context
  const product = products.find(
    p => p.id === productId || p.db_id === productId || p.slug === productId
  );

  if (!product) return null;

  const mainImage = product.images?.[0] || product.image || '/assets/images/placeholder.png';
  const targetUrl = `/product/${product.slug || product.id}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    trackAddToCart(product, 1);
    setAdded(true);
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E8DFD3] p-3 shadow-sm hover:shadow-md transition-shadow my-2 flex flex-col justify-between max-w-sm">
      <div className="flex gap-3">
        {/* Product Image */}
        <Link 
          to={targetUrl} 
          onClick={onCloseChat}
          className="w-20 h-20 rounded-lg overflow-hidden bg-[#FAF7F2] flex-shrink-0 border border-[#F0EAE1] block"
        >
          <img 
            src={mainImage} 
            alt={product.name} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <Link 
              to={targetUrl} 
              onClick={onCloseChat}
              className="font-display font-medium text-sm text-[#2B241C] hover:text-[#B89968] transition-colors line-clamp-1 block"
            >
              {product.name}
            </Link>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xs font-bold text-[#B89968]">
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[10px] text-gray-400 line-through">
                  ₹{product.originalPrice?.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <div className="mt-1">
            <Link 
              to={targetUrl}
              onClick={onCloseChat}
              className="text-[10px] uppercase tracking-wider font-semibold text-muted hover:text-primary flex items-center gap-1 transition-colors"
            >
              <span>View Product</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* AI Explanation / Reason */}
      {reason && (
        <div className="mt-2.5 pt-2 border-t border-[#F5EFE6] text-[11px] leading-relaxed text-[#5E5A52] italic bg-[#FAF7F2]/60 rounded-md p-2">
          "{reason}"
        </div>
      )}

      {/* Direct Add to Cart Action */}
      <div className="mt-2.5">
        <button
          onClick={handleAddToCart}
          className={`w-full py-2 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200 ${
            added
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-[#2B241C] text-[#FBF6EE] hover:bg-[#B89968] active:scale-[0.98]'
          }`}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added to Cart ✓</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ConciergeRecommendationCard;
