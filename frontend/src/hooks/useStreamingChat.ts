/**
 * @file useStreamingChat.ts
 * @description React hook for Server-Sent Events (SSE) streaming chat.
 * Compatible with Vercel AI SDK conventions, includes token tickers and cache indicators.
 */

import { useState, useCallback, useRef } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  cached?: boolean;
  threatScore?: number;
}

export function useStreamingChat(persona: string = 'Architect') {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheHit, setCacheHit] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setError(null);
      setCacheHit(false);

      const assistantMessageId = `asst_${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: 'assistant', content: '', cached: false },
      ]);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content, persona }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorJson = await response.json().catch(() => ({}));
          throw new Error(errorJson.detail || `Server responded with ${response.status}`);
        }

        const isCached = response.headers.get('X-Semantic-Cache') === 'HIT';
        setCacheHit(isCached);

        const reader = response.body?.getReader();
        if (!reader) throw new Error('ReadableStream not supported.');

        const decoder = new TextDecoder();
        let accumulatedText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.substring(6));
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: accumulatedText, cached: isCached }
                        : msg
                    )
                  );
                }
              } catch {
                // Ignore parse errors on partial frames
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Stream connection failed');
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: `⚠️ Error: ${err.message}` }
                : msg
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [isStreaming, persona]
  );

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    sendMessage,
    stopStream,
    clearMessages,
    isStreaming,
    error,
    cacheHit,
  };
}
