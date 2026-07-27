import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('thesacredstore_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Global coupon state
  const [couponState, setCouponState] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  useEffect(() => {
    localStorage.setItem('thesacredstore_cart', JSON.stringify(cart));
  }, [cart]);

  // Add product/bundle to cart, respecting stock limits and max 9 per product
  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        const newQty = Math.min(9, existing.quantity + quantity);
        // Merge latest product fields (price, images, etc.) while preserving quantity
        return prev.map(item =>
          item.id === product.id ? { ...item, ...product, quantity: newQty } : item
        );
      }
      const allowedQty = Math.min(9, quantity, product.stock ?? 9);
      // Store fresh product data
      return [...prev, { ...product, quantity: allowedQty }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const maxQty = Math.min(item.stock ?? 9, 9);
          const boundedQty = Math.min(maxQty, quantity);
          return { ...item, quantity: boundedQty };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
    setCouponState('');
    setDiscountPercent(0);
  };

  const getCartTotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const getCartCount = () =>
    cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        couponState,
        setCouponState,
        discountPercent,
        setDiscountPercent,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
