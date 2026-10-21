import React, { useState, useContext } from 'react';
import { ArrowRight, Check, Star } from 'lucide-react';
import CartContext from '../context/CartContext';

// Deterministic rating generator for realistic e-commerce presentation
function getProductRating(id = '') {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const ratings = ['4.9 (186 Reviews)', '4.8 (124 Reviews)', '4.8 (94 Reviews)', '4.7 (142 Reviews)', '4.9 (210 Reviews)'];
  const tags = ['New Drop', 'Eco Style', 'Verified', 'Top Choice', 'Bestseller'];
  const abs = Math.abs(hash);
  return {
    ratingText: ratings[abs % ratings.length],
    tag1: 'New Drop',
    tag2: tags[(abs + 1) % tags.length] || 'Eco Style',
  };
}

export default function ProductCard({ product, onSelectProduct, onAddToCart }) {
  const [isAdded, setIsAdded] = useState(false);
  const [activeDot, setActiveDot] = useState(0);
  const [localQuantity, setLocalQuantity] = useState(0);

  const cartContext = useContext(CartContext);
  const cartItem = cartContext?.items?.find(
    (item) => item.productId === product.id || item.id === product.id
  );
  // Quantity taken in cart (using CartContext if present, or localQuantity)
  const itemsTaken = cartItem ? cartItem.quantity : localQuantity;

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 3;
  const meta = getProductRating(product.id);

  const handleCardClick = () => {
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  const handleBuyClick = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    setLocalQuantity((prev) => prev + 1);
    if (onAddToCart) {
      onAddToCart(product);
    }
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1200);
  };

  return (
    <div
      className="modern-product-card"
      data-testid="product-card"
      onClick={handleCardClick}
      role="article"
      aria-label={product.name}
    >
      {/* ── 1. Image Container (with inset rounded corners & frosted badges) ── */}
      <div className="modern-card-image-wrap">
        <img
          src={product.image_url}
          alt={product.name}
          className="modern-card-image"
          loading="lazy"
        />

        {/* Top-Left Badges (New Drop, Eco Style / Category / Stock) */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            zIndex: 2,
          }}
        >
          {isOutOfStock ? (
            <span
              className="modern-pill-badge"
              style={{
                background: 'rgba(239, 68, 68, 0.75)',
                borderColor: 'rgba(239, 68, 68, 0.9)',
                color: '#ffffff',
                fontWeight: 700,
              }}
            >
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span
              className="modern-pill-badge"
              style={{
                background: 'rgba(245, 158, 11, 0.75)',
                borderColor: 'rgba(245, 158, 11, 0.9)',
                color: '#ffffff',
                fontWeight: 700,
              }}
            >
              Only {product.stock_quantity} left
            </span>
          ) : (
            <>
              <span className="modern-pill-badge">{meta.tag1}</span>
              <span className="modern-pill-badge">{product.category || meta.tag2}</span>
            </>
          )}
        </div>

        {/* Top-Right Badge (Rating & Reviews count) */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 2,
          }}
        >
          <span className="modern-pill-badge">
            <Star size={11} fill="#fbbf24" stroke="#fbbf24" style={{ marginRight: '2px' }} />
            {meta.ratingText}
          </span>
        </div>

        {/* Bottom-Center Carousel Indicator Dots */}
        <div className="modern-carousel-dots" aria-hidden="true">
          {[0, 1, 2, 3].map((idx) => (
            <span
              key={idx}
              className={`modern-carousel-dot ${activeDot === idx ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveDot(idx);
              }}
            />
          ))}
        </div>
      </div>

      {/* ── 2. Card Content (Title, Description, Price, Buy Button) ── */}
      <div className="modern-card-body">
        <h3
          className="modern-card-title"
          onClick={handleCardClick}
          title={product.name}
        >
          {product.name}
        </h3>

        <p className="modern-card-desc">
          {product.description}
        </p>

        {/* Footer with Price and Olive Pill Buy Button */}
        <div className="modern-card-footer">
          <div className="modern-card-price">
            ${Number(product.price).toFixed(2)}
          </div>

          <button
            onClick={handleBuyClick}
            disabled={isOutOfStock}
            className="modern-buy-btn"
            aria-label={
              isOutOfStock
                ? `${product.name} is out of stock`
                : itemsTaken > 0
                ? `${itemsTaken} in Cart. Click to add more.`
                : `Add ${product.name} to Cart`
            }
            title={
              isOutOfStock
                ? 'Item is out of stock'
                : itemsTaken > 0
                ? `${itemsTaken} in cart - click to add more`
                : 'Add to cart'
            }
          >
            <span>
              {isOutOfStock
                ? 'Sold Out'
                : isAdded
                ? 'Added'
                : itemsTaken > 0
                ? `${itemsTaken} in Cart`
                : 'Buy Now'}
            </span>

            <span className="modern-buy-arrow" aria-hidden="true">
              {isAdded ? (
                <Check size={14} strokeWidth={2.6} />
              ) : itemsTaken > 0 ? (
                <span style={{ fontSize: '0.9rem', fontWeight: 800, lineHeight: 1 }}>+</span>
              ) : (
                <ArrowRight size={14} strokeWidth={2.4} />
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
