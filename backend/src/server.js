import dotenv from 'dotenv';
import app from './app.js';
import { pool } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify database connectivity on startup
    const res = await pool.query('SELECT NOW()');
    console.log(`[Database] PostgreSQL connected successfully at ${res.rows[0].now}`);

    app.listen(PORT, () => {
      console.log(`[Server] Shopping Cart Backend API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('[Startup Error] Failed to connect to PostgreSQL database:', error.message);
    console.log('[Server] Starting HTTP server anyway for testing/health checks...');
    app.listen(PORT, () => {
      console.log(`[Server] Shopping Cart Backend API running on port ${PORT} (Database pending connection)`);
    });
  }
}

startServer();
