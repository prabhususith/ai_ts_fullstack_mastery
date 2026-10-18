/**
 * @file tracingEvaluator.ts
 * @description Enterprise MLOps Tracing, Token Accounting, and Cost Evaluator.
 * Tracks execution latencies, token consumption across model pricing tiers,
 * and maintains OpenTelemetry/LangSmith-compatible distributed execution spans.
 * @see https://opentelemetry.io/docs/
 */

export interface ModelPricingTier {
  modelName: string;
  inputPer1kTokensUsd: number;
  outputPer1kTokensUsd: number;
}

export const PRICING_TIERS: Record<string, ModelPricingTier> = {
  'gpt-4o': {
    modelName: 'gpt-4o',
    inputPer1kTokensUsd: 0.0025,
    outputPer1kTokensUsd: 0.01,
  },
  'claude-3-5-sonnet': {
    modelName: 'claude-3-5-sonnet',
    inputPer1kTokensUsd: 0.003,
    outputPer1kTokensUsd: 0.015,
  },
  'gemini-1-5-pro': {
    modelName: 'gemini-1-5-pro',
    inputPer1kTokensUsd: 0.00125,
    outputPer1kTokensUsd: 0.005,
  },
  'local-minilm-l6-v2': {
    modelName: 'local-minilm-l6-v2',
    inputPer1kTokensUsd: 0.0, // Free local edge inference!
    outputPer1kTokensUsd: 0.0,
  },
};

export interface SpanRecord {
  spanId: string;
  traceId: string;
  name: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  attributes: Record<string, any>;
}

export class TracingEvaluator {
  private static instance: TracingEvaluator;
  private spans: Map<string, SpanRecord[]> = new Map(); // traceId -> spans

  private constructor() {}

  public static getInstance(): TracingEvaluator {
    if (!TracingEvaluator.instance) {
      TracingEvaluator.instance = new TracingEvaluator();
    }
    return TracingEvaluator.instance;
  }

  /**
   * Starts a new distributed tracing span.
   */
  public startSpan(traceId: string, name: string, attributes: Record<string, any> = {}): string {
    const spanId = `span_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const span: SpanRecord = {
      spanId,
      traceId,
      name,
      startTime: performance.now(),
      attributes,
    };

    const traceSpans = this.spans.get(traceId) ?? [];
    traceSpans.push(span);
    this.spans.set(traceId, traceSpans);

    return spanId;
  }

  /**
   * Ends a tracing span and records its elapsed duration.
   */
  public endSpan(traceId: string, spanId: string, extraAttributes: Record<string, any> = {}): void {
    const traceSpans = this.spans.get(traceId);
    if (!traceSpans) return;

    const span = traceSpans.find((s) => s.spanId === spanId);
    if (span) {
      span.endTime = performance.now();
      span.durationMs = Math.round(span.endTime - span.startTime);
      Object.assign(span.attributes, extraAttributes);
    }
  }

  /**
   * Calculates dollar cost based on model and token consumption.
   */
  public calculateCost(
    model: string,
    promptTokens: number,
    completionTokens: number
  ): { costUsd: number; promptCostUsd: number; completionCostUsd: number } {
    const tier = PRICING_TIERS[model] || PRICING_TIERS['local-minilm-l6-v2']!;
    const promptCostUsd = (promptTokens / 1000) * tier.inputPer1kTokensUsd;
    const completionCostUsd = (completionTokens / 1000) * tier.outputPer1kTokensUsd;
    const costUsd = Number((promptCostUsd + completionCostUsd).toFixed(6));

    return {
      costUsd,
      promptCostUsd: Number(promptCostUsd.toFixed(6)),
      completionCostUsd: Number(completionCostUsd.toFixed(6)),
    };
  }

  /**
   * Returns all spans associated with a trace ID.
   */
  public getTrace(traceId: string): SpanRecord[] {
    return this.spans.get(traceId) || [];
  }
}

export const tracer = TracingEvaluator.getInstance();
