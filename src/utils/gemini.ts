import { GoogleGenAI } from "@google/genai";

const getApiKey = () =>
  (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) || import.meta.env.VITE_GEMINI_API_KEY || "";

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

CRITICAL OUTPUT RULE: Always return valid JSON only. No preamble. No explanation. No markdown fences.`;

export async function callGemini(
  prompt: string,
  options: {
    useGrounding?: boolean;
    temperature?: number;
    maxTokens?: number;
    model?: string;
  } = {}
): Promise<any> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const config: any = {
    responseMimeType: "application/json",
    temperature: options.temperature ?? 0.7,
    maxOutputTokens: options.maxTokens ?? 8192,
    systemInstruction: MASTER_SYSTEM_INSTRUCTION,
  };

  if (options.useGrounding) {
    config.tools = [{ googleSearch: {} }];
    delete config.responseMimeType; // Cannot use with grounding
  }

  const response = await ai.models.generateContent({
    model: options.model ?? "gemini-2.5-flash",
    contents: prompt,
    config,
  });

  const text = response.text;

  if (options.useGrounding && text) {
    // Grounding returns prose — parse JSON from it
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return { raw: text };
  }

  if (text) {
     return JSON.parse(text);
  }
  return {};
}

export async function callGeminiStream(
  prompt: string,
  onChunk: (text: string) => void,
  options: { temperature?: number } = {}
): Promise<void> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const response = await ai.models.generateContentStream({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      temperature: options.temperature ?? 0.7,
      systemInstruction: MASTER_SYSTEM_INSTRUCTION,
    },
  });

  for await (const chunk of response) {
    if (chunk.text) onChunk(chunk.text);
  }
}
