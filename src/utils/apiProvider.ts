/**
 * SemanticOS Unified AI Provider
 * Supports: Google Gemini, OpenAI GPT-4o, Anthropic Claude
 * All keys stored in localStorage — no backend required.
 */
import { GoogleGenAI } from "@google/genai";

export type AIProvider = "gemini" | "openai" | "claude";

export interface AIProviderConfig {
  provider: AIProvider;
  geminiKey: string;
  openaiKey: string;
  claudeKey: string;
  geminiModel: string;
  openaiModel: string;
  claudeModel: string;
}

const STORAGE_KEY = "semanticos_api_config";

export const PROVIDER_MODELS: Record<AIProvider, string[]> = {
  gemini: ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"],
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  claude: [
    "claude-opus-4-6",
    "claude-sonnet-4-6",
    "claude-haiku-4-5-20251001",
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022",
  ],
};

const MASTER_SYSTEM_INSTRUCTION = `You are SemanticOS — an advanced Semantic SEO AI built on the Koray Tugberk GUBUR (Koraynese) framework.

YOUR CORE LAWS:
1. A topical map is NEVER a keyword list. It is a semantic content network.
2. ALWAYS anchor every output back to the Central Entity and Source Context.
3. TOPICAL AUTHORITY = Topical Coverage + Historical Data. Both must be addressed.
4. EAV: Entity → Attribute → Value. Attributes matter MORE than entities.
5. One article = One macro context. Never duplicate macro contexts.
6. Cost of retrieval must always decrease. Structure everything for machines and humans.
7. As long as necessary, as short as possible. Zero fluff.
8. Rank topics, not keywords.
9. Trust nodes and historical nodes complete the semantic network. Never skip them.
10. H2 = user question. Every H2 answer ≤ 40 words. Featured snippet ready.

CRITICAL: Always return valid JSON only. No preamble. No explanation. No markdown fences.`;

function extractJSON(text: string): any {
  if (!text || text.trim() === "") throw new Error("Model returned an empty response.");
  try { return JSON.parse(text.trim()); } catch (_) {}
  const fencedJson = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (fencedJson) { try { return JSON.parse(fencedJson[1].trim()); } catch (_) {} }
  const fenced = text.match(/```\s*([\s\S]*?)\s*```/);
  if (fenced) { try { return JSON.parse(fenced[1].trim()); } catch (_) {} }
  const objMatch = text.match(/\{[\s\S]*\}/);
  const arrMatch = text.match(/\[[\s\S]*\]/);
  if (objMatch) { try { return JSON.parse(objMatch[0]); } catch (_) {} }
  if (arrMatch) { try { return JSON.parse(arrMatch[0]); } catch (_) {} }
  console.error("[SemanticOS] Could not extract JSON:", text.slice(0, 500));
  throw new Error(`Model response was not valid JSON. Raw: "${text.slice(0, 200)}"`);
}

export function getConfig(): AIProviderConfig {
  const envGemini = (import.meta.env?.VITE_GEMINI_API_KEY as string) || "";
  const envOpenAI = (import.meta.env?.VITE_OPENAI_API_KEY as string) || "";
  const envClaude = (import.meta.env?.VITE_CLAUDE_API_KEY as string) || "";

  const defaults: AIProviderConfig = {
    provider: "gemini",
    geminiKey: envGemini,
    openaiKey: envOpenAI,
    claudeKey: envClaude,
    geminiModel: "gemini-2.5-flash",
    openaiModel: "gpt-4o",
    claudeModel: "claude-sonnet-4-6",
  };

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AIProviderConfig>;
      return {
        ...defaults,
        ...parsed,
        // env vars override stored empty strings
        geminiKey: parsed.geminiKey || envGemini,
        openaiKey: parsed.openaiKey || envOpenAI,
        claudeKey: parsed.claudeKey || envClaude,
      };
    }
  } catch (_) {}
  return defaults;
}

export function saveConfig(updates: Partial<AIProviderConfig>): void {
  const current = getConfig();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...updates }));
}

function getActiveKey(): string {
  const cfg = getConfig();
  const keys: Record<AIProvider, string> = {
    gemini: cfg.geminiKey,
    openai: cfg.openaiKey,
    claude: cfg.claudeKey,
  };
  const key = keys[cfg.provider];
  if (!key) {
    throw new Error(
      `No API key set for provider "${cfg.provider}". Go to ⚙ Settings → API Keys to add your key.`
    );
  }
  return key;
}

