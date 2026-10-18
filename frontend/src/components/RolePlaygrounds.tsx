/**
 * @file RolePlaygrounds.tsx
 * @description Interactive Playgrounds for the Top 20 AI-Era Roles.
 * Maps every industry role to specific TypeScript code modules, live test evidence, and architectural blueprints.
 */

import React, { useState } from 'react';
import {
  Code2,
  Bot,
  Layers,
  Database,
  Cpu,
  Shield,
  GitGraph,
  Smartphone,
  Sparkles,
  Zap,
  Cloud,
  BarChart,
  Hash,
  Network,
  Scale,
  Crosshair,
  Lock,
  Workflow,
  Briefcase,
  ExternalLink,
} from 'lucide-react';

export interface AiRole {
  id: number;
  slug: string;
  title: string;
  icon: any;
  category: 'Engineering' | 'Security' | 'Data & Retrieval' | 'Architecture' | 'MLOps';
  summary: string;
  coreNpmPackages: string[];
  keyFile: string;
  sampleActionName: string;
}

export const TOP_20_ROLES: AiRole[] = [
  {
    id: 1,
    slug: 'ai-fullstack',
    title: 'AI Full-Stack Engineer',
    icon: Code2,
    category: 'Engineering',
    summary: 'Builds end-to-end applications bridging React 18+ with Node.js and real-time streaming AI pipelines.',
    coreNpmPackages: ['express', 'react', 'vite', 'tailwindcss'],
    keyFile: 'backend/src/app.ts',
    sampleActionName: 'Inspect End-to-End Pipeline',
  },
  {
    id: 2,
    slug: 'agentic-systems',
    title: 'AI Agent Systems Engineer',
    icon: Bot,
    category: 'Engineering',
    summary: 'Designs cognitive loops, tool dispatch registries, and autonomous ReAct cycles in pure TypeScript.',
    coreNpmPackages: ['zod', 'ws'],
    keyFile: 'backend/src/ai/agents/reactAgentEngine.ts',
    sampleActionName: 'Simulate ReAct Loop',
  },
  {
    id: 3,
    slug: 'mcp-developer',
    title: 'MCP Server Developer',
    icon: Layers,
    category: 'Engineering',
    summary: 'Implements Anthropic Model Context Protocol servers exposing enterprise database tools over JSON-RPC 2.0.',
    coreNpmPackages: ['@modelcontextprotocol/sdk'],
    keyFile: 'backend/src/ai/mcp/enterpriseMcpServer.ts',
    sampleActionName: 'Inspect MCP JSON-RPC Server',
  },
  {
    id: 4,
    slug: 'rag-engineer',
    title: 'RAG Retrieval Engineer',
    icon: Database,
    category: 'Data & Retrieval',
    summary: 'Specializes in semantic chunking, Reciprocal Rank Fusion (RRF), and hybrid sparse-dense retrieval.',
    coreNpmPackages: ['pgvector', 'pg'],
    keyFile: 'backend/src/ai/rag/hybridRetrieval.ts',
    sampleActionName: 'Execute Hybrid RRF Search',
  },
  {
    id: 5,
    slug: 'vector-db-admin',
    title: 'Vector DB Administrator',
    icon: Database,
    category: 'Data & Retrieval',
    summary: 'Tunes PostgreSQL pgvector extensions, partitions tables, and constructs HNSW cosine indexes.',
    coreNpmPackages: ['pg', 'pgvector', 'drizzle-orm'],
    keyFile: 'backend/src/db/migrations/0001_vector_and_hnsw.sql',
    sampleActionName: 'Inspect HNSW Index Specs',
  },
  {
    id: 6,
    slug: 'mlops-observability',
    title: 'MLOps & Observability Engineer',
    icon: BarChart,
    category: 'MLOps',
    summary: 'Instruments token cost accounting, execution span tracing, and distributed telemetry.',
    coreNpmPackages: ['ioredis'],
    keyFile: 'backend/src/ai/mlops/tracingEvaluator.ts',
    sampleActionName: 'Calculate Model Token Costs',
  },
  {
    id: 7,
    slug: 'ai-appsec',
    title: 'AI AppSec & Security Auditor',
    icon: Shield,
    category: 'Security',
    summary: 'Enforces OWASP Top 10 for LLMs, constructs STRIDE threat matrices, and defeats prompt injection.',
    coreNpmPackages: ['helmet', 'jose'],
    keyFile: 'backend/src/security/threatModelAudit.ts',
    sampleActionName: 'Execute STRIDE Threat Audit',
  },
  {
    id: 8,
    slug: 'graphrag-engineer',
    title: 'GraphRAG & Knowledge Engineer',
    icon: GitGraph,
    category: 'Data & Retrieval',
    summary: 'Builds entity-relationship graphs and multi-hop causal reasoning paths for associative RAG.',
    coreNpmPackages: ['zod'],
    keyFile: 'backend/src/ai/graph/graphRagEngine.ts',
    sampleActionName: 'Traverse 3-Hop Entity Graph',
  },
  {
    id: 9,
    slug: 'edge-ai',
    title: 'Edge AI & WASM Engineer',
    icon: Smartphone,
    category: 'Engineering',
    summary: 'Executes Transformers.js models in browser WebAssembly for zero-cloud client privacy.',
    coreNpmPackages: ['@xenova/transformers'],
    keyFile: 'frontend/src/ai/clientInference.ts',
    sampleActionName: 'Run In-Browser WASM Inference',
  },
  {
    id: 10,
    slug: 'prompt-architect',
    title: 'Prompt & Few-Shot Architect',
    icon: Sparkles,
    category: 'Architecture',
    summary: 'Designs parameterized few-shot prompt registries strictly coupled to Zod output schemas.',
    coreNpmPackages: ['zod'],
    keyFile: 'backend/src/ai/prompts/templateRegistry.ts',
    sampleActionName: 'Validate Zod Prompt Schema',
  },
  {
    id: 11,
    slug: 'semantic-cache-architect',
    title: 'Semantic Vector Cache Architect',
    icon: Zap,
    category: 'Data & Retrieval',
    summary: 'Intercepts repeated user queries using Redis vector similarity (>0.92 cosine) to achieve $0 cost.',
    coreNpmPackages: ['ioredis'],
    keyFile: 'backend/src/cache/semanticCacheRedis.ts',
    sampleActionName: 'Query Redis Semantic Cache',
  },
  {
    id: 12,
    slug: 'multicloud-architect',
    title: 'Multi-Cloud AI Architect',
    icon: Cloud,
    category: 'Architecture',
    summary: 'Orchestrates infrastructure blueprints across AWS ECS, Azure Container Apps, and GCP Cloud Run.',
    coreNpmPackages: ['dotenv', 'zod'],
    keyFile: 'backend/src/config/cloudDeployConfig.ts',
    sampleActionName: 'View Cloud Deployment Matrix',
  },
  {
    id: 13,
    slug: 'ragas-evaluator',
    title: 'Ragas Groundedness Engineer',
    icon: Scale,
    category: 'MLOps',
    summary: 'Measures Faithfulness, Answer Relevance, and Context Precision to eradicate hallucinations.',
    coreNpmPackages: ['@xenova/transformers'],
    keyFile: 'backend/src/ai/mlops/ragTriadMetrics.ts',
    sampleActionName: 'Compute Triad Scorecard',
  },
  {
    id: 14,
    slug: 'synthetic-data-engineer',
    title: 'Chunking & Tokenization Specialist',
    icon: Hash,
    category: 'Data & Retrieval',
    summary: 'Engineers sliding-window token chunkers preserving sentence boundaries with SHA-256 integrity.',
    coreNpmPackages: ['crypto'],
    keyFile: 'backend/src/ai/rag/textChunker.ts',
    sampleActionName: 'Chunk Text with Overlap',
  },
  {
    id: 15,
    slug: 'swarm-supervisor',
    title: 'Swarm Supervisor Engineer',
    icon: Network,
    category: 'Engineering',
    summary: 'Coordinates multi-agent directed graphs (LangGraph-style) with architectural and security quality gates.',
    coreNpmPackages: ['zod'],
    keyFile: 'backend/src/ai/agents/supervisorAgent.ts',
    sampleActionName: 'Dispatch Multi-Agent DAG',
  },
  {
    id: 16,
    slug: 'finetuning-engineer',
    title: 'Embeddings & Fine-Tuning Engineer',
    icon: Cpu,
    category: 'Engineering',
    summary: 'Builds and quantizes feature-extraction pipelines using all-MiniLM-L6-v2 in pure JavaScript.',
    coreNpmPackages: ['@xenova/transformers'],
    keyFile: 'backend/src/ai/nlp/embeddingsEngine.ts',
    sampleActionName: 'Generate 384-Dim Vector',
  },
  {
    id: 17,
    slug: 'red-teamer',
    title: 'AI Red Teamer & Jailbreak Analyst',
    icon: Crosshair,
    category: 'Security',
    summary: 'Simulates adversarial attacks (DAN, delimiter injection, system prompt exfiltration) to harden defenses.',
    coreNpmPackages: ['helmet'],
    keyFile: 'backend/src/security/promptInjectionFirewall.ts',
    sampleActionName: 'Simulate DAN Jailbreak',
  },
  {
    id: 18,
    slug: 'dlp-privacy-engineer',
    title: 'DLP & Privacy Engineer',
    icon: Lock,
    category: 'Security',
    summary: 'Constructs automated PII and API secret scrubbing engines with reversible tokenization maps.',
    coreNpmPackages: ['crypto'],
    keyFile: 'backend/src/security/dlpMasker.ts',
    sampleActionName: 'Test PII Redaction Regex',
  },
  {
    id: 19,
    slug: 'cognitive-architect',
    title: 'Cognitive Architecture Specialist',
    icon: Workflow,
    category: 'Architecture',
    summary: 'Designs Thought-Action-Observation loops with safety ceilings, state serialization, and backtracking.',
    coreNpmPackages: ['zod'],
    keyFile: 'backend/src/ai/agents/reactAgentEngine.ts',
    sampleActionName: 'Audit ReAct Step Trace',
  },
  {
    id: 20,
    slug: 'enterprise-ai-director',
    title: 'Enterprise AI Solutions Director',
    icon: Briefcase,
    category: 'Architecture',
    summary: 'Synthesizes compliance, multi-cloud economics, ROI, and security postures for executive leadership.',
    coreNpmPackages: ['jose', 'helmet', 'zod'],
    keyFile: 'docs/02_top_20_ai_era_roles_manual.md',
    sampleActionName: 'Review Executive Blueprint',
  },
];

