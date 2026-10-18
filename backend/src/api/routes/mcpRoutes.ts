/**
 * @file mcpRoutes.ts
 * @description Model Context Protocol (MCP) HTTP Endpoints.
 * Facilitates tool discovery, parameter schema retrieval, and execution over JSON-RPC 2.0.
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { mcpClient } from '../../ai/mcp/mcpClientManager';

const router = Router();

const ExecuteToolSchema = z.object({
  toolName: z.string().min(1),
  params: z.record(z.any()).default({}),
});

/**
 * GET /api/mcp/tools
 * Lists all active MCP tools and their input schemas.
 */
router.get('/tools', (_req: Request, res: Response): void => {
  const tools = mcpClient.listDiscoveredTools();
  res.json({ count: tools.length, tools });
});

/**
 * POST /api/mcp/execute
 * Executes a discovered MCP tool.
 */
router.post('/execute', async (req: Request, res: Response): Promise<void> => {
  const parseResult = ExecuteToolSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.format() });
    return;
  }

  const { toolName, params } = parseResult.data;
  const result = await mcpClient.executeTool(toolName, params);

  if (result.status === 'ERROR') {
    res.status(400).json(result);
    return;
  }

  res.json(result);
});

export default router;
