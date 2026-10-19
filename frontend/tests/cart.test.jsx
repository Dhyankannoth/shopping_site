import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { CartProvider, useCart } from '../src/context/CartContext';
import Cart from '../src/pages/Cart';
import Navbar from '../src/components/Navbar';

function TestCartWrapper({ initialItems = [] }) {
  // Helper test component to seed CartContext items
  const { items, addToCart } = useCart();

  React.useEffect(() => {
    initialItems.forEach((item) => {
      addToCart({
        id: item.productId,
        name: item.name,
        price: item.unitPrice,
        stock_quantity: 10,
        image_url: 'https://example.com/test.jpg',
        category: 'Electronics',
      }, item.quantity);
    });
  }, []);

  return <Cart />;
}

describe('Phase 4: Cart Management Frontend Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // T-CART-UI-01: Add to Cart updates navbar counter
  it('T-CART-UI-01: Navbar cart counter reflects item count', () => {
    render(
      <MemoryRouter>
        <Navbar cartCount={3} />
      </MemoryRouter>
    );

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  // T-CART-UI-02: Quantity changes recalculate line total and subtotal
  it('T-CART-UI-02: Incrementing item quantity updates line total and order summary', async () => {
    render(
      <MemoryRouter initialEntries={['/cart']}>
        <AuthProvider>
          <CartProvider>
            <TestCartWrapper
              initialItems={[
                { productId: 'prod-001', name: 'Wireless Headphones', unitPrice: 100, quantity: 1 },
              ]}
            />
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText('Wireless Headphones')).toBeInTheDocument();
    expect(screen.getByText('$100.00 each')).toBeInTheDocument();

    // Click + button
    const plusBtn = screen.getByRole('button', { name: /increase quantity/i });
    fireEvent.click(plusBtn);

    // Quantity should now be 2, line total $200.00
    expect(await screen.findByText('2')).toBeInTheDocument();
    expect(screen.getAllByText('$200.00').length).toBeGreaterThan(0);
  });

  // T-CART-UI-03: Remove item
  it('T-CART-UI-03: Clicking remove button deletes line item from cart', async () => {
    render(
      <MemoryRouter initialEntries={['/cart']}>
        <AuthProvider>
          <CartProvider>
            <TestCartWrapper
              initialItems={[
                { productId: 'prod-002', name: 'Gaming Keyboard', unitPrice: 50, quantity: 1 },
              ]}
            />
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText('Gaming Keyboard')).toBeInTheDocument();

    const removeBtn = screen.getByRole('button', { name: /remove gaming keyboard/i });
    fireEvent.click(removeBtn);

    expect(screen.queryByText('Gaming Keyboard')).not.toBeInTheDocument();
    expect(await screen.findByText(/Your cart is empty/i)).toBeInTheDocument();
  });

  // T-CART-UI-04: Empty cart state
  it('T-CART-UI-04: Empty cart displays friendly empty message and CTA', async () => {
    render(
      <MemoryRouter initialEntries={['/cart']}>
        <AuthProvider>
          <CartProvider>
            <Cart />
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore Catalogue/i })).toBeInTheDocument();
  });
});
