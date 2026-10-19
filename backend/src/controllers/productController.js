import { query } from '../config/db.js';
import { seedProducts } from '../../db/seeds/seed_products.js';

/**
 * List products with search, category filter, price range, and sorting
 * Traceable to: FR-CAT-001, FR-CAT-003, FR-CAT-004, FR-CAT-005, FR-CAT-006, FR-API-001
 */
export async function getProducts(req, res, next) {
  try {
    const { q, category, minPrice, maxPrice, availability, sort } = req.query;

    const conditions = [];
    const params = [];

    // Search query: Case-insensitive across name and description
    if (q && typeof q === 'string' && q.trim()) {
      params.push(`%${q.trim()}%`);
      conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }

    // Category filter
    if (category && typeof category === 'string' && category.trim()) {
      params.push(category.trim());
      conditions.push(`category = $${params.length}`);
    }

    // Price range filter
    if (minPrice && !isNaN(Number(minPrice))) {
      params.push(Number(minPrice));
      conditions.push(`price >= $${params.length}`);
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      params.push(Number(maxPrice));
      conditions.push(`price <= $${params.length}`);
    }

    // Availability filter
    if (availability === 'in_stock') {
      conditions.push('stock_quantity > 0');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Safe sorting
    let orderClause = 'ORDER BY name ASC';
    if (sort === 'price_asc') {
      orderClause = 'ORDER BY price ASC';
    } else if (sort === 'price_desc') {
      orderClause = 'ORDER BY price DESC';
    } else if (sort === 'name_desc') {
      orderClause = 'ORDER BY name DESC';
    }

    const sql = `SELECT id, name, description, price::float, category, stock_quantity, image_url, created_at
                 FROM products
                 ${whereClause}
                 ${orderClause}`;

    const result = await query(sql, params);

    return res.status(200).json({
      products: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Product Details by ID
 * Traceable to: FR-CAT-002, FR-ERR-002
 */
export async function getProductById(req, res, next) {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, name, description, price::float, category, stock_quantity, image_url, created_at
       FROM products
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with ID '${id}' was not found`,
        },
      });
    }

    return res.status(200).json({
      product: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List Distinct Product Categories
 */
export async function getCategories(req, res, next) {
  try {
    const result = await query(
      'SELECT DISTINCT category FROM products ORDER BY category ASC'
    );

    return res.status(200).json({
      categories: result.rows.map((r) => r.category),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Reset Demonstration Data to baseline
 * Traceable to: FR-DATA-004, FR-ERR-003
 */
export async function resetDemoData(req, res, next) {
  try {
    // Clean orders and cart items
    await query('DELETE FROM cart_items');
    await query('DELETE FROM order_items');
    await query('DELETE FROM orders');

    // Re-seed baseline products
    await seedProducts();

    return res.status(200).json({
      message: 'Demonstration data successfully reset to baseline.',
    });
  } catch (error) {
    next(error);
  }
}
