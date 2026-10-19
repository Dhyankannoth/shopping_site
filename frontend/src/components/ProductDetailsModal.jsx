import React, { useState } from 'react';
import { X, ShoppingCart, ShieldCheck, Truck } from 'lucide-react';

export default function ProductDetailsModal({ product, onClose, onAddToCart }) {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = product.stock_quantity <= 0;

  const handleAdd = () => {
    if (onAddToCart && !isOutOfStock) {
      onAddToCart(product, quantity);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        backgroundColor: 'rgba(5, 8, 16, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          maxWidth: '750px',
          width: '100%',
          backgroundColor: '#111827',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Close Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border-glass)',
          }}
        >
          <span className="badge badge-info">{product.category}</span>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.4rem', borderRadius: '50%' }}
            aria-label="Close details"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '1.75rem',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}
        >
          {/* Image */}
          <div
            style={{
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: 'var(--bg-surface-elevated)',
              position: 'relative',
              aspectRatio: '1',
            }}
          >
            <img
              src={product.image_url}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.25 }}>
                {product.name}
              </h2>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-light)', marginBottom: '1rem' }}>
                ${Number(product.price).toFixed(2)}
              </div>

              {/* Stock Status Indicator */}
              <div style={{ marginBottom: '1.25rem' }}>
                {isOutOfStock ? (
                  <span className="badge badge-danger">Out of Stock</span>
                ) : (
                  <span className="badge badge-success">
                    {product.stock_quantity} units available
                  </span>
                )}
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {product.description}
              </p>

              {/* Guarantees */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  <Truck size={16} color="var(--primary)" /> Free simulated demonstration delivery
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  <ShieldCheck size={16} color="var(--success)" /> Instant automated test verification
                </div>
              </div>
            </div>

            {/* Quantity Picker & Add to Cart */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
              {!isOutOfStock && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 0.8rem', fontSize: '1rem' }}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 700 }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 0.8rem', fontSize: '1rem' }}
                    disabled={quantity >= product.stock_quantity}
                  >
                    +
                  </button>
                </div>
              )}

              <button
                onClick={handleAdd}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.75rem 1.25rem', fontSize: '1rem' }}
                disabled={isOutOfStock}
              >
                <ShoppingCart size={18} />
                {isOutOfStock ? 'Currently Unavailable' : `Add to Cart (${quantity})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
