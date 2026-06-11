import React, { useContext, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import { CartContext } from '../context/CartContext';
import { products } from '../data/products';
import { Plus, Minus } from 'lucide-react';

const Product = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [activeTab, setActiveTab] = useState('philosophy');
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const categoryRoutes = {
    'Crystals': '/shop-crystals',
    'Gemstones': '/shop-gems',
    'Bracelets': '/shop-jewellery',
    'Pendants': '/shop-jewellery',
    'Utility & Decor': '/shop-utility',
  };
  // Find the product from our products data
  const product = products.find(p => p.id === id);
  const discountPercentage = product?.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  if (!product) {
    return (
      <Section className="min-h-[70vh] flex items-center justify-center">
        <Container className="text-center">
          <h2 className="text-3xl font-display text-primary mb-4">Object Not Found</h2>
          <p className="text-muted mb-8 font-light">The tool you are looking for does not exist or has been retired.</p>
          <Button to="/shop-crystals" variant="primary">Return to Collection</Button>
        </Container>
      </Section>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleIncrement = () => {
    if (quantity < 9) setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  // Generate unique background gradient styling based on name to make it look premium
  const getPlaceholderStyle = (productName) => {
    const hash = productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hues = [24, 36, 45, 180, 280, 340];
    const baseHue = hues[hash % hues.length];
    return {
      background: `linear-gradient(135deg, #FAF9F6 0%, #F4F1EA 50%, #EAE5D9 100%)`,
    };
  };

  const images = product.images && product.images.length > 0 ? product.images : [];
  const mainImage = images[selectedImageIndex] || null;

  return (
    <Section className="min-h-[85vh] bg-background pt-32">
      <Container>
        {/* Breadcrumb navigation */}
        <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-muted mb-12 font-bold font-body">
          <Link to="/" className="hover:text-primary transition-colors">Ritualist</Link>
          <span>/</span>
          <Link to={categoryRoutes[product.category] || '/shop-crystals'} className="hover:text-primary transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="text-primary">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Left: Interactive Media Column */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Main Image */}
            <div className="w-full max-w-md">
              <div 
                style={!mainImage ? getPlaceholderStyle(product.name) : {}}
                className="w-full aspect-[3/4] border border-border bg-[#F8F5EF] flex flex-col items-center justify-center relative group overflow-hidden mb-4"
              >
                {mainImage ? (
                  <img 
                    src={mainImage} 
                    alt={product.name} 
                    className="w-full h-full object-contain p-2 transition-all duration-500"
                  />
                ) : (
                  <>
                    <div className="w-32 h-32 rounded-full border border-accent/20 flex items-center justify-center relative animate-pulse-slow">
                      <div className="absolute inset-4 rounded-full border border-accent/15"></div>
                      <div className="absolute inset-8 rounded-full border border-accent/10"></div>
                      <span className="font-display text-accent text-3xl font-light tracking-[0.2em] uppercase">
                        {product.name.charAt(0)}
                      </span>
                    </div>
                  </>
                )}

                {product.stamp && (
                  <div className="absolute top-6 left-6 bg-primary text-background px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] font-bold z-10">
                    {product.stamp}
                  </div>
                )}
              </div>

              {/* Thumbnail Row — real images, clickable */}
              {images.length > 1 && (
                <div className="grid grid-cols-3 gap-3">
                  {images.map((imgSrc, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`aspect-square bg-[#F8F5EF] border overflow-hidden transition-all duration-300 ${
                        selectedImageIndex === idx
                          ? 'border-accent ring-1 ring-accent'
                          : 'border-border hover:border-accent/60'
                      }`}
                    >
                      <img
                        src={imgSrc}
                        alt={`${product.name} view ${idx + 1}`}
                        className="w-full h-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Details & Operations Column */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <span className="text-[10px] uppercase tracking-[0.3em] text-accent mb-4 font-bold font-body">{product.category}</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display text-primary mb-4 leading-[1.1] font-medium">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mb-8">
              {product.originalPrice && (
                <span className="text-xl text-muted font-light font-body line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
              )}
              <span className="text-2xl text-primary font-medium font-body">₹{product.price.toLocaleString('en-IN')}</span>
              {discountPercentage > 0 && (
                <span className="text-sm font-bold tracking-widest text-background bg-primary px-2 py-1 rounded-sm ml-2">-{discountPercentage}% OFF</span>
              )}
            </div>
            
            <p className="text-muted leading-relaxed font-light font-body text-base mb-8">
              {product.description}
            </p>

            <div className="flex items-center gap-6 mb-8">
              {/* Quantity Selector */}
              <div className="flex items-center border border-border bg-surface px-4 py-3">
                <button onClick={handleDecrement} className="text-primary hover:text-accent transition-colors"><Minus className="w-4 h-4" /></button>
                <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
                <button onClick={handleIncrement} className="text-primary hover:text-accent transition-colors"><Plus className="w-4 h-4" /></button>
              </div>

              <Button 
                onClick={handleAddToCart} 
                variant="primary" 
                className={`flex-grow py-4 uppercase tracking-[0.2em] font-semibold text-xs transition-all duration-300 ${added ? 'bg-[#d4b584]' : ''}`}
              >
                {added ? 'Added to Cart' : 'Add to Collection'}
              </Button>
            </div>

            {/* Interactive Tabs */}
            <div className="mt-8 border-b border-border flex space-x-8 mb-6">
              <button 
                onClick={() => setActiveTab('philosophy')}
                className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 relative ${activeTab === 'philosophy' ? 'text-primary' : 'text-muted hover:text-primary'}`}
              >
                Philosophy
                {activeTab === 'philosophy' && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent"></div>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('specifications')}
                className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 relative ${activeTab === 'specifications' ? 'text-primary' : 'text-muted hover:text-primary'}`}
              >
                Specifications
                {activeTab === 'specifications' && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent"></div>
                )}
              </button>
            </div>

            <div className="text-muted font-light leading-relaxed text-sm font-body min-h-[120px]">
              {activeTab === 'philosophy' ? (
                <div className="space-y-4">
                  <p className="italic text-primary border-l-2 border-accent pl-4">{product.philosophy}</p>
                  <p>{product.details}</p>
                  <div className="p-4 bg-surface mt-4 text-xs">
                    <strong>Ritual recommendation:</strong> {product.usage}
                  </div>
                  {product.chakraColor && (
                    <div className="mt-6 flex items-start space-x-4 bg-surface p-4 border border-border">
                      <div 
                        className="w-4 h-4 rounded-full mt-0.5 shrink-0" 
                        style={{ backgroundColor: product.chakraColor }}
                      ></div>
                      <div>
                        <p className="font-bold text-primary uppercase tracking-widest text-[10px] mb-1">
                          {product.chakra} Alignment
                        </p>
                        <p className="text-xs text-muted/80 leading-relaxed">{product.effect}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <ul className="space-y-4 text-xs">
                  <li className="flex justify-between border-b border-border pb-3">
                    <span className="uppercase tracking-[0.15em] text-muted/80 font-bold">Origin Country</span>
                    <span className="text-primary font-medium">{product.origin}</span>
                  </li>
                  <li className="flex justify-between border-b border-border pb-3">
                    <span className="uppercase tracking-[0.15em] text-muted/80 font-bold">Primary Alignment</span>
                    <span className="text-primary font-medium">{product.chakra}</span>
                  </li>
                  <li className="flex justify-between border-b border-border pb-3">
                    <span className="uppercase tracking-[0.15em] text-muted/80 font-bold">Material Integrity</span>
                    <span className="text-primary font-medium">100% Sourced Naturally</span>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default Product;
