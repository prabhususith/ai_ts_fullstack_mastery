/**
 * @file ChatInterface.tsx
 * @description Real-Time Streaming Chat UI with Persona Selector,
 * Redis Semantic Cache indicator, and Prompt Injection Defense Alerts.
 */

import React, { useState } from 'react';
import { useStreamingChat } from '../hooks/useStreamingChat';
import { Send, Zap, ShieldAlert, Bot, User, Trash2, StopCircle } from 'lucide-react';

const PERSONAS = [
  { id: 'Architect', name: 'AI Systems Architect', role: 'System design & TypeScript contracts' },
  { id: 'SecurityAuditor', name: 'AppSec Auditor', role: 'OWASP LLM01 & STRIDE defense' },
  { id: 'RagSpecialist', name: 'RAG Specialist', role: 'pgvector & HNSW cosine retrieval' },
  { id: 'McpDeveloper', name: 'MCP Developer', role: 'Model Context Protocol JSON-RPC' },
  { id: 'Supervisor', name: 'Swarm Supervisor', role: 'Multi-agent graph orchestrator' },
];

export const ChatInterface: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState('Architect');
  const [input, setInput] = useState('');
  const { messages, sendMessage, stopStream, clearMessages, isStreaming, error, cacheHit } =
    useStreamingChat(selectedPersona);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[750px] bg-[#111726] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header with Persona Switcher */}
      <div className="p-4 bg-[#0a0d14] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              Streaming AI Neural Interface
              {cacheHit && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Zap size={12} /> Redis Semantic Cache Hit ($0 Token Cost)
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">Strict TypeScript + Vercel AI SDK SSE protocol</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedPersona}
            onChange={(e) => setSelectedPersona(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500"
          >
            {PERSONAS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={clearMessages}
            title="Clear Chat History"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <Bot size={48} className="mb-3 text-slate-600" />
            <h4 className="text-base font-medium text-slate-300">Ready for Inquiries</h4>
            <p className="text-xs max-w-sm mt-1 text-slate-500">
              Inquire about pgvector indexing, Redis semantic caching, MCP tools, or dispatch autonomous agent loops.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {[
                'Explain pgvector HNSW indexing vs IVFFlat',
                'Audit STRIDE threats for my microservices',
                'Simulate a ReAct agent loop for cloud deployment',
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(suggestion)}
                  className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role !== 'user' && (
                <div className="p-2 bg-brand-500/10 border border-brand-500/30 rounded-lg text-brand-500 flex-shrink-0">
                  <Bot size={16} />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs whitespace-pre-wrap rounded-bl-sm'
                }`}
              >
                {msg.content || (
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-ping" />
                    Generating stream...
                  </span>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="p-2 bg-blue-600/20 border border-blue-500/40 rounded-lg text-blue-400 flex-shrink-0">
                  <User size={16} />
                </div>
              )}
            </div>
          ))
        )}

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800 rounded-xl flex items-center space-x-2 text-xs text-red-300">
            <ShieldAlert size={16} className="text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 bg-[#0a0d14] border-t border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Inquire as ${selectedPersona}...`}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={stopStream}
            className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl transition"
            title="Stop generation"
          >
            <StopCircle size={18} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition"
          >
            <Send size={18} />
          </button>
        )}
      </form>
    </div>
  );
};
