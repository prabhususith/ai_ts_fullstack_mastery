/**
 * @file client.ts
 * @description Type-safe API Client for Enterprise Full-Stack AI Ecosystem.
 * Interacts with backend Express routes: /api/chat, /api/rag, /api/mcp, /api/agents, /api/admin.
 */

const BASE_URL = '/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export const apiClient = {
  /**
   * Dispatches a ReAct agent task
   */
  async runReactAgent(objective: string, maxIterations = 5) {
    const res = await fetch(`${BASE_URL}/agents/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objective, maxIterations }),
    });
    return res.json();
  },

  /**
   * Dispatches a multi-agent supervisor graph
   */
  async runSupervisor(objective: string) {
    const res = await fetch(`${BASE_URL}/agents/supervisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objective }),
    });
    return res.json();
  },

  /**
   * Fetches discovered MCP tools
   */
  async getMcpTools() {
    const res = await fetch(`${BASE_URL}/mcp/tools`);
    return res.json();
  },

  /**
   * Executes an MCP tool
   */
  async executeMcpTool(toolName: string, params: Record<string, any>) {
    const res = await fetch(`${BASE_URL}/mcp/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toolName, params }),
    });
    return res.json();
  },

  /**
   * Ingests a document for chunking & embedding
   */
  async ingestDocument(title: string, content: string) {
    const res = await fetch(`${BASE_URL}/rag/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    return res.json();
  },

  /**
   * Queries knowledge base (dense, bm25, hybrid, graph)
   */
  async searchKnowledgeBase(query: string, mode: 'dense' | 'bm25' | 'hybrid' | 'graph' = 'hybrid', topK = 5) {
    const res = await fetch(`${BASE_URL}/rag/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, mode, topK }),
    });
    return res.json();
  },

  /**
   * Evaluates RAG Triad metrics
   */
  async evaluateRag(query: string, retrievedChunks: string[], generatedAnswer: string) {
    const res = await fetch(`${BASE_URL}/rag/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, retrievedChunks, generatedAnswer }),
    });
    return res.json();
  },

  /**
   * Fetches STRIDE threat model audit
   */
  async getThreatModel() {
    const res = await fetch(`${BASE_URL}/admin/threat-model`);
    return res.json();
  },

  /**
   * Tests prompt injection firewall
   */
  async testFirewall(payload: string) {
    const res = await fetch(`${BASE_URL}/admin/security/firewall-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload }),
    });
    return res.json();
  },

  /**
   * Tests DLP redaction
   */
  async testDlp(payload: string) {
    const res = await fetch(`${BASE_URL}/admin/security/dlp-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload }),
    });
    return res.json();
  },

  /**
   * Fetches health status
   */
  async getHealth() {
    const res = await fetch(`${BASE_URL}/admin/health`);
    return res.json();
  },

  /**
   * Fetches semantic cache statistics
   */
  async getCacheStats() {
    const res = await fetch(`${BASE_URL}/admin/cache-stats`);
    return res.json();
  },
};
