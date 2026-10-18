/**
 * @file connection.ts
 * @description Enterprise PostgreSQL Connection Pool and pgvector Extension Initializer.
 * Provides resilient connection pooling, lifecycle management, and vector SQL helpers.
 * @see https://node-postgres.com/
 * @see https://github.com/pgvector/pgvector-node
 */

import pg from 'pg';
import pgvector from 'pgvector/pg';
import { env } from '../config/env';

const { Pool } = pg;

export interface DbQueryResult<T = any> {
  rows: T[];
  rowCount: number | null;
}

/**
 * Enterprise PostgreSQL Connection Pool with connection recycling and error monitoring.
 */
class DatabaseConnectionManager {
  private static instance: DatabaseConnectionManager;
  private pool: pg.Pool;
  private initialized: boolean = false;

  private constructor() {
    this.pool = new Pool({
      connectionString: env.DATABASE_URL,
      min: env.DB_POOL_MIN,
      max: env.DB_POOL_MAX,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: env.DB_SSL_ENABLED ? { rejectUnauthorized: false } : false,
    });

    this.pool.on('error', (err: Error) => {
      console.error('⚠️ Unexpected idle client error on PostgreSQL pool:', err.message);
    });
  }

  public static getInstance(): DatabaseConnectionManager {
    if (!DatabaseConnectionManager.instance) {
      DatabaseConnectionManager.instance = new DatabaseConnectionManager();
    }
    return DatabaseConnectionManager.instance;
  }

  /**
   * Initializes the database connection and registers pgvector types.
   * Ensures the `vector` extension exists.
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const client = await this.pool.connect();
      try {
        // Register pgvector custom vector types on client
        await pgvector.registerType(client);

        // Idempotently create pgvector extension
        await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
        console.log('✅ PostgreSQL pgvector extension verified/enabled.');
        this.initialized = true;
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.warn('⚠️ PostgreSQL connection failed during boot (Will retry on demand):', error.message);
    }
  }

  /**
   * Executes a parameterized SQL query safely.
   * @param text SQL query string
   * @param params Parameter array
   * @returns DbQueryResult<T>
   */
  public async query<T = any>(text: string, params: any[] = []): Promise<DbQueryResult<T>> {
    const client = await this.pool.connect();
    try {
      await pgvector.registerType(client);
      const res = await client.query(text, params);
      return {
        rows: res.rows as T[],
        rowCount: res.rowCount,
      };
    } finally {
      client.release();
    }
  }

  /**
   * Health check query to confirm database liveness.
   */
  public async ping(): Promise<{ healthy: boolean; latencyMs: number; error?: string }> {
    const start = performance.now();
    try {
      await this.query('SELECT 1 as ping');
      return { healthy: true, latencyMs: Math.round(performance.now() - start) };
    } catch (err: any) {
      return { healthy: false, latencyMs: Math.round(performance.now() - start), error: err.message };
    }
  }

  /**
   * Drains and terminates connection pool during server graceful shutdown.
   */
  public async close(): Promise<void> {
    await this.pool.end();
    console.log('🛑 PostgreSQL connection pool drained.');
  }

  public getPool(): pg.Pool {
    return this.pool;
  }
}

export const db = DatabaseConnectionManager.getInstance();
