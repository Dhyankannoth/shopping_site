import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { seedProducts } from '../db/seeds/seed_products.js';
import { query } from '../src/config/db.js';

describe('Phase 5: Checkout & Simulated Payment Backend Tests', () => {
  let authToken;
  let testUserId;

  const validDelivery = {
    recipientName: 'Jane Demonstration',
    address: '123 Test Avenue, Suite 100',
    city: 'Springfield',
    postalCode: '12345',
  };

  beforeAll(async () => {
    await seedProducts();

    const email = 'checkout.test@example.com';
    await query('DELETE FROM users WHERE email = $1', [email]);

    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Checkout Tester',
      email,
      password: 'Password123!',
    });

    authToken = regRes.body.token;
    testUserId = regRes.body.user.id;
  });

  afterAll(async () => {
    if (testUserId) {
      await query('DELETE FROM cart_items WHERE user_id = $1', [testUserId]);
      await query('DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = $1)', [testUserId]);
      await query('DELETE FROM orders WHERE user_id = $1', [testUserId]);
      await query('DELETE FROM users WHERE id = $1', [testUserId]);
    }
  });

  // T-CHK-01: Empty cart rejected
  it('T-CHK-01: Checkout is rejected with 400 when cart is empty', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        deliveryDetails: validDelivery,
        items: [],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('EMPTY_CART');
  });

  // T-CHK-02: Missing or whitespace delivery fields rejected
  it('T-CHK-02: Checkout rejected with 400 when delivery details contain whitespace-only or empty fields', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        deliveryDetails: {
          recipientName: '   ',
          address: '',
          city: ' ',
          postalCode: '  ',
        },
        items: [{ productId: 'prod-001', quantity: 1 }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.length).toBeGreaterThanOrEqual(4);
  });

  // T-CHK-03: Server computes total authoritatively
  it('T-CHK-03: Server ignores client price tampering and computes authoritative total from DB', async () => {
    const res = await request(app)
      .post('/api/checkout/preview')
      .send({
        items: [{ productId: 'prod-001', quantity: 2, price: 0.01 }], // Tampered client price
      });

    expect(res.status).toBe(200);
    // prod-001 price in DB is 149.99, so 2 units = 299.98
    expect(res.body.totalAmount).toBe(299.98);
  });

  // T-PAY-01: Simulated Payment Success
  it('T-PAY-01: Simulated payment "success" confirms order, decrements stock, and returns order snapshot', async () => {
    // Get initial stock of prod-001 (15)
    const initialRes = await request(app).get('/api/products/prod-001');
    const initialStock = initialRes.body.product.stock_quantity;

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        deliveryDetails: validDelivery,
        items: [{ productId: 'prod-001', quantity: 2 }],
        simulatedPaymentOutcome: 'success',
      });

    expect(res.status).toBe(201);
    expect(res.body.order.order_status).toBe('Confirmed');
    expect(res.body.order.payment_status).toBe('Paid');
    expect(res.body.order.total_amount).toBe(299.98);
    expect(res.body.order.items).toHaveLength(1);

    // Verify stock decremented by 2
    const postRes = await request(app).get('/api/products/prod-001');
    expect(postRes.body.product.stock_quantity).toBe(initialStock - 2);
  });

  // T-PAY-02: Simulated Payment Decline
  it('T-PAY-02: Simulated payment "declined" records Payment Failed, does NOT decrement stock', async () => {
    const initialRes = await request(app).get('/api/products/prod-002');
    const initialStock = initialRes.body.product.stock_quantity;

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        deliveryDetails: validDelivery,
        items: [{ productId: 'prod-002', quantity: 1 }],
        simulatedPaymentOutcome: 'declined',
      });

    expect(res.status).toBe(402);
    expect(res.body.error.code).toBe('PAYMENT_DECLINED');

    // Verify stock was NOT decremented
    const postRes = await request(app).get('/api/products/prod-002');
    expect(postRes.body.product.stock_quantity).toBe(initialStock);
  });

  // T-PAY-03: Simulated Payment Timeout
  it('T-PAY-03: Simulated payment "timeout" returns 504 and does NOT decrement stock', async () => {
    const initialRes = await request(app).get('/api/products/prod-002');
    const initialStock = initialRes.body.product.stock_quantity;

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        deliveryDetails: validDelivery,
        items: [{ productId: 'prod-002', quantity: 1 }],
        simulatedPaymentOutcome: 'timeout',
      });

    expect(res.status).toBe(504);
    expect(res.body.error.code).toBe('PAYMENT_TIMEOUT');

    // Verify stock untouched
    const postRes = await request(app).get('/api/products/prod-002');
    expect(postRes.body.product.stock_quantity).toBe(initialStock);
  });

  // T-PAY-04: Idempotency protection against duplicate submissions
  it('T-PAY-04: Resubmitting with same idempotency key returns existing order without duplicate stock decrement', async () => {
    const idempotencyKey = 'unique-test-key-' + Date.now();

    const initialRes = await request(app).get('/api/products/prod-006');
    const initialStock = initialRes.body.product.stock_quantity;

    // First submission
    const firstRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        idempotencyKey,
        deliveryDetails: validDelivery,
        items: [{ productId: 'prod-006', quantity: 1 }],
        simulatedPaymentOutcome: 'success',
      });

    expect(firstRes.status).toBe(201);
    const orderId = firstRes.body.order.id;

    // Second submission with identical key
    const secondRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        idempotencyKey,
        deliveryDetails: validDelivery,
        items: [{ productId: 'prod-006', quantity: 1 }],
        simulatedPaymentOutcome: 'success',
      });

    expect(secondRes.status).toBe(200);
    expect(secondRes.body.order.id).toBe(orderId);
    expect(secondRes.body.isDuplicate).toBe(true);

    // Stock should have only decremented ONCE (1 unit, not 2)
    const postRes = await request(app).get('/api/products/prod-006');
    expect(postRes.body.product.stock_quantity).toBe(initialStock - 1);
  });

  // T-PAY-05: Concurrency guard against overselling
  it('T-PAY-05: Competing requests for limited stock permit only available units and prevent negative stock', async () => {
    // prod-003 has 2 units in seed
    await query('UPDATE products SET stock_quantity = 1 WHERE id = $1', ['prod-003']);

    // Send two parallel orders competing for the 1 remaining unit
    const p1 = request(app)
      .post('/api/orders')
      .send({
        deliveryDetails: validDelivery,
        items: [{ productId: 'prod-003', quantity: 1 }],
        simulatedPaymentOutcome: 'success',
      });

    const p2 = request(app)
      .post('/api/orders')
      .send({
        deliveryDetails: validDelivery,
        items: [{ productId: 'prod-003', quantity: 1 }],
        simulatedPaymentOutcome: 'success',
      });

    const [res1, res2] = await Promise.all([p1, p2]);

    const statuses = [res1.status, res2.status];
    expect(statuses).toContain(201);
    expect(statuses).toContain(409); // The losing request receives 409 Conflict

    // Final stock must be 0, never negative
    const finalProd = await request(app).get('/api/products/prod-003');
    expect(finalProd.body.product.stock_quantity).toBe(0);
  });
});
