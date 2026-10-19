import { query } from '../config/db.js';

/**
 * Format and calculate cart lines and totals from trusted product data
 */
async function fetchUserCart(userId) {
  const result = await query(
    `SELECT c.id, c.product_id, c.quantity,
            p.name, p.price::float, p.stock_quantity, p.image_url, p.category
     FROM cart_items c
     JOIN products p ON c.product_id = p.id
     WHERE c.user_id = $1
     ORDER BY c.created_at ASC`,
    [userId]
  );

  let subtotal = 0;
  let itemCount = 0;

  const items = result.rows.map((row) => {
    const unitPrice = Number(row.price);
    const lineTotal = Number((row.quantity * unitPrice).toFixed(2));
    subtotal += lineTotal;
    itemCount += row.quantity;

    return {
      id: row.id,
      productId: row.product_id,
      name: row.name,
      unitPrice,
      quantity: row.quantity,
      lineTotal,
      availableStock: row.stock_quantity,
      isAvailable: row.stock_quantity >= row.quantity,
      imageUrl: row.image_url,
      category: row.category,
    };
  });

  return {
    items,
    subtotal: Number(subtotal.toFixed(2)),
    itemCount,
  };
}

/**
 * Get current user cart
 * Traceable to: FR-CART-002, FR-API-002
 */
export async function getCart(req, res, next) {
  try {
    const cart = await fetchUserCart(req.user.id);
    return res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
}

/**
 * Add or increment item in cart
 * Traceable to: FR-CART-001, FR-API-002
 */
export async function addToCart(req, res, next) {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = Number(quantity);

    if (!productId || isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_QUANTITY',
          message: 'Quantity must be a positive whole integer',
        },
      });
    }

    // Verify product exists and check stock
    const productRes = await query(
      'SELECT id, name, price, stock_quantity FROM products WHERE id = $1',
      [productId]
    );

    if (productRes.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with ID '${productId}' was not found`,
        },
      });
    }

    const product = productRes.rows[0];

    if (product.stock_quantity <= 0) {
      return res.status(400).json({
        error: {
          code: 'OUT_OF_STOCK',
          message: `'${product.name}' is out of stock and cannot be added to the cart`,
        },
      });
    }

    // Check if item already exists in user cart
    const existingRes = await query(
      'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [req.user.id, productId]
    );

    if (existingRes.rows.length > 0) {
      const currentQty = existingRes.rows[0].quantity;
      const targetQty = currentQty + qty;

      if (targetQty > product.stock_quantity) {
        return res.status(400).json({
          error: {
            code: 'EXCEEDS_STOCK',
            message: `Cannot add ${qty} more unit(s). Total requested (${targetQty}) exceeds available stock (${product.stock_quantity})`,
          },
        });
      }

      await query(
        'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE user_id = $2 AND product_id = $3',
        [targetQty, req.user.id, productId]
      );
    } else {
      if (qty > product.stock_quantity) {
        return res.status(400).json({
          error: {
            code: 'EXCEEDS_STOCK',
            message: `Requested quantity (${qty}) exceeds available stock (${product.stock_quantity})`,
          },
        });
      }

      await query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)',
        [req.user.id, productId, qty]
      );
    }

    const cart = await fetchUserCart(req.user.id);
    return res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
}

/**
 * Update quantity of a cart line item
 * Traceable to: FR-CART-003, FR-CART-004
 */
export async function updateQuantity(req, res, next) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const qty = Number(quantity);

    if (isNaN(qty) || !Number.isInteger(qty) || qty < 0) {
      return res.status(400).json({
        error: {
          code: 'INVALID_QUANTITY',
          message: 'Quantity must be a non-negative whole integer',
        },
      });
    }

    // A quantity of 0 removes the item
    if (qty === 0) {
      await query(
        'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
        [req.user.id, productId]
      );
      const cart = await fetchUserCart(req.user.id);
      return res.status(200).json({ message: 'Item removed from cart', cart });
    }

    // Verify stock availability
    const productRes = await query(
      'SELECT name, stock_quantity FROM products WHERE id = $1',
      [productId]
    );

    if (productRes.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with ID '${productId}' was not found`,
        },
      });
    }

    const product = productRes.rows[0];

    if (qty > product.stock_quantity) {
      return res.status(400).json({
        error: {
          code: 'EXCEEDS_STOCK',
          message: `Requested quantity (${qty}) exceeds available stock (${product.stock_quantity})`,
        },
      });
    }

    await query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = NOW()`,
      [req.user.id, productId, qty]
    );

    const cart = await fetchUserCart(req.user.id);
    return res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
}

/**
 * Remove an item from the cart
 * Traceable to: FR-CART-004
 */
export async function removeFromCart(req, res, next) {
  try {
    const { productId } = req.params;

    await query(
      'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [req.user.id, productId]
    );

    const cart = await fetchUserCart(req.user.id);
    return res.status(200).json({ message: 'Item removed', cart });
  } catch (error) {
    next(error);
  }
}

/**
 * Clear user cart completely
 */
export async function clearCart(req, res, next) {
  try {
    await query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
    return res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * Revalidate cart data against current catalogue prices and stock
 * Traceable to: FR-CART-005
 */
export async function validateCart(req, res, next) {
  try {
    const items = req.body?.items;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: {
          code: 'EMPTY_CART',
          message: 'Cart cannot be empty',
        },
      });
    }

    const validatedItems = [];
    let subtotal = 0;
    const warnings = [];

    for (const item of items) {
      const productRes = await query(
        'SELECT id, name, price::float, stock_quantity, image_url FROM products WHERE id = $1',
        [item.productId]
      );

      if (productRes.rows.length === 0) {
        warnings.push(`Product '${item.productId}' no longer exists.`);
        continue;
      }

      const prod = productRes.rows[0];
      const qty = Math.max(1, Number(item.quantity) || 1);
      const isAvailable = prod.stock_quantity >= qty;

      if (!isAvailable) {
        if (prod.stock_quantity === 0) {
          warnings.push(`'${prod.name}' is now out of stock.`);
        } else {
          warnings.push(`Only ${prod.stock_quantity} unit(s) of '${prod.name}' available.`);
        }
      }

      const lineTotal = Number((qty * prod.price).toFixed(2));
      subtotal += lineTotal;

      validatedItems.push({
        productId: prod.id,
        name: prod.name,
        unitPrice: prod.price,
        quantity: qty,
        lineTotal,
        availableStock: prod.stock_quantity,
        isAvailable,
        imageUrl: prod.image_url,
      });
    }

    return res.status(200).json({
      items: validatedItems,
      subtotal: Number(subtotal.toFixed(2)),
      valid: warnings.length === 0,
      warnings,
    });
  } catch (error) {
    next(error);
  }
}