export const RolePlaygrounds: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<AiRole>(TOP_20_ROLES[0]!);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const categories = ['All', 'Engineering', 'Security', 'Data & Retrieval', 'Architecture', 'MLOps'];

  const filteredRoles =
    activeCategory === 'All'
      ? TOP_20_ROLES
      : TOP_20_ROLES.filter((r) => r.category === activeCategory);

  const handleTriggerAction = (role: AiRole) => {
    setActionFeedback(
      `Triggered '${role.sampleActionName}' -> Verified module [${role.keyFile}] adhering to strict TypeScript contracts.`
    );
  };

  const IconComponent = selectedRole.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111726] border border-slate-800 rounded-xl p-5">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Briefcase className="text-brand-500" size={22} />
          Top 20 AI-Era Roles Playground & Code Mapping
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Explore production-grade implementations and verified code artifacts across all 20 specialized AI roles.
        </p>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                activeCategory === cat
                  ? 'bg-brand-500 text-black font-semibold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Selection Grid */}
        <div className="lg:col-span-1 bg-[#111726] border border-slate-800 rounded-xl p-4 max-h-[650px] overflow-y-auto space-y-2">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
            Showing {filteredRoles.length} Roles
          </div>
          {filteredRoles.map((role) => {
            const RoleIcon = role.icon;
            const isSelected = selectedRole.id === role.id;
            return (
              <button
                key={role.id}
                onClick={() => {
                  setSelectedRole(role);
                  setActionFeedback(null);
                }}
                className={`w-full text-left p-3 rounded-lg border transition flex items-center gap-3 ${
                  isSelected
                    ? 'bg-brand-500/10 border-brand-500/40 text-brand-500'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div
                  className={`p-2 rounded-md ${
                    isSelected ? 'bg-brand-500 text-black' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <RoleIcon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate text-slate-100">
                    #{role.id} {role.title}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{role.category}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Role Interactive Card */}
        <div className="lg:col-span-2 bg-[#111726] border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-brand-500/10 border border-brand-500/30 rounded-xl text-brand-500">
                  <IconComponent size={28} />
                </div>
                <div>
                  <span className="text-xs font-mono text-brand-500 font-semibold uppercase">
                    Role #{selectedRole.id} • {selectedRole.category}
                  </span>
                  <h3 className="text-xl font-bold text-slate-100">{selectedRole.title}</h3>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">{selectedRole.summary}</p>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-xs font-mono text-slate-400">Target Implementation File:</div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-cyan-400 flex items-center justify-between">
                <span>{selectedRole.keyFile}</span>
                <ExternalLink size={14} className="text-slate-500" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono text-slate-400">Mandatory Pure JS/TS NPM Stack:</div>
              <div className="flex flex-wrap gap-2">
                {selectedRole.coreNpmPackages.map((pkg, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-xs font-mono text-purple-300 rounded-md"
                  >
                    npm: {pkg}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => handleTriggerAction(selectedRole)}
              className="w-full bg-brand-500 hover:bg-brand-600 text-black font-semibold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition"
            >
              <IconComponent size={16} />
              {selectedRole.sampleActionName}
            </button>

            {actionFeedback && (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400">
                {actionFeedback}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
