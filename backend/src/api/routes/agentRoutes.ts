/**
 * @file agentRoutes.ts
 * @description Autonomous Agent API: ReAct Loops, Multi-Agent Supervisor Workflows, and Tool Registry.
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { reactEngine } from '../../ai/agents/reactAgentEngine';
import { supervisor } from '../../ai/agents/supervisorAgent';
import { agentTools } from '../../ai/agents/toolRegistry';

const router = Router();

const AgentTaskSchema = z.object({
  objective: z.string().min(1, 'Objective is required'),
  maxIterations: z.number().int().min(1).max(10).optional(),
});

/**
 * POST /api/agents/react
 * Runs the autonomous ReAct (Thought -> Action -> Observation) engine.
 */
router.post('/react', async (req: Request, res: Response): Promise<void> => {
  const parseResult = AgentTaskSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.format() });
    return;
  }

  const { objective } = parseResult.data;
  const trace = await reactEngine.run(objective);
  res.json(trace);
});

/**
 * POST /api/agents/supervisor
 * Dispatches multi-agent state graph (Architect -> Coder -> Security -> Synthesizer).
 */
router.post('/supervisor', async (req: Request, res: Response): Promise<void> => {
  const parseResult = AgentTaskSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.format() });
    return;
  }

  const { objective } = parseResult.data;
  const state = await supervisor.executeGraph(objective);
  res.json(state);
});

/**
 * GET /api/agents/tools
 * Lists registered agent tools.
 */
router.get('/tools', (_req: Request, res: Response): void => {
  res.json({ tools: agentTools.listTools() });
});

export default router;
