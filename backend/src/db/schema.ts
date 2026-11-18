/**
 * @file schema.ts
 * @description Drizzle ORM schema definitions for PostgreSQL + pgvector.
 * Defines enterprise tables: users, documents, embeddings (with HNSW index), audit logs, and sessions.
 * @see https://orm.drizzle.team/docs/sql-schema-declaration
 */

import { pgTable, text, varchar, integer, timestamp, jsonb, customType } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Custom Drizzle type definition for pgvector vector(384).
 */
export const vector384 = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return 'vector(384)';
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`;
  },
  fromDriver(value: string): number[] {
    if (typeof value !== 'string') return value;
    return value.replace(/^\[|\]$/g, '').split(',').map(Number);
  },
});

/**
 * Users and authentication table with RBAC roles.
 */
export const users = pgTable('users', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 50 }).notNull().default('User'), // 'User' | 'Admin' | 'SecurityAuditor' | 'AgentExecutor'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Master Documents table storing raw content and source provenance.
 */
export const documents = pgTable('documents', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  content: text('content').notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull().default('text/plain'),
  sha256Hash: varchar('sha256_hash', { length: 64 }).notNull(),
  metadata: jsonb('metadata').default('{}').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Dense vector embeddings table with 384-dimensional pgvector column.
 * Indexed with HNSW (Hierarchical Navigable Small World) for sub-10ms nearest neighbor search.
 */
export const embeddings = pgTable('embeddings', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar('document_id', { length: 36 }).references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  chunkIndex: integer('chunk_index').notNull(),
  chunkContent: text('chunk_content').notNull(),
  embedding: vector384('embedding').notNull(),
  tokenCount: integer('token_count').notNull(),
  metadata: jsonb('metadata').default('{}').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Enterprise Audit and STRIDE security logs table.
 */
export const auditLogs = pgTable('audit_logs', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id', { length: 36 }),
  action: varchar('action', { length: 100 }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }).notNull(),
  userAgent: text('user_agent'),
  status: varchar('status', { length: 20 }).notNull().default('SUCCESS'), // 'SUCCESS' | 'BLOCKED' | 'FLAGGED'
  threatCategory: varchar('threat_category', { length: 50 }), // e.g. 'PROMPT_INJECTION', 'UNAUTHORIZED_ACCESS'
  payloadMetadata: jsonb('payload_metadata').default('{}').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Interactive Chat and Agent Workflows.
 */
export const chatSessions = pgTable('chat_sessions', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id', { length: 36 }),
  title: text('title').notNull().default('New AI Conversation'),
  persona: varchar('persona', { length: 50 }).default('GeneralAssistant').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const chatMessages = pgTable('chat_messages', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar('session_id', { length: 36 }).references(() => chatSessions.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 20 }).notNull(), // 'system' | 'user' | 'assistant' | 'tool'
  content: text('content').notNull(),
  tokensUsed: integer('tokens_used').default(0).notNull(),
  latencyMs: integer('latency_ms').default(0).notNull(),
  metadata: jsonb('metadata').default('{}').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Multimodal Items table storing image, document, and cross-modal embeddings with HNSW indexing.
 */
export const multimodalItems = pgTable('multimodal_items', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  description: text('description'),
  mediaType: varchar('media_type', { length: 50 }).notNull().default('image'),
  mediaUrl: text('media_url'),
  thumbnailBase64: text('thumbnail_base64'),
  embedding: vector384('embedding').notNull(),
  metadata: jsonb('metadata').default('{}').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Human-in-the-Loop (HITL) annotations for RLHF/DPO preference alignment.
 */
export const humanFeedbackAnnotations = pgTable('human_feedback_annotations', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  prompt: text('prompt').notNull(),
  chosenResponse: text('chosen_response').notNull(),
  rejectedResponse: text('rejected_response').notNull(),
  rating: integer('rating').notNull().default(5),
  hallucinationFlag: varchar('hallucination_flag', { length: 10 }).notNull().default('false'),
  severity: varchar('severity', { length: 50 }).default('NONE'),
  rationale: text('rationale'),
  evaluatorId: varchar('evaluator_id', { length: 100 }).notNull().default('expert_annotator'),
  metadata: jsonb('metadata').default('{}').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * AI Benchmark regression runs and quality gate tracking.
 */
export const evalBenchmarkRuns = pgTable('eval_benchmark_runs', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  suiteName: varchar('suite_name', { length: 100 }).notNull(),
  modelA: varchar('model_a', { length: 100 }).notNull(),
  modelB: varchar('model_b', { length: 100 }),
  accuracyScore: text('accuracy_score').notNull(),
  groundednessScore: text('groundedness_score').notNull(),
  avgLatencyMs: integer('avg_latency_ms').notNull(),
  costPer1k: text('cost_per_1k').notNull(),
  verdict: varchar('verdict', { length: 20 }).notNull().default('PASSED'),
  metricsBreakdown: jsonb('metrics_breakdown').default('{}').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * AI Governance and EU AI Act / ISO 42001 compliance audit reports.
 */
export const governanceAudits = pgTable('governance_audits', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  systemName: varchar('system_name', { length: 100 }).notNull(),
  riskTier: varchar('risk_tier', { length: 50 }).notNull(),
  complianceScore: integer('compliance_score').notNull(),
  transparencyPassed: varchar('transparency_passed', { length: 10 }).notNull().default('true'),
  humanOversightPassed: varchar('human_oversight_passed', { length: 10 }).notNull().default('true'),
  dataGovernancePassed: varchar('data_governance_passed', { length: 10 }).notNull().default('true'),
  auditReport: jsonb('audit_report').default('{}').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Embedding = typeof embeddings.$inferSelect;
export type NewEmbedding = typeof embeddings.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type MultimodalItem = typeof multimodalItems.$inferSelect;
export type HumanFeedbackAnnotation = typeof humanFeedbackAnnotations.$inferSelect;
export type EvalBenchmarkRun = typeof evalBenchmarkRuns.$inferSelect;
export type GovernanceAudit = typeof governanceAudits.$inferSelect;
