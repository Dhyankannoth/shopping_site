import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { seedProducts } from '../db/seeds/seed_products.js';
import { query } from '../src/config/db.js';

describe('Phase 3: Product Catalogue Backend Tests', () => {
  beforeAll(async () => {
    await seedProducts();
  });

  // T-CAT-01: Full Catalogue
  it('T-CAT-01: GET /api/products returns full list of seeded products with expected fields', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.products).toBeInstanceOf(Array);
    expect(res.body.products.length).toBeGreaterThanOrEqual(8);

    const first = res.body.products[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('description');
    expect(first).toHaveProperty('price');
    expect(first).toHaveProperty('category');
    expect(first).toHaveProperty('stock_quantity');
    expect(first).toHaveProperty('image_url');
  });

  // T-CAT-02: Case-Insensitive Search
  it('T-CAT-02: Search is case-insensitive and finds matches across name/description', async () => {
    const lowerRes = await request(app).get('/api/products?q=headphones');
    expect(lowerRes.status).toBe(200);
    expect(lowerRes.body.products.length).toBeGreaterThan(0);
    expect(lowerRes.body.products[0].name).toContain('Headphones');

    const upperRes = await request(app).get('/api/products?q=HEADPHONES');
    expect(upperRes.status).toBe(200);
    expect(upperRes.body.products.length).toBe(lowerRes.body.products.length);
  });

  // T-CAT-03: Resilience to Special Characters in Search
  it('T-CAT-03: Special characters in query parameter do not crash the database or server', async () => {
    const res = await request(app).get("/api/products?q='; DROP TABLE products; -- %&!@#");
    expect(res.status).toBe(200);
    expect(res.body.products).toBeInstanceOf(Array);
  });

  // T-CAT-04: Category and Price Filtering
  it('T-CAT-04: Filters by category and price range accurately', async () => {
    const catRes = await request(app).get('/api/products?category=Electronics');
    expect(catRes.status).toBe(200);
    expect(catRes.body.products.length).toBeGreaterThan(0);
    catRes.body.products.forEach((p) => {
      expect(p.category).toBe('Electronics');
    });

    const priceRes = await request(app).get('/api/products?minPrice=30&maxPrice=100');
    expect(priceRes.status).toBe(200);
    priceRes.body.products.forEach((p) => {
      expect(p.price).toBeGreaterThanOrEqual(30);
      expect(p.price).toBeLessThanOrEqual(100);
    });
  });

  // T-CAT-05: Sorting
  it('T-CAT-05: Sorting by price_asc and price_desc orders products correctly', async () => {
    const ascRes = await request(app).get('/api/products?sort=price_asc');
    expect(ascRes.status).toBe(200);
    const ascPrices = ascRes.body.products.map((p) => p.price);
    for (let i = 0; i < ascPrices.length - 1; i++) {
      expect(ascPrices[i]).toBeLessThanOrEqual(ascPrices[i + 1]);
    }

    const descRes = await request(app).get('/api/products?sort=price_desc');
    expect(descRes.status).toBe(200);
    const descPrices = descRes.body.products.map((p) => p.price);
    for (let i = 0; i < descPrices.length - 1; i++) {
      expect(descPrices[i]).toBeGreaterThanOrEqual(descPrices[i + 1]);
    }
  });

  // T-CAT-06: Product Details by ID & 404 Handling
  it('T-CAT-06: GET /api/products/:id returns product details; unknown ID returns 404', async () => {
    const validRes = await request(app).get('/api/products/prod-001');
    expect(validRes.status).toBe(200);
    expect(validRes.body.product.id).toBe('prod-001');
    expect(validRes.body.product.name).toContain('Headphones');

    const missingRes = await request(app).get('/api/products/prod-non-existent-999');
    expect(missingRes.status).toBe(404);
    expect(missingRes.body.error.code).toBe('PRODUCT_NOT_FOUND');
  });

  // T-CAT-07: Reset Demonstration Data
  it('T-CAT-07: POST /api/demo/reset restores stock quantities back to seeded baseline', async () => {
    // Manually modify stock of prod-001
    await query('UPDATE products SET stock_quantity = 0 WHERE id = $1', ['prod-001']);

    const modRes = await request(app).get('/api/products/prod-001');
    expect(modRes.body.product.stock_quantity).toBe(0);

    // Call demo reset
    const resetRes = await request(app).post('/api/demo/reset');
    expect(resetRes.status).toBe(200);
    expect(resetRes.body.message).toContain('reset');

    // Verify prod-001 restored to 15
    const checkRes = await request(app).get('/api/products/prod-001');
    expect(checkRes.body.product.stock_quantity).toBe(15);
  });
});
