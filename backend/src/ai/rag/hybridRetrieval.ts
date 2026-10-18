/**
 * @file hybridRetrieval.ts
 * @description Enterprise Hybrid Retrieval Engine using Reciprocal Rank Fusion (RRF).
 * Combines dense semantic vector retrieval (pgvector) and sparse lexical search (BM25)
 * into a single unified ranking to maximize recall and precision.
 * @see https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf
 */

import { PgVectorStore, VectorSearchResult } from './vectorStorePg';
import { Bm25Engine, Bm25SearchResult } from './bm25Search';
import { embeddings } from '../nlp/embeddingsEngine';

export interface HybridSearchResult {
  id: string;
  content: string;
  rrfScore: number;
  denseRank: number | null;
  lexicalRank: number | null;
  denseScore: number | null;
  lexicalScore: number | null;
  metadata: Record<string, any>;
}

export interface HybridRetrievalOptions {
  topK?: number;
  kConstant?: number; // Standard RRF smoothing constant (default: 60)
  denseWeight?: number; // default: 0.6
  lexicalWeight?: number; // default: 0.4
  minSimilarity?: number;
}

export class HybridRetrievalEngine {
  private bm25: Bm25Engine;
  private kConstant: number;
  private denseWeight: number;
  private lexicalWeight: number;

  constructor(bm25Engine: Bm25Engine, options: HybridRetrievalOptions = {}) {
    this.bm25 = bm25Engine;
    this.kConstant = options.kConstant ?? 60;
    this.denseWeight = options.denseWeight ?? 0.6;
    this.lexicalWeight = options.lexicalWeight ?? 0.4;
  }

  /**
   * Executes dual-stage retrieval (Dense + Sparse) and fuses rankings via RRF.
   * RRF Formula: RRF_Score(d) = sum( w_m / (k + rank_m(d)) )
   */
  public async search(query: string, options: HybridRetrievalOptions = {}): Promise<HybridSearchResult[]> {
    const topK = options.topK ?? 5;
    const kConst = options.kConstant ?? this.kConstant;
    const denseWeight = options.denseWeight ?? this.denseWeight;
    const lexicalWeight = options.lexicalWeight ?? this.lexicalWeight;
    const minSim = options.minSimilarity ?? 0.3;

    // 1. Dense Semantic Retrieval
    const queryVector = await embeddings.embed(query);
    const denseResults: VectorSearchResult[] = await PgVectorStore.searchCosine(queryVector, topK * 2, minSim);

    // 2. Sparse BM25 Lexical Retrieval
    const lexicalResults: Bm25SearchResult[] = this.bm25.search(query, topK * 2);

    // Map to aggregate documents by ID
    const docMap = new Map<
      string,
      {
        id: string;
        content: string;
        denseRank: number | null;
        lexicalRank: number | null;
        denseScore: number | null;
        lexicalScore: number | null;
        metadata: Record<string, any>;
      }
    >();

    // Process dense rankings
    for (let rank = 0; rank < denseResults.length; rank++) {
      const res = denseResults[rank]!;
      docMap.set(res.id, {
        id: res.id,
        content: res.content,
        denseRank: rank + 1,
        lexicalRank: null,
        denseScore: res.similarity,
        lexicalScore: null,
        metadata: res.metadata,
      });
    }

    // Process lexical rankings
    for (let rank = 0; rank < lexicalResults.length; rank++) {
      const res = lexicalResults[rank]!;
      const existing = docMap.get(res.id);
      if (existing) {
        existing.lexicalRank = rank + 1;
        existing.lexicalScore = res.score;
      } else {
        docMap.set(res.id, {
          id: res.id,
          content: res.content,
          denseRank: null,
          lexicalRank: rank + 1,
          denseScore: null,
          lexicalScore: res.score,
          metadata: res.metadata || {},
        });
      }
    }

    // 3. Compute RRF scores
    const fused: HybridSearchResult[] = [];

    for (const doc of docMap.values()) {
      let rrfScore = 0;

      if (doc.denseRank !== null) {
        rrfScore += denseWeight / (kConst + doc.denseRank);
      }
      if (doc.lexicalRank !== null) {
        rrfScore += lexicalWeight / (kConst + doc.lexicalRank);
      }

      fused.push({
        id: doc.id,
        content: doc.content,
        rrfScore: Number(rrfScore.toFixed(6)),
        denseRank: doc.denseRank,
        lexicalRank: doc.lexicalRank,
        denseScore: doc.denseScore,
        lexicalScore: doc.lexicalScore,
        metadata: doc.metadata,
      });
    }

    // Sort descending by RRF score
    fused.sort((a, b) => b.rrfScore - a.rrfScore);

    return fused.slice(0, topK);
  }
}
