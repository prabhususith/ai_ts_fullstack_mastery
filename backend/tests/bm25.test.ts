import { describe, it, expect, beforeEach } from 'vitest';
import { Bm25Engine } from '../src/ai/rag/bm25Search';

describe('Bm25Engine (Okapi BM25 Lexical Keyword Search)', () => {
  let engine: Bm25Engine;

  beforeEach(() => {
    engine = new Bm25Engine(1.5, 0.75);
    engine.indexCorpus([
      { id: 'doc1', content: 'PostgreSQL provides dense vector storage and HNSW indexing.' },
      { id: 'doc2', content: 'Redis provides semantic vector cache and in-memory key-value lookups.' },
      { id: 'doc3', content: 'React and Vite form the modern frontend ecosystem.' },
    ]);
  });

  it('ranks documents matching lexical query terms highest', () => {
    const results = engine.search('PostgreSQL HNSW');

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.id).toBe('doc1');
    expect(results[0]!.score).toBeGreaterThan(0);
  });

  it('handles terms not present in corpus without crashing', () => {
    const results = engine.search('NonExistentTermXYZ');
    expect(results).toEqual([]);
  });

  it('tokenizes and removes punctuation cleanly', () => {
    const tokens = engine.tokenize('Hello, World! Testing 100% TS.');
    expect(tokens).toContain('hello');
    expect(tokens).toContain('world');
    expect(tokens).toContain('testing');
  });
});
