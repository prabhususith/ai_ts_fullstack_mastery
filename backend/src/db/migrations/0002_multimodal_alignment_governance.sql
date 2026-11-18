-- ==============================================================================
-- Enterprise AI Full-Stack Schema Migration: 0002_multimodal_alignment_governance.sql
-- Enables Multimodal RAG with HNSW indexing, Human-in-the-Loop (HITL) annotations,
-- AI Evaluation benchmark suites, and EU AI Act / ISO 42001 governance audits.
-- ==============================================================================

-- 1. Multimodal Items (Image & Document embeddings with HNSW cosine search)
CREATE TABLE IF NOT EXISTS multimodal_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    media_type VARCHAR(50) NOT NULL DEFAULT 'image',
    media_url TEXT,
    thumbnail_base64 TEXT,
    embedding vector(384) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_multimodal_hnsw_cosine 
ON multimodal_items 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 2. Human-in-the-Loop Feedback & Alignment Annotations
CREATE TABLE IF NOT EXISTS human_feedback_annotations (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt TEXT NOT NULL,
    chosen_response TEXT NOT NULL,
    rejected_response TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5,
    hallucination_flag BOOLEAN NOT NULL DEFAULT FALSE,
    severity VARCHAR(50) DEFAULT 'NONE',
    rationale TEXT,
    evaluator_id VARCHAR(100) NOT NULL DEFAULT 'expert_annotator',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. AI Evaluation & Benchmark Regression Runs
CREATE TABLE IF NOT EXISTS eval_benchmark_runs (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    suite_name VARCHAR(100) NOT NULL,
    model_a VARCHAR(100) NOT NULL,
    model_b VARCHAR(100),
    accuracy_score NUMERIC(5, 4) NOT NULL,
    groundedness_score NUMERIC(5, 4) NOT NULL,
    avg_latency_ms INTEGER NOT NULL,
    cost_per_1k NUMERIC(8, 6) NOT NULL,
    verdict VARCHAR(20) NOT NULL DEFAULT 'PASSED',
    metrics_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. AI Governance & EU AI Act Compliance Audits
CREATE TABLE IF NOT EXISTS governance_audits (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    system_name VARCHAR(100) NOT NULL,
    risk_tier VARCHAR(50) NOT NULL,
    compliance_score INTEGER NOT NULL,
    transparency_passed BOOLEAN NOT NULL DEFAULT TRUE,
    human_oversight_passed BOOLEAN NOT NULL DEFAULT TRUE,
    data_governance_passed BOOLEAN NOT NULL DEFAULT TRUE,
    audit_report JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
