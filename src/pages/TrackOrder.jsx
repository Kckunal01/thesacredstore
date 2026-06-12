import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';

// Mapping raw status/payment values to luxury friendly text
const statusMap = {
  pending: 'Order Confirmed',
  preparing: 'Preparing Your Package',
  shipped: 'In Transit',
  delivered: 'Delivered',
};

const paymentMap = {
  test_paid: 'Confirmed',
  paid: 'Confirmed',
  pending: 'Awaiting Payment',
};

const timelineStages = [
  { key: 'pending', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto‑search if order ID is present in the URL query string
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setOrderId(idFromUrl);
      fetchOrder(idFromUrl);
    }
  }, [searchParams]);

  const fetchOrder = async (id) => {
    setErrorMsg('');
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', id)
      .single();
    setLoading(false);
    if (error) {
      setErrorMsg('No order found with the specified ID. Please verify and try again.');
      setOrder(null);
    } else {
      setOrder(data);
    }
  };

  const handleTrack = (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    fetchOrder(orderId.trim());
  };

  // Determine current stage index for the timeline
  const currentStageIdx = order
    ? timelineStages.findIndex((stage) => stage.key === order.status)
    : -1;

  return (
    <Section className="min-h-[80vh] bg-background flex flex-col justify-center">
      <Container>
        <SectionHeader
          eyebrow="Ritual Logistics"
          title="Track Your Order"
          description="Enter your order identification reference to track your order state."
        />
        <div className="max-w-xl mx-auto">
          {/* Input Form */}
          {!order && (
            <form onSubmit={handleTrack} className="flex flex-col space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted mb-2 font-bold font-body">
                  Order Reference ID
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. TSS-0001"
                  className="w-full bg-surface border border-border p-4 text-primary focus:outline-none focus:border-accent transition-colors font-body text-sm text-center tracking-widest font-semibold"
                  required
                />
              </div>
              {errorMsg && (
                <p className="text-xs text-rose-700 font-body text-center">{errorMsg}</p>
              )}
              {loading && <p className="text-center text-sm text-muted">Loading...</p>}
              <Button type="submit" variant="primary" className="w-full py-4 text-xs font-semibold uppercase tracking-[0.2em]">
                Track Order
              </Button>
            </form>
          )}

          {/* Order Details */}
          {order && (
            <div className="bg-surface border border-border p-8 md:p-10 space-y-8">
              {/* Header: Order Reference & Date */}
              <div className="flex justify-between items-center border-b border-border pb-6">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold font-body">
                    Order Reference
                  </span>
                  <h3 className="text-2xl font-display font-medium text-primary mt-1">
                    {order.order_id}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold font-body">
                    Order Date
                  </span>
                  <p className="text-sm text-primary font-medium mt-1">
                    {order.created_at?.split('T')[0] ?? ''}
                  </p>
                </div>
              </div>

              {/* Mapped Status & Payment */}
              <div className="space-y-2 mb-6">
                <p className="text-sm text-muted font-body">
                  <strong>Status:</strong> {statusMap[order.status] || order.status}
                </p>
                <p className="text-sm text-muted font-body">
                  <strong>Payment:</strong> {paymentMap[order.payment_status] || order.payment_status}
                </p>
                <p className="text-sm text-muted font-body">
                  <strong>Amount:</strong> ₹{order.amount?.toLocaleString('en-IN') ?? '0'}
                </p>
                {order.tracking_id && (
                  <p className="text-sm text-muted font-body">
                    <strong>Tracking ID:</strong> {order.tracking_id}
                  </p>
                )}
              </div>

              {/* 4‑Stage Timeline */}
              <div className="relative pt-4 pb-4 mb-8">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border transform -translate-y-1/2 z-0" />
                <div className="relative z-10 flex justify-between">
                  {timelineStages.map((stage, idx) => {
                    const isDone = idx <= currentStageIdx;
                    const isCurrent = idx === currentStageIdx;
                    return (
                      <div key={stage.key} className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] transition-all duration-500 font-semibold ${isDone ? 'border-accent bg-background text-accent' : 'border-border bg-surface text-muted'
                            }`}
                        >
                          {isCurrent ? '●' : idx + 1}
                        </div>
                        <span
                          className={`text-[10px] uppercase tracking-wider mt-2 font-bold font-body ${isDone ? 'text-primary' : 'text-muted'
                            }`}
                        >
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Luxury Status Message */}
              <div className="border-t border-border pt-6">
                <p className="text-primary font-display text-xl mb-2">
                  {statusMap[order.status] || order.status}
                </p>

                <p className="text-muted font-body leading-relaxed">
                  {order.status === 'pending' &&
                    'Your order has been received and is awaiting preparation.'}

                  {order.status === 'preparing' &&
                    'Your crystals are currently being inspected and packaged.'}

                  {order.status === 'shipped' &&
                    'Your package is now on its way to you.'}

                  {order.status === 'delivered' &&
                    'Your order has been successfully delivered.'}
                </p>
              </div>

              {/* Tracking Button */}
              {order.tracking_id && (
                <Button
                  variant="primary"
                  onClick={() => window.open(`https://track.tracking-service.com/${order.tracking_id}`, '_blank')}
                >
                  Track Package
                </Button>
              )}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default TrackOrder;
