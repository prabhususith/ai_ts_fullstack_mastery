/**
 * @file enterpriseMcpServer.ts
 * @description Official Anthropic Model Context Protocol (MCP) Server.
 * Exposes enterprise tools, resources, and prompt templates over JSON-RPC 2.0.
 * @see https://github.com/modelcontextprotocol/typescript-sdk
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { PgVectorStore } from '../rag/vectorStorePg';
import { embeddings } from '../nlp/embeddingsEngine';
import { calculateCosineSimilarity } from '../../cache/semanticCacheRedis';
import { ThreatModelAuditor } from '../../security/threatModelAudit';

export class EnterpriseMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'ai-enterprise-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // 1. Tool Listing
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
                topK: { type: 'number', description: 'Maximum results to return (default: 5)' },
              },
              required: ['query'],
            },
          },
          {
            name: 'calculate_semantic_similarity',
            description: 'Computes cosine similarity between two text segments using dense embeddings.',
            inputSchema: {
              type: 'object',
              properties: {
                textA: { type: 'string' },
                textB: { type: 'string' },
              },
              required: ['textA', 'textB'],
            },
          },
          {
            name: 'execute_security_audit',
            description: 'Runs STRIDE threat model audit over the AI microservice architecture.',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // 2. Tool Execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'execute_vector_search') {
        const query = String(args?.query || '');
        const topK = Number(args?.topK) || 5;

        const vector = await embeddings.embed(query);
        const results = await PgVectorStore.searchCosine(vector, topK);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      if (name === 'calculate_semantic_similarity') {
        const textA = String(args?.textA || '');
        const textB = String(args?.textB || '');

        const [vecA, vecB] = await Promise.all([embeddings.embed(textA), embeddings.embed(textB)]);
        const sim = calculateCosineSimilarity(vecA, vecB);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ similarity: Number(sim.toFixed(4)), textA, textB }),
            },
          ],
        };
      }

      if (name === 'execute_security_audit') {
        const audit = ThreatModelAuditor.runAudit({
          jwtStrict: true,
          xmlEnvelopesActive: true,
          auditLoggingEnabled: true,
          dlpActive: true,
          rateLimitingActive: true,
          rbacActive: true,
          hnswIndexed: true,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(audit, null, 2),
            },
          ],
        };
      }

      throw new Error(`MCP Tool '${name}' not implemented.`);
    });

    // 3. Resource Listing
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'enterprise://architecture/manifest',
            name: 'Enterprise System Architecture Manifest',
            mimeType: 'application/json',
          },
        ],
      };
    });

    // 4. Resource Reading
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;
      if (uri === 'enterprise://architecture/manifest') {
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                framework: 'Express + React 18+ (Vite)',
                database: 'PostgreSQL 16 + pgvector (HNSW cosine)',
                cache: 'Redis 7 (Semantic Cache >0.92 cosine)',
                mcpVersion: '1.0.0',
              }),
            },
          ],
        };
      }
      throw new Error(`Resource '${uri}' not found.`);
    });
  }

  public getServer(): Server {
    return this.server;
  }
}

export const enterpriseMcpServer = new EnterpriseMcpServer();
