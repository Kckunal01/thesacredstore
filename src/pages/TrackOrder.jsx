import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import { getOrder } from '../services/orderTrackingService';

// ─── Display helpers ─────────────────────────────────────────────────────────

const STATUS_LABEL = {
  pending: 'Order Confirmed',
  preparing: 'Preparing Your Package',
  shipped: 'In Transit',
  delivered: 'Delivered',
};

const PAYMENT_LABEL = {
  test_paid: 'Confirmed',
  paid: 'Confirmed',
  pending: 'Awaiting Payment',
};

const TIMELINE = [
  { key: 'pending', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

const STATUS_DESCRIPTION = {
  pending: 'Your order has been received and is awaiting preparation.',
  preparing: 'Your crystals are currently being inspected and packaged.',
  shipped: 'Your package is now on its way to you.',
  delivered: 'Your order has been successfully delivered.',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Timeline({ status }) {
  const currentIdx = TIMELINE.findIndex((s) => s.key === status);
  return (
    <div className="relative pt-4 pb-4 mb-8">
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border transform -translate-y-1/2 z-0" />
      <div className="relative z-10 flex justify-between">
        {TIMELINE.map((stage, idx) => {
          const done = idx <= currentIdx;
          const current = idx === currentIdx;
          return (
            <div key={stage.key} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-semibold transition-all duration-500 ${
                  done
                    ? 'border-accent bg-background text-accent'
                    : 'border-border bg-surface text-muted'
                }`}
              >
                {current ? '●' : idx + 1}
              </div>
              <span
                className={`text-[10px] uppercase tracking-wider mt-2 font-bold font-body ${
                  done ? 'text-primary' : 'text-muted'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({ order, onReset }) {
  return (
    <div className="bg-surface border border-border p-8 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#000000] font-bold font-body">
            Order Reference
          </span>
          <h3 className="text-2xl font-display font-medium text-primary mt-1">
            {order.order_id}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#000000] font-bold font-body">
            Order Date
          </span>
          <p className="text-sm text-primary font-medium mt-1">
            {order.created_at?.split('T')[0] ?? '—'}
          </p>
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-2">
        <p className="text-sm text-muted font-body">
          <strong>Status:</strong> {STATUS_LABEL[order.status] ?? order.status}
        </p>
        <p className="text-sm text-muted font-body">
          <strong>Payment:</strong>{' '}
          {PAYMENT_LABEL[order.payment_status] ?? order.payment_status}
        </p>
        <p className="text-sm text-muted font-body">
          <strong>Amount:</strong> ₹{order.amount?.toLocaleString('en-IN') ?? '0'}
        </p>
        {order.payment_method === 'cod' && order.payment_status === 'pending' && (
          <p className="text-sm text-amber-600 font-body font-medium">
            <strong>Payment:</strong> Cash on Delivery — payment pending
          </p>
        )}
        {order.tracking_id && (
          <p className="text-sm text-muted font-body">
            <strong>Tracking ID:</strong> {order.tracking_id}
          </p>
        )}
        {!order.tracking_id && order.status !== 'delivered' && (
          <p className="text-sm text-accent font-body font-medium mt-2">
            Tracking information will appear once your shipment is dispatched.
          </p>
        )}
      </div>

      {/* Timeline */}
      <Timeline status={order.status} />

      {/* Status description */}
      <div className="border-t border-border pt-6">
        <p className="text-primary font-display text-xl mb-2">
          {STATUS_LABEL[order.status] ?? order.status}
        </p>
        <p className="text-muted font-body leading-relaxed">
          {STATUS_DESCRIPTION[order.status] ?? ''}
        </p>
      </div>

      {/* External tracking link */}
      {order.tracking_id && (
        <Button
          variant="primary"
          onClick={() =>
            window.open(
              `https://track.tracking-service.com/${order.tracking_id}`,
              '_blank'
            )
          }
        >
          Track Package
        </Button>
      )}

      {/* Search again */}
      <button
        onClick={onReset}
        className="mt-4 text-xs uppercase tracking-widest text-muted underline underline-offset-4 hover:text-primary transition-colors font-body block"
      >
        Search another order
      </button>
    </div>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam && !order && !loading) {
      setInput(idParam);
      // trigger search
      (async () => {
        setLoading(true);
        setError(null);
        const result = await getOrder(idParam);
        if (!result.success) {
          setError('We were unable to retrieve your order. Please try again later.');
        } else if (!result.order) {
          setError('No order found with that reference. Please check your Order ID or Tracking ID and try again.');
        } else {
          setOrder(result.order);
        }
        setLoading(false);
      })();
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = input.trim();
    if (!id) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    const result = await getOrder(id);

    if (!result.success) {
      setError('We were unable to retrieve your order. Please try again later.');
    } else if (!result.order) {
      setError('No order found with that reference. Please check your Order ID or Tracking ID and try again.');
    } else {
      setOrder(result.order);
    }

    setLoading(false);
  };

  const handleReset = () => {
    setOrder(null);
    setError(null);
    setInput('');
  };

  return (
    <Section className="min-h-[80vh] bg-background flex flex-col justify-center">
      <Container>
        <SectionHeader
          title="Track Your Order"
          description="Enter your order identification reference to track your order state."
        />
        <div className="max-w-xl mx-auto">
          {!order && (
            <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted mb-2 font-bold font-body">
                  Order Reference ID
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g. TSS-0001"
                  className="w-full bg-surface border border-border p-4 text-primary focus:outline-none focus:border-accent transition-colors font-body text-sm text-center tracking-widest font-semibold"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <p className="text-xs text-rose-700 font-body text-center">{error}</p>
              )}

              {loading && (
                <p className="text-center text-sm text-muted font-body">Searching…</p>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full py-4 text-xs font-semibold uppercase tracking-[0.2em]"
                disabled={loading}
              >
                {loading ? 'Searching…' : 'Track Order'}
              </Button>
            </form>
          )}

          {order && <OrderCard order={order} onReset={handleReset} />}
        </div>
      </Container>
    </Section>
  );
};

export default TrackOrder;
