import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import { Search, X, SlidersHorizontal, RefreshCw, AlertCircle, ShoppingBag } from 'lucide-react';

export default function Catalogue({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('name_asc');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 'var(--space-2)' }}>
            Catalogue
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Explore verified demonstration products with live stock availability
          </p>
        </div>

        {/* Count summary */}
        {!loading && (
          <span style={{ fontSize: '0.875rem', color: 'var(--text-dim)', fontWeight: 600 }}>
            Showing {products.length} {products.length === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      {/* Filter and Search Bar Controls */}
      <div
        className="ui-card"
        style={{
          padding: 'var(--space-5)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search products by name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: searchQuery ? '2.5rem' : '1rem' }}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <SlidersHorizontal size={16} color="var(--text-dim)" />
          <select
            className="form-control"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{ padding: '0.65rem 1rem', cursor: 'pointer' }}
            aria-label="Sort products"
          >
            <option value="name_asc">Sort: Name (A-Z)</option>
            <option value="name_desc">Sort: Name (Z-A)</option>
            <option value="price_asc">Sort: Price (Low to High)</option>
            <option value="price_desc">Sort: Price (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
        {['All', ...categories].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Error View */}
      {error && (
        <div
          role="alert"
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton / State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem', fontSize: '0.95rem' }}>Loading catalogue...</p>
        </div>
      ) : products.length === 0 ? (
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
            <ShoppingBag size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No products found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', fontSize: '0.9rem' }}>
            We couldn't find any items matching your active search or filters. Try adjusting your query.
          </p>
          <button onClick={handleClearFilters} className="btn btn-secondary" style={{ marginTop: 'var(--space-2)' }}>
            Clear All Filters
          </button>
        </div>
      ) : (
        /* Products Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-6)',
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
