import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Plus, Minus } from 'lucide-react';
import { CartContext } from '../../context/CartContext';

const ProductCard = ({ id, name, price, originalPrice, category, stamp, images }) => {
  const { addToCart } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  const mainImage = images && images.length > 0 ? images[0] : null;
  const discountPercentage = originalPrice && stamp !== 'Fresh' ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id, name, price, originalPrice, images, category }, quantity);
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < 9) setQuantity(prev => prev + 1);
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  return (
    <div className="group flex flex-col cursor-pointer block relative">
      <Link to={`/product/${id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#F8F5EF] mb-6 border border-border">
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
            <div className="absolute top-4 left-4 bg-accent text-background px-3 py-1 text-[9px] uppercase tracking-widest font-bold z-10">
              FRESH
            </div>
          ) : discountPercentage > 0 ? (
            <div className="absolute top-4 right-4 bg-primary text-background px-3 py-1 text-[9px] uppercase tracking-widest font-bold z-10">
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

      {/* Add to Cart UI */}
      <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4">
        <div className="flex items-center justify-between border border-border bg-surface mb-2">
          <button onClick={handleDecrement} className="p-2 text-primary hover:text-accent transition-colors"><Minus className="w-3 h-3" /></button>
          <span className="text-xs font-semibold">{quantity}</span>
          <button onClick={handleIncrement} className="p-2 text-primary hover:text-accent transition-colors"><Plus className="w-3 h-3" /></button>
        </div>
        <button
          onClick={handleQuickAdd}
          className="w-full bg-primary hover:bg-accent text-background text-[10px] uppercase tracking-[0.2em] font-bold py-3 flex items-center justify-center gap-2 transition-colors duration-300"
        >
          <ShoppingBag className="w-3 h-3" /> Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
