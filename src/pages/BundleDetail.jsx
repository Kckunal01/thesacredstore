import React, { useContext, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ProductsContext } from '../context/ProductsContext';
import { CartContext } from '../context/CartContext';
import { bundles, getDynamicBundles } from '../data/bundles';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';

const BundleDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products } = useContext(ProductsContext);
  const { addToCart } = useContext(CartContext);

  // Find bundle config
  const bundle = useMemo(() => {
    return getDynamicBundles(products).find(b => b.slug === slug);
  }, [slug, products]);

  // Find matching items from Products Context
  const matchedProducts = useMemo(() => {
    if (!bundle) return [];
    return bundle.productNames.map(name => {
      return products.find(p => p.name.toLowerCase() === name.toLowerCase());
    }).filter(Boolean);
  }, [bundle, products]);

  // Calculate pricing
  const pricing = useMemo(() => {
    const componentSubtotal = matchedProducts.reduce((sum, p) => sum + p.price, 0);
    const finalPrice = bundle?.price || componentSubtotal;
    const originalPrice = bundle?.originalPrice || componentSubtotal;
    const savings = Math.max(0, originalPrice - finalPrice);
    const percent = originalPrice > 0 ? (savings / originalPrice) : 0;
    return { subtotal: originalPrice, percent, savings, finalPrice };
  }, [matchedProducts, bundle]);

  // Dynamic cover image
  const coverImage = bundle?.imageUrl || bundle?.uniqueCover || matchedProducts[0]?.images?.[0] || matchedProducts[0]?.image_url;

  if (!bundle) {
    return (
      <div className="py-24 text-center">
        <p className="text-muted mb-4">Bundle not found.</p>
        <Link to="/bundles" className="text-accent underline text-sm">Back to All Bundles</Link>
      </div>
    );
  }

  // Combine bundle as a single product to add to cart
  const handleAddEntireBundle = () => {
    if (matchedProducts.length === 0) return;

    const bundleProduct = {
      id: `bundle_${bundle.id}`,
      name: bundle.name, // Keep only its bundle name and omit individual products list
      price: pricing.finalPrice,
      originalPrice: pricing.subtotal,
      images: [coverImage],
      stock: 1,
      category: 'Bundles',
      description: bundle.description,
      isBundle: true,
      quantity: 1
    };

    addToCart(bundleProduct, 1);
    navigate('/checkout');
  };

  return (
    <div className="w-full bg-background min-h-screen py-12">
      <Container>
        <div className="mb-6">
          <Link to="/bundles" className="text-xs text-muted hover:text-accent transition-colors">
            &larr; Back to All Bundles
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Panel: Cover image & benefits */}
          <div className="space-y-8">
            <div className="aspect-[4/3] w-full bg-surface border border-border overflow-hidden rounded-lg">
              <img 
                src={coverImage} 
                alt={bundle.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Short synergy / philosophy section */}
            <div className="bg-surface border border-border p-5 rounded-lg space-y-4">
              <h4 className="text-xs uppercase tracking-widest text-[#ffbd59] font-bold">Energetic Synergy &amp; Philosophy</h4>
              <div className="space-y-4">
                {matchedProducts.map((p, idx) => (
                  <div key={idx} className="border-b border-border/30 pb-2 last:border-0">
                    <span className="block font-semibold text-accent text-sm mb-1 uppercase tracking-wider">
                      {p.name}
                    </span>
                    <p className="text-xs text-muted leading-relaxed font-light">
                      {p.philosophy || "Aligns energy flows within the aura center to restore calm balance."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Description & Pricing Summary */}
          <div className="space-y-8 lg:sticky lg:top-24">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-medium text-primary mb-3">
                {bundle.name}
              </h1>
              <p className="text-base text-muted font-light leading-relaxed">
                {bundle.description}
              </p>
            </div>

            {/* Included individual products */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-wider text-muted/80 font-bold">Included In This Bundle:</h3>
              <div className="space-y-3">
                {matchedProducts.map(p => (
                  <div key={p.id} className="flex items-center gap-4 bg-surface border border-border p-3 rounded">
                    <div className="w-12 h-12 bg-background flex-shrink-0 rounded overflow-hidden">
                      <img src={p.images?.[0] || p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-xs font-semibold text-primary truncate">{p.name}</h4>
                      <p className="text-[10px] text-muted">{p.category}</p>
                    </div>
                    <span className="text-xs font-bold text-primary">₹{p.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Details */}
            <div className="bg-surface border border-border p-6 rounded-lg space-y-4">
              <h3 className="text-sm font-display font-medium text-primary border-b border-border pb-2">
                Bundle Price Summary
              </h3>
              <div className="space-y-2 text-xs text-muted">
                <div className="flex justify-between">
                  <span>Subtotal (Individual Items)</span>
                  <span>₹{pricing.subtotal}</span>
                </div>
                {pricing.percent > 0 && (
                  <div className="flex justify-between text-accent font-semibold">
                    <span>Bundle Discount ({Math.round(pricing.percent * 100)}%)</span>
                    <span>-₹{pricing.savings}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-primary border-t border-border pt-2">
                  <span>Final Bundle Total</span>
                  <span>₹{pricing.finalPrice}</span>
                </div>
              </div>

              <Button 
                onClick={handleAddEntireBundle}
                variant="gold"
                className="w-full py-3 text-xs"
              >
                Add Entire Bundle
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default BundleDetail;
