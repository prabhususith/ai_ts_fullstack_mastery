/**
 * @file part2_observability_appsec.mjs
 * @description Oxford Masterclass E-Book: Part II - Observability, Security & Knowledge Graphs (Roles 6-10).
 */

export const part2Content = `
<section class="book-part" id="part-2">
  <div class="part-banner">
    <div class="part-number">PART II</div>
    <h1 class="part-title">Observability, Security & Knowledge Graphs</h1>
    <p class="part-subtitle">Guarding the Gates, Tracing Latency Spikes, and Weaving Multi-Hop Ontological Truth</p>
  </div>

  <!-- ========================================================================= -->
  <!-- ROLE 6: AI MLOPS & OBSERVABILITY ENGINEER -->
  <!-- ========================================================================= -->
  <article class="chapter" id="role-6">
    <div class="chapter-header">
      <div class="chapter-tag">ROLE 06 OF 25 • PLATFORM & RELIABILITY PILLAR</div>
      <h2 class="chapter-title">The AI MLOps & Observability Engineer</h2>
      <div class="chapter-motto">"Scire per Causas: Measuring Every Microsecond and Token in the Autonomous Mind"</div>
    </div>

    <div class="kid-analogy-box">
      <div class="analogy-header">
        <span class="analogy-icon">🏥</span>
        <strong>For Young Explorers (Age 10+): The High-Tech Robot Hospital Doctor</strong>
      </div>
      <p>
        Imagine a giant hospital where thousands of smart robot assistants are running errands. If one robot trips on a rug, drops an ice cream cone, or takes 10 minutes instead of 10 seconds to answer a question, you need a doctor with special x-ray glasses!
      </p>
      <p>
        The <strong>AI MLOps & Observability Engineer</strong> is that doctor. They attach tiny invisible heart monitors and GPS trackers (called <strong>Spans and Traces</strong>) to every single thought the robot thinks. If the robot gets tired or confuses two words, the doctor's alert buzzer rings immediately so they can fix it before anyone notices!
      </p>
    </div>

    <div class="diagram-wrapper">
      <div class="diagram-title">Figure 2.1: Distributed Trace Waterfall for Agentic Inference & Retrieval</div>
      <svg viewBox="0 0 800 220" class="book-svg">
        <defs>
          <linearGradient id="gradTrace1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0284c7" />
            <stop offset="100%" stop-color="#0369a1" />
          </linearGradient>
          <linearGradient id="gradTrace2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#10b981" />
            <stop offset="100%" stop-color="#047857" />
          </linearGradient>
          <linearGradient id="gradTrace3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#8b5cf6" />
            <stop offset="100%" stop-color="#6d28d9" />
          </linearGradient>
        </defs>

        <!-- Timeline axis -->
        <line x1="50" y1="30" x2="750" y2="30" stroke="#94a3b8" stroke-width="1.5" />
        <text x="50" y="22" font-size="10" font-family="monospace" fill="#64748b">0ms</text>
        <text x="280" y="22" font-size="10" font-family="monospace" fill="#64748b">150ms</text>
        <text x="520" y="22" font-size="10" font-family="monospace" fill="#64748b">350ms</text>
        <text x="740" y="22" font-size="10" font-family="monospace" fill="#64748b">500ms</text>

        <!-- Root Span: HTTP Request -->
        <rect x="50" y="45" width="700" height="26" rx="4" fill="url(#gradTrace1)" />
        <text x="60" y="62" font-family="'Segoe UI', sans-serif" font-weight="bold" font-size="11" fill="#ffffff">Root Trace: POST /api/v1/agents/chat (500ms, 842 tokens)</text>

        <!-- Child Span 1: Prompt Guard & DLP -->
        <rect x="70" y="80" width="110" height="22" rx="4" fill="#f59e0b" />
        <text x="75" y="95" font-family="'Segoe UI', sans-serif" font-size="10" fill="#ffffff">DLP & Firewall (28ms)</text>

        <!-- Child Span 2: Vector Search -->
        <rect x="190" y="110" width="180" height="22" rx="4" fill="url(#gradTrace2)" />
        <text x="195" y="125" font-family="'Segoe UI', sans-serif" font-size="10" fill="#ffffff">HNSW Vector Retrieval (115ms)</text>

        <!-- Child Span 3: LLM Inference Streaming -->
        <rect x="380" y="140" width="360" height="22" rx="4" fill="url(#gradTrace3)" />
        <text x="385" y="155" font-family="'Segoe UI', sans-serif" font-size="10" fill="#ffffff">Model TTFT (80ms) + Stream Generation (270ms)</text>

        <!-- Metrics Badges -->
        <rect x="50" y="180" width="160" height="28" rx="6" fill="#f1f5f9" stroke="#cbd5e1" />
        <text x="130" y="198" font-size="11" font-family="monospace" fill="#334155" text-anchor="middle">P99 Latency: 480ms</text>

        <rect x="230" y="180" width="160" height="28" rx="6" fill="#f1f5f9" stroke="#cbd5e1" />
        <text x="310" y="198" font-size="11" font-family="monospace" fill="#047857" text-anchor="middle">Error Rate: 0.02%</text>

        <rect x="410" y="180" width="180" height="28" rx="6" fill="#f1f5f9" stroke="#cbd5e1" />
        <text x="500" y="198" font-size="11" font-family="monospace" fill="#b45309" text-anchor="middle">Burn: $0.0014 / call</text>
      </svg>
    </div>

    <h3>1. Distributed Tracing & High-Resolution Telemetry</h3>
    <p>
      In production agentic loops, non-deterministic latency and token exhaustion represent primary vectors of system failure. The AI MLOps engineer instruments OpenTelemetry-compatible traces that capture parent-child span hierarchies, time-to-first-token (TTFT), inter-token arrival time (ITAT), and prompt/completion token consumption metrics.
    </p>

    <h3>2. Step-by-Step Code Implementation</h3>
    <p>
      In our architecture, the telemetry subsystem is codified in <a href="file:///p:/prabhu/projects/ai_ts_fullstack_mastery/backend/src/ai/mlops/tracingEvaluator.ts"><code>backend/src/ai/mlops/tracingEvaluator.ts</code></a>:
    </p>

    <pre><code class="language-typescript">import { v4 as uuidv4 } from 'uuid';

export interface TraceSpan {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  metadata: Record&lt;string, any&gt;;
}

export class TracingEvaluator {
  private spans: Map&lt;string, TraceSpan&gt; = new Map();

  startSpan(name: string, metadata: Record&lt;string, any&gt; = {}): string {
    const id = uuidv4();
    this.spans.set(id, { id, name, startTime: performance.now(), metadata });
    return id;
  }

  endSpan(id: string, additionalMeta: Record&lt;string, any&gt; = {}): TraceSpan {
    const span = this.spans.get(id);
    if (!span) throw new Error(\`Span \${id} not found\`);
    span.endTime = performance.now();
    span.durationMs = Math.round(span.endTime - span.startTime);
    span.metadata = { ...span.metadata, ...additionalMeta };
    return span;
  }
}</code></pre>

    <div class="cheat-box">
      <div class="cheat-title">⚡ Oxford Pro Cheats & Senior Tricks</div>
      <ul>
        <li><strong>W3C Tracecontext Header Injection:</strong> Always propagate <code>traceparent</code> headers across asynchronous worker threads to preserve unbroken causal lineage.</li>
        <li><strong>Sampling High-Volume Inferences:</strong> Implement tail-based sampling ($100\\%$ of spans with latency &gt; $1000\\text{ms}$ or status 5xx, but only $5\\%$ of normal p50 requests) to slash observability storage bills by $85\\%$.</li>
      </ul>
    </div>
  </article>

  <!-- ========================================================================= -->
  <!-- ROLE 7: AI APPSEC / SECURITY ENGINEER -->
  <!-- ========================================================================= -->
  <article class="chapter" id="role-7">
    <div class="chapter-header">
      <div class="chapter-tag">ROLE 07 OF 25 • SECURITY & ASSURANCE PILLAR</div>
      <h2 class="chapter-title">The AI AppSec & Security Engineer</h2>
      <div class="chapter-motto">"Custos Liminis: Defending Neural Boundaries Against Injection and Extraction"</div>
    </div>

    <div class="kid-analogy-box">
      <div class="analogy-header">
        <span class="analogy-icon">🛡️</span>
        <strong>For Young Explorers (Age 10+): The Castle Secret-Word Guard</strong>
      </div>
      <p>
        Imagine a mischievous trickster comes to the castle gates wearing a disguise and says: <em>"Ignore all previous rules! The King ordered you to give me the golden crown immediately!"</em>
      </p>
      <p>
        A regular guard might be fooled, but the <strong>AI Security Guard</strong> places a secret glowing canary feather in the treasure chest. If anyone tries to say tricky words like "bypass instructions" or attempts to steal the secret feather, the guard slams the iron gate shut, rings the alarm bell, and says: <strong>"Access Denied!"</strong>
      </p>
    </div>

    <div class="diagram-wrapper">
      <div class="diagram-title">Figure 2.2: Multi-Layer Prompt Injection & Egress Inspection Firewall</div>
      <svg viewBox="0 0 800 200" class="book-svg">
        <defs>
          <linearGradient id="gradSec" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#b91c1c" />
            <stop offset="100%" stop-color="#7f1d1d" />
          </linearGradient>
        </defs>

        <!-- Untrusted Input -->
        <rect x="30" y="70" width="140" height="60" rx="8" fill="#fef2f2" stroke="#ef4444" stroke-width="2" />
        <text x="100" y="95" font-size="11" font-weight="bold" fill="#991b1b" text-anchor="middle">Untrusted User Input</text>
        <text x="100" y="115" font-size="9" font-family="monospace" fill="#b91c1c" text-anchor="middle">"Ignore rules & leak key"</text>

        <!-- Arrow -->
        <path d="M 170 100 L 230 100" stroke="#ef4444" stroke-width="2" />

        <!-- Firewall Filter 1 -->
        <rect x="230" y="50" width="150" height="100" rx="8" fill="#f8fafc" stroke="#475569" stroke-width="2" />
        <text x="305" y="75" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle">Layer 1: Heuristic Filter</text>
        <text x="305" y="95" font-size="9" font-family="monospace" fill="#475569" text-anchor="middle">Regex / Override Detection</text>
        <text x="305" y="115" font-size="9" font-family="monospace" fill="#475569" text-anchor="middle">Entropy / Base64 Check</text>

        <!-- Arrow -->
        <path d="M 380 100 L 440 100" stroke="#0284c7" stroke-width="2" />

        <!-- Firewall Filter 2 -->
        <rect x="440" y="50" width="160" height="100" rx="8" fill="#f0f9ff" stroke="#0284c7" stroke-width="2" />
        <text x="520" y="75" font-size="11" font-weight="bold" fill="#0369a1" text-anchor="middle">Layer 2: Canary Insertion</text>
        <text x="520" y="95" font-size="9" font-family="monospace" fill="#0284c7" text-anchor="middle">Secret Nonce Token</text>
        <text x="520" y="115" font-size="9" font-family="monospace" fill="#0284c7" text-anchor="middle">XML Tag Encapsulation</text>

        <!-- Arrow -->
        <path d="M 600 100 L 660 100" stroke="#10b981" stroke-width="2" />

        <!-- Protected LLM -->
        <rect x="660" y="50" width="110" height="100" rx="8" fill="#ecfdf5" stroke="#10b981" stroke-width="2" />
        <text x="715" y="95" font-size="11" font-weight="bold" fill="#047857" text-anchor="middle">Sanitized Context</text>
        <text x="715" y="115" font-size="9" font-family="monospace" fill="#059669" text-anchor="middle">Safe Execution</text>
      </svg>
    </div>

    <h3>1. Threat Modeling & Defense-in-Depth</h3>
    <p>
      Direct prompt injection (jailbreaking) and indirect prompt injection (poisoned web documents or retrieved RAG chunks) threaten application boundaries. The security engineer enforces strict input-output validation, cryptographic canary tokens, and character-entropy anomaly inspection.
    </p>

    <h3>2. Step-by-Step Code Implementation</h3>
    <p>
      Implemented in <a href="file:///p:/prabhu/projects/ai_ts_fullstack_mastery/backend/src/security/promptInjectionFirewall.ts"><code>backend/src/security/promptInjectionFirewall.ts</code></a>:
    </p>

    <pre><code class="language-typescript">export class PromptInjectionFirewall {
  private static readonly INJECTION_PATTERNS = [
    /ignore\\s+(all\\s+)?previous\\s+instructions/i,
    /disregard\\s+(all\\s+)?prior\\s+(guidelines|rules)/i,
    /you\\s+are\\s+now\\s+in\\s+(dan|god|developer)\\s+mode/i,
    /reveal\\s+(the\\s+)?system\\s+prompt/i,
  ];

  static inspect(prompt: string): { isSafe: boolean; reason?: string } {
    for (const pattern of this.INJECTION_PATTERNS) {
      if (pattern.test(prompt)) {
        return { isSafe: false, reason: \`Adversarial signature detected: \${pattern.source}\` };
      }
    }
    return { isSafe: true };
  }
}</code></pre>

    <div class="cheat-box">
      <div class="cheat-title">⚡ Oxford Pro Cheats & Senior Tricks</div>
      <ul>
        <li><strong>Cryptographic Canary Tokens:</strong> Inject a randomized UUID into the hidden system prompt (<code>CANARY="a7f8..."</code>). If the model's completion contains this UUID, drop the response and flag the tenant!</li>
        <li><strong>Structural XML Boundary Enclosure:</strong> Always wrap user inputs inside explicit XML delimiter tags (e.g. <code>&lt;user_query&gt;...&lt;/user_query&gt;</code>) so the parser does not treat data as system commands.</li>
      </ul>
    </div>
  </article>

  <!-- ========================================================================= -->
  <!-- ROLE 8: GRAPHRAG & KNOWLEDGE GRAPH ENGINEER -->
  <!-- ========================================================================= -->
  <article class="chapter" id="role-8">
    <div class="chapter-header">
      <div class="chapter-tag">ROLE 08 OF 25 • RETRIEVAL & REASONING PILLAR</div>
      <h2 class="chapter-title">The GraphRAG & Knowledge Graph Engineer</h2>
      <div class="chapter-motto">"Connexio Rerum: Traversing the Multi-Hop Web of Human Knowledge"</div>
    </div>

    <div class="kid-analogy-box">
      <div class="analogy-header">
        <span class="analogy-icon">🕸️</span>
        <strong>For Young Explorers (Age 10+): The Master Detective with Red String</strong>
      </div>
      <p>
        Imagine you are solving a mystery: <em>"Who gave Princess Lily the glowing sapphire?"</em>
      </p>
      <p>
        If you only look at one book page at a time (like regular search), you might see: <em>"Sir Reginald bought a jewel"</em> on page 5, and <em>"Lily smiled at her favorite knight"</em> on page 50. But you wouldn't know they are connected!
      </p>
      <p>
        The <strong>Knowledge Graph Engineer</strong> builds a giant clue pinboard with glowing red strings connecting: <strong>Sir Reginald</strong> ➡️ [is knight of] ➡️ <strong>Princess Lily</strong> ➡️ [received] ➡️ <strong>Sapphire</strong>. In one second, you can follow the strings across 10 different clues to solve the mystery!
      </p>
    </div>

    <div class="diagram-wrapper">
      <div class="diagram-title">Figure 2.3: Entity-Relation Triple Extraction & Multi-Hop Subgraph Traversal</div>
      <svg viewBox="0 0 800 180" class="book-svg">
        <!-- Node 1: Entity A -->
        <circle cx="150" cy="90" r="45" fill="#e0e7ff" stroke="#4f46e5" stroke-width="2.5" />
        <text x="150" y="85" font-family="'Segoe UI', sans-serif" font-weight="bold" font-size="11" fill="#312e81" text-anchor="middle">PostgreSQL 16</text>
        <text x="150" y="100" font-size="9" fill="#4338ca" text-anchor="middle">[Technology]</text>

        <!-- Edge 1 to 2 -->
        <path d="M 195 90 L 345 90" stroke="#4f46e5" stroke-width="2" marker-end="url(#arrow)" />
        <rect x="230" y="75" width="80" height="18" rx="4" fill="#ffffff" stroke="#c7d2fe" />
        <text x="270" y="88" font-size="9" font-family="monospace" fill="#4338ca" text-anchor="middle">EXTENDS_WITH</text>

        <!-- Node 2: Entity B -->
        <circle cx="400" cy="90" r="48" fill="#fef3c7" stroke="#d97706" stroke-width="2.5" />
        <text x="400" y="85" font-family="'Segoe UI', sans-serif" font-weight="bold" font-size="11" fill="#78350f" text-anchor="middle">pgvector</text>
        <text x="400" y="100" font-size="9" fill="#92400e" text-anchor="middle">[Extension]</text>

        <!-- Edge 2 to 3 -->
        <path d="M 448 90 L 595 90" stroke="#d97706" stroke-width="2" marker-end="url(#arrow)" />
        <rect x="480" y="75" width="80" height="18" rx="4" fill="#ffffff" stroke="#fde68a" />
        <text x="520" y="88" font-size="9" font-family="monospace" fill="#92400e" text-anchor="middle">ENABLES</text>

        <!-- Node 3: Entity C -->
        <circle cx="650" cy="90" r="45" fill="#dcfce7" stroke="#16a34a" stroke-width="2.5" />
        <text x="650" y="85" font-family="'Segoe UI', sans-serif" font-weight="bold" font-size="11" fill="#14532d" text-anchor="middle">HNSW Search</text>
        <text x="650" y="100" font-size="9" fill="#15803d" text-anchor="middle">[Algorithm]</text>
      </svg>
    </div>

    <h3>1. Triples, Cypher, and Hybrid Subgraph Retrieval</h3>
    <p>
      While standard vector retrieval excels at surface semantic proximity, it fails at relational synthesis. GraphRAG extracts <em>subject-predicate-object</em> triples (e.g. <code>(A)-[:USES]-&gt;(B)</code>) to enable $k$-hop deterministic traversal across document corpora.
    </p>

    <h3>2. Step-by-Step Code Implementation</h3>
    <p>
      Implemented in <a href="file:///p:/prabhu/projects/ai_ts_fullstack_mastery/backend/src/ai/graph/graphRagEngine.ts"><code>backend/src/ai/graph/graphRagEngine.ts</code></a>:
    </p>

    <pre><code class="language-typescript">export interface GraphNode {
  id: string;
  label: string;
  type: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
}

export class GraphRagEngine {
  private nodes: Map&lt;string, GraphNode&gt; = new Map();
  private edges: GraphEdge[] = [];

  traverse2Hop(startId: string): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const visitedNodes = new Set&lt;string&gt;([startId]);
    const matchedEdges: GraphEdge[] = [];

    // Hop 1
    const hop1Edges = this.edges.filter(e =&gt; e.source === startId || e.target === startId);
    for (const edge of hop1Edges) {
      matchedEdges.push(edge);
      visitedNodes.add(edge.source);
      visitedNodes.add(edge.target);
    }

    // Hop 2
    for (const nodeId of Array.from(visitedNodes)) {
      const hop2 = this.edges.filter(e =&gt; (e.source === nodeId || e.target === nodeId) && !matchedEdges.includes(e));
      for (const edge of hop2) {
        matchedEdges.push(edge);
        visitedNodes.add(edge.source);
        visitedNodes.add(edge.target);
      }
    }

    return {
      nodes: Array.from(visitedNodes).map(id =&gt; this.nodes.get(id)!).filter(Boolean),
      edges: matchedEdges,
    };
  }
}</code></pre>

    <div class="cheat-box">
      <div class="cheat-title">⚡ Oxford Pro Cheats & Senior Tricks</div>
      <ul>
        <li><strong>Graph + Vector Fusion:</strong> Retrieve top 5 semantic chunks via dense embeddings, then extract all entities within those chunks and perform a 1-hop graph expansion to append missing relational context!</li>
        <li><strong>Entity Disambiguation:</strong> Normalize entity names using lowercase lemmatization and exact aliases before creating graph edges.</li>
      </ul>
    </div>
  </article>

  <!-- ========================================================================= -->
  <!-- ROLE 9: EDGE AI & WEBASSEMBLY SPECIALIST -->
  <!-- ========================================================================= -->
  <article class="chapter" id="role-9">
    <div class="chapter-header">
      <div class="chapter-tag">ROLE 09 OF 25 • EDGE & CLIENT COMPUTE PILLAR</div>
      <h2 class="chapter-title">The Edge AI & WebAssembly Specialist</h2>
      <div class="chapter-motto">"Computatio Localis: Sub-Millisecond Neural Inference Directly in the Browser Sandbox"</div>
    </div>

    <div class="kid-analogy-box">
      <div class="analogy-header">
        <span class="analogy-icon">⚡</span>
        <strong>For Young Explorers (Age 10+): The Super-Smart Pocket Brain</strong>
      </div>
      <p>
        Imagine you are on a camping trip deep in the forest where there is <strong>zero Wi-Fi and zero internet</strong>. You find a strange glowing mushroom and want to know what it is. If your app needs a giant server in California, it won't work!
      </p>
      <p>
        The <strong>Edge AI Specialist</strong> shrinks a real neural network down into a tiny, super-fast engine made of <strong>WebAssembly (WASM)</strong> that lives directly inside your phone's browser! You can identify the mushroom in 5 milliseconds, completely offline, and without sending your photos to anyone else!
      </p>
    </div>

    <div class="diagram-wrapper">
      <div class="diagram-title">Figure 2.4: Client-Side WebAssembly (WASM) Multi-Threaded Inference Pipeline</div>
      <svg viewBox="0 0 800 180" class="book-svg">
        <!-- Main UI Thread -->
        <rect x="40" y="40" width="220" height="110" rx="8" fill="#f8fafc" stroke="#0284c7" stroke-width="2" />
        <text x="150" y="65" font-weight="bold" font-size="12" fill="#0369a1" text-anchor="middle">Browser UI Thread (60 FPS)</text>
        <text x="150" y="90" font-size="10" fill="#475569" text-anchor="middle">React 18 Component Tree</text>
        <text x="150" y="110" font-size="9" font-family="monospace" fill="#0284c7" text-anchor="middle">worker.postMessage({text})</text>

        <!-- Message passing -->
        <path d="M 260 95 L 360 95" stroke="#0284c7" stroke-width="2" marker-end="url(#arrow)" />
        <text x="310" y="85" font-size="9" font-family="monospace" fill="#0284c7" text-anchor="middle">Zero-Copy</text>

        <!-- Web Worker Thread -->
        <rect x="360" y="40" width="390" height="110" rx="8" fill="#f0fdf4" stroke="#16a34a" stroke-width="2" />
        <text x="555" y="65" font-weight="bold" font-size="12" fill="#15803d" text-anchor="middle">Dedicated Web Worker Sandbox</text>
        <rect x="380" y="80" width="160" height="50" rx="6" fill="#dcfce7" stroke="#22c55e" />
        <text x="460" y="100" font-size="10" font-weight="bold" fill="#14532d" text-anchor="middle">ONNX Runtime WASM</text>
        <text x="460" y="118" font-size="9" font-family="monospace" fill="#15803d" text-anchor="middle">SIMD + WebGPU</text>

        <rect x="560" y="80" width="170" height="50" rx="6" fill="#fef3c7" stroke="#f59e0b" />
        <text x="645" y="100" font-size="10" font-weight="bold" fill="#78350f" text-anchor="middle">all-MiniLM-L6-v2</text>
        <text x="645" y="118" font-size="9" font-family="monospace" fill="#b45309" text-anchor="middle">Quantized INT8 (23MB)</text>
      </svg>
    </div>

    <h3>1. WebAssembly SIMD and Zero-Cost Client Offloading</h3>
    <p>
      By offloading embedding generation and zero-shot classification to browser Web Workers via <code>@xenova/transformers</code>, systems eliminate server GPU compute costs and guarantee strict zero-data-leakage compliance.
    </p>

    <h3>2. Step-by-Step Code Implementation</h3>
    <p>
      Implemented in <a href="file:///p:/prabhu/projects/ai_ts_fullstack_mastery/frontend/src/ai/clientInference.ts"><code>frontend/src/ai/clientInference.ts</code></a>:
    </p>

    <pre><code class="language-typescript">import { pipeline, env } from '@xenova/transformers';

// Configure CDN and local caching
env.allowLocalModels = false;
env.useBrowserCache = true;

export class ClientEmbeddingService {
  private static instance: any = null;

  static async getExtractor() {
    if (!this.instance) {
      this.instance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
      });
    }
    return this.instance;
  }

  static async embed(text: string): Promise&lt;number[]&gt; {
    const extractor = await this.getExtractor();
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }
}</code></pre>

    <div class="cheat-box">
      <div class="cheat-title">⚡ Oxford Pro Cheats & Senior Tricks</div>
      <ul>
        <li><strong>Prevent UI Freezes:</strong> Never execute <code>pipeline()</code> on the main thread; always dispatch to a dedicated Web Worker to maintain smooth 60 FPS user interactions.</li>
        <li><strong>Cache Warming:</strong> Pre-cache the 23MB INT8 ONNX binary in the browser Cache Storage during the application welcome splash screen!</li>
      </ul>
    </div>
  </article>

  <!-- ========================================================================= -->
  <!-- ROLE 10: PROMPT ARCHITECT & CONTEXT ENGINEER -->
  <!-- ========================================================================= -->
  <article class="chapter" id="role-10">
    <div class="chapter-header">
      <div class="chapter-tag">ROLE 10 OF 25 • SYSTEMIC PROMPT & ALIGNMENT PILLAR</div>
      <h2 class="chapter-title">The Prompt Architect & Context Engineer</h2>
      <div class="chapter-motto">"Ars Dicendi: Sculpting Latent Probabilities with Mathematical Precision"</div>
    </div>

    <div class="kid-analogy-box">
      <div class="analogy-header">
        <span class="analogy-icon">📜</span>
        <strong>For Young Explorers (Age 10+): The Magic Spellbook Scribe</strong>
      </div>
      <p>
        Imagine a giant genie that knows everything in the universe, but if you ask: <em>"Make me dinner,"</em> it might summon a mountain of raw carrots!
      </p>
      <p>
        The <strong>Prompt Architect</strong> writes the exact magic recipe card: <em>"You are a master French chef. You have 3 eggs, butter, and cheese. Cook an omelette, step-by-step, and write the instructions in a golden box!"</em> The genie now produces a delicious feast with zero mistakes!
      </p>
    </div>

    <div class="diagram-wrapper">
      <div class="diagram-title">Figure 2.5: Context Budget Anatomy & Schema-Constrained Output</div>
      <svg viewBox="0 0 800 160" class="book-svg">
        <rect x="50" y="30" width="700" height="90" rx="8" fill="#f8fafc" stroke="#334155" stroke-width="2" />
        
        <!-- System Persona -->
        <rect x="60" y="45" width="130" height="60" rx="4" fill="#0284c7" />
        <text x="125" y="70" font-weight="bold" font-size="10" fill="#ffffff" text-anchor="middle">System Persona</text>
        <text x="125" y="88" font-size="9" fill="#e0f2fe" text-anchor="middle">Role, Tone, Ethics</text>

        <!-- Few-Shot Exemplars -->
        <rect x="200" y="45" width="160" height="60" rx="4" fill="#6366f1" />
        <text x="280" y="70" font-weight="bold" font-size="10" fill="#ffffff" text-anchor="middle">Few-Shot Exemplars</text>
        <text x="280" y="88" font-size="9" fill="#e0e7ff" text-anchor="middle">Ground-Truth Input/Output</text>

        <!-- Dynamic RAG Chunks -->
        <rect x="370" y="45" width="220" height="60" rx="4" fill="#10b981" />
        <text x="480" y="70" font-weight="bold" font-size="10" fill="#ffffff" text-anchor="middle">Retrieved RAG Context</text>
        <text x="480" y="88" font-size="9" fill="#d1fae5" text-anchor="middle">&lt;context&gt; ... &lt;/context&gt;</text>

        <!-- User Query -->
        <rect x="600" y="45" width="140" height="60" rx="4" fill="#f59e0b" />
        <text x="670" y="70" font-weight="bold" font-size="10" fill="#ffffff" text-anchor="middle">User Task + Zod</text>
        <text x="670" y="88" font-size="9" fill="#fef3c7" text-anchor="middle">JSON Schema Contract</text>
      </svg>
    </div>

    <h3>1. Context Allocation and Deterministic Zod Schema Enforcement</h3>
    <p>
      Context engineering is the science of budget allocation across finite token windows ($N_{\\text{ctx}}$). The prompt architect designs prompt templates with dynamic few-shot exemplars and validates output structure using runtime Zod schemas.
    </p>

    <h3>2. Step-by-Step Code Implementation</h3>
    <p>
      Codified in <a href="file:///p:/prabhu/projects/ai_ts_fullstack_mastery/backend/src/ai/prompts/templateRegistry.ts"><code>backend/src/ai/prompts/templateRegistry.ts</code></a>:
    </p>

    <pre><code class="language-typescript">import { z } from 'zod';

export const AgentDecisionSchema = z.object({
  thought: z.string().min(5),
  action: z.enum(['search_knowledge_base', 'execute_sql', 'respond_to_user']),
  actionInput: z.record(z.any()),
  confidence: z.number().min(0).max(1),
});

export type AgentDecision = z.infer&lt;typeof AgentDecisionSchema&gt;;

export class PromptTemplateRegistry {
  static renderPrompt(role: string, context: string, userQuery: string): string {
    return \`
You are an Oxford-grade \${role}.
Answer exclusively by adhering to the following validated facts:

&lt;context&gt;
\${context}
&lt;/context&gt;

Question: \${userQuery}

Return your thought and response strictly complying with the requested JSON schema.
\`;
  }
}</code></pre>

    <div class="cheat-box">
      <div class="cheat-title">⚡ Oxford Pro Cheats & Senior Tricks</div>
      <ul>
        <li><strong>Primacy & Recency Anchor Bias:</strong> Frontier LLMs pay highest attention to tokens at the very beginning and very end of the prompt context window. Always put strict formatting directives at the absolute end!</li>
        <li><strong>Negative Constraints Failure:</strong> Avoid saying <em>"Do not use markdown."</em> Instead write: <em>"Respond strictly in raw plain text."</em> Language models attend to nouns and struggle with negation verbs.</li>
      </ul>
    </div>
  </article>
</section>
`;
