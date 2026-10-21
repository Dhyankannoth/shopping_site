import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Package, Calendar, ArrowRight, ShieldAlert } from 'lucide-react';

export default function OrderHistory() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function loadOrders() {
      try {
        setLoading(true);
        const data = await api.get('/orders');
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message || 'Could not load orders');
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="ui-card" style={{ maxWidth: '500px', margin: 'var(--space-12) auto', padding: 'var(--space-8) var(--space-6)', textAlign: 'center' }}>
        <Package size={36} color="var(--primary)" style={{ margin: '0 auto var(--space-4)' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>Sign in to View Order History</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
          Orders associated with your account can be reviewed here after logging in.
        </p>
        <Link to="/login" className="btn btn-primary">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 'var(--space-2)' }}>
          Demonstration Order History
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Immutable records of demonstration orders created during this session
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-4)', color: 'var(--text-muted)' }}>
          Loading order history...
        </div>
      ) : orders.length === 0 ? (
        <div
          className="ui-card"
          style={{
            textAlign: 'center',
            padding: 'var(--space-12) var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-4)',
          }}
        >
          <Package size={36} color="var(--text-dim)" />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>No orders placed yet</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', fontSize: '0.9rem' }}>
            You haven't completed any demonstration checkouts with this account yet.
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 'var(--space-2)' }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="ui-card"
              style={{
                padding: 'var(--space-5) var(--space-6)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-4)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-1)' }}>
                  <strong style={{ fontSize: '1.1rem' }}>{ord.order_number}</strong>
                  <span
                    className={`badge ${
                      ord.order_status === 'Confirmed' ? 'badge-success' : 'badge-danger'
                    }`}
                  >
                    {ord.order_status}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--text-dim)' }}>
                  <Calendar size={14} /> {new Date(ord.created_at).toLocaleDateString()} at{' '}
                  {new Date(ord.created_at).toLocaleTimeString()}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Total</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                    ${Number(ord.total_amount).toFixed(2)}
                  </strong>
                </div>

                <Link
                  to={`/orders/${ord.id}`}
                  className="btn btn-secondary"
                  style={{ padding: '0.55rem 0.95rem', fontSize: '0.875rem' }}
                >
                  View Receipt <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
