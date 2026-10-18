# Volume 04: Model Context Protocol (MCP) Architectural Guide

**Author:** Anthropic Model Context Protocol (MCP) Architect & Staff Systems Engineer  
**Specification Reference:** Anthropic Model Context Protocol Specification & `@modelcontextprotocol/sdk`

---

## 1. What is the Model Context Protocol?

The **Model Context Protocol (MCP)** is an open standard that allows AI models, IDEs, and autonomous agents to securely connect to external tools, data repositories, and execution environments using standard JSON-RPC 2.0 protocols over standard I/O (Stdio) or Server-Sent Events (SSE).

```mermaid
graph LR
    subgraph ClientHost ["MCP Host (Claude Desktop / Antigravity IDE / Agent Engine)"]
        AgentClient["MCP Client (@modelcontextprotocol/sdk/client)"]
    end

    subgraph Transport ["Standard Transport Layer"]
        JSONRPC["JSON-RPC 2.0 (Stdio or SSE/HTTP)"]
    end

    subgraph EnterpriseServer ["Enterprise MCP Server (@modelcontextprotocol/sdk/server)"]
        Router["MCP Request Router"]
        Tool1["Tool: execute_vector_search"]
        Tool2["Tool: calculate_semantic_similarity"]
        Tool3["Tool: execute_security_audit"]
        Resource1["Resource: enterprise://architecture/manifest"]
    end

    AgentClient <-->|"JSON-RPC 2.0"| JSONRPC
    JSONRPC <--> Router
    Router --> Tool1
    Router --> Tool2
    Router --> Tool3
    Router --> Resource1
```

---

## 2. MCP Request-Response Execution Protocol

```mermaid
sequenceDiagram
    autonumber
    participant Host as MCP Client / Host
    participant Server as Enterprise MCP Server
    participant Tool as Registered Tool Handler

    Host->>Server: {"jsonrpc": "2.0", "method": "tools/list", "id": 1}
    Server-->>Host: Returns tools with Zod inputSchemas (properties, required)

    Host->>Server: {"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "execute_vector_search", "arguments": {"query": "pgvector HNSW", "topK": 3}}, "id": 2}
    Server->>Tool: Execute validated handler with arguments
    Tool-->>Server: Raw vector result array
    Server-->>Host: {"jsonrpc": "2.0", "result": {"content": [{"type": "text", "text": "..."}]}, "id": 2}
```

---

## 3. Tool Sandboxing & Input Schema Validation

In our TypeScript backend implementation [`backend/src/ai/mcp/enterpriseMcpServer.ts`](file:///p:/prabhu/projects/ai_ts_fullstack_mastery/backend/src/ai/mcp/enterpriseMcpServer.ts), all tool parameters are strictly validated using standard JSON Schema definitions derived from Zod.

### Exposing Tools via MCP Server
```typescript
this.server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'execute_vector_search',
        description: 'Performs semantic vector search over PostgreSQL pgvector embeddings.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Semantic query text' },
            topK: { type: 'number', description: 'Maximum results to return' },
          },
          required: ['query'],
        },
      },
    ],
  };
});
```

### Exposing Architectural Resources via URIs
MCP allows AI models to read static or dynamic enterprise resources via custom URI schemes (e.g., `enterprise://architecture/manifest`):
```typescript
this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === 'enterprise://architecture/manifest') {
    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            runtime: 'Node.js 22 LTS (Strict TypeScript)',
            database: 'PostgreSQL 16 + pgvector',
            cache: 'Redis 7 Semantic Cache',
          }),
        },
      ],
    };
  }
  throw new Error(`Resource '${request.params.uri}' not found.`);
});
```
