import { GoogleGenAI } from "@google/genai";

console.log("Testing GoogleGenAI import");
try {
  const ai = new GoogleGenAI({ apiKey: "DUMMY_KEY_JUST_TESTING" });
  console.log("Instantiation succeeded", ai);
} catch (e) {
  console.error("Instantiation failed", e);
}
