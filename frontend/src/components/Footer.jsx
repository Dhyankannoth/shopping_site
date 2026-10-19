import React from 'react';
import { RotateCcw, ShieldCheck, Database } from 'lucide-react';

export default function Footer({ onResetDemo }) {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-glass)',
      backgroundColor: 'rgba(11, 15, 25, 0.95)',
      padding: '2.5rem 1.5rem 2rem',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: 'var(--container-max-width)',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        {/* Top Notice */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid var(--border-glass)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={20} color="var(--primary)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <strong>Demonstration Environment:</strong> All checkout and payments are simulated. No real cards or funds are ever used.
            </span>
          </div>

          {onResetDemo && (
            <button
              onClick={onResetDemo}
              className="btn btn-secondary"
              style={{ fontSize: '0.825rem', padding: '0.45rem 0.85rem' }}
            >
              <RotateCcw size={14} />
              Reset Demo Data
            </button>
          )}
        </div>

        {/* Bottom Credits */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--text-dim)',
          fontSize: '0.825rem',
          paddingTop: '0.5rem',
        }}>
          <p>© 2026 Aurora Store. Functional Demonstration Platform.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>React.js</span>
            <span>•</span>
            <span>PostgreSQL</span>
            <span>•</span>
            <span>Express</span>
            <span>•</span>
            <span>Node.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
