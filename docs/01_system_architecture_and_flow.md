# Volume 01: System Architecture & End-to-End Flow

**Author:** Principal Polyglot AI Systems Architect & Lead TypeScript Engineer  
**Scope:** Distributed Monorepo Topology, Request Lifecycles, and Multi-Agent Orchestration

---

## 1. Architectural Blueprint & Component Topology

The enterprise AI system is engineered under a strict **100% JavaScript/TypeScript mandate**. Unlike legacy stacks requiring heterogeneous Python microservices for NLP or embeddings, every layer of this architecture runs directly on Node.js 22 LTS (backend) and React 18+ (frontend).

```mermaid
graph TD
    subgraph ClientLayer ["Client Layer (Browser / Edge)"]
        BrowserUI["React 18+ Dashboard (Vite + Tailwind)"]
        WasmEdge["Edge AI: @xenova/transformers (WASM)"]
        SSEListener["SSE Stream Listener (Vercel AI SDK)"]
    end

    subgraph GatewayLayer ["Security & Gateway Layer"]
        ExpressApp["Node 22 Express Engine"]
        HelmetMW["Helmet Security Headers"]
        AuthGuard["Jose Signed JWT RBAC Guard"]
        OWASPShield["Prompt Injection Firewall (LLM01)"]
        DLPMasker["DLP & PII Redactor (LLM02)"]
    end

    subgraph CacheAndRetrieval ["Cache & Semantic Retrieval"]
        RedisCache["Redis 7 Semantic Cache (>0.92 Cosine)"]
        PGVector["PostgreSQL 16 + pgvector (HNSW Index)"]
        BM25["Pure TS Okapi BM25 Lexical Engine"]
        RRF["Reciprocal Rank Fusion (RRF)"]
    end

    subgraph AgenticSystems ["Agentic & MCP Systems"]
        MCPServer["Anthropic @modelcontextprotocol/sdk Server"]
        ReActLoop["Pure TS ReAct Cognitive Loop"]
        SupervisorDAG["LangGraph-Style State Machine"]
        GraphRAGEngine["GraphRAG Causal Engine"]
    end

    BrowserUI -->|"HTTPS / REST"| ExpressApp
    BrowserUI -->|"WSS"| ExpressApp
    BrowserUI -->|"In-Memory WASM"| WasmEdge
    ExpressApp --> HelmetMW --> AuthGuard --> OWASPShield --> DLPMasker
    DLPMasker --> RedisCache
    RedisCache -->|"Cache Miss"| RRF
    RRF --> PGVector
    RRF --> BM25
    ExpressApp --> MCPServer
    ExpressApp --> ReActLoop
    ReActLoop --> SupervisorDAG
    ReActLoop --> GraphRAGEngine
```

---

## 2. End-to-End Query & Stream Execution Sequence

The sequence diagram below models the complete lifecycle of a streaming query—including prompt injection screening, PII sanitization, semantic vector caching interception, and SSE token streaming.

```mermaid
sequenceDiagram
    autonumber
    actor User as Client / User
    participant Frontend as React 18+ UI
    participant Gateway as Express Gateway
    participant Security as AppSec Firewall & DLP
    participant Cache as Redis Semantic Cache
    participant RAG as Hybrid RRF (pgvector + BM25)
    participant Agent as ReAct Engine / MCP

    User->>Frontend: Enters query: "Analyze pgvector HNSW indexing"
    Frontend->>Gateway: POST /api/chat/stream { message, persona }
    Gateway->>Security: Analyze payload (OWASP LLM01 & DLP)
    
    alt Threat Detected (DAN / Injection)
        Security-->>Gateway: Threat Detected (Score >= 50)
        Gateway-->>Frontend: HTTP 400 Bad Request (RFC 7807 Problem Details)
        Frontend-->>User: Render Threat Warning Badge
    else Benign Query
        Security->>Security: Scrub SSN / API keys / PII
        Security->>Gateway: Clean, Enveloped Query Text
        Gateway->>Cache: Embed query & probe semantic cache
        
        alt Cache HIT (Cosine >= 0.92)
            Cache-->>Gateway: Cached response (Sub-5ms, $0 LLM Cost)
            Gateway-->>Frontend: SSE Stream (Header: X-Semantic-Cache: HIT)
            Frontend-->>User: Instant Response Rendered
        else Cache MISS
            Gateway->>RAG: Retrieve Top-K Chunks (Dense <=> + Sparse BM25)
            RAG-->>Gateway: Grounded Context Chunks
            Gateway->>Agent: Dispatch ReAct Loop / Tool Execution
            Agent-->>Gateway: Synthesized Answer
            Gateway->>Cache: Persist Query Vector & Answer
            Gateway-->>Frontend: SSE Token Stream (Chunks 1..N)
            Frontend-->>User: Interactive Typing Animation
        end
    end
```

---

## 3. The 100% JS/TS Advantage

1. **Unified Type System:** A single schema definition language (Zod) validates API boundaries, database persistence (Drizzle ORM), MCP tool inputs, and React UI form components.
2. **Zero Inter-Process Serialization Latency:** Eliminates fragile microservice bridges between Python backends (FastAPI) and Node.js servers. Embeddings and chunking occur in-memory within the V8 process.
3. **Deterministic Deployment:** A single `package.json` installs all dependencies natively via npm, eradicating Python virtual environments (`venv`, `poetry`, `conda`) and complex cross-platform compilation bugs.
