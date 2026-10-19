import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Catalogue from '../src/pages/Catalogue';
import * as apiModule from '../src/services/api';

describe('Phase 3: Product Catalogue Frontend Tests', () => {
  const mockProducts = [
    {
      id: 'prod-001',
      name: 'Wireless Headphones',
      description: 'Noise canceling headphones',
      price: 149.99,
      category: 'Electronics',
      stock_quantity: 10,
      image_url: 'https://example.com/headphones.jpg',
    },
    {
      id: 'prod-002',
      name: 'Organic Crewneck',
      description: 'Comfortable t-shirt',
      price: 29.99,
      category: 'Apparel',
      stock_quantity: 5,
      image_url: 'https://example.com/shirt.jpg',
    },
    {
      id: 'prod-005',
      name: 'Technical Windbreaker',
      description: 'Waterproof jacket',
      price: 119.0,
      category: 'Apparel',
      stock_quantity: 0, // OUT OF STOCK
      image_url: 'https://example.com/jacket.jpg',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // T-CAT-UI-01: Renders product cards with name, price, and stock status
  it('T-CAT-UI-01: Renders product cards with name, price, and stock badges', async () => {
    vi.spyOn(apiModule.api, 'get').mockImplementation((url) => {
      if (url === '/categories') return Promise.resolve({ categories: ['Electronics', 'Apparel'] });
      return Promise.resolve({ products: mockProducts, total: mockProducts.length });
    });

    render(
      <MemoryRouter>
        <Catalogue />
      </MemoryRouter>
    );

    expect(await screen.findByText('Wireless Headphones')).toBeInTheDocument();
    expect(screen.getByText('Organic Crewneck')).toBeInTheDocument();
    expect(screen.getByText('$149.99')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  // T-CAT-UI-02: Search filtering
  it('T-CAT-UI-02: Typing in search calls API and updates displayed products', async () => {
    const getSpy = vi.spyOn(apiModule.api, 'get').mockImplementation((url) => {
      if (url === '/categories') return Promise.resolve({ categories: ['Electronics', 'Apparel'] });
      if (url.includes('q=Headphones')) {
        return Promise.resolve({ products: [mockProducts[0]], total: 1 });
      }
      return Promise.resolve({ products: mockProducts, total: mockProducts.length });
    });

    render(
      <MemoryRouter>
        <Catalogue />
      </MemoryRouter>
    );

    expect(await screen.findByText('Wireless Headphones')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search products/i);
    fireEvent.change(searchInput, { target: { value: 'Headphones' } });

    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledWith(expect.stringContaining('q=Headphones'));
    });
  });

  // T-CAT-UI-03: Category filter chips
  it('T-CAT-UI-03: Clicking a category chip triggers category-filtered query', async () => {
    const getSpy = vi.spyOn(apiModule.api, 'get').mockImplementation((url) => {
      if (url === '/categories') return Promise.resolve({ categories: ['Electronics', 'Apparel'] });
      return Promise.resolve({ products: mockProducts, total: mockProducts.length });
    });

    render(
      <MemoryRouter>
        <Catalogue />
      </MemoryRouter>
    );

    const electronicsBtn = await screen.findByRole('button', { name: 'Electronics' });
    fireEvent.click(electronicsBtn);

    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledWith(expect.stringContaining('category=Electronics'));
    });
  });

  // T-CAT-UI-04: Out-of-Stock handling
  it('T-CAT-UI-04: Out of stock item renders Out of Stock badge and disables Add button', async () => {
    vi.spyOn(apiModule.api, 'get').mockImplementation((url) => {
      if (url === '/categories') return Promise.resolve({ categories: ['Apparel'] });
      return Promise.resolve({ products: [mockProducts[2]], total: 1 });
    });

    render(
      <MemoryRouter>
        <Catalogue />
      </MemoryRouter>
    );

    expect(await screen.findByText('Technical Windbreaker')).toBeInTheDocument();
    expect(screen.getByText(/Out of Stock/i)).toBeInTheDocument();

    const addBtn = screen.getByRole('button', { name: /out of stock/i });
    expect(addBtn).toBeDisabled();
  });

  // T-CAT-UI-05: Empty state display
  it('T-CAT-UI-05: Displays friendly empty-state when no products match', async () => {
    vi.spyOn(apiModule.api, 'get').mockImplementation((url) => {
      if (url === '/categories') return Promise.resolve({ categories: [] });
      return Promise.resolve({ products: [], total: 0 });
    });

    render(
      <MemoryRouter>
        <Catalogue />
      </MemoryRouter>
    );

    expect(await screen.findByText(/No products found/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear All Filters/i })).toBeInTheDocument();
  });
});
