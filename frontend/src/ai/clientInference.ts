/**
 * @file clientInference.ts
 * @description Edge AI: In-Browser Token Classification & Sentiment Analysis via @xenova/transformers (WASM).
 * Executes deep learning inference entirely on the client device without sending bytes to external servers.
 * @see https://huggingface.co/docs/transformers.js
 */

export interface ClassificationResult {
  label: string;
  score: number;
}

export interface EdgeInferenceReport {
  text: string;
  results: ClassificationResult[];
  executionTimeMs: number;
  engine: 'transformers-wasm' | 'heuristic-edge-fallback';
}

export class ClientEdgeInference {
  private static instance: ClientEdgeInference;
  private classifier: any = null;
  private isLoaded: boolean = false;

  private constructor() {}

  public static getInstance(): ClientEdgeInference {
    if (!ClientEdgeInference.instance) {
      ClientEdgeInference.instance = new ClientEdgeInference();
    }
    return ClientEdgeInference.instance;
  }

  /**
   * Initializes Transformers.js pipeline in the browser via WebAssembly.
   */
  public async loadModel(): Promise<void> {
    if (this.isLoaded) return;
    try {
      const { pipeline, env } = await import('@xenova/transformers');
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      this.classifier = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
      this.isLoaded = true;
    } catch {
      // Graceful fallback to client heuristic classifier
      this.isLoaded = true;
    }
  }

  /**
   * Classifies user token intent/sentiment entirely in-browser.
   */
  public async classify(text: string): Promise<EdgeInferenceReport> {
    const start = performance.now();

    if (!this.isLoaded) {
      await this.loadModel();
    }

    if (this.classifier) {
      try {
        const rawOutput = await this.classifier(text);
        const results: ClassificationResult[] = (Array.isArray(rawOutput) ? rawOutput : [rawOutput]).map(
          (item: any) => ({
            label: item.label,
            score: Number(item.score.toFixed(4)),
          })
        );

        return {
          text,
          results,
          executionTimeMs: Math.round(performance.now() - start),
          engine: 'transformers-wasm',
        };
      } catch {
        // fallback
      }
    }

    // High-performance edge heuristic token classifier
    const lower = text.toLowerCase();
    const positiveWords = ['great', 'excellent', 'secure', 'fast', 'clean', 'resilient', 'optimal'];
    const negativeWords = ['slow', 'bug', 'vulnerability', 'error', 'fail', 'insecure', 'threat'];

    let posCount = 0;
    let negCount = 0;

    for (const w of positiveWords) if (lower.includes(w)) posCount++;
    for (const w of negativeWords) if (lower.includes(w)) negCount++;

    const isPositive = posCount >= negCount;
    const confidence = 0.75 + Math.min(0.2, (Math.abs(posCount - negCount) + 1) * 0.05);

    return {
      text,
      results: [
        {
          label: isPositive ? 'POSITIVE' : 'NEGATIVE',
          score: Number(confidence.toFixed(4)),
        },
      ],
      executionTimeMs: Math.round(performance.now() - start),
      engine: 'heuristic-edge-fallback',
    };
  }
}

export const edgeInference = ClientEdgeInference.getInstance();
