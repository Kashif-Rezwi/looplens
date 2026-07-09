export interface SecretWarning {
  label: string;
  detail: string;
}

const SECRET_PATTERNS: Array<{ label: string; regex: RegExp; detail: string }> = [
  {
    label: "Possible API key",
    regex: /\b(?:api[_-]?key|secret|token|password)\s*[:=]\s*["']?[A-Za-z0-9_\-.]{16,}/i,
    detail: "Review pasted evidence for keys, tokens, passwords, or secrets."
  },
  {
    label: "Possible OpenAI-style key",
    regex: /\bsk-[A-Za-z0-9_-]{20,}\b/,
    detail: "Remove provider keys before publishing."
  },
  {
    label: "Possible private URL",
    regex: /\bhttps?:\/\/(?:localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[0-1]))[^\s]*/i,
    detail: "Private or localhost URLs may not be useful or safe in a public report."
  },
  {
    label: "Possible JWT",
    regex: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/,
    detail: "JWT-like strings should not be published."
  }
];

export function scanForSensitiveContent(text: string): SecretWarning[] {
  return SECRET_PATTERNS.filter((pattern) => pattern.regex.test(text)).map((pattern) => ({
    label: pattern.label,
    detail: pattern.detail
  }));
}
