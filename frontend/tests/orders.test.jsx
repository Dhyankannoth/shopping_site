import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import OrderConfirmation from '../src/pages/OrderConfirmation';
import OrderHistory from '../src/pages/OrderHistory';
import * as apiModule from '../src/services/api';

describe('Phase 6: Orders & Confirmation Frontend Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const mockOrder = {
    id: 'ord-uuid-12345',
    order_number: 'ORD-20261019-888',
    order_status: 'Confirmed',
    payment_status: 'Paid',
    total_amount: 149.99,
    subtotal: 149.99,
    recipient_name: 'John Customer',
    address: '456 Elm Street',
    city: 'Metropolis',
    postal_code: '54321',
    created_at: new Date().toISOString(),
    items: [
      { product_name: 'Wireless Headphones', unit_price: 149.99, quantity: 1, line_total: 149.99 },
    ],
  };

  // T-ORD-UI-01: Order confirmation renders immutable snapshot
  it('T-ORD-UI-01: Order confirmation page renders reference, address, items, and total', async () => {
    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce({ order: mockOrder });

    render(
      <MemoryRouter initialEntries={['/orders/ord-uuid-12345']}>
        <Routes>
          <Route path="/orders/:id" element={<OrderConfirmation />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Demonstration Order Confirmed!/i)).toBeInTheDocument();
    expect(screen.getByText('ORD-20261019-888')).toBeInTheDocument();
    expect(screen.getByText('John Customer')).toBeInTheDocument();
    expect(screen.getByText(/456 Elm Street/i)).toBeInTheDocument();
    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
    expect(screen.getAllByText('$149.99').length).toBeGreaterThan(0);
  });

  // T-ORD-UI-02: Page refresh idempotency
  it('T-ORD-UI-02: Refreshing order confirmation retrieves stored snapshot without triggering checkout', async () => {
    const getSpy = vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce({ order: mockOrder });
    const postSpy = vi.spyOn(apiModule.api, 'post');

    render(
      <MemoryRouter initialEntries={['/orders/ord-uuid-12345']}>
        <Routes>
          <Route path="/orders/:id" element={<OrderConfirmation />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('ORD-20261019-888')).toBeInTheDocument();
    expect(getSpy).toHaveBeenCalledWith('/orders/ord-uuid-12345');
    // Crucial: no new order creation call triggered
    expect(postSpy).not.toHaveBeenCalled();
  });

  // T-ORD-UI-03: Order history list
  it('T-ORD-UI-03: Order history displays past demonstration orders for authenticated user', async () => {
    vi.spyOn(apiModule.api, 'get').mockImplementation((url) => {
      if (url === '/auth/me') return Promise.resolve({ user: { id: 'u1', name: 'John Customer' } });
      if (url === '/orders') {
        return Promise.resolve({
          orders: [
            {
              id: 'ord-uuid-12345',
              order_number: 'ORD-20261019-888',
              order_status: 'Confirmed',
              total_amount: 149.99,
              created_at: new Date().toISOString(),
            },
          ],
        });
      }
      return Promise.resolve({});
    });

    localStorage.setItem('token', 'valid-test-token');

    render(
      <MemoryRouter initialEntries={['/orders']}>
        <AuthProvider>
          <Routes>
            <Route path="/orders" element={<OrderHistory />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText('ORD-20261019-888')).toBeInTheDocument();
    expect(screen.getByText('$149.99')).toBeInTheDocument();
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View Receipt/i })).toBeInTheDocument();
  });
});
