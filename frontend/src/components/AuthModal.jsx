import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, AlertCircle, ArrowRight, X } from 'lucide-react';

export default function AuthModal({ isOpen, initialMode = 'login', onClose }) {
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [clientErrors, setClientErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const modalRef = useRef(null);

  // Sync mode with initialMode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setServerError('');
      setClientErrors({});
    }
  }, [isOpen, initialMode]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset errors when mode changes
  const switchMode = (newMode) => {
    setMode(newMode);
    setServerError('');
    setClientErrors({});
  };

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (mode === 'register') {
      if (!name.trim() || name.trim().length < 2) {
        errs.name = 'Name must be at least 2 characters long';
      }
    }

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (mode === 'register' && password.length < 8) {
      errs.password = 'Password must be at least 8 characters long';
    }

    if (mode === 'register' && password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setClientErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
      onClose();
    } catch (err) {
      setServerError(err.message || `${mode === 'login' ? 'Login' : 'Registration'} failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setServerError('');
    setLoading(true);
    try {
      await loginWithGoogle('mock-google-valid-token');
      onClose();
    } catch (err) {
      setServerError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.25rem',
        animation: 'fadeIn 0.2s ease-out forwards',
      }}
      onClick={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        style={{
          width: '100%',
          maxWidth: '450px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9)',
          padding: '2rem',
          position: 'relative',
          color: 'var(--text-main)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close authentication modal"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease, color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)';
            e.currentTarget.style.color = 'var(--text-main)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <X size={16} />
        </button>

        {/* Modal Tab Switcher */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface-elevated)',
            padding: '0.25rem',
            borderRadius: '9999px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.75rem',
          }}
        >
          <button
            type="button"
            onClick={() => switchMode('login')}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: mode === 'login' ? 700 : 500,
              backgroundColor: mode === 'login' ? 'var(--primary)' : 'transparent',
              color: mode === 'login' ? '#000000' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: mode === 'register' ? 700 : 500,
              backgroundColor: mode === 'register' ? 'var(--primary)' : 'transparent',
              color: mode === 'register' ? '#000000' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2
            id="auth-modal-title"
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              margin: '0 0 0.35rem 0',
              color: 'var(--text-main)',
            }}
          >
            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            {mode === 'login'
              ? 'Sign in to unlock product catalogue, cart, and orders'
              : 'Sign up to unlock the entire product collection and shopping cart'}
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: 'var(--danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#fca5a5',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{serverError}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} noValidate>
          {mode === 'register' && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="modal-name">
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="modal-name"
                  type="text"
                  className="form-control"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (clientErrors.name) setClientErrors({ ...clientErrors, name: '' });
                  }}
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                />
                <User
                  size={16}
                  color="var(--text-dim)"
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
              {clientErrors.name && <span className="form-error">{clientErrors.name}</span>}
            </div>
          )}

          {/* Email Field */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" htmlFor="modal-email">
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="modal-email"
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (clientErrors.email) setClientErrors({ ...clientErrors, email: '' });
                }}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
              />
              <Mail
                size={16}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            {clientErrors.email && <span className="form-error">{clientErrors.email}</span>}
          </div>

          {/* Password Field */}
          <div className="form-group" style={{ marginBottom: mode === 'register' ? '1rem' : '1.25rem' }}>
            <label className="form-label" htmlFor="modal-password">
              Password {mode === 'register' && '(min. 8 characters)'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="modal-password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (clientErrors.password) setClientErrors({ ...clientErrors, password: '' });
                }}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
              />
              <Lock
                size={16}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            {clientErrors.password && <span className="form-error">{clientErrors.password}</span>}
          </div>

          {mode === 'register' && (
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="modal-confirm-password">
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="modal-confirm-password"
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (clientErrors.confirmPassword) setClientErrors({ ...clientErrors, confirmPassword: '' });
                  }}
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                />
                <Lock
                  size={16}
                  color="var(--text-dim)"
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
              {clientErrors.confirmPassword && <span className="form-error">{clientErrors.confirmPassword}</span>}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', fontWeight: 700 }}
            disabled={loading}
          >
            {loading
              ? mode === 'login'
                ? 'Signing in...'
                : 'Creating Account...'
              : mode === 'login'
              ? 'Sign In'
              : 'Create Account'}{' '}
            <ArrowRight size={16} />
          </button>
        </form>

        {mode === 'login' && (
          <>
            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                margin: '1.25rem 0',
                color: 'var(--text-dim)',
                fontSize: '0.75rem',
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              <span>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.65rem', gap: '0.6rem', fontSize: '0.875rem' }}
              disabled={loading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </button>
          </>
        )}
      </div>
    </div>
  );
}
