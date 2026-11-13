export interface PromptSafetyResult {
  safe: boolean;
  reason?: "disallowed_content" | "prompt_injection";
  message?: string;
}

const DISALLOWED_PATTERNS: RegExp[] = [
  /\b(nude|nudity|nsfw|porn|pornography|erotic|sexually\s+explicit|hentai|fetish)\b/i,
  /\b(gore|dismember|behead|torture|suicide|self[- ]harm|kill\s+yourself)\b/i,
  /\b(terrorist|bomb\s+making|methamphetamine|cocaine|heroin)\b/i,
  /\b(racial\s+slur|white\s+supremacy|nazi)\b/i,
];

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/i,
  /disregard\s+(all\s+)?(previous|prior|system)\s+(instructions|prompts|rules)/i,
  /override\s+(system|safety|style)\s+(prompt|rules|instructions)/i,
  /you\s+are\s+now\s+(a|an|in)\s+(unfiltered|jailbreak|dan|developer\s+mode)/i,
  /^\s*(system|assistant)\s*:\s*/im,
];

export const GEMINI_KID_SAFE_SETTINGS = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_LOW_AND_ABOVE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_LOW_AND_ABOVE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_LOW_AND_ABOVE" },
] as const;

export function checkPromptSafety(texts: Array<string | undefined | null>): PromptSafetyResult {
  for (const raw of texts) {
    if (!raw || typeof raw !== "string") continue;
    const text = raw.trim();
    if (!text) continue;

    for (const pattern of DISALLOWED_PATTERNS) {
      if (pattern.test(text)) {
        return {
          safe: false,
          reason: "disallowed_content",
          message:
            "Let's keep our stories family-friendly! Please try a gentle, kid-safe idea.",
        };
      }
    }

    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(text)) {
        return {
          safe: false,
          reason: "prompt_injection",
          message:
            "That request looks like it's trying to change studio rules. Please describe your story or character normally.",
        };
      }
    }
  }

  return { safe: true };
}

export function wrapUserPrompt(text: string): string {
  const cleaned = text.replace(/<\/?user_story_input>/gi, "");
  return `<user_story_input>\n${cleaned}\n</user_story_input>`;
}
