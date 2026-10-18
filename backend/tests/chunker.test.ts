import { describe, it, expect } from 'vitest';
import { TextChunker } from '../src/ai/rag/textChunker';

describe('TextChunker (Sliding Window & SHA-256)', () => {
  const chunker = new TextChunker({
    maxTokens: 20,
    overlapTokens: 5,
    approximateCharsPerToken: 4,
  });

  it('splits long text into overlapping chunks with SHA-256 hashes', () => {
    const text =
      'Sentence one is introductory. Sentence two details the architecture. Sentence three explains pgvector indexing. Sentence four covers Redis semantic cache. Sentence five finishes the overview.';
    const chunks = chunker.chunkText('doc_123', text);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]!.sha256Hash).toHaveLength(64);
    expect(chunks[0]!.id).toBe('doc_123_chunk_0');
    expect(chunks[1]!.metadata.hasOverlap).toBe(true);
  });

  it('handles empty input gracefully', () => {
    const chunks = chunker.chunkText('doc_empty', '   ');
    expect(chunks).toEqual([]);
  });

  it('computes deterministic SHA-256 hashes', () => {
    const hash1 = TextChunker.hashContent('Deterministic hash check');
    const hash2 = TextChunker.hashContent('Deterministic hash check');
    const hash3 = TextChunker.hashContent('Different text content');

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
  });
});
