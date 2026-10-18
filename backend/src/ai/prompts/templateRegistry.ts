/**
 * @file templateRegistry.ts
 * @description Parameterized Few-Shot Prompt Templates with Zod Output Schemas.
 * Guarantees structured, type-safe generation contracts across LLM calls.
 * @see https://zod.dev
 */

import { z } from 'zod';

export interface PromptTemplate<TParams extends Record<string, any>, TOutput> {
  id: string;
  name: string;
  description: string;
  template: (params: TParams) => string;
  outputSchema: z.ZodType<TOutput>;
}

// 1. Code Review Analysis Schema
export const CodeReviewOutputSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string(),
  issues: z.array(
    z.object({
      severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']),
      line: z.number().optional(),
      category: z.enum(['SECURITY', 'PERFORMANCE', 'MAINTAINABILITY', 'BUG']),
      description: z.string(),
      suggestedFix: z.string(),
    })
  ),
  recommendedRefactor: z.string().optional(),
});
export type CodeReviewOutput = z.infer<typeof CodeReviewOutputSchema>;

// 2. RAG Synthesis Groundedness Schema
export const GroundedRagOutputSchema = z.object({
  answer: z.string(),
  citations: z.array(
    z.object({
      chunkId: z.string(),
      sourceDocument: z.string(),
      quote: z.string(),
    })
  ),
  confidenceScore: z.number().min(0).max(1),
  hasSufficientContext: z.boolean(),
});
export type GroundedRagOutput = z.infer<typeof GroundedRagOutputSchema>;

// 3. Knowledge Graph Entity Extraction Schema
export const EntityExtractionOutputSchema = z.object({
  entities: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['TECHNOLOGY', 'CONCEPT', 'PERSON', 'ORGANIZATION', 'SECURITY_VULNERABILITY', 'METRIC']),
      description: z.string(),
    })
  ),
  relationships: z.array(
    z.object({
      sourceId: z.string(),
      targetId: z.string(),
      predicate: z.string(),
      weight: z.number().min(0).max(1),
    })
  ),
});
export type EntityExtractionOutput = z.infer<typeof EntityExtractionOutputSchema>;

/**
 * Enterprise Centralized Prompt Template Registry.
 */
export class PromptTemplateRegistry {
  private static templates: Map<string, PromptTemplate<any, any>> = new Map();

  public static register<TParams extends Record<string, any>, TOutput>(
    template: PromptTemplate<TParams, TOutput>
  ): void {
    PromptTemplateRegistry.templates.set(template.id, template);
  }

  public static get<TParams extends Record<string, any>, TOutput>(
    id: string
  ): PromptTemplate<TParams, TOutput> | undefined {
    return PromptTemplateRegistry.templates.get(id);
  }

  public static render<TParams extends Record<string, any>>(id: string, params: TParams): string {
    const t = PromptTemplateRegistry.get(id);
    if (!t) throw new Error(`Prompt template with ID '${id}' not found in registry.`);
    return t.template(params);
  }
}

// Register Default Production Templates
PromptTemplateRegistry.register<
  { language: string; codeSnippet: string; focus: string },
  CodeReviewOutput
>({
  id: 'code_review_v1',
  name: 'Enterprise Static Code & Security Reviewer',
  description: 'Audits TypeScript/JavaScript code for memory leaks, async race conditions, and OWASP issues',
  template: (p) => `
You are an Elite TypeScript Systems Architect and Application Security Auditor.
Review the following ${p.language} code focusing on ${p.focus}.
Analyze security vulnerabilities, performance bottlenecks, and adherence to clean architecture.

<code>
${p.codeSnippet}
</code>

Respond ONLY with valid JSON matching the following schema:
${JSON.stringify(CodeReviewOutputSchema.shape, null, 2)}
`,
  outputSchema: CodeReviewOutputSchema,
});

PromptTemplateRegistry.register<
  { question: string; contextChunks: string },
  GroundedRagOutput
>({
  id: 'rag_synthesis_v1',
  name: 'Grounded RAG Factuality Synthesizer',
  description: 'Generates answers strictly cited from verified pgvector retrieved chunks',
  template: (p) => `
You are a Grounded RAG Assistant. Answer the question using ONLY the retrieved context below.
If the answer cannot be verified from the context, set hasSufficientContext to false.

<retrieved_context>
${p.contextChunks}
</retrieved_context>

<user_question>
${p.question}
</user_question>

Respond ONLY with valid JSON adhering to this schema:
${JSON.stringify(GroundedRagOutputSchema.shape, null, 2)}
`,
  outputSchema: GroundedRagOutputSchema,
});

PromptTemplateRegistry.register<{ text: string }, EntityExtractionOutput>({
  id: 'graph_entity_extraction_v1',
  name: 'Knowledge Graph Entity & Relation Extractor',
  description: 'Extracts semantic entities and causal relationships for GraphRAG indexing',
  template: (p) => `
Extract all entities and relationships from the text below for knowledge graph ingestion.

<corpus>
${p.text}
</corpus>

Respond with JSON adhering to this schema:
${JSON.stringify(EntityExtractionOutputSchema.shape, null, 2)}
`,
  outputSchema: EntityExtractionOutputSchema,
});
