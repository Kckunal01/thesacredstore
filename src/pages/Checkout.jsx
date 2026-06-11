import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import { CartContext } from '../context/CartContext';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { cart, getCartTotal, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const [step, setStep] = useState(1); // 1: Cart, 2: Checkout Form, 3: Success
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    pinCode: '',
    phone: ''
  });

  const totalOriginal = cart.reduce((acc, item) => acc + (item.originalPrice || item.price) * item.quantity, 0);
  const totalDiscount = totalOriginal - getCartTotal();

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const res = await loadRazorpayScript();

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setIsProcessing(false);
      return;
    }

    try {
      // Attempt to call the Serverless function
      let razorpayOrderId = `order_mock_${Math.floor(Math.random() * 1000000)}`;
      try {
        const result = await fetch('/api/razorpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: getCartTotal() })
        });
        if (result.ok) {
          const data = await result.json();
          if (data.id) razorpayOrderId = data.id;
        }
      } catch (err) {
        console.log("Using mock order ID due to local environment.");
      }

      const options = {
        key: "rzp_test_mock_key", // Enter the Key ID generated from the Dashboard
        amount: getCartTotal() * 100,
        currency: "INR",
        name: "RITUALIST",
        description: "Purchase Order",
        image: "https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?q=80&w=200&auto=format&fit=crop",
        order_id: razorpayOrderId,
        handler: function (response) {
          // Payment successful
          const finalOrderId = `RIT-${Math.floor(10000 + Math.random() * 90000)}`;
          setOrderId(finalOrderId);
          
          // Store in localStorage for Tracking
          const activeOrders = JSON.parse(localStorage.getItem('ritualist_orders') || '{}');
          activeOrders[finalOrderId] = {
            id: finalOrderId,
            state: 'Ordered',
            date: new Date().toLocaleDateString(),
            items: cart.map(item => ({ name: item.name, quantity: item.quantity })),
            total: getCartTotal(),
            shipping: formData
          };
          localStorage.setItem('ritualist_orders', JSON.stringify(activeOrders));
          
          setStep(3);
          clearCart();
          setIsProcessing(false);
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#111111"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        alert("Payment failed. Please try again.");
        setIsProcessing(false);
      });
      paymentObject.open();

    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  // Generate unique background gradient styling based on name to make it look premium
  const getPlaceholderStyle = (productName) => {
    return {
      background: `linear-gradient(135deg, #FAF9F6 0%, #F4F1EA 100%)`,
    };
  };

  if (step === 3) {
    return (
      <Section className="min-h-[80vh] flex items-center justify-center bg-background pt-32">
        <Container className="text-center max-w-lg">
          <div className="w-16 h-16 rounded-full border border-accent flex items-center justify-center mx-auto mb-8">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B89968" strokeWidth="2"><path d="M5 12l5 5l10 -10"/></svg>
          </div>
          <h2 className="text-4xl font-display text-primary mb-4">Order Placed.</h2>
          <p className="text-muted leading-relaxed mb-6 font-light font-body">
            Thank you for making space for meaning. Order <strong className="text-primary font-semibold font-display">{orderId}</strong> has been created.
          </p>
          <div className="bg-surface border border-border p-6 mb-8 text-left space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-accent font-bold">Important logistics information</span>
            <p className="text-xs text-muted leading-relaxed font-body">
              Your energy tool is being packaged carefully and cleansed with incense before shipping. You can track its shipment status directly.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
            <Button to={`/track-order?id=${orderId}`} variant="primary">Track Package</Button>
            <Button to="/" variant="ghost">Return Home</Button>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-[80vh] bg-background pt-32">
      <Container>
        <SectionHeader 
          eyebrow="Shopping bag"
          title={step === 1 ? "Your Cart" : "Checkout details"} 
          description={step === 1 ? "Verify the weight, intention, and quantity of your chosen tools before proceeding." : "All shipments are handled with premium care and fully insured packaging."} 
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
            
            {/* Left Column: Cart Items or Form */}
            <div className="w-full lg:w-2/3">
              {step === 1 ? (
                <div className="space-y-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-surface border border-border gap-6">
                      <div className="flex items-center space-x-6">
                        <div 
                          style={getPlaceholderStyle(item.name)} 
                          className="w-20 h-24 border border-border flex items-center justify-center text-xs uppercase tracking-widest text-accent font-semibold font-display"
                        >
                          {item.images && item.images.length > 0 ? (
                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-contain" />
                          ) : item.name.charAt(0)}
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-accent mb-1 block font-bold font-body">{item.category}</span>
                          <h4 className="font-display text-xl text-primary font-medium">{item.name}</h4>
                          <span className="text-sm text-muted font-light font-body">₹{item.price.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between w-full sm:w-auto space-x-6 sm:space-x-12 border-t sm:border-t-0 pt-4 sm:pt-0 border-border">
                        <div className="flex items-center border border-border bg-background">
                          <button 
                            className="px-3 py-2 hover:bg-surface text-primary" 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="px-4 py-2 text-xs font-semibold text-primary">{item.quantity}</span>
                          <button 
                            className="px-3 py-2 hover:bg-surface text-primary" 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <button 
                            onClick={() => removeFromCart(item.id)} 
                            className="text-[10px] uppercase tracking-[0.2em] text-accent hover:text-primary transition-colors font-bold font-body"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center pt-8 border-t border-border">
                    <Link to="/shop-crystals" className="text-xs uppercase tracking-[0.2em] text-accent hover:text-primary transition-colors font-semibold font-body">
                      ← Continue Shopping
                    </Link>
                    <Button onClick={() => setStep(2)} variant="primary">Proceed to Shipping</Button>
                  </div>
                </div>
              ) : (
                <form id="checkout-form" onSubmit={handleCheckout} className="bg-surface border border-border p-8 md:p-10 space-y-8">
                  <div className="flex justify-between items-center border-b border-border pb-4">
                    <h3 className="font-display text-2xl text-primary font-medium">Shipping & Delivery</h3>
                    <button 
                      type="button" 
                      onClick={() => setStep(1)} 
                      className="text-[10px] uppercase tracking-widest text-accent hover:text-primary font-bold font-body"
                    >
                      ← Edit Cart
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs uppercase tracking-widest text-muted mb-2 font-bold font-body">First Name</label>
                      <input 
                        type="text" 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={handleInputChange} 
                        className="w-full bg-background border border-border p-4 text-primary focus:outline-none focus:border-accent font-body text-sm" 
                        required 
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs uppercase tracking-widest text-muted mb-2 font-bold font-body">Last Name</label>
                      <input 
                        type="text" 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleInputChange} 
                        className="w-full bg-background border border-border p-4 text-primary focus:outline-none focus:border-accent font-body text-sm" 
                        required 
                      />
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs uppercase tracking-widest text-muted mb-2 font-bold font-body">Email Address</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        className="w-full bg-background border border-border p-4 text-primary focus:outline-none focus:border-accent font-body text-sm" 
                        required 
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs uppercase tracking-widest text-muted mb-2 font-bold font-body">Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        className="w-full bg-background border border-border p-4 text-primary focus:outline-none focus:border-accent font-body text-sm" 
                        required 
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs uppercase tracking-widest text-muted mb-2 font-bold font-body">Delivery Address</label>
                      <input 
                        type="text" 
                        name="address" 
                        value={formData.address} 
                        onChange={handleInputChange} 
                        className="w-full bg-background border border-border p-4 text-primary focus:outline-none focus:border-accent font-body text-sm" 
                        required 
                      />
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs uppercase tracking-widest text-muted mb-2 font-bold font-body">City / Town</label>
                      <input 
                        type="text" 
                        name="city" 
                        value={formData.city} 
                        onChange={handleInputChange} 
                        className="w-full bg-background border border-border p-4 text-primary focus:outline-none focus:border-accent font-body text-sm" 
                        required 
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs uppercase tracking-widest text-muted mb-2 font-bold font-body">Postal PIN Code</label>
                      <input 
                        type="text" 
                        name="pinCode" 
                        value={formData.pinCode} 
                        onChange={handleInputChange} 
                        className="w-full bg-background border border-border p-4 text-primary focus:outline-none focus:border-accent font-body text-sm" 
                        required 
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Right Column: Order Summary */}
            <div className="w-full lg:w-1/3">
              <div className="bg-surface border border-border p-8 sticky top-24 space-y-6">
                <h3 className="font-display text-2xl text-primary font-medium border-b border-border pb-4">Order Summary</h3>
                <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs font-body text-muted">
                      <span className="truncate max-w-[150px]">{item.name} <strong className="text-accent">x{item.quantity}</strong></span>
                      <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex justify-between text-xs font-body text-muted">
                    <span>Subtotal</span>
                    <span>₹{totalOriginal.toLocaleString('en-IN')}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-xs font-body text-[#2ECC71]">
                      <span>Discount</span>
                      <span>-₹{totalDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-body text-muted">
                    <span>Shipping</span>
                    <span className="text-accent uppercase tracking-wider font-bold">Free</span>
                  </div>
                </div>
                <div className="flex justify-between text-xl font-display text-primary border-t border-border pt-4">
                  <span>Total</span>
                  <span className="font-semibold text-accent">₹{getCartTotal().toLocaleString('en-IN')}</span>
                </div>
                {step === 2 && (
                  <Button 
                    type="submit" 
                    form="checkout-form" 
                    variant="primary" 
                    className="w-full py-4 text-xs font-semibold uppercase tracking-[0.2em]"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Pay with Razorpay'}
                  </Button>
                )}
              </div>
            </div>

          </div>
        )}
      </Container>
    </Section>
  );
};

export default Checkout;
