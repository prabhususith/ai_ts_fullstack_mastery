/**
 * @file textChunker.ts
 * @description Sliding-Window Text Chunker with Sentence Boundary Preservation and SHA-256 Hashes.
 * Guarantees semantic continuity across document splits for vector embedding indexing.
 */

import crypto from 'crypto';
import { env } from '../../config/env';

export interface TextChunk {
  id: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  sha256Hash: string;
  metadata: {
    startChar: number;
    endChar: number;
    hasOverlap: boolean;
  };
}

export interface ChunkerOptions {
  maxTokens?: number;
  overlapTokens?: number;
  approximateCharsPerToken?: number;
}

export class TextChunker {
  private maxTokens: number;
  private overlapTokens: number;
  private charsPerToken: number;

  constructor(options: ChunkerOptions = {}) {
    this.maxTokens = options.maxTokens ?? env.MAX_CHUNK_TOKENS ?? 512;
    this.overlapTokens = options.overlapTokens ?? env.CHUNK_OVERLAP_TOKENS ?? 64;
    this.charsPerToken = options.approximateCharsPerToken ?? 4;
  }

  /**
   * Generates a deterministic SHA-256 hash for a chunk string.
   */
  public static hashContent(content: string): string {
    return crypto.createHash('sha256').update(content.trim()).digest('hex');
  }

  /**
   * Splits a document into overlapping semantic chunks respecting sentence and paragraph boundaries.
   */
  public chunkText(documentId: string, text: string): TextChunk[] {
    const trimmed = text.trim();
    if (!trimmed) return [];

    const maxChars = this.maxTokens * this.charsPerToken;
    const overlapChars = this.overlapTokens * this.charsPerToken;

    // Split text into candidate sentence fragments
    const sentenceRegex = /([^.!?\n]+[.!?\n]+)/g;
    const sentences = trimmed.match(sentenceRegex) || [trimmed];

    const chunks: TextChunk[] = [];
    let currentChunkSentences: string[] = [];
    let currentLength = 0;
    let chunkIndex = 0;
    let startChar = 0;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i] ?? '';
      const sentenceLength = sentence.length;

      if (currentLength + sentenceLength > maxChars && currentChunkSentences.length > 0) {
        // Formulate finished chunk
        const chunkContent = currentChunkSentences.join('').trim();
        const endChar = startChar + chunkContent.length;
        const sha256 = TextChunker.hashContent(chunkContent);

        chunks.push({
          id: `${documentId}_chunk_${chunkIndex}`,
          chunkIndex,
          content: chunkContent,
          tokenCount: Math.ceil(chunkContent.length / this.charsPerToken),
          sha256Hash: sha256,
          metadata: {
            startChar,
            endChar,
            hasOverlap: chunkIndex > 0,
          },
        });

        chunkIndex++;

        // Calculate overlap sentence buffer
        const overlapSentences: string[] = [];
        let accumulatedOverlap = 0;

        for (let j = currentChunkSentences.length - 1; j >= 0; j--) {
          const prevSent = currentChunkSentences[j] ?? '';
          if (accumulatedOverlap + prevSent.length <= overlapChars) {
            overlapSentences.unshift(prevSent);
            accumulatedOverlap += prevSent.length;
          } else {
            break;
          }
        }

        currentChunkSentences = [...overlapSentences];
        currentLength = accumulatedOverlap;
        startChar = endChar - accumulatedOverlap;
      }

      currentChunkSentences.push(sentence);
      currentLength += sentenceLength;
    }

    // Append remaining tail chunk
    if (currentChunkSentences.length > 0) {
      const chunkContent = currentChunkSentences.join('').trim();
      if (chunkContent.length > 0) {
        const endChar = startChar + chunkContent.length;
        const sha256 = TextChunker.hashContent(chunkContent);

        chunks.push({
          id: `${documentId}_chunk_${chunkIndex}`,
          chunkIndex,
          content: chunkContent,
          tokenCount: Math.ceil(chunkContent.length / this.charsPerToken),
          sha256Hash: sha256,
          metadata: {
            startChar,
            endChar,
            hasOverlap: chunkIndex > 0,
          },
        });
      }
    }

    return chunks;
  }
}

export const chunker = new TextChunker();
