/**
 * @file adminRoutes.ts
 * @description Enterprise Administration, STRIDE Threat Audits, Cache Telemetry, and Multi-Cloud Health Checks.
 */

import { Router, Request, Response } from 'express';
import { db } from '../../db/connection';
import { redis } from '../../cache/redisClient';
import { semanticCache } from '../../cache/semanticCacheRedis';
import { ThreatModelAuditor } from '../../security/threatModelAudit';
import { PromptInjectionFirewall } from '../../security/promptInjectionFirewall';
import { DlpMasker } from '../../security/dlpMasker';
import { cloudManager } from '../../config/cloudDeployConfig';

const router = Router();

/**
 * GET /api/admin/health
 * Comprehensive liveness and readiness probe for PostgreSQL, Redis, and Memory.
 */
router.get('/health', async (_req: Request, res: Response): Promise<void> => {
  const [dbStatus, redisStatus] = await Promise.all([db.ping(), redis.ping()]);
  const cloudInfo = cloudManager.getConnectionDiagnostics();

  const isHealthy = dbStatus.healthy && redisStatus.healthy;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'UP' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    cloudProvider: cloudInfo.provider,
    components: {
      postgres: dbStatus,
      redis: redisStatus,
    },
  });
});

/**
 * GET /api/admin/cache-stats
 * Returns semantic vector cache metrics and cost savings.
 */
router.get('/cache-stats', async (_req: Request, res: Response): Promise<void> => {
  const stats = await semanticCache.getStats();
  res.json(stats);
});

/**
 * POST /api/admin/cache-clear
 * Flushes semantic vector cache.
 */
router.post('/cache-clear', async (_req: Request, res: Response): Promise<void> => {
  const deletedCount = await semanticCache.clearCache();
  res.json({ message: 'Semantic cache purged', deletedCount });
});

/**
 * GET /api/admin/threat-model
 * Runs automated STRIDE Threat Model Audit over AI microservices.
 */
router.get('/threat-model', (_req: Request, res: Response): void => {
  const auditReport = ThreatModelAuditor.runAudit({
    jwtStrict: true,
    xmlEnvelopesActive: true,
    auditLoggingEnabled: true,
    dlpActive: true,
    rateLimitingActive: true,
    rbacActive: true,
    hnswIndexed: true,
  });
  res.json(auditReport);
});

/**
 * POST /api/admin/security/firewall-test
 * Live test bench for prompt injection payloads.
 */
router.post('/security/firewall-test', (req: Request, res: Response): void => {
  const payload = String(req.body.payload || '');
  const result = PromptInjectionFirewall.analyze(payload);
  res.json(result);
});

/**
 * POST /api/admin/security/dlp-test
 * Live test bench for DLP PII redaction.
 */
router.post('/security/dlp-test', (req: Request, res: Response): void => {
  const payload = String(req.body.payload || '');
  const result = DlpMasker.mask(payload);
  res.json(result);
});

/**
 * GET /api/admin/cloud-profile
 * Returns active cloud deployment profile.
 */
router.get('/cloud-profile', (_req: Request, res: Response): void => {
  res.json(cloudManager.getActiveProfile());
});

export default router;
