/**
 * @file multimodalRoutes.ts
 * @description API routes for Role #21: Multimodal AI & Vision-Language Engineer.
 */

import { Router, Request, Response } from 'express';
import { multimodalEngine } from '../../ai/multimodal/multimodalRagEngine';

const router = Router();

/**
 * GET /api/multimodal/catalog
 * Lists all registered visual and multimodal catalog items.
 */
router.get('/catalog', (_req: Request, res: Response): void => {
  const items = multimodalEngine.getCatalog();
  res.json({
    count: items.length,
    items: items.map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      mediaType: i.mediaType,
      mediaUrl: i.mediaUrl,
      visualTags: i.visualTags,
      embeddingDimension: i.embedding.length,
    })),
  });
});

/**
 * POST /api/multimodal/search
 * Cross-modal search: text query -> visual items with cosine similarity.
 */
router.post('/search', async (req: Request, res: Response): Promise<void> => {
  const { query, topK = 3 } = req.body;
  if (!query) {
    res.status(400).json({ error: 'Query parameter is required' });
    return;
  }

  const results = await multimodalEngine.searchByText(String(query), Number(topK));
  res.json({
    query,
    count: results.length,
    results,
  });
});

/**
 * POST /api/multimodal/classify
 * Zero-shot visual classification against arbitrary labels.
 */
router.post('/classify', async (req: Request, res: Response): Promise<void> => {
  const { item, candidateLabels } = req.body;
  if (!item || !candidateLabels || !Array.isArray(candidateLabels)) {
    res.status(400).json({ error: 'item object and candidateLabels array are required' });
    return;
  }

  const classifications = await multimodalEngine.classifyZeroShot(item, candidateLabels);
  res.json({
    itemTitle: item.title,
    classifications,
  });
});

/**
 * POST /api/multimodal/register
 * Registers a new visual or multimodal item.
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { title, description, mediaType = 'image', visualTags = [] } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const id = await multimodalEngine.registerItem({
    title,
    description,
    mediaType,
    visualTags,
  });

  res.status(201).json({
    message: 'Multimodal item registered successfully',
    id,
  });
});

export default router;
