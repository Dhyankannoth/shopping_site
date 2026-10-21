import React from 'react';
import { Link } from 'react-router-dom';
import TiltedGridHero from '../components/TiltedGridHero';
import { ArrowLeft, Sparkles, Layers, ShieldCheck, Zap, ShoppingBag, ArrowRight } from 'lucide-react';

const HERO_FRAMES = [
  { src: '/hero/frame1.jpg', alt: 'Eclipse Arc in deep space' },
  { src: '/hero/frame2.jpg', alt: 'Motion silhouette with warm red orange lighting' },
  { src: '/hero/frame3.jpg', alt: 'Warm golden amber bokeh and lens blur' },
  { src: '/hero/frame4.jpg', alt: 'Silhouette holding racket to twilight sky with aircraft contrail' },
];

export default function HeroShowcase() {
  return (
    <div
      style={{
        backgroundColor: '#000000',
        color: '#ffffff',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font-heading)',
        position: 'relative',
      }}
    >
      {/* Sleek Minimalist Floating Top Navbar */}
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '64px',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 50,
        }}
      >
        {/* Top-Left: Empty spacer to balance layout */}
        <div style={{ width: '40px' }} />

        {/* Center / Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span
              style={{
                fontSize: '0.85rem',
                color: '#94a3b8',
                cursor: 'default',
                fontWeight: 500,
              }}
            >
              Cylinder Projection
            </span>
            <span
              style={{
                fontSize: '0.85rem',
                color: '#64748b',
                cursor: 'default',
              }}
            >
              16 Facets / Slices
            </span>
          </nav>

          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 1rem',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background-color 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
            }}
          >
            <ArrowLeft size={14} /> Back to Store
          </Link>
        </div>
      </header>

      {/* Full-Screen Main Hero Canvas */}
      <main
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Upper Floating Headline */}
        <div
          style={{
            position: 'absolute',
            top: 'clamp(5.25rem, 12vh, 8rem)',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            zIndex: 20,
            pointerEvents: 'none',
            width: '100%',
            maxWidth: '960px',
            padding: '0 1.5rem',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5.2vw, 4.4rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.035em',
              color: '#ffffff',
              margin: 0,
              textShadow: '0 4px 28px rgba(0, 0, 0, 0.95)',
            }}
          >
            Every frame,<br />
            brought into focus.
          </h1>
        </div>

        {/* 3D Tilted Cylinder Grid Stream - Expanding across entire screen width & height */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <TiltedGridHero
            images={HERO_FRAMES}
            speed={4.5}
            tileHeight={42}
            aspectRatio={16 / 10}
            gap={6}
            axis={50}
            curve={80}
            fade={12}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent',
            }}
          />
        </div>

        {/* Lower Floating Tagline & CTA Action */}
        <div
          style={{
            position: 'absolute',
            bottom: 'clamp(4rem, 9.5vh, 6.5rem)',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            zIndex: 20,
            width: '100%',
            maxWidth: '600px',
            padding: '0 1.5rem',
          }}
        >
          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)',
              color: '#e2e8f0',
              lineHeight: 1.5,
              fontWeight: 400,
              letterSpacing: '-0.01em',
              margin: '0 auto 1.25rem',
              textShadow: '0 2px 14px rgba(0, 0, 0, 0.9)',
            }}
          >
            A clearer vision for every product you buy.
          </p>
        </div>
      </main>

      {/* Floating Bottom Footer Signature */}
      <footer
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '46px',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: '#64748b',
          fontSize: '0.8rem',
          zIndex: 50,
        }}
      >
        <span>VisionBuy — Scroll Tilted Grid 3D Projection</span>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span>SLICES: 16</span>
          <span>•</span>
          <span>CAMERA: 1.6</span>
          <span>•</span>
          <span>CURVE: 80°</span>
        </div>
      </footer>
    </div>
  );
}
