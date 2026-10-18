/**
 * @file env.ts
 * @description Zod-validated environment configuration schema and runtime parser.
 * Guarantees strict type safety and fails fast at boot time if required variables are missing or malformed.
 * @see https://zod.dev
 */

import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env if present
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // PostgreSQL Database
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/ai_enterprise_db'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  DB_NAME: z.string().default('ai_enterprise_db'),
  DB_POOL_MIN: z.coerce.number().int().min(1).default(2),
  DB_POOL_MAX: z.coerce.number().int().min(2).default(20),
  DB_SSL_ENABLED: z.coerce.boolean().default(false),

  // Redis Cache & Semantic Broker
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),
  REDIS_TTL_SECONDS: z.coerce.number().int().positive().default(3600),
  SEMANTIC_CACHE_SIMILARITY_THRESHOLD: z.coerce.number().min(0.0).max(1.0).default(0.92),

  // Security & Cryptographic Tokens
  JWT_SECRET: z.string().min(32, {
    message: 'JWT_SECRET must be at least 32 characters long for cryptographically secure HS256/HS512 signatures',
  }).default('super-secret-jwt-key-with-minimum-32-characters-entropy-999'),
  JWT_EXPIRATION: z.string().default('24h'),
  ARGON2_MEMORY_COST: z.coerce.number().int().positive().default(65536),
  ARGON2_TIME_COST: z.coerce.number().int().positive().default(3),
  ARGON2_PARALLELISM: z.coerce.number().int().positive().default(4),
  CANARY_TOKEN_SECRET: z.string().default('canary-guard-entropy-777'),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),

  // Cloud Target Configuration
  CLOUD_PROVIDER: z.enum(['localhost', 'aws', 'azure', 'gcp']).default('localhost'),
  AWS_REGION: z.string().default('us-east-1'),
  AZURE_LOCATION: z.string().default('eastus'),
  GCP_REGION: z.string().default('us-central1'),

  // AI & RAG Configuration
  EMBEDDINGS_MODEL: z.string().default('Xenova/all-MiniLM-L6-v2'),
  EMBEDDINGS_DIMENSION: z.coerce.number().int().positive().default(384),
  MAX_CHUNK_TOKENS: z.coerce.number().int().positive().default(512),
  CHUNK_OVERLAP_TOKENS: z.coerce.number().int().nonnegative().default(64),

  // External APIs (Optional)
  OPENAI_API_KEY: z.string().optional().default(''),
  ANTHROPIC_API_KEY: z.string().optional().default(''),
  GEMINI_API_KEY: z.string().optional().default(''),
  LANGSMITH_API_KEY: z.string().optional().default(''),
});

export type Environment = z.infer<typeof EnvironmentSchema>;

/**
 * Validates process.env against EnvironmentSchema.
 * Throws readable error message upon validation failure.
 */
function validateEnv(): Environment {
  const result = EnvironmentSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ FATAL: Invalid application environment configuration:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error('Environment configuration validation failed');
  }
  return result.data;
}

export const env: Environment = validateEnv();
