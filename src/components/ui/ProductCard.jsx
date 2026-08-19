import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, Minus } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import { ProductsContext } from '../../context/ProductsContext';

// Helper to generate slug from product name (matches server-side slug logic)
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-)$/g, '');
};

const ProductCard = ({ id, slug, name, price, originalPrice, category, stamp, images }) => {
  const { products } = useContext(ProductsContext);
  const { cart, addToCart } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const mainImage = images && images.length > 0 ? images[0] : null;
  const discountPercentage = originalPrice && stamp !== 'Fresh' ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  // Find if item is already in cart to check the 9-limit
  const cartItem = cart.find(item => item.id === id);
  const cartQty = cartItem ? cartItem.quantity : 0;
  const isCartFull = cartQty >= 9;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCartFull) return;
    addToCart({ id, name, price, originalPrice, images, category }, quantity);
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < 9 && (quantity + cartQty < 9)) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleNotifyMeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Redirect to the product detail page where waitlist modal is fully integrated
    navigate(`/product/${slug || id}`);
  };

  return (
    <div className="group flex flex-col h-full justify-between cursor-pointer block relative">
      <Link to={`/product/${slug || id}`} className="block flex-grow flex flex-col justify-between">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#FEFBF1] mb-2 sm:mb-4 border border-border">
          {mainImage ? (
            <img
              src={mainImage}
              alt={name}
              loading="lazy"
              decoding="async"
              fetchpriority="low"
              width="240"
              height="300"
              className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105 p-1"
              onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/placeholder.png'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted text-xs uppercase tracking-widest font-semibold">
              {name}
            </div>
          )}

          {/* Stamps */}
          {stamp === 'Fresh' ? (
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-accent text-background px-2 py-1 sm:px-4 sm:py-2 text-[8px] sm:text-[12px] uppercase tracking-widest font-bold rounded-md z-10">
            FRESH
          </div>
          ) : stamp === 'Sale' ? (
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-accent text-background px-2 py-1 sm:px-4 sm:py-2 text-[8px] sm:text-[12px] uppercase tracking-widest font-bold rounded-md z-10">
            SALE
          </div>
          ) : discountPercentage > 0 ? (
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-primary text-background px-2 py-1 sm:px-4 sm:py-2 text-[8px] sm:text-[12px] uppercase tracking-widest font-bold rounded-md z-10">
            {discountPercentage}% OFF
          </div>
          ) : null}
        </div>

        {/* Product Info */}
        <div className="flex flex-col text-center mb-2 sm:mb-4 flex-grow justify-end">
          <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-muted font-bold mb-0.5 sm:mb-1">{category}</span>
          <h3 className="font-display text-[12px] sm:text-[15px] md:text-lg text-primary mb-0.5 sm:mb-1 transition-colors group-hover:text-accent line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center px-1 leading-tight sm:leading-snug">{name}</h3>
          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
            {originalPrice && (
              <span className="text-[10px] sm:text-xs font-light tracking-wider text-muted line-through">₹{originalPrice}</span>
            )}
            <span className="text-xs sm:text-sm font-semibold tracking-wider text-primary">₹{price}</span>
          </div>
        </div>
      </Link>

      {/* Add to Cart / Out of Stock UI */}
      <div className="flex flex-col opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 px-2 sm:px-4 mt-2">
        {(() => {
          const productData = products.find(p => p.id === id || p.db_id === id || p.slug === slugify(name));
          const stock = productData?.stock ?? null;
          const active = productData?.active ?? true;
          if (stock !== null && stock > 0 && active) {
            return (
              <>
                <div className="flex items-center justify-between border border-border bg-surface mb-1 sm:mb-2">
                  <button
                    onClick={handleDecrement}
                    className="p-1 sm:p-2 text-primary hover:text-accent transition-colors"
                    disabled={isCartFull}
                  >
                    <Minus className="w-2 h-2 sm:w-3 sm:h-3" />
                  </button>
                  <span className="text-[10px] sm:text-xs font-semibold">{isCartFull ? 'Max' : quantity}</span>
                  <button
                    onClick={handleIncrement}
                    className="p-1 sm:p-2 text-primary hover:text-accent transition-colors"
                    disabled={isCartFull}
                  >
                    <Plus className="w-2 h-2 sm:w-3 sm:h-3" />
                  </button>
                </div>
                <button
                  onClick={handleQuickAdd}
                  disabled={isCartFull}
                  className={`w-full bg-[#000000] hover:bg-[#FFBD59] text-[#FEFBF1] hover:text-[#000000] text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-bold py-2 sm:py-3 flex items-center justify-center gap-1 sm:gap-2 transition-colors duration-300 ${isCartFull ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ShoppingBag className="w-2 h-2 sm:w-3 sm:h-3" /> {isCartFull ? 'Limit Reached' : 'Add to Cart'}
                </button>
              </>
            );
          } else {
            return (
              <>
                <div className="text-center text-[10px] sm:text-xs font-bold text-red-500 uppercase py-1 sm:py-2">
                  Out of Stock
                </div>
                <button
                  onClick={handleNotifyMeClick}
                  className="w-full bg-[#000000] hover:bg-[#FFBD59] text-[#FEFBF1] hover:text-[#000000] text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-bold py-2 sm:py-3 flex items-center justify-center gap-1 sm:gap-2 transition-colors duration-300"
                >
                  Notify Me
                </button>
              </>
            );
          }
        })()}
      </div>
    </div>
  );
};

export default ProductCard;
