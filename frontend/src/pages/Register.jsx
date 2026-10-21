import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, AlertCircle, ArrowRight, X } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [clientErrors, setClientErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!name.trim() || name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters long';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters long';
    }

    if (password !== confirmPassword) {
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
      await register(name.trim(), email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) navigate('/');
      }}
    >
      <div
        className="ui-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: 'var(--space-8) var(--space-6)',
          position: 'relative',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          borderRadius: '20px',
        }}
      >
        <button
          onClick={() => navigate('/')}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            padding: '0.4rem',
            borderRadius: '8px',
          }}
        >
          <X size={20} />
        </button>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 'var(--space-2)' }}>
            Create Account
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            Join VisionBuy to start demonstration shopping
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#fca5a5',
              fontSize: '0.875rem',
              marginBottom: 'var(--space-5)',
            }}
          >
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="name"
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
                size={18}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            {clientErrors.name && <span className="form-error">{clientErrors.name}</span>}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
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
                size={18}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            {clientErrors.email && <span className="form-error">{clientErrors.email}</span>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password (min. 8 characters)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
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
                size={18}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            {clientErrors.password && <span className="form-error">{clientErrors.password}</span>}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirmPassword"
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
                size={18}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            {clientErrors.confirmPassword && <span className="form-error">{clientErrors.confirmPassword}</span>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', marginBottom: 'var(--space-4)' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer Link */}
        <p style={{ textAlign: 'center', marginTop: 'var(--space-5)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
