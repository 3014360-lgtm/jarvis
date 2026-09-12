/**
 * JARVIS Security Redactor Pipeline
 * Mandated for all data traversing outward to the model or persisted to logs.
 * Masks credentials, secrets, tokens, CPF, credit cards, passwords, and sensitive PII.
 */

export interface RedactionResult {
  redactedText: string;
  hasRedactions: boolean;
  redactedTypes: string[];
}

export class SecurityRedactor {
  // Regex patterns for sensitive entities
  private static readonly PATTERNS: Array<{ type: string; regex: RegExp; replacement: string }> = [
    // JWT Tokens
    {
      type: 'JWT_TOKEN',
      regex: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g,
      replacement: '[REDACTED_JWT_TOKEN]',
    },
    // API Keys (Bearer, sk-, gsk_, AIza, etc.)
    {
      type: 'API_KEY',
      regex: /(?:Bearer\s+|api[_-]?key["':\s=]+|chave["':\s=]+|token["':\s=]+)([a-zA-Z0-9_\-.]{16,})|\bAIza[0-9A-Za-z-_]{30,}\b|\bsk-[a-zA-Z0-9]{20,}\b/gi,
      replacement: '[REDACTED_API_KEY]',
    },
    // Generic high-entropy secret patterns
    {
      type: 'GENERIC_SECRET',
      regex: /(?:password|secret|passwd|pwd)["':\s=]+([^\s"',;]{6,})/gi,
      replacement: 'password: "[REDACTED_SECRET]"',
    },
    // Brazilian CPF (xxx.xxx.xxx-xx or 11 digits)
    {
      type: 'CPF_DOCUMENT',
      regex: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,
      replacement: '[REDACTED_CPF]',
    },
    // Credit Cards (Visa, MC, Amex 13-19 digits)
    {
      type: 'CREDIT_CARD',
      regex: /\b(?:\d{4}[ -]?){3}\d{4}\b|\b\d{15,16}\b/g,
      replacement: '[REDACTED_CARD_NUMBER]',
    },
    // Email addresses when flagged for high-sensitivity context
    {
      type: 'AUTH_COOKIE',
      regex: /(?:connect\.sid|session_id|remember_token)=([a-zA-Z0-9_%-]+)/gi,
      replacement: '$1=[REDACTED_SESSION_COOKIE]',
    },
  ];

  /**
   * Redacts sensitive secrets, credentials, and PII from raw text strings
   */
  public static redact(text: string): RedactionResult {
    if (!text || typeof text !== 'string') {
      return { redactedText: text, hasRedactions: false, redactedTypes: [] };
    }

    let result = text;
    const types: Set<string> = new Set();

    for (const item of this.PATTERNS) {
      if (item.regex.test(result)) {
        types.add(item.type);
        result = result.replace(item.regex, item.replacement);
      }
    }

    return {
      redactedText: result,
      hasRedactions: types.size > 0,
      redactedTypes: Array.from(types),
    };
  }

  /**
   * Deeply redacts an object before sending it to the model reasoning plane or logging
   */
  public static redactObject<T>(obj: T): T {
    if (!obj || typeof obj !== 'object') {
      if (typeof obj === 'string') {
        return this.redact(obj).redactedText as unknown as T;
      }
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.redactObject(item)) as unknown as T;
    }

    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const lowerKey = k.toLowerCase();
      if (
        lowerKey.includes('password') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('apikey') ||
        lowerKey.includes('token') ||
        lowerKey.includes('cookie')
      ) {
        cleaned[k] = '[REDACTED_BY_KEY_POLICY]';
      } else if (typeof v === 'string') {
        cleaned[k] = this.redact(v).redactedText;
      } else if (typeof v === 'object' && v !== null) {
        cleaned[k] = this.redactObject(v);
      } else {
        cleaned[k] = v;
      }
    }
    return cleaned as T;
  }
}
