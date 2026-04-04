import { GoogleGenAI } from "@google/genai";

// Gets API key - works in AI Studio AND Vercel
function getApiKey(): string {
  const key =
    (import.meta.env?.VITE_GEMINI_API_KEY) ||
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    "";

  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not set. " +
      "In Vercel: add VITE_GEMINI_API_KEY in Settings → Environment Variables, then redeploy. " +
      "In AI Studio: check your Secrets panel."
    );
  }
  return key;
}

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

/**
 * Robustly extracts a JSON object or array from a string.
 * Handles: clean JSON, ```json ... ``` fences, ``` ... ``` fences,
 * and JSON embedded inside conversational text.
 */
function extractJSON(text: string): any {
  if (!text || text.trim() === "") {
    throw new Error("Model returned an empty response.");
  }

  // 1. Try direct parse first (cleanest path)
  try {
    return JSON.parse(text.trim());
  } catch (_) {}

  // 2. Try extracting from ```json ... ``` fences
  const fencedJson = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (fencedJson) {
    try {
      return JSON.parse(fencedJson[1].trim());
    } catch (_) {}
  }

  // 3. Try extracting from ``` ... ``` fences (no language tag)
  const fenced = text.match(/```\s*([\s\S]*?)\s*```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch (_) {}
  }

  // 4. Try extracting the largest { } or [ ] block in the text
  const objMatch = text.match(/\{[\s\S]*\}/);
  const arrMatch = text.match(/\[[\s\S]*\]/);

  if (objMatch) {
    try {
      return JSON.parse(objMatch[0]);
    } catch (_) {}
  }

  if (arrMatch) {
    try {
      return JSON.parse(arrMatch[0]);
    } catch (_) {}
  }

  // 5. All strategies failed — throw with the raw text for debugging
  console.error("[SemanticOS] Could not extract JSON from model response:", text.slice(0, 500));
  throw new Error(`Model response was not valid JSON. Raw preview: "${text.slice(0, 200)}"`);
}

export interface GeminiOptions {
  useGrounding?: boolean;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

// Use gemini-2.0-flash as the stable default.
// gemini-2.5-flash is experimental and has inconsistent JSON output.
const DEFAULT_MODEL = "gemini-2.0-flash";

export async function callGemini(prompt: string, options: GeminiOptions = {}): Promise<any> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const config: Record<string, any> = {
    temperature: options.temperature ?? 0.7,
    maxOutputTokens: options.maxTokens ?? 8192,
    systemInstruction: MASTER_SYSTEM_INSTRUCTION,
  };

  // Cannot use responseMimeType with grounding
  if (options.useGrounding) {
    config.tools = [{ googleSearch: {} }];
  } else {
    // Force JSON output mode — supported reliably on gemini-2.0-flash+
    config.responseMimeType = "application/json";
  }

  const model = options.model ?? DEFAULT_MODEL;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config,
  });

  const text = response.text ?? "";
  return extractJSON(text);
}

// For streaming responses (content writing mode)
export async function callGeminiStream(
  prompt: string,
  onChunk: (text: string) => void,
  options: { temperature?: number } = {}
): Promise<void> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const stream = await ai.models.generateContentStream({
    model: DEFAULT_MODEL,
    contents: prompt,
    config: {
      temperature: options.temperature ?? 0.7,
      systemInstruction: MASTER_SYSTEM_INSTRUCTION,
    },
  });

  for await (const chunk of stream) {
    if (chunk.text) onChunk(chunk.text);
  }
}

// Test if the API key works - use this on app load
export async function testApiKey(): Promise<{ valid: boolean; error?: string }> {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: "Reply with the word OK only.",
      config: { maxOutputTokens: 10 },
    });
    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}
