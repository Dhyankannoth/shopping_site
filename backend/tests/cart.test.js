import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { seedProducts } from '../db/seeds/seed_products.js';
import { query } from '../src/config/db.js';

describe('Phase 4: Cart Management Backend Tests', () => {
  let authToken;
  let testUserId;

  beforeAll(async () => {
    await seedProducts();

    // Create a fresh test user
    const email = 'cart.test.user@example.com';
    await query('DELETE FROM users WHERE email = $1', [email]);

    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Cart Tester',
      email,
      password: 'Password123!',
    });

    authToken = regRes.body.token;
    testUserId = regRes.body.user.id;
  });

  afterAll(async () => {
    if (testUserId) {
      await query('DELETE FROM cart_items WHERE user_id = $1', [testUserId]);
      await query('DELETE FROM users WHERE id = $1', [testUserId]);
    }
  });

  // T-CART-01: Add available item
  it('T-CART-01: Adding available product adds line item with correct quantity and calculated subtotal', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ productId: 'prod-001', quantity: 1 });

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].productId).toBe('prod-001');
    expect(res.body.items[0].quantity).toBe(1);
    expect(res.body.items[0].lineTotal).toBe(149.99);
    expect(res.body.subtotal).toBe(149.99);
  });

  // T-CART-02: Increment existing item
  it('T-CART-02: Adding existing item increments quantity in same line item', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ productId: 'prod-001', quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(3);
    expect(res.body.items[0].lineTotal).toBe(449.97);
    expect(res.body.subtotal).toBe(449.97);
  });

  // T-CART-03: Reject out-of-stock or exceeding stock
  it('T-CART-03: Adding out-of-stock product or exceeding available stock is rejected with 400', async () => {
    // prod-005 has 0 stock in seed
    const outOfStockRes = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ productId: 'prod-005', quantity: 1 });

    expect(outOfStockRes.status).toBe(400);
    expect(outOfStockRes.body.error.code).toBe('OUT_OF_STOCK');

    // prod-003 has 2 stock in seed
    const exceedStockRes = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ productId: 'prod-003', quantity: 10 });

    expect(exceedStockRes.status).toBe(400);
    expect(exceedStockRes.body.error.code).toBe('EXCEEDS_STOCK');
  });

  // T-CART-04: Update quantity
  it('T-CART-04: Updating quantity recalculates line item subtotal and cart subtotal', async () => {
    const res = await request(app)
      .patch('/api/cart/items/prod-001')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ quantity: 2 });

    expect(res.status).toBe(200);
    const item = res.body.items.find((i) => i.productId === 'prod-001');
    expect(item.quantity).toBe(2);
    expect(item.lineTotal).toBe(299.98);
    expect(res.body.subtotal).toBe(299.98);
  });

  // T-CART-05: Update quantity to 0 removes item
  it('T-CART-05: Updating quantity to 0 removes the item from the cart', async () => {
    // Add prod-002 first
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ productId: 'prod-002', quantity: 1 });

    // Set prod-001 to 0
    const res = await request(app)
      .patch('/api/cart/items/prod-001')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ quantity: 0 });

    expect(res.status).toBe(200);
    const hasProd1 = res.body.cart.items.some((i) => i.productId === 'prod-001');
    expect(hasProd1).toBe(false);
  });

  // T-CART-06: Remove item and clear cart
  it('T-CART-06: Removing an item updates cart count; clearing cart results in empty cart', async () => {
    const removeRes = await request(app)
      .delete('/api/cart/items/prod-002')
      .set('Authorization', `Bearer ${authToken}`);

    expect(removeRes.status).toBe(200);
    expect(removeRes.body.cart.items).toHaveLength(0);
    expect(removeRes.body.cart.subtotal).toBe(0);

    // Verify GET /api/cart returns empty
    const getRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${authToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.items).toHaveLength(0);
  });

  // T-CART-07: Cart revalidation endpoint
  it('T-CART-07: POST /api/cart/validate reports stock warnings and authoritative totals', async () => {
    const res = await request(app)
      .post('/api/cart/validate')
      .send({
        items: [
          { productId: 'prod-001', quantity: 2 },
          { productId: 'prod-005', quantity: 1 }, // Out of stock
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('subtotal');
    expect(res.body.valid).toBe(false);
    expect(res.body.warnings.length).toBeGreaterThan(0);
    expect(res.body.warnings[0]).toContain('out of stock');
  });
});
