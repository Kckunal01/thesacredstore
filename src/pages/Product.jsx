import React, { useContext, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import { CartContext } from '../context/CartContext';
import { Plus, Minus, X, Play } from 'lucide-react';
import { ProductsContext } from '../context/ProductsContext';
import ProductRecommendations from '../components/ProductRecommendations';
// Import necessary Supabase helpers
// Supabase helpers are no longer needed for stock; keep only waitlist helpers
import { checkStockRequestExists, createStockRequest } from '../lib/supabase';
import { resolveProductImages, resolveProductImage } from '../utils/productImageResolver';

// Helper to generate slug from product name
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^[-]+|[-]+$/g, '');
}

// Stock state will be defined inside the component


// Removed redundant stock map import

const Product = () => {
  const { id } = useParams();
  const { cart, addToCart } = useContext(CartContext);
  const { products } = useContext(ProductsContext);
  const [activeTab, setActiveTab] = useState('philosophy');
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [addCertification, setAddCertification] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [estimatedRange, setEstimatedRange] = useState('');
  const [loading, setLoading] = useState(false);

  // Find product by id (string comparison)
  const product = products.find(p => p.id?.toString() === id || p.db_id?.toString() === id || p.slug === id);
  // Derive stock, active status, and dbId from product data (provided by ProductsContext)
  const stock = product?.stock ?? null;
  const active = product?.active ?? true;
  const dbId = product?.db_id ?? null;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalSuccess, setModalSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);



  const discountPercentage = product?.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  // Delivery Estimator logic
  const handleCheckPin = async () => {
    // Sanitize input: keep only digits
    const sanitized = pin.replace(/\D/g, '').trim();
    if (sanitized.length !== 6) {
      setPinError('Please enter a valid 6-digit PIN code.');
      setEstimatedRange('');
      return;
    }
    // Update pin state with sanitized value
    setPin(sanitized);
    setPinError('');
    setLoading(true);
    // Use sanitized PIN for caching & API calls
    const effectivePin = sanitized;
    const cached = sessionStorage.getItem(`pin_${effectivePin}`);
    if (cached) {
      const info = JSON.parse(cached);
      applyDeliveryInfo(info);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${effectivePin}`);
      const data = await res.json();
      if (data[0].Status !== 'Success') throw new Error('API error');
      const post = data[0].PostOffice[0];
      const info = { city: post.District, state: post.State, district: post.District };
      sessionStorage.setItem(`pin_${effectivePin}`, JSON.stringify(info));
      applyDeliveryInfo(info);
    } catch (e) {
      setPinError('Delivery estimate unavailable. Please try again.');
      setEstimatedRange('');
    } finally {
      setLoading(false);
    }
  };

  const applyDeliveryInfo = (info) => {
    setDeliveryInfo(info);
    const delDays = getDeliveryDays(info);
    const now = new Date();
    const add = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
    const format = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    if (delDays.min === delDays.max) {
      setEstimatedRange(`${format(add(delDays.min))}`);
    } else {
      setEstimatedRange(`${format(add(delDays.min))} – ${format(add(delDays.max))}`);
    }
  };

  const getDeliveryDays = (info) => {
    const city = info.city.toLowerCase();
    const delhiNcr = ['new delhi', 'delhi'];
    const tier1 = ['mumbai', 'chennai', 'bangalore', 'hyderabad', 'pune', 'kochi'];
    const tier2 = ['jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'bhopal'];
    if (delhiNcr.includes(city)) return { min: 2, max: 3 };
    if (tier1.includes(city) || tier2.includes(city)) return { min: 3, max: 5 };
    return { min: 5, max: 7 };
  };

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

  const cartItem = cart.find(item => item.id === product.id && item.certification === addCertification);
  const cartQty = cartItem ? cartItem.quantity : 0;
  const isCartFull = cartQty >= 9;

  const handleAddToCart = () => {
    if (isCartFull) return;
    const itemToAdd = {
      ...product,
      certification: addCertification,
      certificationPrice: 100
    };
    addToCart(itemToAdd, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleIncrement = () => {
    if (quantity < 9 && (quantity + cartQty < 9)) setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const targetId = dbId || product.id;
      const exists = await checkStockRequestExists(targetId, email);
      if (exists) {
        setModalMessage("You've already requested a notification.");
        setModalSuccess(false);
      } else {
        await createStockRequest(targetId, email);
        setModalMessage("We'll notify you when this crystal is back in stock.");
        setModalSuccess(true);
        setEmail('');
      }
    } catch (err) {
      setModalMessage("Failed to submit request. Please try again.");
      setModalSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate unique background gradient styling based on name to make it look premium
  const getPlaceholderStyle = (productName) => {
    const hash = productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hues = [24, 36, 45, 180, 280, 340];
    const baseHue = hues[hash % hues.length];
    return {
      background: `linear-gradient(135deg, #FEFBF1 0%, #FEFBF1 50%, #FEFBF1 100%)`,
    };
  };

  const images = resolveProductImages(product);
  const mainImage = images[selectedImageIndex] || null;

  return (
    <Section className="min-h-[85vh] bg-background pt-32">
      <Container>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Left: Interactive Media Column */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Main Image */}
            <div className="w-full max-w-md">
              <div
                style={!mainImage ? getPlaceholderStyle(product.name) : {}}
                className="w-full aspect-[3/4] border border-border bg-[#FEFBF1] flex flex-col items-center justify-center relative group overflow-hidden mb-4"
              >
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.name}
                    loading="lazy" decoding="async" width="100%" height="auto"
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

                {product.stamp === 'Fresh' ? (
                  <div className="absolute top-4 left-4 bg-accent text-background px-4 py-2 text-[12px] uppercase tracking-widest font-bold rounded-md z-10">
                    FRESH
                  </div>
                ) : product.stamp === 'Sale' ? (
                  <div className="absolute top-4 left-4 bg-accent text-background px-4 py-2 text-[12px] uppercase tracking-widest font-bold rounded-md z-10">
                    SALE
                  </div>
                ) : product.stamp ? (
                  <div className="absolute top-4 left-4 bg-primary text-background px-4 py-2 text-[12px] uppercase tracking-widest font-bold rounded-md z-10">
                    {product.stamp}
                  </div>
                ) : null}
              </div>

              {/* Thumbnail Row — real images, clickable */}
              {images.length > 1 && (
                <div className="grid grid-cols-3 gap-3">
                  {images.map((imgSrc, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`aspect-square bg-[#FEFBF1] border overflow-hidden transition-all duration-300 ${selectedImageIndex === idx
                        ? 'border-accent ring-1 ring-accent'
                        : 'border-border hover:border-accent/60'
                        }`}
                    >
                      <img
                        src={imgSrc}
                        alt={`${product.name} view ${idx + 1}`}
                        loading="lazy" decoding="async" width="100%" height="auto"
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
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#000000] mb-4 font-bold font-body">{product.category}</span>
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

            {stock !== null && stock > 0 && active ? (
              <>
                {product.collection !== "Rakhi'26" && (
                  <div className="mb-6 bg-surface p-4 border border-border">
                    <label className="flex items-start cursor-pointer group">
                      <div className="flex-shrink-0 mt-1">
                        <input 
                          type="checkbox" 
                          checked={addCertification}
                          onChange={(e) => setAddCertification(e.target.checked)}
                          className="w-4 h-4 text-accent bg-background border-border rounded focus:ring-accent focus:ring-2 cursor-pointer"
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-bold text-primary mb-1">
                          Add Authenticity Certification (+₹100)
                        </p>
                        <p className="text-xs text-muted leading-relaxed font-light">
                          Includes a premium printed authenticity certificate for your crystal.
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                <div className="flex items-center gap-6 mb-8">
                  {/* Quantity Selector */}
                  <div className="flex items-center border border-border bg-surface px-4 py-3">
                    <button
                      onClick={handleDecrement}
                      className="text-primary hover:text-accent transition-colors"
                      disabled={isCartFull}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-semibold">{isCartFull ? 'Max' : quantity}</span>
                    <button
                      onClick={handleIncrement}
                      className="text-primary hover:text-accent transition-colors"
                      disabled={isCartFull}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {stock !== null && stock > 0 && stock <= 3 && (
                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest ml-2 font-body">
                      Only {stock} left!
                    </p>
                  )}
                  <Button
                    onClick={handleAddToCart}
                    variant="primary"
                    disabled={isCartFull}
                    className={`flex-grow py-4 uppercase tracking-[0.2em] font-semibold text-xs transition-all duration-300 ${added ? 'bg-[#FFBD59]' : ''} ${isCartFull ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {added ? 'Added to Cart' : isCartFull ? 'Limit Reached' : 'Add to Collection'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-4 mb-8">
                <div className="text-sm font-bold tracking-widest text-red-500 uppercase py-2">
                  Out of Stock
                </div>
                <Button
                  onClick={() => {
                    setIsModalOpen(true);
                    setModalMessage('');
                  }}
                  variant="primary"
                  className="w-full py-4 uppercase tracking-[0.2em] font-semibold text-xs"
                >
                  Notify Me When Available
                </Button>
              </div>
            )}

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
            </div>

            <div className="text-muted font-light leading-relaxed text-sm font-body min-h-[120px]">
              {product.collection === "Rakhi'26" ? (
                <div className="space-y-6">
                  <div>
                    <p className="font-bold text-primary uppercase tracking-widest text-[10px] mb-1">Crystal Constituents</p>
                    <p>{product.crystal_constituents}</p>
                  </div>
                  <div>
                    <p className="font-bold text-primary uppercase tracking-widest text-[10px] mb-1">Charm</p>
                    <p>{product.charm}</p>
                  </div>
                  <div>
                    <p className="font-bold text-primary uppercase tracking-widest text-[10px] mb-1">Feeling</p>
                    <p>{product.feeling}</p>
                  </div>
                  <div>
                    <p className="font-bold text-primary uppercase tracking-widest text-[10px] mb-1">Reason to Gift</p>
                    <p>{product.reason_to_gift}</p>
                  </div>
                  <div className="p-4 bg-surface mt-4 text-xs">
                    <p className="font-bold text-primary uppercase tracking-widest text-[10px] mb-2">Crystal & Charm Qualities</p>
                    <ul className="list-disc list-inside text-xs text-muted/80 space-y-2">
                      {product.crystal_charm_qualities?.split('\n').map((quality, idx) => (
                        <li key={idx} className="font-body">{quality}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="italic text-primary border-l-2 border-accent pl-4">{product.philosophy}</p>
                  <p>{product.details}</p>
                  <div className="p-4 bg-surface mt-4 text-xs"><strong>Ritual recommendation:</strong> {product.usage}</div>
                  {product.category === 'Specialised Crystals' ? (
                    <div className="mt-6 flex flex-col bg-surface p-4 border border-border">
                      <p className="font-bold text-primary uppercase tracking-widest text-[10px] mb-2">Crystal Composition</p>
                      <ul className="list-disc list-inside text-xs text-muted/80 space-y-1">
                        {["Green Aventurine", "Citrine", "Tiger's Eye", "Pyrite"].map((comp, idx) => (
                          <li key={idx} className="font-body">{comp}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    product.chakraColor && (
                      <div className="mt-6 flex items-start space-x-4 bg-surface p-4 border border-border">
                        <div className="w-4 h-4 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: product.chakraColor }}></div>
                        <div>
                          <p className="font-bold text-primary uppercase tracking-widest text-[10px] mb-1">{product.chakra} Alignment</p>
                          <p className="text-xs text-muted/80 leading-relaxed">{product.effect}</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>


            {/* Estimated Delivery Section (Moved below tabs) */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-[10px] uppercase tracking-widest text-[#000000] mb-2 font-bold font-body">Estimate Delivery</p>
              <div className="flex items-center gap-2 max-w-xs">
                <input
                  type="text"
                  maxLength={6}
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-background border border-border py-2 px-3 text-sm focus:outline-none focus:border-accent text-primary"
                  placeholder="Enter 6-digit PIN"
                />
                <button onClick={handleCheckPin} className="bg-primary hover:bg-[#FFBD59] hover:text-[#000000] text-background px-4 py-2 text-xs uppercase tracking-widest font-bold transition-colors">
                  {loading ? '...' : 'Go'}
                </button>
              </div>
              {pinError && <p className="text-xs text-red-500 mt-2 font-body">{pinError}</p>}
              {estimatedRange && <p className="text-xs text-accent mt-2 font-bold font-body">Delivers by {estimatedRange}</p>}
            </div>
          </div>
        </div>

        {/* Complete Your Ritual recommendations section (full container width below the columns) */}
        <ProductRecommendations currentProduct={product} products={products} />

      </Container>

      {/* Notify Waitlist Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-background border border-border max-w-md w-full p-8 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display text-2xl text-primary mb-2 uppercase tracking-wide">Waitlist Request</h3>
            <p className="text-xs text-muted mb-6 leading-relaxed">
              Register your email below. We'll send a notification once this {product.name} is back in stock.
            </p>
            {modalMessage ? (
              <div className="space-y-6 text-center py-4">
                <p className={`text-sm ${modalSuccess ? 'text-accent font-semibold' : 'text-primary'}`}>
                  {modalMessage}
                </p>
                <Button onClick={() => setIsModalOpen(false)} variant="primary" className="px-6 py-2 text-[10px]">
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-surface border border-border p-4 text-sm focus:outline-none focus:border-accent text-primary transition-colors font-body"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-4 text-xs font-semibold uppercase tracking-[0.2em]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Notify Me'}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </Section>
  );
};

export default Product;
