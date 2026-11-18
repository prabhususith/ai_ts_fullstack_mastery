/**
 * @file alignmentRoutes.ts
 * @description API routes for Role #22: Human-in-the-Loop (HITL) & Alignment Lead.
 */

import { Router, Request, Response } from 'express';
import { hitlEngine } from '../../ai/alignment/hitlAnnotationEngine';

const router = Router();

/**
 * GET /api/alignment/annotations
 * Retrieves all human-in-the-loop preference annotations.
 */
router.get('/annotations', (_req: Request, res: Response): void => {
  const annotations = hitlEngine.getAnnotations();
  const metrics = hitlEngine.calculateMetrics();
  res.json({
    metrics,
    count: annotations.length,
    annotations,
  });
});

/**
 * POST /api/alignment/annotate
 * Submits a new pairwise human-in-the-loop alignment annotation.
 */
router.post('/annotate', (req: Request, res: Response): void => {
  const { prompt, chosenResponse, rejectedResponse, rating, hallucinationFlag, severity, rationale, evaluatorId } = req.body;

  if (!prompt || !chosenResponse || !rejectedResponse) {
    res.status(400).json({ error: 'prompt, chosenResponse, and rejectedResponse are mandatory' });
    return;
  }

  const annotation = hitlEngine.recordAnnotation({
    prompt,
    chosenResponse,
    rejectedResponse,
    rating: Number(rating) || 5,
    hallucinationFlag: Boolean(hallucinationFlag),
    severity: severity || 'NONE',
    rationale,
    evaluatorId: evaluatorId || 'expert_annotator',
  });

  res.status(201).json({
    message: 'Alignment feedback recorded successfully',
    annotation,
  });
});

/**
 * GET /api/alignment/export-dpo
 * Exports annotations in Direct Preference Optimization (DPO) JSONL format.
 */
router.get('/export-dpo', (_req: Request, res: Response): void => {
  const dpoJsonl = hitlEngine.exportDpoJsonl();
  res.setHeader('Content-Type', 'application/x-jsonlines');
  res.setHeader('Content-Disposition', 'attachment; filename="dpo_alignment_pairs.jsonl"');
  res.send(dpoJsonl);
});

export default router;
