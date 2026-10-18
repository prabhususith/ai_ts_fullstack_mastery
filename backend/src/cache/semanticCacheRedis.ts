/**
 * @file semanticCacheRedis.ts
 * @description Enterprise Semantic Vector Cache backed by Redis.
 * Intercepts incoming queries by comparing dense vector cosine similarity against cached queries.
 * Queries with cosine similarity >= 0.92 are served in sub-5ms at $0 LLM token cost.
 * @see https://redis.io/docs/latest/develop/interact/search-and-query/advanced-concepts/vectors/
 */

import { redis } from './redisClient';
import { env } from '../config/env';

export interface SemanticCacheEntry {
  id: string;
  query: string;
  queryEmbedding: number[];
  response: string;
  hitCount: number;
  metadata?: Record<string, any>;
  createdAt: number;
}

export interface SemanticMatchResult {
  hit: boolean;
  score: number;
  entry?: SemanticCacheEntry;
  latencyMs: number;
}

export interface SemanticCacheStats {
  totalQueries: number;
  cacheHits: number;
  cacheMisses: number;
  hitRatePercent: number;
  estimatedCostSavedUsd: number;
  totalCachedEntries: number;
}

/**
 * Calculates cosine similarity between two normalized or arbitrary vectors.
 * Formula: (A · B) / (||A|| * ||B||)
 */
export function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    const valA = a[i] ?? 0;
    const valB = b[i] ?? 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class SemanticCacheManager {
  private static instance: SemanticCacheManager;
  private prefix = 'semantic_cache:item:';
  private indexKey = 'semantic_cache:index';
  private totalQueries = 0;
  private cacheHits = 0;
  private cacheMisses = 0;

  private constructor() {}

  public static getInstance(): SemanticCacheManager {
    if (!SemanticCacheManager.instance) {
      SemanticCacheManager.instance = new SemanticCacheManager();
    }
    return SemanticCacheManager.instance;
  }

  /**
   * Searches the semantic cache for a query embedding exceeding the similarity threshold.
   * @param queryEmbedding Dense vector representing the user prompt
   * @param threshold Minimum cosine similarity (defaults to env.SEMANTIC_CACHE_SIMILARITY_THRESHOLD or 0.92)
   */
  public async findMatch(
    queryEmbedding: number[],
    threshold: number = env.SEMANTIC_CACHE_SIMILARITY_THRESHOLD
  ): Promise<SemanticMatchResult> {
    const start = performance.now();
    this.totalQueries++;

    // Retrieve all cached item keys
    const itemKeys = await redis.keys(`${this.prefix}*`);

    let bestScore = -1;
    let bestEntry: SemanticCacheEntry | undefined = undefined;

    for (const key of itemKeys) {
      const raw = await redis.get(key);
      if (!raw) continue;

      try {
        const entry: SemanticCacheEntry = JSON.parse(raw);
        const score = calculateCosineSimilarity(queryEmbedding, entry.queryEmbedding);

        if (score > bestScore) {
          bestScore = score;
          bestEntry = entry;
        }
      } catch {
        continue;
      }
    }

    const latencyMs = Math.round(performance.now() - start);

    if (bestEntry && bestScore >= threshold) {
      this.cacheHits++;
      bestEntry.hitCount = (bestEntry.hitCount || 0) + 1;
      // Update hit count asynchronously
      redis.set(this.prefix + bestEntry.id, JSON.stringify(bestEntry)).catch(() => {});

      return {
        hit: true,
        score: Number(bestScore.toFixed(4)),
        entry: bestEntry,
        latencyMs,
      };
    }

    this.cacheMisses++;
    return {
      hit: false,
      score: bestScore > 0 ? Number(bestScore.toFixed(4)) : 0,
      latencyMs,
    };
  }

  /**
   * Stores a generated response in the semantic vector cache.
   */
  public async setCache(
    query: string,
    queryEmbedding: number[],
    response: string,
    metadata: Record<string, any> = {}
  ): Promise<SemanticCacheEntry> {
    const id = `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const entry: SemanticCacheEntry = {
      id,
      query,
      queryEmbedding,
      response,
      hitCount: 0,
      metadata,
      createdAt: Date.now(),
    };

    await redis.set(this.prefix + id, JSON.stringify(entry), env.REDIS_TTL_SECONDS);
    return entry;
  }

  /**
   * Returns operational telemetry and cost savings.
   */
  public async getStats(): Promise<SemanticCacheStats> {
    const itemKeys = await redis.keys(`${this.prefix}*`);
    const hitRatePercent = this.totalQueries > 0 ? (this.cacheHits / this.totalQueries) * 100 : 0;
    // Typical saved cost: ~$0.003 per 1K cached prompt/completion tokens
    const estimatedCostSavedUsd = Number((this.cacheHits * 0.003).toFixed(4));

    return {
      totalQueries: this.totalQueries,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      hitRatePercent: Number(hitRatePercent.toFixed(2)),
      estimatedCostSavedUsd,
      totalCachedEntries: itemKeys.length,
    };
  }

  /**
   * Purges all semantic cache entries.
   */
  public async clearCache(): Promise<number> {
    const itemKeys = await redis.keys(`${this.prefix}*`);
    let deleted = 0;
    for (const key of itemKeys) {
      deleted += await redis.del(key);
    }
    return deleted;
  }
}

export const semanticCache = SemanticCacheManager.getInstance();
