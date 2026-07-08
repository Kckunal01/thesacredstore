import React, { useContext, useState, useMemo } from 'react';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { ProductsContext } from '../context/ProductsContext';
import { getCartRecommendations } from '../lib/recommendations';
import ProductCard from '../components/ui/ProductCard';
// Keep only stock map fetch for pre‑checkout validation
import { getProductStockMap } from '../lib/supabaseProducts';


const loadRazorpayScript = () =>
  new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// Helper to generate placeholder style (unchanged)
function getPlaceholderStyle(name) {
  const hash = Array.from(name || '').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  return { background: `hsl(${hue}, 25%, 95%)` };
}

// Simple slugify (kept for client‑side validation only)
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-)$/g, '');
}

const Checkout = () => {
  const { cart, getCartTotal, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const { products } = useContext(ProductsContext);
  
  const recommendations = useMemo(
    () => getCartRecommendations(cart, products),
    [cart, products]
  );

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', address: '',
    city: '', state: '', pinCode: '', phone: '',
  });

  // Coupon states
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

  const totalOriginal = cart.reduce((acc, item) => acc + (item.originalPrice || item.price) * item.quantity, 0);
  const totalDiscount = totalOriginal - getCartTotal();

  // Coupon calculations
  const subtotalAfterOriginalDiscount = getCartTotal();
  const couponDiscountAmount = Math.round((subtotalAfterOriginalDiscount * discountPercent) / 100);
  const finalTotalAmount = subtotalAfterOriginalDiscount - couponDiscountAmount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ----------- POST‑PAYMENT HANDLER (backend) ------------
  const completeOrderOnServer = async (razorpayResponse) => {
    try {
      const res = await fetch('/api/complete-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayResponse,
          formData,
          cart,
          couponCode: appliedCoupon || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Order completion failed');
      }

      const { orderId: returnedOrderId } = await res.json();
      setOrderId(returnedOrderId);
      setStep(3);
      clearCart();
    } catch (err) {
      console.error('Backend order completion error:', err);
      alert('Your payment succeeded but we could not finalize the order. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // ---- Stock validation (client side) ----
    const stockMap = await getProductStockMap();
    const issues = [];
    for (const item of cart) {
      const slug = item.slug || slugify(item.name);
      const info = stockMap[slug];
      if (!info || !info.active) {
        issues.push(`${item.name} is currently out of stock.`);
      } else if (info.stock < item.quantity) {
        issues.push(`${item.name} – requested ${item.quantity}, available ${info.stock}`);
      }
    }
    if (issues.length > 0) {
      alert('Some items in your cart are no longer available:\n\n' + issues.map(i => `• ${i}`).join('\n') + '\n\nPlease update your cart and try again.');
      setIsProcessing(false);
      return;
    }

    const razorpayReady = await loadRazorpayScript();
    if (!razorpayReady) {
      alert('Razorpay SDK failed to load. Are you online?');
      setIsProcessing(false);
      return;
    }

    let orderData;
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotalAmount }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to initialise payment');
      }
      orderData = await res.json();
    } catch (err) {
      console.error('Create order error:', err);
      alert('Failed to connect to payment gateway: ' + err.message);
      setIsProcessing(false);
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'The Sacred Store',
      description: 'Order Payment',
      image: 'https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?q=80&w=200&auto=format&fit=crop',
      order_id: orderData.order_id,
      handler: async function (response) {
        try {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          if (!verifyRes.ok) throw new Error('Payment verification failed.');
          await completeOrderOnServer(response);
        } catch (err) {
          console.error('Verification error:', err);
          alert('Payment verification error.');
          setIsProcessing(false);
        }
      },
      prefill: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        contact: formData.phone,
      },
      theme: { color: '#FFBD59' },
      modal: {
        ondismiss: function () {
          alert('Payment was cancelled.');
          setIsProcessing(false);
        },
      },
    };

    // Guard: ensure Razorpay key is set
    if (!options.key) {
      alert('Razorpay key is missing. Please configure VITE_RAZORPAY_KEY_ID.');
      setIsProcessing(false);
      return;
    }
    const paymentObject = new window.Razorpay(options);
    paymentObject.on('payment.failed', function (response) {
      alert('Payment failed. ' + response.error.description);
      setIsProcessing(false);
    });
    paymentObject.open();
  };

  const handleApplyCoupon = async () => {
    if (!couponInput) {
      setCouponMessage('Enter a coupon code');
      return;
    }
    try {
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode: couponInput,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Invalid coupon');
      }

      setDiscountPercent(data.discount_percent || 0);
      setAppliedCoupon(couponInput);
      setCouponMessage(`Coupon applied: ${data.discount_percent}% off`);
    } catch (err) {
      setCouponMessage(err.message);
      setDiscountPercent(0);
      setAppliedCoupon('');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponInput('');
    setAppliedCoupon('');
    setDiscountPercent(0);
    setCouponMessage('');
  };

  // ----- UI RENDERING -----
  return (
    <>
      {step === 3 ? (
        <Section className="min-h-[80vh] flex items-center justify-center bg-background pt-32">
          <Container className="text-center max-w-lg">
            <div className="w-16 h-16 rounded-full border border-accent flex items-center justify-center mx-auto mb-8">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFBD59" strokeWidth="2">
                <path d="M5 12l5 5l10 -10" />
              </svg>
            </div>
            <h2 className="text-4xl font-display text-primary mb-4">Order Placed.</h2>
            <p className="text-muted leading-relaxed mb-6 font-light font-body">
              Thank you for making space for meaning. Order <strong className="text-primary font-semibold font-display">{orderId}</strong> has been created.
            </p>
            <div className="bg-surface border border-border p-6 mb-8 text-left space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-[#000000] font-bold">Important logistics information</span>
              <p className="text-xs text-muted leading-relaxed font-body">
                Your energy tool is being packaged carefully and cleansed with incense before shipping. You can track its shipment status directly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <Button to={`/track-order?id=${orderId}`} variant="primary">Track Package</Button>
              <Button to="/" variant="secondary">Return Home</Button>
            </div>
          </Container>
        </Section>
      ) : (
        <Section className="min-h-[80vh] bg-background pt-32">
          <Container>
            <SectionHeader
              eyebrow="Shopping bag"
              title={step === 1 ? 'Your Cart' : 'Checkout details'}
              description={
                step === 1
                  ? 'Verify the weight, intention, and quantity of your chosen tools before proceeding.'
                  : 'All shipments are handled with premium care and fully insured packaging.'
              }
            />

            {cart.length === 0 && step === 1 ? (
              <div className="text-center py-24 bg-surface border border-border max-w-2xl mx-auto flex flex-col items-center justify-center p-8 mt-12">
                <div className="w-12 h-12 rounded-full border border-accent/20 flex items-center justify-center mb-6">
                  <span className="text-accent text-xs">∅</span>
                </div>
                <p className="text-muted mb-8 font-light font-body">Your ritual cart is currently empty.</p>
                <Button to="/shop-crystals" variant="primary">Explore Collection</Button>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 mt-12">
                <div className="w-full lg:w-2/3">
                  {step === 1 ? (
                    <div className="space-y-6">
                      {cart.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-surface border border-border gap-6">
                          <div className="flex items-center space-x-6">
                            <div style={getPlaceholderStyle(item.name)} className="w-20 h-24 border border-border flex items-center justify-center text-xs uppercase tracking-widest text-[#000000] font-semibold font-display">
                              {item.images && item.images.length > 0 ? (
                                <img
                                  src={item.images[0]}
                                  alt={item.name}
                                  loading="lazy"
                                  decoding="async"
                                  width="80"
                                  height="96"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                item.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <span className="text-[10px] uppercase tracking-widest text-[#000000] mb-1 block font-bold font-body">{item.category}</span>
                              <h4 className="font-display text-xl text-primary font-medium">{item.name}</h4>
                              <span className="text-sm text-muted font-light font-body">₹{item.price.toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between w-full sm:w-auto space-x-6 sm:space-x-12 border-t sm:border-t-0 pt-4 sm:pt-0 border-border">
                            <div className="flex items-center border border-border bg-background">
                              <button className="px-3 py-2 hover:bg-surface text-primary" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                              <span className="px-4 py-2 text-xs font-semibold text-primary">{item.quantity}</span>
                              <button className="px-3 py-2 hover:bg-surface text-primary" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                            </div>
                            <div className="text-right">
                              <button onClick={() => removeFromCart(item.id)} className="text-[10px] uppercase tracking-[0.2em] text-[#000000] hover:text-primary transition-colors font-bold font-body">Remove</button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Coupon Section (Cart/Step 1) */}
                      <div className="p-6 bg-surface border border-border space-y-4">
                        <span className="text-[10px] uppercase tracking-widest text-[#000000] font-bold block">Apply Coupon</span>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            placeholder="COUPON CODE"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.trim().toUpperCase())}
                            className="bg-background border border-border p-3 text-primary focus:outline-none focus:border-accent font-body text-xs uppercase tracking-widest w-full sm:max-w-xs"
                          />
                          {appliedCoupon ? (
                            <button
                              type="button"
                              onClick={handleRemoveCoupon}
                              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white text-[10px] uppercase tracking-widest font-bold transition-colors"
                            >
                              Remove Coupon
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleApplyCoupon}
                              className="px-6 py-3 bg-[#000000] hover:bg-[#FFBD59] text-white hover:text-black text-[10px] uppercase tracking-widest font-bold transition-colors"
                            >
                              Apply Coupon
                            </button>
                          )}
                        </div>
                        {couponMessage && (
                          <p className="text-xs font-semibold" style={{ color: appliedCoupon ? '#28a745' : '#dc3545' }}>
                            {couponMessage}
                          </p>
                        )}
                      </div>

                      {/* Recommendations section */}
                      {recommendations && recommendations.length > 0 && (
                        <div className="pt-12 border-t border-border mt-12">
                          <h3 className="text-xl font-display font-medium text-primary mb-6 tracking-widest uppercase">
                            FREQUENTLY BOUGHT TOGETHER
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {recommendations.map(product => (
                              <div key={product.id} className="scale-95 transform transition-transform duration-300 hover:scale-100">
                                <ProductCard {...product} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-8 border-t border-border mt-8">
                        <Link to="/shop-crystals" className="text-xs uppercase tracking-[0.2em] text-[#000000] hover:text-primary transition-colors font-semibold font-body">← Continue Shopping</Link>
                        <Button onClick={() => setStep(2)} variant="primary">Proceed to Shipping</Button>
                      </div>
                    </div>
                  ) : (
                    <form id="checkout-form" onSubmit={handleCheckout} className="bg-surface border border-border p-8 md:p-10 space-y-8">
                      <div className="flex justify-between items-center border-b border-border pb-4">
                        <h3 className="font-display text-2xl text-primary font-medium">Shipping &amp; Delivery</h3>
                        <button type="button" onClick={() => setStep(1)} className="text-[10px] uppercase tracking-widest text-[#000000] hover:text-primary font-bold font-body">← Edit Cart</button>
                      </div>

                      {/* Display Coupon Details without inputs */}
                      {appliedCoupon && (
                        <div className="p-4 bg-background border border-accent/20 flex justify-between items-center text-xs font-semibold text-primary">
                          <span>Applied Coupon: {appliedCoupon}</span>
                          <span className="text-accent">-{discountPercent}% OFF</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2 md:col-span-1">
                          <label className="block text-xs uppercase tracking-widest text-muted mb-2 font-bold font-body">First Name</label>
                          <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full bg-background border border-border p-4 text-primary focus:outline-none focus:border-accent font-body text-sm" required />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <label className="block text-xs uppercase tracking-widest text-muted mb-2 font-bold font-body">Last Name</label>
                          <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full bg-background border border-border p-4 text-primary focus:outline-none focus:border-accent font-body text-sm" required />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                          <label className="block text-xs uppercase tracking-widest text-muted mb-2 font-bold font-body">Email Address</label>
                          <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-background border border-border p-4 text-primary focus:outline-none focus:border-accent font-body text-sm" required />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <label className="block text-xs uppercase tracking-widest text-muted mb-2 font-bold font-body">Phone Number</label>
                          <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-background border border-border p-4 text-primary focus:outline-none focus:border-accent font-body text-sm" required />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                          <label className="block text-xs uppercase tracking-widest text-muted mb-2 font-bold font-body">Delivery Address</label>
                          <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-background border border-border p-4 text-primary focus:outline-none focus:border-accent font-body text-sm" required />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                          <label className="block text-xs uppercase tracking-widest text-muted mb-2 font-bold font-body">City / Town</label>
                          <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-background border border-border p-4 text-primary focus:outline-none focus:border-accent font-body text-sm" required />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                          <label className="block text-xs uppercase tracking-widest text-muted mb-2 font-bold font-body">State</label>
                          <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full bg-background border border-border p-4 text-primary focus:outline-none focus:border-accent font-body text-sm" required />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                          <label className="block text-xs uppercase tracking-widest text-muted mb-2 font-bold font-body">Postal PIN Code</label>
                          <input type="text" name="pinCode" value={formData.pinCode} onChange={handleInputChange} className="w-full bg-background border border-border p-4 text-primary focus:outline-none focus:border-accent font-body text-sm" required />
                        </div>
                      </div>

                      <Button type="submit" variant="primary" className="w-full py-4 text-xs font-semibold uppercase tracking-[0.2em]" disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : 'Pay with Razorpay'}
                      </Button>
                    </form>
                  )}
                </div>

                <div className="w-full lg:w-1/3">
                  <div className="bg-[#FEFBF1]/40 backdrop-blur-md border border-accent/20 p-8 md:p-10 sticky top-24 space-y-8 rounded-lg shadow-sm">
                    <h3 className="font-display text-3xl text-primary font-semibold border-b border-border/80 pb-4 tracking-wide">Order Summary</h3>
                    
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm font-body text-primary">
                          <span className="truncate max-w-[180px] font-medium">
                            {item.name} <strong className="text-accent ml-1">x{item.quantity}</strong>
                          </span>
                          <span className="font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 pt-6 border-t border-border/80">
                      <div className="flex justify-between text-sm font-body text-muted">
                        <span>Subtotal</span>
                        <span className="font-medium">₹{totalOriginal.toLocaleString('en-IN')}</span>
                      </div>
                      {totalDiscount > 0 && (
                        <div className="flex justify-between text-sm font-body text-[#2ECC71] font-medium">
                          <span>Discount</span>
                          <span>-₹{totalDiscount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {discountPercent > 0 && (
                        <div className="flex justify-between text-sm font-body text-[#2ECC71] font-medium">
                          <span>Coupon ({appliedCoupon})</span>
                          <span>-₹{couponDiscountAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-body text-muted">
                        <span>Shipping</span>
                        <span className="text-accent uppercase tracking-widest font-bold text-xs">Free</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-baseline text-2xl font-display text-primary border-t-2 border-accent/30 pt-6">
                      <span className="font-medium">Total Amount</span>
                      <span className="font-bold text-accent text-3xl">₹{finalTotalAmount.toLocaleString('en-IN')}</span>
                    </div>

                    {step === 2 && (
                      <Button type="submit" form="checkout-form" variant="primary" className="w-full py-4 text-xs font-semibold uppercase tracking-[0.2em]" disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : 'Pay'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Container>
        </Section>
      )}
    </>
  );
};

export default Checkout;
