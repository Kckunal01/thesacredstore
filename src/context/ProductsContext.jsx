import React, { createContext, useState, useEffect } from 'react';
import { fetchProducts } from '../lib/productsService';

export const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (force = false) => {
    setLoading(true);
    try {
      const data = await fetchProducts(force);
      setProducts(data);
    } catch (err) {
      console.error("Error loading products in context:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Force reload on mount to pick up Rakhi products during HMR
    loadData();
  }, []);

  const refreshProducts = () => loadData(true);

  return (
    <ProductsContext.Provider value={{ products, loading, refreshProducts }}>
      {children}
    </ProductsContext.Provider>
  );
};
