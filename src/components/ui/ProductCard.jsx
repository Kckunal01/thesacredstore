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

const ProductCard = ({ id, name, price, originalPrice, category, stamp, images }) => {
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
    navigate(`/product/${id}`);
  };

  return (
    <div className="group flex flex-col cursor-pointer block relative">
      <Link to={`/product/${id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#FEFBF1] mb-6 border border-border">
          {mainImage ? (
            <img
              src={mainImage}
              alt={name}
              className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105 p-1"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted text-xs uppercase tracking-widest font-semibold">
              {name}
            </div>
          )}

          {/* Stamps */}
          {stamp === 'Fresh' ? (
            <div className="absolute top-4 left-4 bg-accent text-background px-4 py-2 text-[12px] uppercase tracking-widest font-bold rounded-md z-10">
            FRESH
          </div>
          ) : discountPercentage > 0 ? (
            <div className="absolute top-4 right-4 bg-primary text-background px-4 py-2 text-[12px] uppercase tracking-widest font-bold rounded-md z-10">
            {discountPercentage}% OFF
          </div>
          ) : null}
        </div>

        {/* Product Info */}
        <div className="flex flex-col text-center mb-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold mb-2">{category}</span>
          <h3 className="font-display text-xl text-primary mb-2 transition-colors group-hover:text-accent">{name}</h3>
          <div className="flex items-center justify-center space-x-3">
            {originalPrice && (
              <span className="text-sm font-light tracking-wider text-muted line-through">₹{originalPrice}</span>
            )}
            <span className="text-sm font-semibold tracking-wider text-primary">₹{price}</span>
          </div>
        </div>
      </Link>

      {/* Add to Cart / Out of Stock UI */}
      <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4">
        {(() => {
          const productData = products.find(p => p.id === id || p.db_id === id || p.slug === slugify(name));
          const stock = productData?.stock ?? null;
          const active = productData?.active ?? true;
          if (stock !== null && stock > 0 && active) {
            return (
              <>
                <div className="flex items-center justify-between border border-border bg-surface mb-2">
                  <button
                    onClick={handleDecrement}
                    className="p-2 text-primary hover:text-accent transition-colors"
                    disabled={isCartFull}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-semibold">{isCartFull ? 'Max' : quantity}</span>
                  <button
                    onClick={handleIncrement}
                    className="p-2 text-primary hover:text-accent transition-colors"
                    disabled={isCartFull}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={handleQuickAdd}
                  disabled={isCartFull}
                  className={`w-full bg-[#000000] hover:bg-[#FFBD59] text-[#FEFBF1] hover:text-[#000000] text-[10px] uppercase tracking-[0.2em] font-bold py-3 flex items-center justify-center gap-2 transition-colors duration-300 ${isCartFull ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ShoppingBag className="w-3 h-3" /> {isCartFull ? 'Limit Reached' : 'Add to Cart'}
                </button>
              </>
            );
          } else {
            return (
              <>
                <div className="text-center text-xs font-bold text-red-500 uppercase py-2">
                  Out of Stock
                </div>
                <button
                  onClick={handleNotifyMeClick}
                  className="w-full bg-[#000000] hover:bg-[#FFBD59] text-[#FEFBF1] hover:text-[#000000] text-[10px] uppercase tracking-[0.2em] font-bold py-3 flex items-center justify-center gap-2 transition-colors duration-300"
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
