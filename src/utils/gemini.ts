/**
 * gemini.ts — Legacy compatibility shim.
 * All modules now call `callAI()` from apiProvider, but existing pages
 * that import `callGemini` / `callGeminiStream` still work via this shim.
 */
export { callAI as callGemini, testConnection as testApiKey } from "./apiProvider";
export type { CallOptions as GeminiOptions } from "./apiProvider";

// callGeminiStream is kept for ContentBrief streaming — falls back to OpenAI/Claude streaming stub
import { getConfig } from "./apiProvider";
import { GoogleGenAI } from "@google/genai";

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

export async function callGeminiStream(
  prompt: string,
  onChunk: (text: string) => void,
  options: { temperature?: number } = {}
): Promise<void> {
  const cfg = getConfig();

  if (cfg.provider === "gemini" && cfg.geminiKey) {
    // Native Gemini streaming
    const ai = new GoogleGenAI({ apiKey: cfg.geminiKey });
    const stream = await ai.models.generateContentStream({
      model: cfg.geminiModel,
      contents: prompt,
      config: {
        temperature: options.temperature ?? 0.7,
        systemInstruction: MASTER_SYSTEM_INSTRUCTION,
      },
    });
    for await (const chunk of stream) {
      if (chunk.text) onChunk(chunk.text);
    }
    return;
  }

  // For OpenAI / Claude: use non-streaming callAI and deliver as single chunk
  const { callAI } = await import("./apiProvider");
  const result = await callAI(prompt, { temperature: options.temperature });
  onChunk(typeof result === "string" ? result : JSON.stringify(result, null, 2));
}
