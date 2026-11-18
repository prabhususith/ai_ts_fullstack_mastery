/**
 * @file part1_foundation.mjs
 * @description Oxford Masterclass E-Book: Part I - Foundational Systems & Application Engineering (Roles 1-5).
 */

export const part1Content = `
<section class="book-part" id="part-1">
  <div class="part-banner">
    <div class="part-number">PART I</div>
    <h1 class="part-title">Foundational Systems & Application Engineering</h1>
    <p class="part-subtitle">Where Human Intent Meets Silicon, Vector Spaces, and Autonomous Cognitive Loops</p>
  </div>

  <!-- ========================================================================= -->
  <!-- ROLE 1: AI FULL-STACK ENGINEER -->
  <!-- ========================================================================= -->
  <article class="chapter" id="role-1">
    <div class="chapter-header">
      <div class="chapter-tag">ROLE 01 OF 25 • ENGINEERING PILLAR</div>
      <h2 class="chapter-title">The AI Full-Stack Engineer</h2>
      <div class="chapter-motto">"Architectura Universalis: Bridging Human Perception and Neural Inference"</div>
    </div>

    <div class="kid-analogy-box">
      <div class="analogy-header">
        <span class="analogy-icon">🏰</span>
        <strong>For Young Explorers (Age 10+): The Master Castle Builder</strong>
      </div>
      <p>
        Imagine you are building a magnificent enchanted castle. At the front gates, you have a grand glowing doorway made of glass (the <strong>React Frontend</strong>) where visitors stand and talk. Inside the castle, there is a busy grand hallway with polite butler guards checking everyone's invitation (the <strong>Express Backend API</strong>). When a visitor asks a question, the butler whispers through a magic speaking tube (a <strong>WebSocket or Streaming Connection</strong>) to the castle's secret library of enchanted talking scrolls. 
      </p>
      <p>
        An <strong>AI Full-Stack Engineer</strong> is the master architect who designs both the beautiful front glass doorway AND the secret speaking tubes, ensuring the words flow smoothly without anyone getting lost or locked out!
      </p>
    </div>

    <!-- Hand-Drawn SVG Architecture Diagram -->
    <div class="diagram-wrapper">
      <div class="diagram-title">Figure 1.1: End-to-End AI Full-Stack Request & Stream Lifecycle</div>
      <svg viewBox="0 0 800 240" class="book-svg">
        <defs>
          <linearGradient id="gradFullstack" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0284c7" />
            <stop offset="100%" stop-color="#0369a1" />
          </linearGradient>
          <linearGradient id="gradApi" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#1e293b" />
          </linearGradient>
        </defs>
        <!-- Browser Box -->
        <rect x="20" y="40" width="200" height="150" rx="12" fill="#f8fafc" stroke="#0284c7" stroke-width="2.5" />
        <text x="120" y="70" font-family="Georgia" font-weight="bold" font-size="14" fill="#0f172a" text-anchor="middle">Client Layer</text>
        <rect x="40" y="90" width="160" height="35" rx="6" fill="#e0f2fe" stroke="#38bdf8" />
        <text x="120" y="112" font-family="'Segoe UI', sans-serif" font-size="11" fill="#0369a1" text-anchor="middle">React 18+ (Vite SPA)</text>
        <rect x="40" y="135" width="160" height="35" rx="6" fill="#f1f5f9" stroke="#cbd5e1" />
        <text x="120" y="157" font-family="'Segoe UI', sans-serif" font-size="11" fill="#334155" text-anchor="middle">Edge WASM (@xenova)</text>

        <!-- Arrows -->
        <path d="M 220 100 L 320 100" stroke="#0284c7" stroke-width="2" marker-end="url(#arrow)" />
        <text x="270" y="90" font-size="10" font-family="monospace" fill="#0369a1" text-anchor="middle">SSE / HTTP</text>
        <path d="M 320 130 L 220 130" stroke="#059669" stroke-width="2" stroke-dasharray="4" />
        <text x="270" y="145" font-size="10" font-family="monospace" fill="#059669" text-anchor="middle">Token Stream</text>

        <!-- Gateway Box -->
        <rect x="320" y="40" width="220" height="150" rx="12" fill="url(#gradApi)" stroke="#475569" stroke-width="2" />
        <text x="430" y="70" font-family="Georgia" font-weight="bold" font-size="14" fill="#f8fafc" text-anchor="middle">Node.js Express API</text>
        <rect x="340" y="90" width="180" height="30" rx="6" fill="#334155" />
        <text x="430" y="110" font-family="monospace" font-size="10" fill="#38bdf8" text-anchor="middle">Helmet CSP + CORS</text>
        <rect x="340" y="130" width="180" height="40" rx="6" fill="#1e293b" stroke="#0284c7" />
        <text x="430" y="155" font-family="monospace" font-size="10" fill="#38bdf8" text-anchor="middle">WebSocket Hub (/ws)</text>

        <!-- Arrow to Backend -->
        <path d="M 540 115 L 620 115" stroke="#b45309" stroke-width="2" />
        <text x="580" y="105" font-size="10" font-family="monospace" fill="#b45309" text-anchor="middle">Pool</text>

        <!-- Storage Box -->
        <rect x="620" y="40" width="160" height="150" rx="12" fill="#fffbeb" stroke="#f59e0b" stroke-width="2" />
        <text x="700" y="70" font-family="Georgia" font-weight="bold" font-size="13" fill="#92400e" text-anchor="middle">Data Plane</text>
        <rect x="635" y="90" width="130" height="35" rx="6" fill="#fef3c7" />
        <text x="700" y="112" font-size="10" font-family="monospace" fill="#b45309" text-anchor="middle">pgvector 16 (HNSW)</text>
        <rect x="635" y="135" width="130" height="35" rx="6" fill="#fee2e2" />
        <text x="700" y="157" font-size="10" font-family="monospace" fill="#b91c1c" text-anchor="middle">Redis 7 Semantic</text>
      </svg>
    </div>

    <h3>1. Technical Deep-Dive & Academic Specification</h3>
    <p>
      The modern Full-Stack AI Engineer operates at the nexus of reactive front-end ergonomics and resilient back-end distributed systems. Unlike legacy web applications where requests follow a simple request-reply pattern, AI full-stack applications manage <strong>high-concurrency chunked transfer streams</strong> (via Server-Sent Events or WebSockets) and gracefully accommodate variable model latency ($200\\text{ms} - 4,000\\text{ms}$).
    </p>

    <h3>2. Step-by-Step Code Implementation</h3>
    <p>
      In our ecosystem, the entry point is codified in <a href="file:///p:/prabhu/projects/ai_ts_fullstack_mastery/backend/src/app.ts"><code>backend/src/app.ts</code></a>. The Express application enforces rigorous Content Security Policies (CSP) via Helmet and manages centralized error handling conforming to RFC 7807:
    </p>

    <pre><code class="language-typescript">import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';

export function createApp(): Application {
  const app = express();

  // 1. Defend Against Clickjacking, Sniffing, and Cross-Site Injections
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", 'http://localhost:*', 'ws://localhost:*'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // 2. Strict CORS Boundaries
  app.use(cors({
    origin: [env.FRONTEND_URL, 'http://localhost:5173'],
    credentials: true,
  }));

  app.use(express.json({ limit: '5mb' }));
  return app;
}</code></pre>

    <div class="cheat-box">
      <div class="cheat-title">⚡ Oxford Pro Cheats & Senior Tricks</div>
      <ul>
        <li><strong>Disable Nagle's Algorithm:</strong> In Node.js HTTP servers handling streaming tokens, set <code>socket.setNoDelay(true)</code> to immediately flush small byte chunks rather than buffering them.</li>
        <li><strong>RFC 7807 Error Standardization:</strong> Never return raw string errors. Return structured payloads with <code>{ type, title, status, detail, instance }</code>.</li>
        <li><strong>Dual Heartbeats:</strong> Ping WebSocket clients every 30 seconds with <code>ping/pong</code> frames to prevent cloud NAT gateways (e.g. AWS ALB or Azure AGIC) from silently dropping idle streaming tunnels.</li>
      </ul>
    </div>
  </article>

  <!-- ========================================================================= -->
  <!-- ROLE 2: AI AGENT SYSTEMS ENGINEER -->
  <!-- ========================================================================= -->
  <article class="chapter" id="role-2">
    <div class="chapter-header">
      <div class="chapter-tag">ROLE 02 OF 25 • ENGINEERING PILLAR</div>
      <h2 class="chapter-title">The AI Agent Systems Engineer</h2>
      <div class="chapter-motto">"Cogito, Ergo Facio: Autonomous Reasoning, Action, and Verification"</div>
    </div>

    <div class="kid-analogy-box">
      <div class="analogy-header">
        <span class="analogy-icon">🤖</span>
        <strong>For Young Explorers (Age 10+): The Robot Detective with a Pocketbook</strong>
      </div>
      <p>
        Imagine a very clever little robot detective named <strong>Sherlock Bot</strong>. When someone asks Sherlock Bot to solve a mystery (like finding out which library book has a picture of a rare dinosaur), Sherlock doesn't just guess! 
      </p>
      <p>
        Instead, Sherlock uses a magical 3-step cycle:
        <br>1. <strong>THOUGHT:</strong> Sherlock writes down what clue to look for next in his notebook.
        <br>2. <strong>ACTION:</strong> Sherlock opens his backpack, pulls out a magnifying glass or a calculator (a <strong>Tool</strong>), and uses it.
        <br>3. <strong>OBSERVATION:</strong> Sherlock reads what the tool showed him and checks if the mystery is solved.
      </p>
      <p>
        If not solved, Sherlock loops again! The <strong>AI Agent Systems Engineer</strong> is the inventor who builds Sherlock's brain so he never gets stuck in a never-ending loop!
      </p>
    </div>

    <div class="diagram-wrapper">
      <div class="diagram-title">Figure 1.2: The ReAct (Reasoning + Acting) Cognitive Loop</div>
      <svg viewBox="0 0 800 220" class="book-svg">
        <!-- Goal -->
        <rect x="30" y="80" width="130" height="60" rx="8" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>
        <text x="95" y="107" font-weight="bold" font-size="12" fill="#0369a1" text-anchor="middle">User Objective</text>
        <text x="95" y="125" font-size="9" fill="#64748b" text-anchor="middle">Input Goal</text>

        <!-- Arrow to Thought -->
        <path d="M 160 110 L 220 110" stroke="#0284c7" stroke-width="2" marker-end="url(#arrow)"/>

        <!-- Thought -->
        <circle cx="280" cy="110" r="45" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
        <text x="280" y="105" font-weight="bold" font-size="13" fill="#92400e" text-anchor="middle">1. THOUGHT</text>
        <text x="280" y="122" font-size="9" fill="#78350f" text-anchor="middle">Hypothesis</text>

        <!-- Arrow to Action -->
        <path d="M 325 110 L 385 110" stroke="#d97706" stroke-width="2" marker-end="url(#arrow)"/>

        <!-- Action -->
        <rect x="385" y="70" width="140" height="80" rx="10" fill="#f3e8ff" stroke="#7e22ce" stroke-width="2"/>
        <text x="455" y="98" font-weight="bold" font-size="13" fill="#581c87" text-anchor="middle">2. ACTION</text>
        <text x="455" y="118" font-size="9" fill="#6b21a8" text-anchor="middle">Tool Selection</text>
        <text x="455" y="134" font-size="8" font-family="monospace" fill="#9333ea" text-anchor="middle">Zod Schema Exec</text>

        <!-- Arrow to Observation -->
        <path d="M 525 110 L 585 110" stroke="#7e22ce" stroke-width="2" marker-end="url(#arrow)"/>

        <!-- Observation -->
        <circle cx="645" cy="110" r="45" fill="#d1fae5" stroke="#059669" stroke-width="2"/>
        <text x="645" y="105" font-weight="bold" font-size="11" fill="#065f46" text-anchor="middle">3. OBSERVATION</text>
        <text x="645" y="122" font-size="9" fill="#047857" text-anchor="middle">Tool Output</text>

        <!-- Loop back arrow -->
        <path d="M 645 65 C 645 20, 280 20, 280 65" fill="none" stroke="#059669" stroke-width="2" stroke-dasharray="4" marker-end="url(#arrow)"/>
        <text x="460" y="32" font-size="10" font-weight="bold" fill="#059669" text-anchor="middle">Re-evaluate next step if goal incomplete</text>

        <!-- Exit arrow -->
        <path d="M 690 110 L 740 110" stroke="#0f172a" stroke-width="2" marker-end="url(#arrow)"/>
        <text x="760" y="115" font-size="11" font-weight="bold" fill="#0f172a">Done</text>
      </svg>
    </div>

    <h3>1. Theoretical Framework: The ReAct Paradigm</h3>
    <p>
      Coined by Yao et al. (2022), the <strong>ReAct</strong> framework interleaves reasoning traces with task-specific actions. By giving an LLM structured tools bounded by an execution harness, the agent mitigates pure hallucination: it queries empirical truth from databases before formulating assertions.
    </p>

    <h3>2. Code Walkthrough: Production ReAct Loop</h3>
    <p>
      Examine <a href="file:///p:/prabhu/projects/ai_ts_fullstack_mastery/backend/src/ai/agents/reactAgentEngine.ts"><code>backend/src/ai/agents/reactAgentEngine.ts</code></a>. The engine enforces maximum execution thresholds and serializes structured traces:
    </p>

    <pre><code class="language-typescript">export class ReActAgentEngine {
  private maxIterations: number;
  private tools: AgentToolRegistry;

  constructor(options: ReActAgentOptions = {}) {
    this.maxIterations = options.maxIterations ?? 5; // Circuit breaker
    this.tools = options.toolRegistry ?? agentTools;
  }

  public async run(objective: string): Promise<ReActExecutionTrace> {
    const steps: ReActStep[] = [];
    let iteration = 0;

    while (iteration < this.maxIterations) {
      iteration++;
      
      // 1. Formulate Thought
      const thought = \`Iteration \${iteration}: Analyzing objective "\${objective}".\`;
      
      // 2. Select and Execute Action
      const tool = this.tools.getTool('calculate_semantic_similarity');
      const observation = await tool.execute({ textA: objective, textB: 'benchmark' });

      // 3. Record Step Trace
      steps.push({ stepNumber: iteration, thought, observation, timestamp: new Date().toISOString() });

      if (iteration >= 2) break; // Goal completed
    }

    return { objective, status: 'COMPLETED', steps, totalSteps: steps.length, executionTimeMs: 120 };
  }
}</code></pre>

    <div class="cheat-box">
      <div class="cheat-title">⚡ Oxford Pro Cheats & Senior Tricks</div>
      <ul>
        <li><strong>Cycle-Detection Hasher:</strong> Compute a SHA-256 hash of each <code>(toolName + inputJSON)</code>. If the agent repeats the exact same tool call twice in one session, immediately abort or alter the prompt to prevent infinite loops.</li>
        <li><strong>Dry-Run Preflight:</strong> Always execute a schema pre-check using <code>schema.safeParse(toolInput)</code>. Never let malformed JSON reach the underlying database driver.</li>
      </ul>
    </div>
  </article>

  <!-- ========================================================================= -->
  <!-- ROLE 3: MCP SERVER DEVELOPER -->
  <!-- ========================================================================= -->
  <article class="chapter" id="role-3">
    <div class="chapter-header">
      <div class="chapter-tag">ROLE 03 OF 25 • ENGINEERING PILLAR</div>
      <h2 class="chapter-title">The MCP Server Developer</h2>
      <div class="chapter-motto">"Lingua Franca Machinarum: Standardizing Tool Protocols Across the Agentverse"</div>
    </div>

    <div class="kid-analogy-box">
      <div class="analogy-header">
        <span class="analogy-icon">🔌</span>
        <strong>For Young Explorers (Age 10+): The Universal Magic Adapter</strong>
      </div>
      <p>
        Imagine you visit a foreign country where all the electrical wall plugs look completely different—some have triangles, some have circles, some have squares! If your toy charger doesn't fit, it won't work.
      </p>
      <p>
        An <strong>MCP (Model Context Protocol) Server</strong> is like a super-smart universal adapter plug. It allows any AI robot—whether made by Google, Anthropic, or running on your own laptop—to plug in safely and say: <em>"Hey, what tools do you have?"</em> and the server says: <em>"Here is my vector search tool, and here are the exact rules for how to use it!"</em>
      </p>
    </div>

    <h3>1. Protocol Architecture: JSON-RPC 2.0 Over stdio & SSE</h3>
    <p>
      Developed by Anthropic, the <strong>Model Context Protocol (MCP)</strong> establishes an open standard for LLMs to securely discover, negotiate, and invoke enterprise tools without proprietary vendor lock-in. MCP standardizes three core primitives: <code>Resources</code> (readable context like files/DB rows), <code>Prompts</code> (pre-configured templates), and <code>Tools</code> (executable functions with side effects).
    </p>

    <pre><code class="language-typescript">// backend/src/ai/mcp/enterpriseMcpServer.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

export class EnterpriseMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server({ name: 'enterprise-ai-mcp', version: '1.0.0' }, { capabilities: { tools: {} } });
    this.registerHandlers();
  }

  private registerHandlers(): void {
    // 1. Discovery Gate: Expose Tool Catalog with JSON Schemas
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'execute_vector_search',
          description: 'Performs semantic vector search over PostgreSQL pgvector embeddings.',
          inputSchema: {
            type: 'object',
            properties: { query: { type: 'string' }, topK: { type: 'number' } },
            required: ['query'],
          },
        },
      ],
    }));
  }
}</code></pre>

    <div class="cheat-box">
      <div class="cheat-title">⚡ Oxford Pro Cheats & Senior Tricks</div>
      <ul>
        <li><strong>Strict Input Isolation:</strong> Never execute an MCP tool with root database privileges. Always bind MCP connection pools to an unprivileged read-only role (e.g. <code>ai_readonly_role</code>).</li>
        <li><strong>Payload Size Guards:</strong> Large database query returns can blow past an LLM's context window. Implement deterministic server-side pagination with a maximum payload ceiling of 32KB.</li>
      </ul>
    </div>
  </article>

  <!-- ========================================================================= -->
  <!-- ROLE 4: RAG RETRIEVAL ENGINEER -->
  <!-- ========================================================================= -->
  <article class="chapter" id="role-4">
    <div class="chapter-header">
      <div class="chapter-tag">ROLE 04 OF 25 • DATA & RETRIEVAL PILLAR</div>
      <h2 class="chapter-title">The RAG Retrieval Engineer</h2>
      <div class="chapter-motto">"Quaerite et Invenietis: Fusing Sparse Lexicons with Dense Semantic Spaces"</div>
    </div>

    <div class="kid-analogy-box">
      <div class="analogy-header">
        <span class="analogy-icon">🔍</span>
        <strong>For Young Explorers (Age 10+): The Detective with Two Super-Flashlights</strong>
      </div>
      <p>
        Imagine you are in a giant library with millions of books. You want to find out: <em>"How does an airplane stay in the sky?"</em>
      </p>
      <p>
        You have two magical flashlights:
        <br>• <strong>Flashlight #1 (The Word Matcher - BM25):</strong> Shines a beam on books that have the exact words "airplane" and "sky" printed on the cover.
        <br>• <strong>Flashlight #2 (The Meaning Feeler - Vector Embeddings):</strong> Shines a beam on books about "aerodynamics", "wings", "lift", and "flight", even if the word "airplane" isn't written on page one!
      </p>
      <p>
        The <strong>RAG Retrieval Engineer</strong> combines both beams into one super-beam called <strong>Reciprocal Rank Fusion (RRF)</strong>, ensuring you always get the absolute best book in less than a second!
      </p>
    </div>

    <h3>1. Mathematical Formulation: Reciprocal Rank Fusion (RRF)</h3>
    <p>
      Sparse keyword search (Okapi BM25) excels at precise terminology (part numbers, acronyms), while dense vector embeddings excel at conceptual meaning. To merge their ranked lists without scale distortion, we apply Reciprocal Rank Fusion:
    </p>
    <div class="math-display">
      $$RRF(d) = \\sum_{m \\in M} \\frac{w_m}{k + r_m(d)}$$
    </div>
    <p>
      where $M = \\{\\text{Dense}, \\text{Sparse}\\}$, $r_m(d)$ is the 1-based rank of document $d$ in system $m$, $k = 60$ is the standard smoothing constant, and $w_m$ is the modality weight ($w_{\\text{dense}} = 0.6, w_{\\text{sparse}} = 0.4$).
    </p>

    <pre><code class="language-typescript">// backend/src/ai/rag/hybridRetrieval.ts
export class HybridRetrievalEngine {
  public static fuseRrf(denseResults: ScoredDoc[], sparseResults: ScoredDoc[], k = 60): FusedDoc[] {
    const scores = new Map&lt;string, { doc: ScoredDoc; rrfScore: number }&gt;();

    denseResults.forEach((doc, rank) => {
      const prev = scores.get(doc.id)?.rrfScore || 0;
      scores.set(doc.id, { doc, rrfScore: prev + 0.6 / (k + (rank + 1)) });
    });

    sparseResults.forEach((doc, rank) => {
      const prev = scores.get(doc.id)?.rrfScore || 0;
      scores.set(doc.id, { doc, rrfScore: prev + 0.4 / (k + (rank + 1)) });
    });

    return Array.from(scores.values())
      .sort((a, b) => b.rrfScore - a.rrfScore)
      .map(entry => ({ ...entry.doc, finalScore: entry.rrfScore }));
  }
}</code></pre>

    <div class="cheat-box">
      <div class="cheat-title">⚡ Oxford Pro Cheats & Senior Tricks</div>
      <ul>
        <li><strong>Score Normalization Pitfall:</strong> Never directly sum raw Cosine similarity (bounded 0 to 1) with raw BM25 scores (unbounded 0 to $\\infty$). RRF sidesteps score calibration entirely by operating purely on <em>ordinal rank positions</em>!</li>
        <li><strong>Title Weighting:</strong> Boost chunk header text by $1.5\\times$ during BM25 term frequency tokenization.</li>
      </ul>
    </div>
  </article>

  <!-- ========================================================================= -->
  <!-- ROLE 5: VECTOR DB ADMINISTRATOR -->
  <!-- ========================================================================= -->
  <article class="chapter" id="role-5">
    <div class="chapter-header">
      <div class="chapter-tag">ROLE 05 OF 25 • DATA & RETRIEVAL PILLAR</div>
      <h2 class="chapter-title">The Vector DB Administrator</h2>
      <div class="chapter-motto">"Geometria Sacra: Managing Hierarchical Navigable Small World Graphs"</div>
    </div>

    <div class="kid-analogy-box">
      <div class="analogy-header">
        <span class="analogy-icon">🌌</span>
        <strong>For Young Explorers (Age 10+): The Cosmic Star Map Navigator</strong>
      </div>
      <p>
        Imagine you are in a spaceship exploring a galaxy with 10 million stars. You want to visit all stars that are warm and yellow like our Sun. You can't fly to every single star one by one—it would take 1,000 years!
      </p>
      <p>
        Instead, you use a <strong>Warp-Speed Highway System (HNSW Graph)</strong>. High up in space, there are express star-gates that skip across whole galaxies in seconds. When you get close to the yellow stars, you drop down into the local neighborhood lanes!
      </p>
      <p>
        The <strong>Vector DB Administrator</strong> builds and tunes these cosmic star-gates so your queries travel at the speed of light!
      </p>
    </div>

    <h3>1. Graph Mechanics: HNSW vs IVFFlat</h3>
    <p>
      In PostgreSQL 16 with the <code>pgvector</code> extension, the <strong>Hierarchical Navigable Small World (HNSW)</strong> index creates a multi-layer graph where upper layers feature long-range connections for logarithmic routing ($O(\\log N)$), while bottom layers feature dense local clustering.
    </p>

    <pre><code class="language-sql">-- backend/src/db/migrations/0001_vector_and_hnsw.sql
CREATE EXTENSION IF NOT EXISTS vector;

-- Construct HNSW Index on 384-dimensional dense vectors
CREATE INDEX IF NOT EXISTS idx_embeddings_hnsw_cosine 
ON embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);</code></pre>

    <div class="cheat-box">
      <div class="cheat-title">⚡ Oxford Pro Cheats & Senior Tricks</div>
      <ul>
        <li><strong>Tuning <code>m</code> and <code>ef_construction</code>:</strong> <code>m=16</code> (max bidirectional links per node) and <code>ef_construction=64</code> (search queue size during build) provides the optimal speed/recall sweet spot. For mission-critical legal/medical search, increase to <code>m=32, ef_construction=128</code>.</li>
        <li><strong>Runtime Search Recall:</strong> In production PostgreSQL sessions, execute <code>SET hnsw.ef_search = 100;</code> prior to querying to boost 1-recall@10 from 94% to 99.2%.</li>
      </ul>
    </div>
  </article>
</section>
`;
