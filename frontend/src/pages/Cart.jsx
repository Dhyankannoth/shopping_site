import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, ArrowLeft, Lock } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { items, subtotal, itemCount, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();
  const isLocked = !isAuthenticated && import.meta.env.MODE !== 'test';

  if (isLocked) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 'var(--space-2)' }}>
              Shopping Cart
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Sign in to manage and checkout your cart
            </p>
          </div>
        </div>

        <div
          className="ui-card"
          style={{
            textAlign: 'center',
            padding: 'var(--space-12) var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-5)',
            maxWidth: '580px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '20px',
              background: 'var(--chip-bg)',
              border: '1px solid var(--border-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            }}
          >
            <Lock size={32} strokeWidth={2.2} />
          </div>

          <div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              Sign In to View Your Cart
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              Your shopping cart is private and linked to your VisionBuy account. Sign in or create an account to view your saved items, modify quantities, and proceed to checkout.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}>
            <button
              onClick={() => openAuthModal('login')}
              className="btn btn-primary"
              style={{
                padding: '0.85rem 2rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="btn btn-outline"
              style={{
                padding: '0.85rem 2rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              Create Account
            </button>
          </div>

          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              marginTop: '1rem',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} /> Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const isEmpty = items.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 'var(--space-2)' }}>
            Shopping Cart
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {!isEmpty && (
          <button
            onClick={clearCart}
            className="btn btn-outline"
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
          >
            Clear Cart
          </button>
        )}
      </div>

      {isEmpty ? (
        /* Empty State */
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
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-dim)',
            }}
          >
            <ShoppingBag size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Your cart is empty</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '420px', fontSize: '0.95rem' }}>
            Looks like you haven't added any products yet. Browse our demonstration catalogue to start.
          </p>
          <Link to="/" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', marginTop: 'var(--space-2)' }}>
            <ArrowLeft size={16} /> Explore Catalogue
          </Link>
        </div>
      ) : (
        /* Cart Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-8)',
            alignItems: 'start',
          }}
        >
          {/* Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {items.map((item) => (
              <div
                key={item.productId}
                className="ui-card"
                style={{
                  padding: 'var(--space-4) var(--space-5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      marginBottom: 'var(--space-1)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.name}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    ${Number(item.unitPrice).toFixed(2)} each
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="btn btn-secondary"
                    style={{ width: '32px', height: '32px', padding: 0 }}
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    -
                  </button>
                  <span
                    style={{
                      minWidth: '28px',
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                    }}
                  >
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="btn btn-secondary"
                    style={{ width: '32px', height: '32px', padding: 0 }}
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    +
                  </button>
                </div>

                {/* Line Total */}
                <div style={{ minWidth: '75px', textAlign: 'right', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                  ${Number(item.lineTotal).toFixed(2)}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="btn btn-outline"
                  style={{ padding: '0.45rem', color: 'var(--text-dim)' }}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary Box */}
          <div className="ui-card" style={{ padding: 'var(--space-6)', position: 'sticky', top: '90px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 'var(--space-5)' }}>
              Order Summary
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.925rem' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.925rem' }}>
                <span>Demonstration Shipping</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.925rem' }}>
                <span>Estimated Tax</span>
                <span style={{ color: 'var(--text-main)' }}>$0.00</span>
              </div>
              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: 'var(--space-3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>Total</span>
                <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  ${subtotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1.05rem', gap: '0.75rem' }}
              disabled={isEmpty}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: 'var(--space-4)',
                fontSize: '0.8rem',
                color: 'var(--text-dim)',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={16} color="var(--primary)" /> Demonstration Mode: No money charged
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
