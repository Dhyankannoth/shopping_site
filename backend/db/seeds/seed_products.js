import { pool, query } from '../../src/config/db.js';

export const SEEDED_PRODUCTS = [
  {
    id: 'prod-001',
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and plush memory foam earcups.',
    price: 149.99,
    category: 'Electronics',
    stock_quantity: 15,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-002',
    name: 'Mechanical RGB Gaming Keyboard',
    description: 'Compact mechanical keyboard featuring tactile brown switches, customizable per-key backlighting, and braided cable.',
    price: 89.50,
    category: 'Electronics',
    stock_quantity: 8,
    image_url: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-003',
    name: 'Ultra-Slim 27-inch 4K Monitor',
    description: 'Crisp IPS display with 99% sRGB color accuracy, USB-C connectivity, and tilt-adjustable stand.',
    price: 299.00,
    category: 'Electronics',
    stock_quantity: 2, // Limited stock for testing FR-DATA-001 / FR-DATA-002
    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-004',
    name: 'Organic Cotton Everyday Crewneck',
    description: 'Sustainably sourced 100% organic cotton t-shirt with a modern relaxed fit and reinforced collar.',
    price: 29.99,
    category: 'Apparel',
    stock_quantity: 25,
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-005',
    name: 'All-Weather Technical Windbreaker',
    description: 'Ultralight waterproof jacket engineered for outdoor versatility and breathable storm protection.',
    price: 119.00,
    category: 'Apparel',
    stock_quantity: 0, // OUT OF STOCK for testing FR-CAT-006 / FR-DATA-001
    image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-006',
    name: 'Ceramic Pour-Over Coffee Dripper',
    description: 'Handcrafted ceramic brewer designed for optimal extraction rate and rich, aromatic pour-over coffee.',
    price: 24.50,
    category: 'Home',
    stock_quantity: 12,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-007',
    name: 'Ergonomic Contoured Memory Foam Pillow',
    description: 'Therapeutic neck support pillow with cooling gel layer and removable hypoallergenic bamboo cover.',
    price: 45.00,
    category: 'Home',
    stock_quantity: 5,
    image_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-008',
    name: 'Designing Data-Intensive Applications',
    description: 'Comprehensive guide to the fundamental principles, architectures, and trade-offs of modern data systems.',
    price: 39.99,
    category: 'Books',
    stock_quantity: 18,
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
  },
];

export async function seedProducts() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const prod of SEEDED_PRODUCTS) {
      await client.query(
        `INSERT INTO products (id, name, description, price, category, stock_quantity, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           price = EXCLUDED.price,
           category = EXCLUDED.category,
           stock_quantity = EXCLUDED.stock_quantity,
           image_url = EXCLUDED.image_url`,
        [
          prod.id,
          prod.name,
          prod.description,
          prod.price,
          prod.category,
          prod.stock_quantity,
          prod.image_url,
        ]
      );
    }

    await client.query('COMMIT');
    console.log(`Successfully seeded ${SEEDED_PRODUCTS.length} products.`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to seed products:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Allow direct execution
if (process.argv[1]?.endsWith('seed_products.js')) {
  seedProducts()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
