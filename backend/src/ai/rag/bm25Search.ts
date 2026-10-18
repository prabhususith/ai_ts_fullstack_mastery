/**
 * @file bm25Search.ts
 * @description Pure TypeScript Okapi BM25 Lexical Keyword Search Engine.
 * Implements standard BM25 ranking algorithm with configurable k1 and b parameters,
 * inverted index tokenization, and Inverse Document Frequency (IDF) smoothing.
 * @see https://en.wikipedia.org/wiki/Okapi_BM25
 */

export interface Bm25Document {
  id: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface Bm25SearchResult {
  id: string;
  content: string;
  score: number;
  metadata?: Record<string, any>;
}

export class Bm25Engine {
  private k1: number;
  private b: number;
  private documents: Map<string, Bm25Document> = new Map();
  private docTokens: Map<string, string[]> = new Map();
  private docLengths: Map<string, number> = new Map();
  private invertedIndex: Map<string, Set<string>> = new Map(); // term -> set of docIds
  private avgDocLength: number = 0;

  /**
   * Initializes BM25 engine with hyper-parameters.
   * @param k1 Term frequency saturation limit (typically 1.2 to 2.0, default 1.5)
   * @param b Document length penalty factor (typically 0.75)
   */
  constructor(k1: number = 1.5, b: number = 0.75) {
    this.k1 = k1;
    this.b = b;
  }

  /**
   * Tokenizes and normalizes text into lower-cased keyword stems.
   */
  public tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((term) => term.length > 1);
  }

  /**
   * Adds a document to the lexical inverted index.
   */
  public addDocument(doc: Bm25Document): void {
    const tokens = this.tokenize(doc.content);
    this.documents.set(doc.id, doc);
    this.docTokens.set(doc.id, tokens);
    this.docLengths.set(doc.id, tokens.length);

    for (const token of tokens) {
      let docSet = this.invertedIndex.get(token);
      if (!docSet) {
        docSet = new Set();
        this.invertedIndex.set(token, docSet);
      }
      docSet.add(doc.id);
    }

    this.recalculateAvgDocLength();
  }

  /**
   * Batch indexes multiple documents.
   */
  public indexCorpus(docs: Bm25Document[]): void {
    for (const doc of docs) {
      this.addDocument(doc);
    }
  }

  private recalculateAvgDocLength(): void {
    if (this.docLengths.size === 0) {
      this.avgDocLength = 0;
      return;
    }
    let total = 0;
    for (const len of this.docLengths.values()) {
      total += len;
    }
    this.avgDocLength = total / this.docLengths.size;
  }

  /**
   * Calculates Inverse Document Frequency (IDF) with standard Robertson-Spärck Jones smoothing.
   */
  private calculateIdf(term: string): number {
    const N = this.documents.size;
    const docSet = this.invertedIndex.get(term);
    const n = docSet ? docSet.size : 0;
    return Math.log((N - n + 0.5) / (n + 0.5) + 1);
  }

  /**
   * Queries the corpus using BM25 ranking.
   */
  public search(query: string, topK: number = 5): Bm25SearchResult[] {
    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0 || this.documents.size === 0) return [];

    const scores: Map<string, number> = new Map();

    for (const term of queryTokens) {
      const idf = this.calculateIdf(term);
      const matchingDocs = this.invertedIndex.get(term);
      if (!matchingDocs) continue;

      for (const docId of matchingDocs) {
        const tokens = this.docTokens.get(docId) ?? [];
        const docLen = this.docLengths.get(docId) ?? 1;

        // Calculate term frequency in document
        let tf = 0;
        for (const t of tokens) {
          if (t === term) tf++;
        }

        // BM25 numerator and denominator
        const numerator = tf * (this.k1 + 1);
        const denominator = tf + this.k1 * (1 - this.b + (this.b * docLen) / (this.avgDocLength || 1));
        const termScore = idf * (numerator / denominator);

        const currentScore = scores.get(docId) ?? 0;
        scores.set(docId, currentScore + termScore);
      }
    }

    const results: Bm25SearchResult[] = [];
    for (const [docId, score] of scores.entries()) {
      const doc = this.documents.get(docId);
      if (doc) {
        results.push({
          id: doc.id,
          content: doc.content,
          score: Number(score.toFixed(4)),
          metadata: doc.metadata,
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  /**
   * Clears the index.
   */
  public clear(): void {
    this.documents.clear();
    this.docTokens.clear();
    this.docLengths.clear();
    this.invertedIndex.clear();
    this.avgDocLength = 0;
  }
}

export const bm25 = new Bm25Engine();
