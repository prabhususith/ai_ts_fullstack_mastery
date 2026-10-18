/**
 * @file McpToolExplorer.tsx
 * @description Model Context Protocol (MCP) Interactive Explorer.
 * Allows developers to discover Anthropic MCP tools, inspect JSON schemas, and trigger live executions.
 */

import React, { useState } from 'react';
import { useMcpServer, McpTool } from '../hooks/useMcpServer';
import { Layers, Play, CheckCircle, AlertTriangle, RefreshCw, Code } from 'lucide-react';

export const McpToolExplorer: React.FC = () => {
  const { tools, isLoading, isExecuting, executionResult, error, refreshTools, executeTool } =
    useMcpServer();
  const [selectedTool, setSelectedTool] = useState<McpTool | null>(null);
  const [paramsInput, setParamsInput] = useState<string>('{}');

  const handleSelectTool = (tool: McpTool) => {
    setSelectedTool(tool);
    // Generate default JSON payload based on schema
    const defaultParams: Record<string, any> = {};
    if (tool.name === 'execute_vector_search') {
      defaultParams.query = 'pgvector HNSW';
      defaultParams.topK = 3;
    } else if (tool.name === 'calculate_semantic_similarity') {
      defaultParams.textA = 'Node.js Express TypeScript';
      defaultParams.textB = 'Backend JavaScript API framework';
    }
    setParamsInput(JSON.stringify(defaultParams, null, 2));
  };

  const handleExecute = async () => {
    if (!selectedTool) return;
    try {
      const parsedParams = JSON.parse(paramsInput);
      await executeTool(selectedTool.name, parsedParams);
    } catch (err: any) {
      alert(`Invalid JSON: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Layers className="text-cyan-400" size={22} />
            Model Context Protocol (MCP) Tool Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Standard JSON-RPC 2.0 tool endpoints registered via @modelcontextprotocol/sdk.
          </p>
        </div>

        <button
          onClick={refreshTools}
          disabled={isLoading}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh Registry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tool List */}
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-4 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Discovered Tools</h3>
          {tools.map((t) => (
            <button
              key={t.name}
              onClick={() => handleSelectTool(t)}
              className={`w-full text-left p-3 rounded-lg border transition ${
                selectedTool?.name === t.name
                  ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="font-mono text-xs font-semibold">{t.name}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{t.description}</div>
            </button>
          ))}
        </div>

        {/* Tool Playground & JSON Schema */}
        <div className="lg:col-span-2 bg-[#111726] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          {selectedTool ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-semibold">{selectedTool.name}</span>
                <p className="text-xs text-slate-400 mt-0.5">{selectedTool.description}</p>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 flex items-center gap-1 mb-1">
                  <Code size={13} />
                  Tool Parameters (JSON Schema adheres to Zod)
                </label>
                <textarea
                  rows={5}
                  value={paramsInput}
                  onChange={(e) => setParamsInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-xs flex items-center justify-center gap-2 transition"
              >
                <Play size={14} />
                {isExecuting ? 'Executing over JSON-RPC...' : 'Execute MCP Tool'}
              </button>

              {executionResult && (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle size={14} /> Status: {executionResult.status}
                    </span>
                    <span className="text-slate-500">{executionResult.executionTimeMs}ms</span>
                  </div>
                  <pre className="text-[11px] text-slate-300 font-mono overflow-x-auto max-h-56">
                    {JSON.stringify(executionResult.output, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500">
              <Layers size={40} className="mb-2 text-slate-600" />
              <p className="text-xs">Select an MCP tool from the left panel to inspect parameters and run tests.</p>
            </div>
          )}

          {error && (
            <div className="mt-3 p-2.5 bg-red-950/30 border border-red-800 rounded-lg text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
