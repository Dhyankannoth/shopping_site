import React from 'react';
import { ShoppingCart, Eye } from 'lucide-react';

export default function ProductCard({ product, onSelectProduct, onAddToCart }) {
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 3;

  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Product Image Container */}
      <div
        style={{
          position: 'relative',
          paddingTop: '65%',
          backgroundColor: 'var(--bg-surface-elevated)',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        onClick={() => onSelectProduct && onSelectProduct(product)}
      >
        <img
          src={product.image_url}
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.25s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        />

        {/* Stock Badge Overlay */}
        <div style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)' }}>
          {isOutOfStock ? (
            <span className="badge badge-danger">Out of Stock</span>
          ) : isLowStock ? (
            <span className="badge badge-warning">Only {product.stock_quantity} left</span>
          ) : (
            <span className="badge badge-success">In Stock</span>
          )}
        </div>

        {/* Category Tag */}
        <div style={{ position: 'absolute', bottom: 'var(--space-3)', left: 'var(--space-3)' }}>
          <span
            style={{
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {product.category}
          </span>
        </div>
      </div>

      {/* Product Details Content */}
      <div
        style={{
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              marginBottom: 'var(--space-2)',
              lineHeight: 1.35,
              cursor: 'pointer',
            }}
            onClick={() => onSelectProduct && onSelectProduct(product)}
          >
            {product.name}
          </h3>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              marginBottom: 'var(--space-4)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.description}
          </p>
        </div>

        {/* Price and Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--border-subtle)',
            marginTop: 'auto',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Price</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              onClick={() => onSelectProduct && onSelectProduct(product)}
              className="btn btn-secondary"
              style={{ padding: '0.55rem 0.75rem' }}
              title="View details"
              aria-label={`View details for ${product.name}`}
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => onAddToCart && onAddToCart(product)}
              className="btn btn-primary"
              style={{ padding: '0.55rem 0.95rem' }}
              disabled={isOutOfStock}
              aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to Cart`}
            >
              <ShoppingCart size={16} />
              <span>{isOutOfStock ? 'Sold Out' : 'Add'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
