import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-search if order ID is in URL query parameters
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setOrderId(idFromUrl);
      fetchOrderStatus(idFromUrl);
    }
  }, [searchParams]);

  const fetchOrderStatus = (id) => {
    setErrorMsg('');
    const storedOrders = JSON.parse(localStorage.getItem('ritualist_orders') || '{}');
    
    if (storedOrders[id]) {
      setStatus(storedOrders[id]);
    } else if (id.toUpperCase().startsWith('RIT-') && id.length === 9) {
      // Simulate status for realistic generated IDs that might not be in storage
      setStatus({
        id: id.toUpperCase(),
        state: 'Ordered',
        date: new Date().toLocaleDateString(),
        items: [{ name: 'Raw Black Tourmaline', quantity: 1 }],
        total: 1200,
        simulated: true,
        message: 'Your energy tools are being chosen and cleansed with sage. Shipping carrier assignment is pending.'
      });
    } else {
      setErrorMsg('No order found with the specified ID. Please verify and try again.');
      setStatus(null);
    }
  };

  const handleTrack = (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    fetchOrderStatus(orderId.trim());
  };

  return (
    <Section className="min-h-[80vh] bg-background flex flex-col justify-center">
      <Container>
        <SectionHeader 
          eyebrow="Ritual Logistics" 
          title="Track Your Order" 
          description="Enter your order identification reference to track your order state." 
        />
        <div className="max-w-xl mx-auto">
          {!status ? (
            <form onSubmit={handleTrack} className="flex flex-col space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted mb-2 font-bold font-body">Order Reference ID</label>
                <input 
                  type="text" 
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. RIT-10992"
                  className="w-full bg-surface border border-border p-4 text-primary focus:outline-none focus:border-accent transition-colors font-body text-sm text-center tracking-widest font-semibold"
                  required
                />
              </div>
              {errorMsg && (
                <p className="text-xs text-rose-700 font-body text-center">{errorMsg}</p>
              )}
              <Button type="submit" variant="primary" className="w-full py-4 text-xs font-semibold uppercase tracking-[0.2em]">
                Track Protocol Status
              </Button>
            </form>
          ) : (
            <div className="bg-surface border border-border p-8 md:p-10 space-y-8">
              <div className="flex justify-between items-center border-b border-border pb-6">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold font-body">Order Reference</span>
                  <h3 className="text-2xl font-display font-medium text-primary mt-1">{status.id}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold font-body">Order Date</span>
                  <p className="text-sm text-primary font-medium mt-1">{status.date}</p>
                </div>
              </div>

              {/* Status Visual Tracker */}
              <div className="relative pt-4 pb-4">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border transform -translate-y-1/2 z-0"></div>
                <div className="relative z-10 flex justify-between">
                  {['Ordered', 'Processed', 'Shipped', 'Delivered'].map((step, idx) => {
                    const states = ['Ordered', 'Processed', 'Shipped', 'Delivered'];
                    const currentIdx = states.indexOf(status.state);
                    const isDone = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={step} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] transition-all duration-500 font-semibold ${isDone ? 'border-accent bg-background text-accent' : 'border-border bg-surface text-muted'}`}>
                          {isCurrent ? '●' : idx + 1}
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider mt-2 font-bold font-body ${isDone ? 'text-primary' : 'text-muted'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 bg-background border border-border text-center">
                <p className="text-xs text-muted leading-relaxed font-body">
                  {status.simulated 
                    ? status.message 
                    : `Your order is currently [${status.state}]. We are handling your ritual items with care.`
                  }
                </p>
              </div>

              {/* Items in the order */}
              {status.items && (
                <div className="space-y-3 pt-6 border-t border-border">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold font-body">Items in Package</span>
                  {status.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-body text-muted">
                      <span>{item.name}</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col space-y-4 pt-6 border-t border-border text-center">
                <button 
                  onClick={() => { setStatus(null); setOrderId(''); }}
                  className="text-xs uppercase tracking-[0.2em] text-accent hover:text-primary transition-colors font-bold font-body"
                >
                  ← Track Another Order
                </button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default TrackOrder;
