/**
 * @file emergent_roles.test.ts
 * @description Comprehensive Vitest test suite for Emergent AI Roles (Roles #21 through #24):
 * - Role #21: Multimodal AI & Vision-Language Engineer
 * - Role #22: Human-in-the-Loop (HITL) & Alignment Lead
 * - Role #23: AI Evals & Benchmark Lead (AI Product Manager)
 * - Role #24: AI Governance & EU AI Act Compliance Auditor
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { multimodalEngine } from '../src/ai/multimodal/multimodalRagEngine';
import { hitlEngine } from '../src/ai/alignment/hitlAnnotationEngine';
import { evalsEngine } from '../src/ai/evals/evalsBenchmarkEngine';
import { euAiAuditor } from '../src/security/euAiActAuditor';

describe('Emergent AI-Era Roles Suite (Roles #21 - #24)', () => {
  // --------------------------------------------------------------------------
  // Role #21: Multimodal AI & Vision-Language Engineer
  // --------------------------------------------------------------------------
  describe('Role #21: Multimodal AI & Vision-Language Engineer', () => {
    it('generates 384-dimensional cross-modal embeddings for visual artifacts', async () => {
      const embedding = await multimodalEngine.generateVisualEmbedding({
        title: 'Microservices Mesh Diagram',
        mediaType: 'diagram',
        visualTags: ['kubernetes', 'istio', 'mesh'],
      });

      expect(embedding).toHaveLength(384);
      // Normalized unit vector check (||v|| ~= 1.0)
      const magnitude = Math.sqrt(embedding.reduce((acc, v) => acc + v * v, 0));
      expect(magnitude).toBeCloseTo(1.0, 2);
    });

    it('performs cross-modal search from natural language query to visual diagrams', async () => {
      const results = await multimodalEngine.searchByText('Kubernetes service mesh networking', 2);
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0]!.cosineSimilarity).toBeGreaterThan(0.0);
      expect(results[0]!.item.title).toBeDefined();
    });

    it('executes zero-shot visual classification across candidate domain labels', async () => {
      const classifications = await multimodalEngine.classifyZeroShot(
        {
          title: 'HNSW Cosine Graph Architecture',
          mediaType: 'chart',
          visualTags: ['vector database', 'pgvector', 'hnsw'],
        },
        ['Database Architecture', 'Frontend CSS Design', 'Social Media Meme']
      );

      expect(classifications).toHaveLength(3);
      expect(classifications[0]!.candidateLabel).toBe('Database Architecture');
      expect(classifications[0]!.confidenceScore).toBeGreaterThan(classifications[1]!.confidenceScore);
    });
  });

  // --------------------------------------------------------------------------
  // Role #22: Human-in-the-Loop (HITL) & Alignment Lead
  // --------------------------------------------------------------------------
  describe('Role #22: Human-in-the-Loop (HITL) & Alignment Lead', () => {
    it('records pairwise human preference annotations and scores hallucination severity', () => {
      const annotation = hitlEngine.recordAnnotation({
        prompt: 'How to enable pgvector extension in PostgreSQL?',
        chosenResponse: 'Run: CREATE EXTENSION IF NOT EXISTS vector;',
        rejectedResponse: 'Install Python and compile PostgreSQL from C source.',
        rating: 5,
        hallucinationFlag: false,
        severity: 'NONE',
        rationale: 'Chosen response provides the exact SQL command.',
        evaluatorId: 'senior_annotator_01',
      });

      expect(annotation.id).toBeDefined();
      expect(annotation.rating).toBe(5);
      expect(annotation.createdAt).toBeDefined();
    });

    it('exports clean Direct Preference Optimization (DPO) JSONL dataset', () => {
      const jsonl = hitlEngine.exportDpoJsonl();
      expect(typeof jsonl).toBe('string');
      expect(jsonl.length).toBeGreaterThan(0);

      // Verify each line is valid JSON with prompt, chosen, and rejected fields
      const lines = jsonl.split('\n').filter(Boolean);
      for (const line of lines) {
        const parsed = JSON.parse(line);
        expect(parsed.prompt).toBeDefined();
        expect(parsed.chosen).toBeDefined();
        expect(parsed.rejected).toBeDefined();
      }
    });

    it('computes agreement scores and hallucination rates accurately', () => {
      const metrics = hitlEngine.calculateMetrics();
      expect(metrics.totalAnnotations).toBeGreaterThanOrEqual(1);
      expect(metrics.averageRating).toBeGreaterThanOrEqual(1.0);
      expect(metrics.interAnnotatorAgreementScore).toBeGreaterThan(0.7);
      expect(metrics.severityBreakdown).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // Role #23: AI Evals & Benchmark Lead (AI Product Manager)
  // --------------------------------------------------------------------------
  describe('Role #23: AI Evals & Benchmark Lead', () => {
    it('evaluates prompt variant against regression test suite with latency percentiles', () => {
      const result = evalsEngine.evaluateVariant('Test-Variant-Strict', (tc) => ({
        text: `Response with full ground truth: ${tc.groundTruthKeywords.join(', ')}`,
        latencyMs: 150,
      }));

      expect(result.accuracyScore).toBeGreaterThanOrEqual(0.75);
      expect(result.qualityGateStatus).toBe('PASSED');
      expect(result.p50LatencyMs).toBeLessThanOrEqual(500);
      expect(result.estimatedCostPer1kQueries).toBeGreaterThan(0);
    });

    it('runs A/B comparative evaluation and declares winner with performance delta', () => {
      const report = evalsEngine.runAbComparison('Baseline-ZeroShot', 'Optimized-FewShot-Zod');
      expect(report.suiteName).toBe('production-regression-v1');
      expect(report.winnerVariant).toBeDefined();
      expect(report.performanceDeltaPercent).toBeGreaterThanOrEqual(0);
      expect(report.recommendation).toContain('Recommend');
    });
  });

  // --------------------------------------------------------------------------
  // Role #24: AI Governance & EU AI Act Compliance Auditor
  // --------------------------------------------------------------------------
  describe('Role #24: AI Governance & EU AI Act Compliance Auditor', () => {
    it('classifies High-Risk AI systems under Article 6 and Annex III correctly', () => {
      const riskTier = euAiAuditor.classifyRiskTier({
        systemName: 'Automated CV Screening Tool',
        intendedDomain: 'HR_RECRUITMENT',
        interactsDirectlyWithHumans: true,
        generatesSyntheticMedia: false,
        makesAutomatedLegalDecisions: true,
        hasHumanOversightKillSwitch: true,
        usesStrictDlpMasking: true,
        hasAuditLoggingEnabled: true,
      });

      expect(riskTier).toBe('HIGH_RISK');
    });

    it('prohibits Unacceptable Risk systems under Article 5', () => {
      const audit = euAiAuditor.auditSystem({
        systemName: 'Public Social Credit Scoring Tool',
        intendedDomain: 'SOCIAL_SCORING',
        interactsDirectlyWithHumans: true,
        generatesSyntheticMedia: false,
        makesAutomatedLegalDecisions: true,
        hasHumanOversightKillSwitch: false,
        usesStrictDlpMasking: false,
        hasAuditLoggingEnabled: false,
      });

      expect(audit.riskTier).toBe('UNACCEPTABLE_RISK');
      expect(audit.legalStatus).toBe('PROHIBITED');
      expect(audit.compositeComplianceScore).toBe(0);
    });

    it('conducts ISO/IEC 42001 conformity audit for compliant production enterprise systems', () => {
      const audit = euAiAuditor.auditSystem({
        systemName: 'Enterprise AI TypeScript Platform',
        intendedDomain: 'DEV_TOOLING',
        interactsDirectlyWithHumans: true,
        generatesSyntheticMedia: false,
        makesAutomatedLegalDecisions: false,
        hasHumanOversightKillSwitch: true,
        usesStrictDlpMasking: true,
        hasAuditLoggingEnabled: true,
      });

      expect(audit.riskTier).toBe('LIMITED_TRANSPARENCY_RISK');
      expect(audit.compositeComplianceScore).toBeGreaterThanOrEqual(90);
      expect(audit.iso42001Controls.length).toBe(5);
      expect(audit.mandatoryRequirements.length).toBeGreaterThan(0);
    });
  });
});
