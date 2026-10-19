import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import React from 'react';
import App from '../src/App';

describe('Phase 1: Frontend Foundation Tests', () => {
  it('T-FRONT-01: App component mounts and displays header and hero', () => {
    render(<App />);
    expect(screen.getAllByText(/Aurora/i)[0]).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /Catalogue/i })).toBeInTheDocument();
  });

  it('T-FRONT-02: Navbar renders navigation links and demo banner correctly', () => {
    render(<App />);
    const nav = screen.getByRole('navigation');
    expect(within(nav).getByRole('link', { name: /^Catalogue$/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /^Sign In$/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /^Register$/i })).toBeInTheDocument();
    expect(screen.getByText(/Demonstration Environment/i)).toBeInTheDocument();
  });
});
