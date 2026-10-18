import { describe, it, expect } from 'vitest';
import { mcpClient } from '../src/ai/mcp/mcpClientManager';
import { reactEngine } from '../src/ai/agents/reactAgentEngine';
import { supervisor } from '../src/ai/agents/supervisorAgent';
import { GraphRagEngine } from '../src/ai/graph/graphRagEngine';
import { RagTriadEvaluator } from '../src/ai/mlops/ragTriadMetrics';
import { calculateCosineSimilarity } from '../src/cache/semanticCacheRedis';

describe('MCP, Agents & Cognitive Systems Suite', () => {
  describe('Model Context Protocol (MCP) Client & Server', () => {
    it('discovers registered MCP tools with JSON schemas', () => {
      const tools = mcpClient.listDiscoveredTools();

      expect(tools.length).toBeGreaterThanOrEqual(3);
      const names = tools.map((t) => t.name);
      expect(names).toContain('execute_vector_search');
      expect(names).toContain('calculate_semantic_similarity');
      expect(names).toContain('execute_security_audit');
    });

    it('executes calculate_semantic_similarity tool over MCP', async () => {
      const res = await mcpClient.executeTool('calculate_semantic_similarity', {
        textA: 'PostgreSQL pgvector',
        textB: 'Vector database indexing',
      });

      expect(res.status).toBe('SUCCESS');
      expect(res.output).toBeDefined();
      expect(res.output.similarity).toBeGreaterThan(0);
    });

    it('executes security audit tool over MCP', async () => {
      const res = await mcpClient.executeTool('execute_security_audit', {});

      expect(res.status).toBe('SUCCESS');
      expect(res.output.overallScore).toBeDefined();
    });
  });

  describe('ReAct Agent Engine (Thought -> Action -> Observation)', () => {
    it('executes autonomous cognitive loop and returns structured trace', async () => {
      const objective = 'Verify pgvector HNSW index and audit system security';
      const trace = await reactEngine.run(objective);

      expect(trace.status).toBe('COMPLETED');
      expect(trace.steps.length).toBeGreaterThanOrEqual(2);
      expect(trace.finalAnswer).toContain('[ReAct Synthesis');

      const step1 = trace.steps[0]!;
      expect(step1.thought).toBeDefined();
      expect(step1.action).toBeDefined();
      expect(step1.observation).toBeDefined();
    });
  });

  describe('Supervisor Multi-Agent State Machine (LangGraph style)', () => {
    it('transitions through DAG nodes to executive synthesis', async () => {
      const objective = 'Implement pgvector microservice on AWS Fargate';
      const state = await supervisor.executeGraph(objective);

      expect(state.currentNode).toBe('COMPLETED');
      expect(state.securityVerdict).toBe('APPROVED');
      expect(state.nodeHistory.length).toBe(5);

      const nodeNames = state.nodeHistory.map((n) => n.node);
      expect(nodeNames).toEqual([
        'ROUTER',
        'ARCHITECT_NODE',
        'CODER_NODE',
        'SECURITY_NODE',
        'SYNTHESIZER_NODE',
      ]);
    });
  });

  describe('GraphRAG Engine (Entity Extraction & Multi-Hop Pathfinding)', () => {
    it('extracts entities and discovers multi-hop paths', () => {
      const graph = new GraphRagEngine();
      const text =
        'PostgreSQL pgvector integrates with Redis to accelerate semantic vector queries. Express connects to PostgreSQL.';
      const res = graph.extractAndIngest(text);

      expect(res.entitiesCount).toBeGreaterThan(0);

      const paths = graph.findMultiHopPaths('postgresql', 2);
      expect(paths).toBeDefined();
    });
  });

  describe('RAG Triad Evaluator (Faithfulness, Relevance, Groundedness)', () => {
    it('computes triad metrics accurately in pure TypeScript', async () => {
      const query = 'How does pgvector store vectors?';
      const context = [
        'pgvector adds a custom vector datatype to PostgreSQL and creates HNSW graph indexes for cosine distance.',
      ];
      const answer =
        'pgvector adds a custom vector data type to PostgreSQL and builds HNSW graph indexes.';

      const card = await RagTriadEvaluator.evaluate(query, context, answer);

      expect(card.faithfulnessScore).toBeGreaterThanOrEqual(0.7);
      expect(card.answerRelevanceScore).toBeGreaterThan(0);
      expect(card.contextPrecisionScore).toBeGreaterThan(0);
      expect(card.compositeRagasScore).toBeGreaterThan(0);
    });
  });

  describe('Semantic Vector Cosine Utility', () => {
    it('calculates exact cosine similarity between orthogonal and parallel vectors', () => {
      const vecA = [1, 0, 0];
      const vecB = [1, 0, 0];
      const vecC = [0, 1, 0];

      expect(calculateCosineSimilarity(vecA, vecB)).toBeCloseTo(1.0);
      expect(calculateCosineSimilarity(vecA, vecC)).toBeCloseTo(0.0);
    });
  });
});
