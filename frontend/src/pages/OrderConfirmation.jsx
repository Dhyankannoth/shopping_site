import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle2, ArrowRight, Package, Calendar, MapPin, Receipt, AlertCircle } from 'lucide-react';

export default function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) return;

    async function loadOrder() {
      try {
        setLoading(true);
        const data = await api.get(`/orders/${id}`);
        setOrder(data.order);
      } catch (err) {
        setError(err.message || 'Could not find order');
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [id, order]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
        Loading demonstration order confirmation...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="glass-card" style={{ maxWidth: '500px', margin: '4rem auto', padding: '3rem 2rem', textAlign: 'center' }}>
        <AlertCircle size={40} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Order Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error || 'No order record found for this identifier.'}</p>
        <Link to="/" className="btn btn-primary">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '1rem auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Success Hero Card */}
      <div
        className="glass-card animate-fade-in"
        style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          background: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.15) 0%, rgba(17, 24, 39, 0.75) 70%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--success-bg)',
            border: '2px solid var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
        >
          <CheckCircle2 size={36} color="var(--success)" />
        </div>

        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Demonstration Order Confirmed!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
          Your sample order has been recorded into PostgreSQL. No payment was charged.
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface-elevated)', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-glass)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Order Reference:</span>
          <strong style={{ letterSpacing: '0.05em', color: 'var(--text-main)' }}>{order.order_number}</strong>
        </div>
      </div>

      {/* Order Snapshot Receipt */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Receipt size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Order Snapshot Receipt</h2>
          </div>
          <span className="badge badge-success">
            {order.order_status}
          </span>
        </div>

        {/* Metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', fontSize: '0.825rem', marginBottom: '0.25rem' }}>
              <Calendar size={14} /> Date Placed
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              {new Date(order.created_at).toLocaleString()}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', fontSize: '0.825rem', marginBottom: '0.25rem' }}>
              <MapPin size={14} /> Shipped To
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              {order.recipient_name}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {order.address}, {order.city} {order.postal_code}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Purchased Products
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{item.product_name}</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.825rem' }}>
                    ${Number(item.unit_price).toFixed(2)} × {item.quantity} unit{item.quantity > 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                  ${Number(item.line_total).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Subtotal</span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>${Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Demonstration Shipping</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>Total Paid</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-light)' }}>
              ${Number(order.total_amount).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem' }}>
        <Link to="/" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem' }}>
          Continue Shopping <ArrowRight size={18} />
        </Link>
        <Link to="/orders" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem' }}>
          <Package size={18} /> View All Orders
        </Link>
      </div>
    </div>
  );
}
