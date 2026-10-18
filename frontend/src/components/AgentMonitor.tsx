/**
 * @file AgentMonitor.tsx
 * @description Real-Time Visual Timeline of Autonomous Agent Thoughts, Tool Calls, and State Machines.
 * Renders ReAct cognitive traces and LangGraph multi-agent supervisor workflows.
 */

import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { Cpu, Play, CheckCircle, Clock, Terminal, GitFork, ArrowDown } from 'lucide-react';

export const AgentMonitor: React.FC = () => {
  const [objective, setObjective] = useState(
    'Verify pgvector HNSW index integrity and audit STRIDE threat boundaries.'
  );
  const [activeTab, setActiveTab] = useState<'react' | 'supervisor'>('react');
  const [isLoading, setIsLoading] = useState(false);
  const [reactTrace, setReactTrace] = useState<any | null>(null);
  const [supervisorState, setSupervisorState] = useState<any | null>(null);

  const handleRunAgent = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'react') {
        const trace = await apiClient.runReactAgent(objective);
        setReactTrace(trace);
      } else {
        const state = await apiClient.runSupervisor(objective);
        setSupervisorState(state);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-[#111726] border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="text-brand-500" size={22} />
              Autonomous Agent Cognitive Monitor
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Visualize real-time ReAct cognitive loops and LangGraph multi-agent state transitions.
            </p>
          </div>

          <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5">
            <button
              onClick={() => setActiveTab('react')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'react' ? 'bg-brand-500 text-black font-semibold' : 'text-slate-400'
              }`}
            >
              ReAct Cognitive Loop
            </button>
            <button
              onClick={() => setActiveTab('supervisor')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'supervisor' ? 'bg-brand-500 text-black font-semibold' : 'text-slate-400'
              }`}
            >
              Multi-Agent Graph (DAG)
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Specify autonomous objective..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
          />
          <button
            onClick={handleRunAgent}
            disabled={isLoading || !objective.trim()}
            className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-black font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition"
          >
            <Play size={14} />
            {isLoading ? 'Agent Executing...' : 'Dispatch Swarm'}
          </button>
        </div>
      </div>

      {/* Visual Timeline / Graph */}
      {activeTab === 'react' && reactTrace && (
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs text-slate-400">Objective:</span>
              <h4 className="text-sm font-semibold text-slate-200">{reactTrace.objective}</h4>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle size={14} /> {reactTrace.status}
              </span>
              <span className="text-slate-400 flex items-center gap-1">
                <Clock size={14} /> {reactTrace.executionTimeMs}ms
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {reactTrace.steps.map((step: any, idx: number) => (
              <div key={idx} className="relative pl-6 border-l-2 border-brand-500/40 space-y-2">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#111726] border-2 border-brand-500 flex items-center justify-center text-[10px] text-brand-500 font-bold">
                  {step.stepNumber}
                </div>

                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg">
                  <div className="text-xs font-mono text-cyan-400 font-semibold mb-1 flex items-center gap-1.5">
                    <Terminal size={14} /> Thought
                  </div>
                  <p className="text-xs text-slate-300 font-mono">{step.thought}</p>
                </div>

                {step.action && (
                  <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-lg">
                    <div className="text-xs font-mono text-blue-400 font-semibold mb-1">
                      Action: {step.action.toolName}
                    </div>
                    <pre className="text-[11px] text-slate-400 font-mono overflow-x-auto">
                      {JSON.stringify(step.action.input, null, 2)}
                    </pre>
                  </div>
                )}

                {step.observation && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg">
                    <div className="text-xs font-mono text-emerald-400 font-semibold mb-1">Observation</div>
                    <pre className="text-[11px] text-slate-400 font-mono max-h-32 overflow-y-auto">
                      {typeof step.observation === 'object'
                        ? JSON.stringify(step.observation, null, 2)
                        : step.observation}
                    </pre>
                  </div>
                )}
              </div>
            ))}

            {reactTrace.finalAnswer && (
              <div className="p-4 bg-brand-500/10 border border-brand-500/30 rounded-xl mt-4">
                <div className="text-xs font-bold text-brand-500 uppercase tracking-wide mb-1">Final Answer</div>
                <p className="text-xs text-slate-200 font-mono whitespace-pre-wrap">{reactTrace.finalAnswer}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Multi-Agent Supervisor View */}
      {activeTab === 'supervisor' && supervisorState && (
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <GitFork size={16} className="text-purple-400" />
              LangGraph State Machine DAG Transitions
            </h3>
            <span className="text-xs font-mono bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full border border-purple-500/30">
              {supervisorState.currentNode}
            </span>
          </div>

          <div className="flex flex-col items-center space-y-3">
            {supervisorState.nodeHistory.map((node: any, idx: number) => (
              <React.Fragment key={idx}>
                <div className="w-full max-w-xl p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold font-mono text-purple-400">{node.node}</span>
                    <p className="text-xs text-slate-400 mt-0.5">{node.outputSummary}</p>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{node.durationMs}ms</span>
                </div>
                {idx < supervisorState.nodeHistory.length - 1 && (
                  <ArrowDown size={18} className="text-slate-600" />
                )}
              </React.Fragment>
            ))}
          </div>

          {supervisorState.finalSynthesis && (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-xs font-mono text-emerald-400 font-semibold">Executive Delivery:</span>
              <pre className="mt-2 text-xs text-slate-200 font-mono whitespace-pre-wrap">
                {supervisorState.finalSynthesis}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
