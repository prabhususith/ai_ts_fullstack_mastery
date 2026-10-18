/**
 * @file ragRoutes.ts
 * @description Enterprise RAG API: Document Ingestion, Chunking, Dense Vector Search,
 * BM25 Lexical Keyword Search, Hybrid RRF Retrieval, and Ragas Triad Evaluation.
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { chunker, TextChunker } from '../../ai/rag/textChunker';
import { embeddings } from '../../ai/nlp/embeddingsEngine';
import { PgVectorStore } from '../../ai/rag/vectorStorePg';
import { bm25 } from '../../ai/rag/bm25Search';
import { HybridRetrievalEngine } from '../../ai/rag/hybridRetrieval';
import { graphRag } from '../../ai/graph/graphRagEngine';
import { RagTriadEvaluator } from '../../ai/mlops/ragTriadMetrics';

const router = Router();
const hybridEngine = new HybridRetrievalEngine(bm25);

const IngestDocumentSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(10, 'Content must contain at least 10 characters for chunking'),
  metadata: z.record(z.any()).optional().default({}),
});

const SearchSchema = z.object({
  query: z.string().min(1),
  topK: z.number().int().positive().default(5),
  mode: z.enum(['dense', 'bm25', 'hybrid', 'graph']).default('hybrid'),
});

const EvaluateSchema = z.object({
  query: z.string().min(1),
  retrievedChunks: z.array(z.string()),
  generatedAnswer: z.string().min(1),
});

/**
 * POST /api/rag/ingest
 * Ingests, chunks, embeds, and indexes a document across pgvector, BM25, and GraphRAG.
 */
router.post('/ingest', async (req: Request, res: Response): Promise<void> => {
  const parseResult = IngestDocumentSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.format() });
    return;
  }

  const { title, content, metadata } = parseResult.data;
  const documentId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const sha256 = TextChunker.hashContent(content);

  // 1. Sliding-window chunking
  const chunks = chunker.chunkText(documentId, content);

  // 2. Generate dense vector embeddings (384-dim)
  const chunkTexts = chunks.map((c) => c.content);
  const vectors = await embeddings.embedBatch(chunkTexts);

  // 3. Persist to pgvector
  const insertPayloads = chunks.map((c, idx) => ({
    documentId,
    chunkIndex: c.chunkIndex,
    content: c.content,
    embedding: vectors[idx]!,
    tokenCount: c.tokenCount,
    metadata: { ...metadata, title, sha256: c.sha256Hash },
  }));
  await PgVectorStore.insertBatch(insertPayloads);

  // 4. Index in lexical BM25 engine
  for (const c of chunks) {
    bm25.addDocument({
      id: c.id,
      content: c.content,
      metadata: { documentId, title },
    });
  }

  // 5. Ingest into Knowledge Graph
  const graphResult = graphRag.extractAndIngest(content);

  res.status(201).json({
    documentId,
    title,
    sha256Hash: sha256,
    chunksCreated: chunks.length,
    graphEntitiesExtracted: graphResult.entitiesCount,
    graphEdgesCreated: graphResult.edgesCount,
    status: 'INDEXED_SUCCESSFULLY',
  });
});

/**
 * POST /api/rag/search
 * Executes dense vector search, BM25 search, or hybrid RRF ranking.
 */
router.post('/search', async (req: Request, res: Response): Promise<void> => {
  const parseResult = SearchSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.format() });
    return;
  }

  const { query, topK, mode } = parseResult.data;

  if (mode === 'dense') {
    const vector = await embeddings.embed(query);
    const results = await PgVectorStore.searchCosine(vector, topK);
    res.json({ mode: 'dense', results });
    return;
  }

  if (mode === 'bm25') {
    const results = bm25.search(query, topK);
    res.json({ mode: 'bm25', results });
    return;
  }

  if (mode === 'graph') {
    const context = graphRag.getGraphContextForQuery(query);
    res.json({ mode: 'graph', context });
    return;
  }

  // Default: Hybrid Reciprocal Rank Fusion
  const results = await hybridEngine.search(query, { topK });
  res.json({ mode: 'hybrid', results });
});

/**
 * POST /api/rag/evaluate
 * Calculates RAG Triad faithfulness, relevance, and groundedness metrics.
 */
router.post('/evaluate', async (req: Request, res: Response): Promise<void> => {
  const parseResult = EvaluateSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.format() });
    return;
  }

  const { query, retrievedChunks, generatedAnswer } = parseResult.data;
  const scoreCard = await RagTriadEvaluator.evaluate(query, retrievedChunks, generatedAnswer);
  res.json(scoreCard);
});

export default router;
