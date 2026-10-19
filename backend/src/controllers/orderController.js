import { pool, query } from '../config/db.js';

/**
 * Preview checkout calculations authoritatively from DB prices
 * Traceable to: FR-CHK-001, FR-CHK-003
 */
export async function checkoutPreview(req, res, next) {
  try {
    let items = req.body?.items;

    // If items not in body, load from user's DB cart if authenticated
    if ((!items || items.length === 0) && req.user?.id) {
      const cartRes = await query(
        `SELECT c.product_id as "productId", c.quantity, p.name, p.price::float as "unitPrice"
         FROM cart_items c JOIN products p ON c.product_id = p.id
         WHERE c.user_id = $1`,
        [req.user.id]
      );
      items = cartRes.rows;
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        error: {
          code: 'EMPTY_CART',
          message: 'Cannot checkout with an empty cart',
        },
      });
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prodRes = await query(
        'SELECT id, name, price::float, stock_quantity FROM products WHERE id = $1',
        [item.productId]
      );

      if (prodRes.rows.length === 0) continue;
      const prod = prodRes.rows[0];
      const qty = Number(item.quantity);
      const lineTotal = Number((qty * prod.price).toFixed(2));
      subtotal += lineTotal;

      validatedItems.push({
        productId: prod.id,
        name: prod.name,
        unitPrice: prod.price,
        quantity: qty,
        lineTotal,
        availableStock: prod.stock_quantity,
      });
    }

    return res.status(200).json({
      items: validatedItems,
      subtotal: Number(subtotal.toFixed(2)),
      shippingFee: 0.0,
      tax: 0.0,
      totalAmount: Number(subtotal.toFixed(2)),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Place a demonstration order with atomic stock locks and simulated payment
 * Traceable to: FR-CHK-001 to FR-CHK-005, FR-PAY-001 to FR-PAY-005, FR-DATA-002, FR-DATA-003
 */
export async function createOrder(req, res, next) {
  const client = await pool.connect();

  try {
    const { idempotencyKey, deliveryDetails, simulatedPaymentOutcome = 'success' } = req.body;
    let items = req.body.items;

    // 1. Idempotency Check: if submission already processed, return existing order
    if (idempotencyKey) {
      const existingOrderRes = await client.query(
        `SELECT id, order_number, user_id, recipient_name, address, city, postal_code,
                subtotal::float, shipping_fee::float, tax::float, total_amount::float,
                payment_status, order_status, idempotency_key, created_at
         FROM orders
         WHERE idempotency_key = $1`,
        [idempotencyKey]
      );

      if (existingOrderRes.rows.length > 0) {
        const order = existingOrderRes.rows[0];
        const itemsRes = await client.query(
          `SELECT product_id, product_name, unit_price::float, quantity, line_total::float
           FROM order_items
           WHERE order_id = $1`,
          [order.id]
        );
        client.release();
        return res.status(200).json({
          order: { ...order, items: itemsRes.rows },
          isDuplicate: true,
        });
      }
    }

    // 2. Resolve items
    if ((!items || items.length === 0) && req.user?.id) {
      const cartRes = await client.query(
        `SELECT c.product_id as "productId", c.quantity
         FROM cart_items c
         WHERE c.user_id = $1`,
        [req.user.id]
      );
      items = cartRes.rows;
    }

    if (!items || items.length === 0) {
      client.release();
      return res.status(400).json({
        error: {
          code: 'EMPTY_CART',
          message: 'Cannot place an order with an empty cart',
        },
      });
    }

    // 3. Begin Transaction with Row Locks
    await client.query('BEGIN');

    const orderItemsToInsert = [];
    let subtotal = 0;

    for (const item of items) {
      // Lock product row for atomic stock check and decrement
      const productRes = await client.query(
        'SELECT id, name, price::float, stock_quantity FROM products WHERE id = $1 FOR UPDATE',
        [item.productId]
      );

      if (productRes.rows.length === 0) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(404).json({
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: `Product '${item.productId}' does not exist`,
          },
        });
      }

      const prod = productRes.rows[0];
      const qty = Number(item.quantity);

      if (prod.stock_quantity < qty) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(409).json({
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: `Insufficient stock for '${prod.name}'. Available: ${prod.stock_quantity}, requested: ${qty}`,
          },
        });
      }

      const lineTotal = Number((qty * prod.price).toFixed(2));
      subtotal += lineTotal;

      orderItemsToInsert.push({
        productId: prod.id,
        productName: prod.name,
        unitPrice: prod.price,
        quantity: qty,
        lineTotal,
      });
    }

    const totalAmount = Number(subtotal.toFixed(2));
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // 4. Handle Simulated Payment Outcomes
    if (simulatedPaymentOutcome === 'timeout') {
      await client.query('ROLLBACK');
      client.release();
      return res.status(504).json({
        error: {
          code: 'PAYMENT_TIMEOUT',
          message: 'Simulated payment processing timed out. Cart is preserved and no order was placed.',
        },
      });
    }

    if (simulatedPaymentOutcome === 'declined') {
      // Record declined order for demonstration audit without consuming stock
      const orderRes = await client.query(
        `INSERT INTO orders (
           order_number, user_id, recipient_name, address, city, postal_code,
           subtotal, shipping_fee, tax, total_amount, payment_status, order_status, idempotency_key
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          orderNumber,
          req.user?.id || null,
          deliveryDetails.recipientName,
          deliveryDetails.address,
          deliveryDetails.city,
          deliveryDetails.postalCode,
          subtotal,
          0.0,
          0.0,
          totalAmount,
          'Declined',
          'Payment Failed',
          idempotencyKey || null,
        ]
      );

      const order = orderRes.rows[0];

      for (const item of orderItemsToInsert) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [order.id, item.productId, item.productName, item.unitPrice, item.quantity, item.lineTotal]
        );
      }

      await client.query('COMMIT');
      client.release();

      return res.status(402).json({
        error: {
          code: 'PAYMENT_DECLINED',
          message: 'Simulated demonstration payment was declined. You can retry with a different test outcome.',
        },
        orderId: order.id,
      });
    }

    // 5. Payment Success: Decrement Stock and Create Confirmed Order
    for (const item of orderItemsToInsert) {
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.productId]
      );
    }

    const orderRes = await client.query(
      `INSERT INTO orders (
         order_number, user_id, recipient_name, address, city, postal_code,
         subtotal, shipping_fee, tax, total_amount, payment_status, order_status, idempotency_key
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        orderNumber,
        req.user?.id || null,
        deliveryDetails.recipientName,
        deliveryDetails.address,
        deliveryDetails.city,
        deliveryDetails.postalCode,
        subtotal,
        0.0,
        0.0,
        totalAmount,
        'Paid',
        'Confirmed',
        idempotencyKey || null,
      ]
    );

    const order = orderRes.rows[0];

    for (const item of orderItemsToInsert) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.productId, item.productName, item.unitPrice, item.quantity, item.lineTotal]
      );
    }

    // Clear user's DB cart if authenticated
    if (req.user?.id) {
      await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
    }

    await client.query('COMMIT');
    client.release();

    return res.status(201).json({
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        shipping_fee: Number(order.shipping_fee),
        tax: Number(order.tax),
        total_amount: Number(order.total_amount),
        items: orderItemsToInsert,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    client.release();
    next(error);
  }
}

/**
 * Get single order details
 * Traceable to: FR-ORD-001, FR-ORD-002
 */
export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;

    const orderRes = await query(
      `SELECT id, order_number, user_id, recipient_name, address, city, postal_code,
              subtotal::float, shipping_fee::float, tax::float, total_amount::float,
              payment_status, order_status, created_at
       FROM orders
       WHERE id = $1`,
      [id]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'ORDER_NOT_FOUND',
          message: `Order with ID '${id}' was not found`,
        },
      });
    }

    const order = orderRes.rows[0];
    const itemsRes = await query(
      `SELECT product_id, product_name, unit_price::float, quantity, line_total::float
       FROM order_items
       WHERE order_id = $1`,
      [id]
    );

    return res.status(200).json({
      order: {
        ...order,
        items: itemsRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List orders for current authenticated user
 * Traceable to: FR-ORD-003, FR-ORD-004
 */
export async function listOrders(req, res, next) {
  try {
    const ordersRes = await query(
      `SELECT id, order_number, recipient_name, total_amount::float, payment_status, order_status, created_at
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      orders: ordersRes.rows,
    });
  } catch (error) {
    next(error);
  }
}
