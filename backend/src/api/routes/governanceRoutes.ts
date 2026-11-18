/**
 * @file governanceRoutes.ts
 * @description API routes for Role #24: AI Governance & EU AI Act Compliance Auditor.
 */

import { Router, Request, Response } from 'express';
import { euAiAuditor, SystemProfileInput } from '../../security/euAiActAuditor';

const router = Router();

/**
 * POST /api/governance/eu-ai-act-audit
 * Runs automated EU AI Act risk classification and ISO 42001 conformity audit.
 */
router.post('/eu-ai-act-audit', (req: Request, res: Response): void => {
  const profile: SystemProfileInput = {
    systemName: req.body.systemName || 'Enterprise Full-Stack AI Ecosystem',
    intendedDomain: req.body.intendedDomain || 'CUSTOMER_CHATBOT',
    interactsDirectlyWithHumans: req.body.interactsDirectlyWithHumans !== false,
    generatesSyntheticMedia: Boolean(req.body.generatesSyntheticMedia),
    makesAutomatedLegalDecisions: Boolean(req.body.makesAutomatedLegalDecisions),
    hasHumanOversightKillSwitch: req.body.hasHumanOversightKillSwitch !== false,
    usesStrictDlpMasking: req.body.usesStrictDlpMasking !== false,
    hasAuditLoggingEnabled: req.body.hasAuditLoggingEnabled !== false,
  };

  const report = euAiAuditor.auditSystem(profile);
  res.json(report);
});

/**
 * GET /api/governance/default-audit
 * Audits the current platform's default production profile.
 */
router.get('/default-audit', (_req: Request, res: Response): void => {
  const defaultProfile: SystemProfileInput = {
    systemName: 'Enterprise AI TypeScript Platform (Production)',
    intendedDomain: 'DEV_TOOLING',
    interactsDirectlyWithHumans: true,
    generatesSyntheticMedia: false,
    makesAutomatedLegalDecisions: false,
    hasHumanOversightKillSwitch: true,
    usesStrictDlpMasking: true,
    hasAuditLoggingEnabled: true,
  };

  const report = euAiAuditor.auditSystem(defaultProfile);
  res.json(report);
});

export default router;
