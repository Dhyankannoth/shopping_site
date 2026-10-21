import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, LogOut, ShieldCheck, Sun, Moon } from 'lucide-react';
import ScatterLink from './ScatterLink';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ user, cartCount = 0, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { openAuthModal } = useAuth();

  const handleCatalogueClick = (e) => {
    if (location.pathname === '/' || location.pathname === '/catalogue') {
      const el = document.getElementById('catalogue-section');
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      className="navbar-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--nav-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        width: '100%',
        transition: 'background-color 0.25s ease, border-color 0.25s ease',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 2rem',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left balance spacer */}
        <div style={{ width: '40px' }} />

        {/* Minimalist Centered Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <ScatterLink to="/" onClick={handleHomeClick} active={location.pathname === '/'}>
            Home
          </ScatterLink>

          <ScatterLink to="/#catalogue" onClick={handleCatalogueClick}>
            Catalogue
          </ScatterLink>

          {!user && (
            <>
              <ScatterLink
                to="/login"
                onClick={(e) => {
                  e.preventDefault();
                  openAuthModal('login');
                }}
                active={location.pathname === '/login'}
              >
                Sign In
              </ScatterLink>
              <ScatterLink
                to="/register"
                onClick={(e) => {
                  e.preventDefault();
                  openAuthModal('register');
                }}
                active={location.pathname === '/register'}
              >
                Register
              </ScatterLink>
            </>
          )}

          {user && (
            <ScatterLink to="/orders" active={location.pathname === '/orders'}>
              My Orders
            </ScatterLink>
          )}
        </nav>

        {/* Right Section: Theme Switcher, Demo Environment Status & Cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Subtle Demo Environment Badge */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              color: 'var(--text-dim)',
              fontWeight: 500,
            }}
            className="demo-notice-desktop"
          >
            <ShieldCheck size={13} color="#10b981" />
            <span>Demo Platform</span>
          </div>

          {/* Theme Toggle Button (Light / Dark Mode Switcher) */}
          <button
            onClick={toggleTheme}
            id="theme-toggle-btn"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '9999px',
              background: 'var(--chip-bg)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              transition: 'background-color 0.2s, border-color 0.2s, transform 0.15s',
              cursor: 'pointer',
            }}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-strong)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.transform = 'scale(1.0)';
            }}
          >
            {theme === 'dark' ? (
              <Sun size={17} strokeWidth={2} />
            ) : (
              <Moon size={17} strokeWidth={2} />
            )}
          </button>

          {/* User Profile / Logout */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  maxWidth: '160px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.name || user.email}
              </span>
              <button
                onClick={onLogout}
                style={{
                  color: 'var(--text-muted)',
                  background: 'transparent',
                  padding: '0.35rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.15s',
                }}
                title="Log out"
                aria-label="Log out"
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

          {/* Cart Icon Button with Counter Badge */}
          <Link
            to="/cart"
            onClick={(e) => {
              if (!user && import.meta.env.MODE !== 'test') {
                e.preventDefault();
                openAuthModal('login');
              }
            }}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '9999px',
              background: 'var(--chip-bg)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              transition: 'background-color 0.15s, border-color 0.15s',
              textDecoration: 'none',
            }}
            aria-label="Shopping Cart"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-strong)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--primary)',
                  color: '#000000',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
