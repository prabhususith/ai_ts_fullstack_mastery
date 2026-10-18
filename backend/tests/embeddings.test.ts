import { describe, it, expect } from 'vitest';
import { EmbeddingsEngine, embeddings } from '../src/ai/nlp/embeddingsEngine';

describe('EmbeddingsEngine (Pure JS/TS Native)', () => {
  it('generates a 384-dimensional dense vector', async () => {
    const text = 'Enterprise AI Full-Stack with pgvector and TypeScript';
    const vector = await embeddings.embed(text);

    expect(vector).toBeDefined();
    expect(vector.length).toBe(384);
    expect(typeof vector[0]).toBe('number');
  });

  it('guarantees L2 unit normalization (magnitude approximately 1.0)', async () => {
    const text = 'Testing L2 normalization constraint';
    const vector = await embeddings.embed(text);

    let sumSquares = 0;
    for (const val of vector) {
      sumSquares += val * val;
    }
    const magnitude = Math.sqrt(sumSquares);

    expect(magnitude).toBeCloseTo(1.0, 3);
  });

  it('batch embeds multiple texts maintaining dimensionality', async () => {
    const corpus = ['Text chunk alpha', 'Text chunk beta', 'Text chunk gamma'];
    const vectors = await embeddings.embedBatch(corpus);

    expect(vectors.length).toBe(3);
    for (const vec of vectors) {
      expect(vec.length).toBe(384);
    }
  });
});