// ──────────────────────────────────────────
// GEMINI
// ──────────────────────────────────────────
async function callGeminiProvider(
  prompt: string,
  key: string,
  model: string,
  temperature: number,
  maxTokens: number,
  useGrounding = false
): Promise<any> {
  const ai = new GoogleGenAI({ apiKey: key });
  const config: Record<string, any> = {
    temperature,
    maxOutputTokens: maxTokens,
    systemInstruction: MASTER_SYSTEM_INSTRUCTION,
  };
  if (useGrounding) config.tools = [{ googleSearch: {} }];

  let attempt = 1;
  while (true) {
    try {
      const response = await ai.models.generateContent({ model, contents: prompt, config });
      return extractJSON(response.text ?? "");
    } catch (error: any) {
      const msg = error.message ?? "";
      if ((msg.includes("RESOURCE_EXHAUSTED") || msg.includes("429")) && attempt <= 2) {
        const match = msg.match(/retry in (\d+(\.\d+)?)s/);
        const wait = match ? Math.ceil(parseFloat(match[1]) * 1000) + 2000 : 35000;
        console.warn(`[SemanticOS] Gemini rate limit — waiting ${wait / 1000}s (attempt ${attempt}/2)`);
        await new Promise(r => setTimeout(r, wait));
        attempt++;
      } else {
        throw error;
      }
    }
  }
}

// ──────────────────────────────────────────
// OPENAI
// ──────────────────────────────────────────
async function callOpenAIProvider(
  prompt: string,
  key: string,
  model: string,
  temperature: number,
  maxTokens: number
): Promise<any> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: MASTER_SYSTEM_INSTRUCTION },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`OpenAI API error ${res.status}: ${(err as any)?.error?.message ?? res.statusText}`);
  }
  const data = await res.json();
  return extractJSON(data.choices?.[0]?.message?.content ?? "");
}

// ──────────────────────────────────────────
// CLAUDE
// ──────────────────────────────────────────
async function callClaudeProvider(
  prompt: string,
  key: string,
  model: string,
  temperature: number,
  maxTokens: number
): Promise<any> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system: MASTER_SYSTEM_INSTRUCTION,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Claude API error ${res.status}: ${(err as any)?.error?.message ?? res.statusText}`);
  }
  const data = await res.json();
  return extractJSON(data.content?.[0]?.text ?? "");
}

// ──────────────────────────────────────────
// UNIFIED CALL
// ──────────────────────────────────────────
export interface CallOptions {
  useGrounding?: boolean;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export async function callAI(prompt: string, options: CallOptions = {}): Promise<any> {
  const cfg = getConfig();
  const key = getActiveKey();
  const temperature = options.temperature ?? 0.7;
  const maxTokens = options.maxTokens ?? 8192;

  switch (cfg.provider) {
    case "gemini":
      return callGeminiProvider(
        prompt,
        key,
        options.model ?? cfg.geminiModel,
        temperature,
        maxTokens,
        options.useGrounding
      );
    case "openai":
      return callOpenAIProvider(prompt, key, options.model ?? cfg.openaiModel, temperature, maxTokens);
    case "claude":
      return callClaudeProvider(prompt, key, options.model ?? cfg.claudeModel, temperature, maxTokens);
    default:
      throw new Error(`Unknown provider: ${cfg.provider}`);
  }
}

// ──────────────────────────────────────────
// TEST CONNECTION
// ──────────────────────────────────────────
export async function testConnection(
  provider: AIProvider,
  key: string,
  model?: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const ping = "Reply with the single word: OK";
    const cfg = getConfig();
    switch (provider) {
      case "gemini": {
        const ai = new GoogleGenAI({ apiKey: key });
        await ai.models.generateContent({
          model: model ?? cfg.geminiModel,
          contents: ping,
          config: { maxOutputTokens: 10 },
        });
        break;
      }
      case "openai": {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: model ?? cfg.openaiModel,
            messages: [{ role: "user", content: ping }],
            max_tokens: 10,
          }),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error((e as any)?.error?.message ?? res.statusText);
        }
        break;
      }
      case "claude": {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: model ?? cfg.claudeModel,
            max_tokens: 10,
            messages: [{ role: "user", content: ping }],
          }),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error((e as any)?.error?.message ?? res.statusText);
        }
        break;
      }
    }
    return { valid: true };
  } catch (error: any) {
    const msg = error.message ?? "";
    if (msg.includes("not found") || msg.includes("NOT_FOUND") || msg.includes("RESOURCE_EXHAUSTED")) {
      return { valid: true };
    }
    return { valid: false, error: msg };
  }
}

// Legacy shim so existing imports from gemini.ts still work via re-export
export { extractJSON };
