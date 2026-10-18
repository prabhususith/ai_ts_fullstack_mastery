/**
 * @file dlpMasker.ts
 * @description Enterprise Data Loss Prevention (DLP) and PII/Secret Redaction Engine.
 * Detects and scrubs sensitive information (SSNs, credit cards, emails, phone numbers,
 * cloud credentials, and API keys) before data leaves the enterprise boundary to an LLM.
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Information_Leakage_Cheat_Sheet.html
 */

export interface RedactionResult {
  scrubbedText: string;
  redactedCount: number;
  detectedCategories: string[];
  reversibleMap?: Record<string, string>;
}

export class DlpMasker {
  private static readonly RULES: Array<{ category: string; regex: RegExp; placeholder: string }> = [
    // US Social Security Numbers (SSN)
    {
      category: 'SSN',
      regex: /\b\d{3}-\d{2}-\d{4}\b/g,
      placeholder: '[REDACTED_SSN]',
    },
    // Credit Cards (Visa, MasterCard, Amex, Discover)
    {
      category: 'CREDIT_CARD',
      regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
      placeholder: '[REDACTED_CREDIT_CARD]',
    },
    // Email Addresses
    {
      category: 'EMAIL',
      regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
      placeholder: '[REDACTED_EMAIL]',
    },
    // Phone numbers (US & International formats)
    {
      category: 'PHONE_NUMBER',
      regex: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
      placeholder: '[REDACTED_PHONE]',
    },
    // AWS Access Key ID
    {
      category: 'AWS_ACCESS_KEY',
      regex: /\bAKIA[0-9A-Z]{16}\b/g,
      placeholder: '[REDACTED_AWS_KEY]',
    },
    // OpenAI API Keys
    {
      category: 'OPENAI_API_KEY',
      regex: /\bsk-[a-zA-Z0-9]{32,}\b/g,
      placeholder: '[REDACTED_OPENAI_KEY]',
    },
    // Generic High-Entropy API Keys / Hex secrets
    {
      category: 'API_SECRET',
      regex: /\b(?:api[_-]?key|secret|token)\s*[:=]\s*['"]?([A-Za-z0-9_\-]{24,})['"]?/gi,
      placeholder: 'api_key: [REDACTED_SECRET]',
    },
  ];

  /**
   * Sanitizes input text by masking all PII and cryptographic secrets.
   * @param input Raw text containing potential sensitive PII or credentials
   * @param reversible If true, returns token replacement mapping allowing re-hydration
   */
  public static mask(input: string, reversible: boolean = false): RedactionResult {
    let scrubbedText = input;
    let redactedCount = 0;
    const detectedCategories = new Set<string>();
    const reversibleMap: Record<string, string> = {};

    for (const rule of DlpMasker.RULES) {
      scrubbedText = scrubbedText.replace(rule.regex, (match) => {
        redactedCount++;
        detectedCategories.add(rule.category);

        if (reversible) {
          const token = `[${rule.category}_${Math.random().toString(36).substring(2, 8)}]`;
          reversibleMap[token] = match;
          return token;
        }

        return rule.placeholder;
      });
    }

    return {
      scrubbedText,
      redactedCount,
      detectedCategories: Array.from(detectedCategories),
      reversibleMap: reversible ? reversibleMap : undefined,
    };
  }

  /**
   * Re-hydrates scrubbed text using the reversible token map.
   */
  public static unmask(scrubbedText: string, reversibleMap: Record<string, string>): string {
    let result = scrubbedText;
    for (const [token, original] of Object.entries(reversibleMap)) {
      result = result.replaceAll(token, original);
    }
    return result;
  }
}
