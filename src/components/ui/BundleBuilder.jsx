import React, { useState, useMemo, useContext } from 'react';
import { ProductsContext } from '../../context/ProductsContext';
import { CartContext } from '../../context/CartContext';
import Button from './Button';

const BundleBuilder = () => {
  const { products } = useContext(ProductsContext);
  const { cart, addToCart } = useContext(CartContext);

  // Rules: Hide out-of-stock, inactive, invisible, and malformed products.
  // A product is considered valid if it has id, name, price, and at least one image.
  const availableProducts = useMemo(() => {
    return products.filter(p => {
      if (!p || !p.id || !p.name || p.price == null) return false;
      const hasRequired = (p.images && p.images.length > 0) || p.image || p.image_url;
      const isBundle = p.category === 'Bundles' || p.isBundle === true || p.isCustomBundle === true || p.slug?.includes('bundle');
      return (
        hasRequired &&
        p.active !== false &&
        (p.stock ?? 0) > 0 &&
        !isBundle
      );
    });
  }, [products]);

  // Selected products state: Map of { productId: quantityChosen }
  const [selectedQuantities, setSelectedQuantities] = useState({});

  // Search or filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = new Set(availableProducts.map(p => p.category).filter(Boolean));
    return ['All', ...Array.from(cats).sort()];
  }, [availableProducts]);  const filteredProducts = useMemo(() => {
    return availableProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = searchQuery || selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [availableProducts, searchQuery, selectedCategory]);

  // Returns max quantity allowed to select based on inventory stock limit AND existing cart qty
  const getMaxAllowedSelect = (product) => {
    const existingInCart = cart.find(item => item.id === product.id);
    const cartQty = existingInCart ? existingInCart.quantity : 0;
    const stockLimit = product.stock ?? 9;
    return Math.max(0, Math.min(9, stockLimit) - cartQty);
  };

  const handleIncrement = (product) => {
    const maxSelect = getMaxAllowedSelect(product);
    const currentSelected = selectedQuantities[product.id] || 0;
    if (currentSelected < maxSelect) {
      setSelectedQuantities(prev => ({
        ...prev,
        [product.id]: currentSelected + 1,
      }));
    }
  };

  const handleDecrement = (productId) => {
    const currentSelected = selectedQuantities[productId] || 0;
    if (currentSelected > 0) {
      setSelectedQuantities(prev => {
        const next = { ...prev };
        if (currentSelected - 1 === 0) {
          delete next[productId];
        } else {
          next[productId] = currentSelected - 1;
        }
        return next;
      });
    }
  };

  // Memoized lists and values
  const selectedProducts = useMemo(() => {
    return availableProducts
      .filter(p => (selectedQuantities[p.id] || 0) > 0)
      .map(p => ({
        ...p,
        quantity: selectedQuantities[p.id],
      }));
  }, [availableProducts, selectedQuantities]);

  const subtotal = useMemo(() => {
    return selectedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [selectedProducts]);

  const discountInfo = useMemo(() => {
    let percent = 0;
    if (subtotal >= 11999) {
      percent = 0.15;
    } else if (subtotal >= 7999) {
      percent = 0.10;
    } else if (subtotal >= 4999) {
      percent = 0.05;
    }
    const amount = Math.round(subtotal * percent);
    const finalTotal = subtotal - amount;
    return { percent, amount, finalTotal };
  }, [subtotal]);

  // Adds a bundle as a single product record to prevent breakdown parts
  const handleAddBundle = () => {
    if (selectedProducts.length === 0) return;

    const customBundleProduct = {
      id: `custom_bundle_${Date.now()}`,
      name: `Custom Crystal Set (${selectedProducts.map(p => `${p.name} x${p.quantity}`).join(', ')})`,
      price: discountInfo.finalTotal,
      originalPrice: subtotal,
      images: [selectedProducts[0]?.images?.[0] || selectedProducts[0]?.image_url || '/assets/images/placeholder.png'],
      stock: 1,
      category: 'Bundles',
      description: 'Your tailored curation of sacred healing crystals.',
      isCustomBundle: true,
      quantity: 1,
    };

    addToCart(customBundleProduct, 1);
    setSelectedQuantities({});
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Selection list */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface p-4 border border-border rounded-lg">
          <input 
            type="text" 
            placeholder="Search crystals..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 bg-background border border-border px-4 py-2 text-sm text-primary placeholder-muted/50 focus:outline-none focus:border-accent"
          />
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10px] uppercase tracking-wider px-3 py-1.5 border transition-all ${
                  selectedCategory === cat 
                    ? 'border-accent bg-accent text-white' 
                    : 'border-border bg-background text-primary hover:border-accent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
          {filteredProducts.map(p => {
            const qtySelected = selectedQuantities[p.id] || 0;
            const maxSelect = getMaxAllowedSelect(p);
            return (
              <div 
                key={p.id}
                className={`bg-surface border p-4 transition-all flex flex-col justify-between rounded-lg ${
                  qtySelected > 0 ? 'border-accent ring-1 ring-accent' : 'border-border'
                }`}
              >
                <div>
                  <div className="aspect-square bg-background overflow-hidden mb-3 rounded-md">
                    <img 
                      src={p.images?.[0] || p.image_url || '/assets/images/placeholder.png'} 
                      alt={p.name} 
                      loading="lazy"
                      decoding="async"
                      width="180"
                      height="180"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h5 className="font-display font-medium text-sm text-primary mb-1 line-clamp-1">{p.name}</h5>
                  <span className="text-[10px] text-muted tracking-wider block mb-2">{p.category}</span>
                </div>
                
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-primary">₹{p.price}</span>
                  </div>

                  {qtySelected > 0 ? (
                    <div className="flex items-center justify-between border border-accent/30 rounded px-1.5 py-1">
                      <button 
                        onClick={() => handleDecrement(p.id)} 
                        className="text-accent font-bold px-2 py-0.5 text-xs hover:bg-background rounded"
                      >
                        -
                      </button>
                      <span className="text-xs font-semibold text-primary">{qtySelected}</span>
                      <button 
                        onClick={() => handleIncrement(p)} 
                        disabled={qtySelected >= maxSelect}
                        className="text-accent font-bold px-2 py-0.5 text-xs hover:bg-background rounded disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleIncrement(p)}
                      disabled={maxSelect <= 0}
                      className="w-full text-center text-[10px] uppercase font-bold tracking-wider py-1.5 border border-border hover:border-accent rounded text-primary transition-all disabled:opacity-40"
                    >
                      {maxSelect <= 0 ? 'Unavailable / Maxed' : 'Select'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Right Panel */}
      <div className="lg:col-span-1 lg:sticky lg:top-24 bg-surface border border-border p-6 rounded-lg space-y-6">
        <h4 className="text-lg font-display font-medium text-primary border-b border-border pb-3">
          Your Custom Bundle
        </h4>

        {selectedProducts.length === 0 ? (
          <div className="py-8 text-center text-muted font-light text-sm">
            Select items from the list to build your custom crystal set.
          </div>
        ) : (
          <div className="space-y-4">
            <ul className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {selectedProducts.map(p => (
                <li key={p.id} className="flex justify-between items-center text-xs text-primary bg-background p-2 border border-border rounded">
                  <span className="truncate pr-2 font-medium">{p.name} <span className="text-accent font-bold">x{p.quantity}</span></span>
                  <span className="font-bold flex-shrink-0">₹{p.price * p.quantity}</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-xs text-muted font-light">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discountInfo.percent > 0 && (
                <div className="flex justify-between text-xs text-accent font-semibold">
                  <span>Bundle Discount ({discountInfo.percent * 100}%)</span>
                  <span>-₹{discountInfo.amount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-primary border-t border-border pt-2">
                <span>Total Price</span>
                <span>₹{discountInfo.finalTotal}</span>
              </div>
            </div>

            <Button 
              onClick={handleAddBundle}
              variant="gold"
              className="w-full text-xs py-3"
            >
              Add Bundle To Cart
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BundleBuilder;
