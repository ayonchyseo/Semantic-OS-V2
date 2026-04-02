import { GoogleGenAI } from "@google/genai";

// Gets API key - works in AI Studio AND Vercel
function getApiKey(): string {
  const key =
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (import.meta.env?.VITE_GEMINI_API_KEY) ||
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

export interface GeminiOptions {
  useGrounding?: boolean;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

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
    config.responseMimeType = "application/json";
  }

  try {
    const response = await ai.models.generateContent({
      model: options.model ?? "gemini-2.5-flash",
      contents: prompt,
      config,
    });

    const text = response.text ?? "";

    if (options.useGrounding) {
      // Extract JSON from grounded response
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) ||
                        text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      return { raw: text, error: "Could not parse JSON from grounded response" };
    }

    // With responseMimeType: "application/json", text is clean JSON
    return JSON.parse(text);

  } catch (error: any) {
    // Re-throw with helpful message
    if (error.message?.includes("API_KEY") || error.message?.includes("401") || error.message?.includes("403")) {
      throw new Error(
        "API Key Error: Your Gemini API key is missing or invalid on Vercel. " +
        "Go to Vercel → Settings → Environment Variables → add VITE_GEMINI_API_KEY → Redeploy."
      );
    }
    if (error.message?.includes("JSON")) {
      throw new Error("AI returned invalid JSON. Please retry — this is a temporary model issue.");
    }
    throw error;
  }
}

// For streaming responses (content writing mode)
export async function callGeminiStream(
  prompt: string,
  onChunk: (text: string) => void,
  options: { temperature?: number } = {}
): Promise<void> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const stream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
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
      model: "gemini-2.5-flash",
      contents: "Reply with the word OK only.",
      config: { maxOutputTokens: 10 },
    });
    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}
