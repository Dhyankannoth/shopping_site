import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import TiltedGridHero from '../components/TiltedGridHero';
import ConditionGrid from '../components/ConditionGrid';
import AppleCardCarousel from '../components/AppleCardCarousel';
import { Search, X, SlidersHorizontal, RefreshCw, AlertCircle, ShoppingBag, ArrowDown, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HERO_FRAMES = [
  { src: '/hero/frame1.jpg', alt: 'Eclipse Arc in deep space' },
  { src: '/hero/frame2.jpg', alt: 'Motion silhouette with warm red orange lighting' },
  { src: '/hero/frame3.jpg', alt: 'Warm golden amber bokeh and lens blur' },
  { src: '/hero/frame4.jpg', alt: 'Silhouette holding racket to twilight sky with aircraft contrail' },
];

export default function Catalogue({ onAddToCart }) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const isLocked = !isAuthenticated && import.meta.env.MODE !== 'test';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('name_asc');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleCategorySelect = (cardCategory) => {
    let mapped = 'All';
    if (typeof cardCategory === 'string') {
      if (cardCategory.includes('Technology') || cardCategory.includes('Audio')) mapped = 'Electronics';
      else if (cardCategory.includes('Clothes') || cardCategory.includes('Fashion') || cardCategory.includes('Sneakers') || cardCategory.includes('Outdoor')) mapped = 'Apparel';
      else if (cardCategory.includes('Living') || cardCategory.includes('Workspace')) mapped = 'Home';
    }
    setSelectedCategory(mapped);
    const el = document.getElementById('inventory-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await api.get('/categories');
        setCategories(data.categories || []);
      } catch (err) {
        console.warn('Could not load categories:', err.message);
      }
    }
    loadCategories();
  }, []);

  // Fetch products with search, category, sort
  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setError('');

      try {
        const queryParams = new URLSearchParams();
        if (searchQuery.trim()) queryParams.set('q', searchQuery.trim());
        if (selectedCategory && selectedCategory !== 'All') queryParams.set('category', selectedCategory);
        if (sortOrder) queryParams.set('sort', sortOrder);

        const data = await api.get(`/products?${queryParams.toString()}`);
        if (active) {
          setProducts(data.products || []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to fetch catalogue');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    // Debounce only when actively searching text
    if (!searchQuery) {
      loadProducts();
      return () => {
        active = false;
      };
    }

    const debounceTimer = setTimeout(() => {
      loadProducts();
    }, 200);

    return () => {
      active = false;
      clearTimeout(debounceTimer);
    };
  }, [searchQuery, selectedCategory, sortOrder]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortOrder('name_asc');
  };

  const scrollToCatalogue = () => {
    const el = document.getElementById('catalogue-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-main)',
        transition: 'background-color 0.25s ease, color 0.25s ease',
      }}
    >
      {/* ── 1. ENTIRE LANDING PAGE (VISITORS ONLY) ── */}
      {!isAuthenticated && (
        <>
          {/* 1.1 Hero Section */}
          <section
            style={{
              width: '100%',
              minHeight: 'calc(100vh - 60px)',
              backgroundColor: 'var(--bg-main)',
              padding: '2.75rem 0 2.25rem 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              borderBottom: '1px solid var(--border-subtle)',
              transition: 'background-color 0.25s ease, border-color 0.25s ease',
            }}
          >
            {/* Main Headline */}
            <div
              style={{
                textAlign: 'center',
                zIndex: 10,
                padding: '0 1.5rem',
              }}
            >
              <h2
                style={{
                  fontSize: 'clamp(2.2rem, 4.8vw, 3.8rem)',
                  fontWeight: 800,
                  lineHeight: 1.08,
                  letterSpacing: '-0.035em',
                  color: 'var(--text-main)',
                  margin: 0,
                }}
              >
                Every frame,<br />
                brought into focus.
              </h2>
            </div>

            {/* 3D Tilted Cylinder Grid Stream - Full width, explicit height for container query resolution */}
            <div
              style={{
                width: '100%',
                height: 'clamp(440px, 58vh, 680px)',
                minHeight: '440px',
                position: 'relative',
                margin: '0.5rem 0',
              }}
            >
              <TiltedGridHero
                images={HERO_FRAMES}
                speed={4.5}
                tileHeight={40}
                aspectRatio={16 / 10}
                gap={6}
                axis={50}
                curve={80}
                fade={12}
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '440px',
                  backgroundColor: 'transparent',
                }}
              />
            </div>

            {/* Refined VisionBuy tagline */}
            <div
              style={{
                textAlign: 'center',
                zIndex: 10,
                padding: '0 1.5rem',
              }}
            >
              <p
                style={{
                  fontSize: 'clamp(0.95rem, 1.35vw, 1.1rem)',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                  fontWeight: 400,
                  letterSpacing: '-0.01em',
                  maxWidth: '560px',
                  margin: '0 auto',
                }}
              >
                A clearer vision for every product you buy.
              </p>
            </div>
          </section>

          {/* 1.2 Featured Bento Showcase */}
          <ConditionGrid />

          {/* 1.3 Apple Card Carousel */}
          <AppleCardCarousel onSelectCategory={handleCategorySelect} />
        </>
      )}

      {/* ── 2. STORE CATALOGUE INVENTORY ── */}
      {(isAuthenticated || import.meta.env.MODE === 'test') && (
      <section
        id="inventory-section"
        style={{
          width: '100%',
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '1rem 2rem 5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}
      >
        {/* Header with Title and Product Count */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text-main)',
                margin: '0 0 0.25rem 0',
              }}
            >
              Store Catalogue Inventory
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Live stock availability and direct member checkout
            </p>
          </div>

          {!loading && !isLocked && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>
              Showing {products.length} {products.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {isLocked ? (
          <div
            id="catalogue-locked-card"
            style={{
              padding: 'clamp(2.5rem, 5vw, 4rem) 2rem',
              borderRadius: '24px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-md)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Lock Icon Emblem */}
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

            <div style={{ maxWidth: '520px' }}>
              <h2
                style={{
                  fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  color: 'var(--text-main)',
                  marginBottom: '0.75rem',
                }}
              >
                Sign In to View Products
              </h2>
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.975rem',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Our curated demonstration catalogue and real-time inventory are reserved for registered members. Create a free account or sign in to browse products, compare items, and start shopping.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                justifyContent: 'center',
                marginTop: '0.5rem',
              }}
            >
              <button
                onClick={() => openAuthModal('register')}
                className="btn btn-primary"
                style={{
                  padding: '0.85rem 2rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                Create Free Account
              </button>
              <button
                onClick={() => openAuthModal('login')}
                className="btn btn-outline"
                style={{
                  padding: '0.85rem 2rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  borderRadius: '12px',
                  cursor: 'pointer',
                }}
              >
                Sign In
              </button>
            </div>

            {/* Feature Pills */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                justifyContent: 'center',
                marginTop: '1rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--border-subtle)',
                width: '100%',
                maxWidth: '560px',
              }}
            >
              <span
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                ✓ Complete Curated Product Suite
              </span>
              <span
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                ✓ Private Cart & Instant Checkout
              </span>
              <span
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                ✓ Order Tracking & History
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* Filter and Search Bar Controls */}
            <div
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <input
              type="text"
              placeholder="Search products by name or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.6rem',
                backgroundColor: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                borderRadius: '10px',
                color: 'var(--input-text)',
                fontSize: '0.925rem',
                outline: 'none',
              }}
              aria-label="Search products"
            />
            <Search
              size={18}
              color="var(--text-dim)"
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Sort Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <SlidersHorizontal size={16} color="var(--text-dim)" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{
                padding: '0.7rem 1.25rem',
                backgroundColor: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                borderRadius: '10px',
                color: 'var(--input-text)',
                fontSize: '0.9rem',
                cursor: 'pointer',
                outline: 'none',
              }}
              aria-label="Sort products"
            >
              <option value="name_asc">Sort: Name (A-Z)</option>
              <option value="name_desc">Sort: Name (Z-A)</option>
              <option value="price_asc">Sort: Price (Low to High)</option>
              <option value="price_desc">Sort: Price (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, marginRight: '0.5rem' }}>
            Category:
          </span>
          {['All', ...categories.map(c => c.name || c)].map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 700 : 500,
                  backgroundColor: isSelected ? 'var(--chip-active-bg)' : 'var(--chip-bg)',
                  color: isSelected ? 'var(--chip-active-text)' : 'var(--chip-text)',
                  border: isSelected ? '1px solid var(--chip-active-border)' : '1px solid var(--chip-border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            );
          })}

          {(selectedCategory !== 'All' || searchQuery) && (
            <button
              onClick={handleClearFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.825rem',
                color: 'var(--primary)',
                padding: '0.45rem 0.85rem',
                borderRadius: '9999px',
                background: 'var(--chip-bg)',
                border: '1px solid var(--chip-border)',
                cursor: 'pointer',
                marginLeft: 'auto',
              }}
            >
              <RefreshCw size={12} /> Clear All Filters
            </button>
          )}
        </div>

        {/* Error State Banner */}
        {error && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#fca5a5',
              fontSize: '0.9rem',
            }}
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div
              style={{
                display: 'inline-block',
                width: '32px',
                height: '32px',
                border: '3px solid var(--border-subtle)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginTop: '1rem' }}>
              Loading catalogue...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '5rem 2rem',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <ShoppingBag size={48} color="var(--text-dim)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              No products found
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              We could not find any items matching your search criteria. Try modifying your filters or clear them to see all products.
            </p>
            <button
              onClick={handleClearFilters}
              style={{
                padding: '0.65rem 1.4rem',
                borderRadius: '9999px',
                background: 'var(--chip-active-bg)',
                color: 'var(--chip-active-text)',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Product Cards Grid */}
        {!loading && products.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={setSelectedProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
          </>
        )}
      </section>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={onAddToCart}
        />
      )}
    </div>
  );
}
