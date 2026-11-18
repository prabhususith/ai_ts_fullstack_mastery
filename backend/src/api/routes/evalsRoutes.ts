/**
 * @file evalsRoutes.ts
 * @description API routes for Role #23: AI Evals & Benchmark Lead (AI Product Manager).
 */

import { Router, Request, Response } from 'express';
import { evalsEngine } from '../../ai/evals/evalsBenchmarkEngine';

const router = Router();

/**
 * POST /api/evals/compare-ab
 * Executes automated A/B evaluation between two prompt variants or models.
 */
router.post('/compare-ab', (req: Request, res: Response): void => {
  const { variantA = 'Standard Baseline Prompt', variantB = 'Grounded Few-Shot Prompt' } = req.body;

  const report = evalsEngine.runAbComparison(String(variantA), String(variantB));
  res.json(report);
});

/**
 * GET /api/evals/history
 * Returns historical evaluation benchmark runs.
 */
router.get('/history', (_req: Request, res: Response): void => {
  const history = evalsEngine.getHistory();
  res.json({
    count: history.length,
    runs: history,
  });
});

export default router;
