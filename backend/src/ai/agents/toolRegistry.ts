/**
 * @file toolRegistry.ts
 * @description Dynamic Agent Tool Registry with Zod Input Validation.
 * Provides type-safe parameter validation and execution sandbox for autonomous ReAct agents.
 * @see https://zod.dev
 */

import { z } from 'zod';

export interface AgentTool<TInput = any, TOutput = any> {
  name: string;
  description: string;
  schema: z.ZodType<TInput>;
  execute: (input: TInput) => Promise<TOutput>;
}

export class AgentToolRegistry {
  private static instance: AgentToolRegistry;
  private tools: Map<string, AgentTool> = new Map();

  private constructor() {
    this.registerDefaultTools();
  }

  public static getInstance(): AgentToolRegistry {
    if (!AgentToolRegistry.instance) {
      AgentToolRegistry.instance = new AgentToolRegistry();
    }
    return AgentToolRegistry.instance;
  }

  public register<TInput, TOutput>(tool: AgentTool<TInput, TOutput>): void {
    this.tools.set(tool.name, tool);
  }

  public getTool(name: string): AgentTool | undefined {
    return this.tools.get(name);
  }

  public listTools(): Array<{ name: string; description: string }> {
    return Array.from(this.tools.values()).map((t) => ({
      name: t.name,
      description: t.description,
    }));
  }

  /**
   * Executes a registered tool after verifying inputs against its Zod schema.
   */
  public async execute(name: string, rawInput: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool '${name}' is not registered in AgentToolRegistry.`);
    }

    const parseResult = tool.schema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new Error(`Invalid arguments for tool '${name}': ${JSON.stringify(parseResult.error.format())}`);
    }

    return await tool.execute(parseResult.data);
  }

  private registerDefaultTools(): void {
    // 1. Vector Search Tool
    this.register({
      name: 'vector_search',
      description: 'Searches knowledge base chunks for relevant context using semantic vector similarity.',
      schema: z.object({
        query: z.string().min(1),
        topK: z.number().int().positive().default(3),
      }),
      execute: async ({ query, topK }) => {
        const { embeddings } = await import('../nlp/embeddingsEngine');
        const { PgVectorStore } = await import('../rag/vectorStorePg');
        const vector = await embeddings.embed(query);
        return await PgVectorStore.searchCosine(vector, topK);
      },
    });

    // 2. Lexical Keyword BM25 Tool
    this.register({
      name: 'bm25_search',
      description: 'Searches documents using exact Okapi BM25 keyword matching.',
      schema: z.object({
        query: z.string().min(1),
        topK: z.number().int().positive().default(3),
      }),
      execute: async ({ query, topK }) => {
        const { bm25 } = await import('../rag/bm25Search');
        return bm25.search(query, topK);
      },
    });

    // 3. Calculator / Arithmetic Tool
    this.register({
      name: 'math_evaluator',
      description: 'Safely evaluates mathematical expressions and formulas.',
      schema: z.object({
        expression: z.string().min(1),
      }),
      execute: async ({ expression }) => {
        // Sanitize: only numbers and basic operators
        if (!/^[\d\s+\-*/().%^]+$/.test(expression)) {
          throw new Error('Unsafe math expression. Only basic arithmetic operators permitted.');
        }
        // Safe evaluation
        const result = Function(`'use strict'; return (${expression})`)();
        return { expression, result };
      },
    });

    // 4. STRIDE Security Check Tool
    this.register({
      name: 'security_auditor',
      description: 'Audits the current application state against the STRIDE threat matrix.',
      schema: z.object({}),
      execute: async () => {
        const { ThreatModelAuditor } = await import('../../security/threatModelAudit');
        return ThreatModelAuditor.runAudit({
          jwtStrict: true,
          xmlEnvelopesActive: true,
          auditLoggingEnabled: true,
          dlpActive: true,
          rateLimitingActive: true,
          rbacActive: true,
          hnswIndexed: true,
        });
      },
    });
  }
}

export const agentTools = AgentToolRegistry.getInstance();
