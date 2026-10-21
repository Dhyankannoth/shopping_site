import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Organic character scatter displacement offsets on hover (matching the GIF micro-interaction)
const SCATTER_OFFSETS = [
  { x: -3.5, y: 3.5, r: -10 },
  { x: -2.0, y: -7.5, r: 12 },
  { x: 3.0, y: -9.0, r: -8 },
  { x: 5.5, y: -4.5, r: 15 },
  { x: 4.0, y: 4.5, r: -12 },
  { x: -4.5, y: -5.5, r: 9 },
  { x: 2.5, y: 6.0, r: -7 },
  { x: -1.5, y: -8.5, r: 11 },
  { x: 5.0, y: -2.0, r: -14 },
  { x: -3.0, y: 6.5, r: 8 },
];

export default function ScatterLink({
  to,
  children,
  onClick,
  active = false,
  className = '',
  style = {},
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);
  const text = typeof children === 'string' ? children : String(children || '');

  return (
    <Link
      to={to}
      onClick={onClick}
      aria-label={props['aria-label'] || text}
      className={`scatter-link ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.45rem 0.85rem',
        color: active ? 'var(--text-main)' : isHovered ? 'var(--text-main)' : 'var(--text-muted)',
        fontSize: '0.85rem',
        fontWeight: active ? 600 : 450,
        letterSpacing: '-0.015em',
        textDecoration: 'none',
        transition: 'color 0.18s ease',
        cursor: 'pointer',
        ...style,
      }}
      {...props}
    >
      <span aria-hidden="true" className="scatter-word" style={{ display: 'inline-flex', position: 'relative' }}>
        {text.split('').map((char, idx) => {
          const offset = SCATTER_OFFSETS[idx % SCATTER_OFFSETS.length];
          const isSpace = char === ' ';
          const charStyle = isHovered && !isSpace
            ? {
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0) rotate(${offset.r}deg)`,
                color: 'var(--text-main)',
                display: 'inline-block',
                transition: 'transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.18s ease',
              }
            : {
                transform: 'translate3d(0, 0, 0) rotate(0deg)',
                display: 'inline-block',
                transition: 'transform 0.2s ease, color 0.18s ease',
              };

          return (
            <span key={idx} className="scatter-letter" style={charStyle}>
              {isSpace ? '\u00A0' : char}
            </span>
          );
        })}
      </span>
    </Link>
  );
}
