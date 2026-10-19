import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ShieldAlert,
  CreditCard,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Lock,
} from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [delivery, setDelivery] = useState({
    recipientName: user?.name || '',
    address: '',
    city: '',
    postalCode: '',
  });

  const [paymentOutcome, setPaymentOutcome] = useState('success');
  const [clientErrors, setClientErrors] = useState({});
  const [paymentError, setPaymentError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);

  // Load authoritative preview from server
  useEffect(() => {
    if (items.length === 0) return;

    async function loadPreview() {
      try {
        const data = await api.post('/checkout/preview', {
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        });
        setPreview(data);
      } catch (err) {
        console.warn('Preview error:', err.message);
      }
    }
    loadPreview();
  }, [items]);

  const validate = () => {
    const errs = {};
    if (!delivery.recipientName.trim()) {
      errs.recipientName = 'Recipient name cannot be empty';
    }
    if (!delivery.address.trim()) {
      errs.address = 'Street address cannot be empty';
    }
    if (!delivery.city.trim()) {
      errs.city = 'City cannot be empty';
    }
    if (!delivery.postalCode.trim()) {
      errs.postalCode = 'Postal code cannot be empty';
    }

    setClientErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPaymentError('');

    if (!validate()) return;
    if (items.length === 0) {
      setPaymentError('Your cart is empty. Please add items before checking out.');
      return;
    }

    setSubmitting(true);
    const idempotencyKey = `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    try {
      const response = await api.post('/orders', {
        idempotencyKey,
        deliveryDetails: {
          recipientName: delivery.recipientName.trim(),
          address: delivery.address.trim(),
          city: delivery.city.trim(),
          postalCode: delivery.postalCode.trim(),
        },
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        simulatedPaymentOutcome: paymentOutcome,
      });

      // Clear local cart on success
      await clearCart();
      navigate(`/orders/${response.order.id}`, { state: { order: response.order } });
    } catch (err) {
      if (err.status === 402 || err.code === 'PAYMENT_DECLINED') {
        setPaymentError('Payment was declined by simulation. No funds were charged. You can retry with a different outcome.');
      } else if (err.status === 504 || err.code === 'PAYMENT_TIMEOUT') {
        setPaymentError('Simulated payment timed out. Your order was not placed. It is safe to retry.');
      } else {
        setPaymentError(err.message || 'An error occurred while placing your order.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="glass-card" style={{ maxWidth: '500px', margin: '4rem auto', padding: '3rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Cannot Proceed to Checkout</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Your shopping cart is currently empty.</p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Catalogue
        </Link>
      </div>
    );
  }

  const authoritativeTotal = preview?.totalAmount ?? subtotal;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
          Checkout & Payment
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Complete demonstration shipping details and simulate order payment
        </p>
      </div>

      {/* Safety Notice Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          color: '#fde68a',
          fontSize: '0.875rem',
        }}
      >
        <ShieldAlert size={20} color="var(--warning)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Demonstration Environment Notice:</strong> Do not enter real credit cards, passwords, or personal credentials.
          All payments and transactions are simulated.
        </span>
      </div>

      {/* Payment Error Alert */}
      {paymentError && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            fontSize: '0.9rem',
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{paymentError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Delivery Details & Payment Method */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Step 1: Delivery Details */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                1. Delivery Details (Demonstration)
              </h2>

              <div className="form-group">
                <label className="form-label" htmlFor="recipientName">
                  Recipient Name
                </label>
                <input
                  id="recipientName"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Jane Doe"
                  value={delivery.recipientName}
                  onChange={(e) => {
                    setDelivery({ ...delivery, recipientName: e.target.value });
                    if (clientErrors.recipientName) setClientErrors({ ...clientErrors, recipientName: '' });
                  }}
                />
                {clientErrors.recipientName && <span className="form-error">{clientErrors.recipientName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="address">
                  Street Address
                </label>
                <input
                  id="address"
                  type="text"
                  className="form-control"
                  placeholder="e.g. 123 Sample Boulevard, Apt 4B"
                  value={delivery.address}
                  onChange={(e) => {
                    setDelivery({ ...delivery, address: e.target.value });
                    if (clientErrors.address) setClientErrors({ ...clientErrors, address: '' });
                  }}
                />
                {clientErrors.address && <span className="form-error">{clientErrors.address}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="city">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Springfield"
                    value={delivery.city}
                    onChange={(e) => {
                      setDelivery({ ...delivery, city: e.target.value });
                      if (clientErrors.city) setClientErrors({ ...clientErrors, city: '' });
                    }}
                  />
                  {clientErrors.city && <span className="form-error">{clientErrors.city}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="postalCode">
                    Postal Code
                  </label>
                  <input
                    id="postalCode"
                    type="text"
                    className="form-control"
                    placeholder="e.g. 12345"
                    value={delivery.postalCode}
                    onChange={(e) => {
                      setDelivery({ ...delivery, postalCode: e.target.value });
                      if (clientErrors.postalCode) setClientErrors({ ...clientErrors, postalCode: '' });
                    }}
                  />
                  {clientErrors.postalCode && <span className="form-error">{clientErrors.postalCode}</span>}
                </div>
              </div>
            </div>

            {/* Step 2: Simulated Payment Selection */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                <CreditCard size={20} color="var(--primary)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  2. Select Simulated Payment Outcome
                </h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Select a deterministic scenario to test the application response:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Option: Success */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${paymentOutcome === 'success' ? 'var(--primary)' : 'var(--border-glass)'}`,
                    background: paymentOutcome === 'success' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-surface-elevated)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="simulatedPayment"
                    value="success"
                    checked={paymentOutcome === 'success'}
                    onChange={() => setPaymentOutcome('success')}
                    style={{ marginTop: '0.25rem' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={16} color="var(--success)" /> Simulate Payment Success
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      Authorizes payment, decrements product stock, confirms order, and clears cart.
                    </div>
                  </div>
                </label>

                {/* Option: Decline */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${paymentOutcome === 'declined' ? 'var(--danger)' : 'var(--border-glass)'}`,
                    background: paymentOutcome === 'declined' ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-surface-elevated)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="simulatedPayment"
                    value="declined"
                    checked={paymentOutcome === 'declined'}
                    onChange={() => setPaymentOutcome('declined')}
                    style={{ marginTop: '0.25rem' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <XCircle size={16} color="var(--danger)" /> Simulate Payment Decline
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      Simulates a declined transaction. Stock is preserved and cart remains intact.
                    </div>
                  </div>
                </label>

                {/* Option: Timeout */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${paymentOutcome === 'timeout' ? 'var(--warning)' : 'var(--border-glass)'}`,
                    background: paymentOutcome === 'timeout' ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-surface-elevated)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="simulatedPayment"
                    value="timeout"
                    checked={paymentOutcome === 'timeout'}
                    onChange={() => setPaymentOutcome('timeout')}
                    style={{ marginTop: '0.25rem' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={16} color="var(--warning)" /> Simulate Payment Timeout / Failure
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      Simulates a network timeout. Reversible without creating an order.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review Snapshot & Submit */}
          <div className="glass-card" style={{ padding: '1.75rem', position: 'sticky', top: '90px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              3. Order Review
            </h2>

            {/* Purchased Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', maxHeight: '240px', overflowY: 'auto' }}>
              {items.map((item) => (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <div style={{ maxWidth: '65%' }}>
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                    <span style={{ color: 'var(--text-dim)', marginLeft: '0.4rem' }}>× {item.quantity}</span>
                  </div>
                  <span style={{ fontWeight: 700 }}>${Number(item.lineTotal || item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>${authoritativeTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <span>Demonstration Shipping</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
              </div>
              <div
                style={{
                  borderTop: '1px solid var(--border-glass)',
                  paddingTop: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Total Due</span>
                <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary-light)' }}>
                  ${authoritativeTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1.05rem', gap: '0.65rem' }}
              disabled={submitting}
            >
              {submitting ? (
                'Processing Order...'
              ) : (
                <>
                  <Lock size={16} /> Place Demonstration Order
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/cart" style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <ArrowLeft size={14} /> Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
