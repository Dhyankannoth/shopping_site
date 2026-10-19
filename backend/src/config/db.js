import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      user: process.env.PGUSER || 'postgres',
      host: process.env.PGHOST || 'localhost',
      database: process.env.PGDATABASE || 'shopping_cart',
      password: process.env.PGPASSWORD || 'postgres',
      port: Number(process.env.PGPORT) || 5432,
    };

export const pool = new Pool(poolConfig);

export const query = (text, params) => pool.query(text, params);

export const getClient = () => pool.connect();

export default {
  pool,
  query,
  getClient,
};
