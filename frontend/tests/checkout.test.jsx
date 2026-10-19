import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { CartProvider, useCart } from '../src/context/CartContext';
import Checkout from '../src/pages/Checkout';
import OrderConfirmation from '../src/pages/OrderConfirmation';
import * as apiModule from '../src/services/api';

function TestCheckoutSetup({ children }) {
  const { addToCart } = useCart();

  React.useEffect(() => {
    addToCart(
      {
        id: 'prod-001',
        name: 'Wireless Headphones',
        price: 150,
        stock_quantity: 10,
        image_url: 'https://example.com/test.jpg',
        category: 'Electronics',
      },
      2
    );
  }, []);

  return children;
}

describe('Phase 5: Checkout & Simulated Payment Frontend Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // T-CHK-UI-01: Empty delivery fields validation
  it('T-CHK-UI-01: Submitting checkout with empty fields displays inline validation errors', async () => {
    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <AuthProvider>
          <CartProvider>
            <TestCheckoutSetup>
              <Checkout />
            </TestCheckoutSetup>
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText('Wireless Headphones')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Place Demonstration Order/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Recipient name cannot be empty/i)).toBeInTheDocument();
    expect(await screen.findByText(/Street address cannot be empty/i)).toBeInTheDocument();
    expect(await screen.findByText(/City cannot be empty/i)).toBeInTheDocument();
    expect(await screen.findByText(/Postal code cannot be empty/i)).toBeInTheDocument();
  });

  // T-CHK-UI-02: Order review calculations display
  it('T-CHK-UI-02: Order review displays snapshot items, quantities, and authoritative total', async () => {
    vi.spyOn(apiModule.api, 'post').mockImplementation((url) => {
      if (url === '/checkout/preview') {
        return Promise.resolve({
          items: [{ productId: 'prod-001', name: 'Wireless Headphones', quantity: 2, lineTotal: 300 }],
          subtotal: 300,
          totalAmount: 300,
        });
      }
      return Promise.resolve({});
    });

    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <AuthProvider>
          <CartProvider>
            <TestCheckoutSetup>
              <Checkout />
            </TestCheckoutSetup>
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText('Wireless Headphones')).toBeInTheDocument();
    expect(screen.getByText('× 2')).toBeInTheDocument();
    expect(screen.getAllByText('$300.00').length).toBeGreaterThan(0);
  });

  // T-CHK-UI-03: Simulated Payment Success
  it('T-CHK-UI-03: Selecting "Simulate Payment Success" submits order and redirects to confirmation', async () => {
    const postSpy = vi.spyOn(apiModule.api, 'post').mockImplementation((url) => {
      if (url === '/checkout/preview') {
        return Promise.resolve({ items: [], subtotal: 300, totalAmount: 300 });
      }
      if (url === '/orders') {
        return Promise.resolve({
          order: {
            id: 'ord-123',
            order_number: 'ORD-999-001',
            order_status: 'Confirmed',
            payment_status: 'Paid',
            total_amount: 300,
            recipient_name: 'Jane Doe',
            address: '123 Test St',
            city: 'Springfield',
            postal_code: '12345',
            created_at: new Date().toISOString(),
            items: [{ product_name: 'Wireless Headphones', unit_price: 150, quantity: 2, line_total: 300 }],
          },
        });
      }
      return Promise.resolve({});
    });

    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <AuthProvider>
          <CartProvider>
            <TestCheckoutSetup>
              <Routes>
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders/:id" element={<OrderConfirmation />} />
              </Routes>
            </TestCheckoutSetup>
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText('Wireless Headphones')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Jane Doe/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. 123 Sample Boulevard/i), { target: { value: '123 Test St' } });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Springfield/i), { target: { value: 'Springfield' } });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. 12345/i), { target: { value: '12345' } });

    const submitBtn = screen.getByRole('button', { name: /Place Demonstration Order/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/orders', expect.objectContaining({
        simulatedPaymentOutcome: 'success',
      }));
      expect(screen.getByText(/Demonstration Order Confirmed!/i)).toBeInTheDocument();
      expect(screen.getByText('ORD-999-001')).toBeInTheDocument();
    });
  });

  // T-CHK-UI-04: Simulated Payment Decline
  it('T-CHK-UI-04: Selecting "Simulate Payment Decline" displays decline error message without clearing fields', async () => {
    vi.spyOn(apiModule.api, 'post').mockImplementation((url, body) => {
      if (url === '/checkout/preview') {
        return Promise.resolve({ items: [], subtotal: 300, totalAmount: 300 });
      }
      if (url === '/orders') {
        const error = new Error('Payment was declined');
        error.status = 402;
        error.code = 'PAYMENT_DECLINED';
        return Promise.reject(error);
      }
      return Promise.resolve({});
    });

    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <AuthProvider>
          <CartProvider>
            <TestCheckoutSetup>
              <Checkout />
            </TestCheckoutSetup>
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText('Wireless Headphones')).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText(/e\.g\. Jane Doe/i);
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. 123 Sample Boulevard/i), { target: { value: '123 Test St' } });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Springfield/i), { target: { value: 'Springfield' } });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. 12345/i), { target: { value: '12345' } });

    // Select Decline option
    const declineRadio = screen.getByLabelText(/Simulate Payment Decline/i);
    fireEvent.click(declineRadio);

    const submitBtn = screen.getByRole('button', { name: /Place Demonstration Order/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent(/declined by simulation/i);
    // Preserves entered input
    expect(nameInput.value).toBe('Jane Doe');
  });

  // T-CHK-UI-05: Double-click guard
  it('T-CHK-UI-05: Submit button is disabled while request is in-flight', async () => {
    let resolvePost;
    vi.spyOn(apiModule.api, 'post').mockImplementation((url) => {
      if (url === '/checkout/preview') return Promise.resolve({ items: [], subtotal: 300, totalAmount: 300 });
      if (url === '/orders') {
        return new Promise((resolve) => {
          resolvePost = resolve;
        });
      }
      return Promise.resolve({});
    });

    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <AuthProvider>
          <CartProvider>
            <TestCheckoutSetup>
              <Checkout />
            </TestCheckoutSetup>
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText('Wireless Headphones')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Jane Doe/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. 123 Sample Boulevard/i), { target: { value: '123 Test St' } });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Springfield/i), { target: { value: 'Springfield' } });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. 12345/i), { target: { value: '12345' } });

    const submitBtn = screen.getByRole('button', { name: /Place Demonstration Order/i });
    fireEvent.click(submitBtn);

    // Button should be disabled during flight
    expect(screen.getByRole('button', { name: /Processing Order/i })).toBeDisabled();

    // Clean up pending promise
    resolvePost({ order: { id: 'test' } });
  });
});
