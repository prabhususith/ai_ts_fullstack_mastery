/**
 * @file promptInjectionFirewall.ts
 * @description OWASP Top 10 for LLM Applications (LLM01: Prompt Injection) Defense Firewall.
 * Implements XML tag delimiter envelopes, regex jailbreak heuristics, canary token validation,
 * and multi-factor threat scoring.
 * @see https://genai.owasp.org/llm-top-10/
 */

import crypto from 'crypto';
import { env } from '../config/env';

export interface ThreatAnalysisResult {
  isBlocked: boolean;
  threatScore: number; // 0 - 100
  detectedPatterns: string[];
  sanitizedInput: string;
  canaryToken?: string;
  reason?: string;
}

export class PromptInjectionFirewall {
  // Regex heuristics targeting common prompt injection and jailbreak attack patterns
  private static readonly JAILBREAK_PATTERNS: Array<{ name: string; pattern: RegExp; weight: number }> = [
    { name: 'DAN_JAILBREAK', pattern: /\b(DAN|do anything now|jailbreak|unfiltered mode)\b/i, weight: 40 },
    { name: 'IGNORE_INSTRUCTIONS', pattern: /\b(ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)|disregard\s+rules)\b/i, weight: 50 },
    { name: 'SYSTEM_PROMPT_LEAK', pattern: /\b(repeat\s+(the\s+)?(words\s+above|system\s+prompt|instructions)|show\s+system\s+prompt)\b/i, weight: 45 },
    { name: 'ROLE_OVERRIDE', pattern: /\b(you\s+are\s+now|act\s+as\s+(an\s+unrestricted|a\s+malicious|god\s+mode)|developer\s+mode\s+output)\b/i, weight: 40 },
    { name: 'DELIMITER_ESCAPING', pattern: /(<\/system>|<\/instructions>|<\/user_untrusted_input>|```system|<\|im_start\|>|<\|im_end\|>)/i, weight: 50 },
    { name: 'BASE64_OBFUSCATION_INDICATOR', pattern: /\b(decode\s+base64|base64:\s*[A-Za-z0-9+/=]{20,})\b/i, weight: 30 },
    { name: 'CANARY_LEAK_PROBE', pattern: /\b(print\s+canary|leak\s+secret|canary_token)\b/i, weight: 35 },
  ];

  /**
   * Generates a unique, high-entropy canary token for insertion into privileged system prompts.
   */
  public static generateCanaryToken(): string {
    const salt = env.CANARY_TOKEN_SECRET || 'canary-secret';
    const entropy = crypto.randomBytes(8).toString('hex');
    const hash = crypto.createHmac('sha256', salt).update(entropy).digest('hex').substring(0, 12);
    return `CANARY_${entropy}_${hash}`;
  }

  /**
   * Validates whether an LLM generation accidentally or maliciously leaked a canary token.
   */
  public static checkCanaryLeak(responseContent: string, canaryToken: string): boolean {
    if (!canaryToken) return false;
    return responseContent.includes(canaryToken);
  }

  /**
   * Sanitizes untrusted user text by neutralizing structural delimiters and XML injection tags.
   */
  public static sanitizeDelimiters(input: string): string {
    return input
      .replace(/<(\/?(system|user_untrusted_input|instructions|context|canary))/gi, '&lt;$1')
      .replace(/<\|im_(start|end)\|>/g, '[SANITIZED_DELIMITER]');
  }

  /**
   * Encloses untrusted user input within tamper-resistant XML envelopes.
   */
  public static wrapInUntrustedEnvelope(input: string): string {
    const sanitized = PromptInjectionFirewall.sanitizeDelimiters(input);
    return `<user_untrusted_input>\n${sanitized}\n</user_untrusted_input>`;
  }

  /**
   * Evaluates untrusted input against prompt injection signatures and computes threat score.
   * If threatScore >= 50, triggers blocking.
   */
  public static analyze(input: string): ThreatAnalysisResult {
    let threatScore = 0;
    const detectedPatterns: string[] = [];

    for (const { name, pattern, weight } of PromptInjectionFirewall.JAILBREAK_PATTERNS) {
      if (pattern.test(input)) {
        threatScore += weight;
        detectedPatterns.push(name);
      }
    }

    // Cap score at 100
    threatScore = Math.min(threatScore, 100);
    const isBlocked = threatScore >= 50;

    return {
      isBlocked,
      threatScore,
      detectedPatterns,
      sanitizedInput: PromptInjectionFirewall.wrapInUntrustedEnvelope(input),
      reason: isBlocked
        ? `Blocked by PromptInjectionFirewall: High confidence attack vector detected [${detectedPatterns.join(', ')}]`
        : undefined,
    };
  }
}
