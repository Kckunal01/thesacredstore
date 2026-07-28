import React, { useContext, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ProductsContext } from '../context/ProductsContext';
import { CartContext } from '../context/CartContext';
import { getDynamicBundles } from '../data/bundles';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';

const BundleDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products, loading } = useContext(ProductsContext);
  const { addToCart } = useContext(CartContext);

  // Find bundle purely from DB (via getDynamicBundles)
  const bundle = useMemo(() => {
    return getDynamicBundles(products).find(b => b.slug === slug);
  }, [slug, products]);

  // includedProducts is already resolved inside getDynamicBundles
  const includedProducts = bundle?.includedProducts || [];

  // Pricing is fully calculated in getDynamicBundles
  const pricing = useMemo(() => {
    if (!bundle) return { subtotal: 0, finalPrice: 0, savings: 0, percent: 0 };
    const subtotal = bundle.originalPrice || 0;
    const finalPrice = bundle.price || subtotal;
    const savings = Math.max(0, subtotal - finalPrice);
    const percent = subtotal > 0 ? savings / subtotal : 0;
    return { subtotal, finalPrice, savings, percent };
  }, [bundle]);

  const coverImage = bundle?.imageUrl || bundle?.image_url || includedProducts[0]?.images?.[0] || '';

  // Loading state
  if (loading) {
    return (
      <div className="py-24 text-center">
        <p className="text-muted text-sm animate-pulse">Loading bundle…</p>
      </div>
    );
  }

  // Not found
  if (!bundle) {
    return (
      <div className="py-24 text-center">
        <p className="text-muted mb-4">Bundle not found.</p>
        <Link to="/bundles" className="text-accent underline text-sm">Back to All Bundles</Link>
      </div>
    );
  }

  const handleAddEntireBundle = () => {
    if (includedProducts.length === 0) return;
    const bundleProduct = {
      id: `bundle_${bundle.id}`,
      name: bundle.name,
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
          {/* Left Panel: Cover image & synergy */}
          <div className="space-y-8">
            <div className="aspect-[4/3] w-full bg-surface border border-border overflow-hidden rounded-lg">
              {coverImage ? (
                <img src={coverImage} alt={bundle.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted text-xs">No image</div>
              )}
            </div>


          </div>

          {/* Right Panel: Description, Products & Pricing */}
          <div className="space-y-8 lg:sticky lg:top-24">
            <div>
              {bundle.stamp && (
                <span className="inline-block text-[9px] uppercase tracking-widest font-bold bg-accent text-white px-2 py-0.5 mb-2">
                  {bundle.stamp}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-display font-medium text-primary mb-3">
                {bundle.name}
              </h1>
              <p className="text-base text-muted font-light leading-relaxed">
                {bundle.description || 'A thoughtfully curated crystal bundle.'}
              </p>
              <div className="mt-4 p-4 bg-surface border border-border/60 rounded">
                <span className="text-[10px] uppercase tracking-wider text-accent font-semibold block mb-1">Handpicked by Sacred Store</span>
                <p className="text-xs text-muted font-light leading-relaxed">A thoughtfully curated collection designed to work beautifully together.</p>
              </div>
            </div>

            {/* Included Products */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-wider text-muted/80 font-bold">Included In This Bundle:</h3>
              {includedProducts.length > 0 ? (
                <div className="space-y-3">
                  {includedProducts.map(p => {
                    const specificDesc = bundle.bundle_product_descriptions?.[p.db_id] || bundle.bundle_product_descriptions?.[p.id];
                    return (
                      <div key={p.db_id || p.id} className="flex flex-col bg-surface border border-border p-3 rounded space-y-2">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-background flex-shrink-0 rounded overflow-hidden">
                            <img src={p.images?.[0] || p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h4 className="text-xs font-semibold text-primary truncate">{p.name}</h4>
                            <p className="text-[10px] text-muted">{p.category}</p>
                          </div>
                          <span className="text-xs font-bold text-primary">₹{p.price}</span>
                        </div>
                        {specificDesc && (
                          <p className="text-[11px] text-accent italic pl-16 border-l-2 border-accent/20">
                            {specificDesc}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-surface border border-border p-4 rounded text-xs text-muted italic text-center">
                  Product details for this bundle are being updated. Check back soon.
                </div>
              )}
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
                disabled={includedProducts.length === 0}
              >
                {includedProducts.length === 0 ? 'Products Unavailable' : 'Add Entire Bundle'}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default BundleDetail;
