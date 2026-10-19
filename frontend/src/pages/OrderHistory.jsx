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
      <div className="glass-card" style={{ maxWidth: '500px', margin: '4rem auto', padding: '3rem 2rem', textAlign: 'center' }}>
        <Package size={36} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Sign in to View Order History</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Orders associated with your account can be reviewed here after logging in.
        </p>
        <Link to="/login" className="btn btn-primary">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
          Demonstration Order History
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Immutable records of demonstration orders created during this session
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          Loading order history...
        </div>
      ) : orders.length === 0 ? (
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <Package size={36} color="var(--text-dim)" />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>No orders placed yet</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', fontSize: '0.9rem' }}>
            You haven't completed any demonstration checkouts with this account yet.
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="glass-card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Total</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--primary-light)' }}>
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
