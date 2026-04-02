import { GoogleGenAI } from '@google/genai'; const ai = new GoogleGenAI({ apiKey: 'a' }); ai.models.generateContent({ model: 'gemini-2.0-flash', contents: 'hi' }).catch(console.error);  
