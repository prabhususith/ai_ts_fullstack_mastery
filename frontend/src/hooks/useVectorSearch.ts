/**
 * @file useVectorSearch.ts
 * @description React hook for executing dense, lexical BM25, and hybrid RRF vector queries.
 */

import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';

export interface SearchResultItem {
  id: string;
  content: string;
  similarity?: number;
  score?: number;
  rrfScore?: number;
  metadata?: Record<string, any>;
}

export function useVectorSearch() {
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [graphContext, setGraphContext] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (query: string, mode: 'dense' | 'bm25' | 'hybrid' | 'graph' = 'hybrid', topK = 5) => {
      if (!query.trim()) return;
      setIsSearching(true);
      setError(null);
      setGraphContext(null);

      try {
        const data = await apiClient.searchKnowledgeBase(query, mode, topK);
        if (mode === 'graph') {
          setGraphContext(data.context || '');
          setResults([]);
        } else {
          setResults(data.results || []);
        }
      } catch (err: any) {
        setError(err.message || 'Search execution failed');
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  return {
    results,
    graphContext,
    isSearching,
    error,
    search,
  };
}
