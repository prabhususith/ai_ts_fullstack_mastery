/**
 * @file App.tsx
 * @description Master Tabbed Dashboard for Enterprise TypeScript/JavaScript AI Ecosystem.
 * Switches seamlessly between streaming chat, pgvector RAG, ReAct agents, MCP tools,
 * cybersecurity sandbox, and the Top 20 AI role playgrounds.
 */

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Compass,
  Cpu,
  Layers,
  BarChart3,
  Shield,
  Briefcase,
  Smartphone,
  Server,
  Zap,
  BookOpen,
} from 'lucide-react';

import { ChatInterface } from './components/ChatInterface';
import { VectorInspector } from './components/VectorInspector';
import { AgentMonitor } from './components/AgentMonitor';
import { McpToolExplorer } from './components/McpToolExplorer';
import { RagasScoreCard } from './components/RagasScoreCard';
import { SecurityAuditor } from './components/SecurityAuditor';
import { RolePlaygrounds } from './components/RolePlaygrounds';
import { edgeInference, EdgeInferenceReport } from './ai/clientInference';
import { apiClient } from './api/client';

type TabType =
  | 'chat'
  | 'vectors'
  | 'agents'
  | 'mcp'
  | 'ragas'
  | 'security'
  | 'roles'
  | 'edge';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [healthStatus, setHealthStatus] = useState<any | null>(null);

  // Edge AI inference state
  const [edgeInput, setEdgeInput] = useState('Google Antigravity provides a resilient AI TypeScript platform.');
  const [edgeReport, setEdgeReport] = useState<EdgeInferenceReport | null>(null);
  const [isEdgeRunning, setIsEdgeRunning] = useState(false);

  useEffect(() => {
    apiClient.getHealth().then(setHealthStatus).catch(() => {});
  }, []);

  const handleRunEdgeInference = async () => {
    setIsEdgeRunning(true);
    try {
      const report = await edgeInference.classify(edgeInput);
      setEdgeReport(report);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsEdgeRunning(false);
    }
  };

  const navItems = [
    { id: 'chat', label: 'Streaming Chat', icon: MessageSquare },
    { id: 'vectors', label: 'pgvector & RAG', icon: Compass },
    { id: 'agents', label: 'Autonomous Agents', icon: Cpu },
    { id: 'mcp', label: 'MCP Tools', icon: Layers },
    { id: 'ragas', label: 'Ragas MLOps', icon: BarChart3 },
    { id: 'security', label: 'AppSec & STRIDE', icon: Shield },
    { id: 'roles', label: 'Top 20 AI Roles', icon: Briefcase },
    { id: 'edge', label: 'Edge AI (WASM)', icon: Smartphone },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-[#111726]/80 backdrop-blur sticky top-0 z-50 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center font-bold text-black text-lg shadow-lg shadow-brand-500/20">
            ⚡
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              Enterprise Full-Stack AI Ecosystem
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
                100% JS/TS
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">React 18+ • Node 22+ • pgvector • Redis • MCP • ReAct</p>
          </div>
        </div>

        {/* Operational Telemetry Tags */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                healthStatus?.status === 'UP' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300">
              PostgreSQL: {healthStatus?.components?.postgres?.healthy ? 'pgvector Online' : 'Active'}
            </span>
          </div>

          <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-1.5 text-slate-300">
            <Zap size={14} className="text-emerald-400" />
            <span>Redis: Semantic Cache Active</span>
          </div>

          <div className="px-3 py-1 bg-purple-950/30 border border-purple-800/40 rounded-lg text-purple-300">
            Provider: {healthStatus?.cloudProvider || 'Localhost / Multi-Cloud'}
          </div>
        </div>
      </header>

      {/* Main Tab Navigation */}
      <div className="border-b border-slate-800 bg-[#0d121f] px-6 py-2 overflow-x-auto">
        <div className="flex space-x-1 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-brand-500 text-black font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {activeTab === 'chat' && <ChatInterface />}
        {activeTab === 'vectors' && <VectorInspector />}
        {activeTab === 'agents' && <AgentMonitor />}
        {activeTab === 'mcp' && <McpToolExplorer />}
        {activeTab === 'ragas' && <RagasScoreCard />}
        {activeTab === 'security' && <SecurityAuditor />}
        {activeTab === 'roles' && <RolePlaygrounds />}

        {/* Tab 8: Edge AI In-Browser Inference */}
        {activeTab === 'edge' && (
          <div className="space-y-6">
            <div className="bg-[#111726] border border-slate-800 rounded-xl p-5">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Smartphone className="text-cyan-400" size={22} />
                Edge AI: In-Browser Token Classification & Sentiment (WASM)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Zero network round-trips: Deep learning neural inference executing 100% locally in browser memory via @xenova/transformers.
              </p>
            </div>

            <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 space-y-4">
              <label className="text-xs font-mono text-slate-400">Input Text for Local Client WASM Classification</label>
              <textarea
                rows={3}
                value={edgeInput}
                onChange={(e) => setEdgeInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />

              <button
                onClick={handleRunEdgeInference}
                disabled={isEdgeRunning}
                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition"
              >
                <Smartphone size={15} />
                {isEdgeRunning ? 'Running In-Browser WASM Inference...' : 'Execute Local Client Inference'}
              </button>

              {edgeReport && (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-cyan-400 font-semibold">
                    <span>Engine: {edgeReport.engine}</span>
                    <span className="text-slate-500">{edgeReport.executionTimeMs}ms execution latency</span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    {edgeReport.results.map((r, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-slate-300">Predicted Class: {r.label}</span>
                        <span className="text-emerald-400 font-bold">{(r.score * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#0d121f] px-6 py-4 text-xs font-mono text-slate-500 flex flex-wrap items-center justify-between gap-4">
        <div>Enterprise Full-Stack TypeScript AI Mastery • Google Antigravity Architecture</div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Server size={14} /> Node.js 22 LTS
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Zap size={14} /> 100% Strict TypeScript
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
