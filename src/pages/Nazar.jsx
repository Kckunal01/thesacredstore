import React, { useState } from 'react';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { resolveProductImages, resolveProductImage } from '../utils/productImageResolver';
import ProductRecommendations from '../components/ProductRecommendations';

// Static product data for Nazar — The Rakhi of Protection
const staticProduct = {
  id: 'rakhi-nazar',
  slug: 'nazar-the-rakhi-of-protection',
  name: "Nazar — The Rakhi of Protection",
  price: 1999,
  originalPrice: 2499,
  category: 'Limited',
  stamp: null,
  description: 'A beautiful Rakhi crafted to ward off negativity and provide protection.',
  philosophy: 'Protection and positivity.',
  details: 'Made with premium crystals.',
  usage: 'Wear it on auspicious occasions.',
  chakra: 'Root',
  chakraColor: '#ff0000',
  effect: 'Grounding and protective.',
};

export default function NazarProductPage() {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const product = staticProduct;

  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addCertification, setAddCertification] = useState(false);

  const discountPercentage = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    const itemToAdd = { ...product, certification: addCertification, certificationPrice: 100 };
    addToCart(itemToAdd, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleIncrement = () => { if (quantity < 9) setQuantity(q => q + 1); };
  const handleDecrement = () => { if (quantity > 1) setQuantity(q => q - 1); };

  const images = resolveProductImages(product);
  const mainImage = images[selectedImageIndex] || null;

  return (
    <Section className="min-h-[85vh] bg-background pt-32">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full max-w-md">
              <div
                style={!mainImage ? { background: 'linear-gradient(135deg, #FEFBF1 0%, #FEFBF1 100%)' } : {}}
                className="w-full aspect-[3/4] border border-border bg-[#FEFBF1] flex flex-col items-center justify-center relative group overflow-hidden mb-4"
              >
                {mainImage ? (
                  <img src={mainImage} alt={product.name} loading="lazy" decoding="async" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <span className="text-xl font-bold">{product.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-3 gap-3">
                  {images.map((imgSrc, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`aspect-square bg-[#FEFBF1] border overflow-hidden transition-all duration-300 ${selectedImageIndex === idx ? 'border-accent ring-1 ring-accent' : 'border-border hover:border-accent/60'}`}
                    >
                      <img src={imgSrc} alt={`${product.name} view ${idx + 1}`} loading="lazy" decoding="async" className="w-full h-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-5 flex flex-col justify-center">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#000000] mb-4 font-bold font-body">{product.category}</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display text-primary mb-4 leading-[1.1] font-medium">{product.name}</h1>
            <div className="flex items-center space-x-4 mb-8">
              {product.originalPrice && (
                <span className="text-xl text-muted font-light line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
              )}
              <span className="text-2xl text-primary font-medium">₹{product.price.toLocaleString('en-IN')}</span>
              {discountPercentage > 0 && (
                <span className="text-sm font-bold tracking-widest text-background bg-primary px-2 py-1 rounded-sm ml-2">-{discountPercentage}% OFF</span>
              )}
            </div>
            <p className="text-muted leading-relaxed font-light text-base mb-8">{product.description}</p>
            <div className="mb-6 bg-surface p-4 border border-border">
              <label className="flex items-start cursor-pointer">
                <div className="flex-shrink-0 mt-1">
                  <input type="checkbox" checked={addCertification} onChange={e => setAddCertification(e.target.checked)} className="w-4 h-4 text-accent bg-background border-border rounded focus:ring-accent focus:ring-2" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-bold text-primary mb-1">Add Authenticity Certification (+₹100)</p>
                  <p className="text-xs text-muted">Includes a premium printed authenticity certificate.</p>
                </div>
              </label>
            </div>
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center border border-border bg-surface px-4 py-3">
                <button onClick={handleDecrement} className="text-primary hover:text-accent" disabled={quantity>=9}>
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
                <button onClick={handleIncrement} className="text-primary hover:text-accent" disabled={quantity>=9}>
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <Button onClick={handleAddToCart} variant="primary" className={`flex-grow py-4 uppercase tracking-[0.2em] font-semibold text-xs ${added ? 'bg-[#FFBD59]' : ''}`}> 
                {added ? 'Added to Cart' : 'Add to Collection'}
              </Button>
            </div>
            {/* Simple placeholder tabs */}
            <div className="mt-8 border-b border-border flex space-x-8 mb-6">
              <button className="pb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Philosophy</button>
            </div>
            <div className="text-muted font-light leading-relaxed text-sm min-h-[120px]">
              <p className="italic text-primary border-l-2 border-accent pl-4">{product.philosophy}</p>
              <p>{product.details}</p>
            </div>
          </div>
        </div>
        <ProductRecommendations currentProduct={product} products={[]} />
      </Container>
    </Section>
  );
}
