
import { GoogleGenAI, Type } from "@google/genai";
import { UserMeasurements, Product } from "../types";

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// Added missing interfaces to resolve the import error in ChromaPaletteModal.tsx
export interface ChromaColor {
  hex: string;
  name: string;
  usage: string;
}

export interface ChromaPalette {
  colors: ChromaColor[];
  moodRationale: string;
}

export class GeminiService {
  private async urlToBase64(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      return null;
    }
  }

  async *getStylistResponseStream(history: ChatMessage[], currentQuery: string) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (window as any).KlyoraConfig?.geminiApiKey;

    if (!apiKey) {
      // Robust Local "AI" Simulation
      const queryLower = currentQuery.toLowerCase();
      let response = "I advise selecting your true size for a tailored fit.";

      if (queryLower.includes('return') || queryLower.includes('refund')) {
        response = "For returns, simply scroll to the footer and select 'Concierge Services'. We offer store credit for all preference-based returns.";
      } else if (queryLower.includes('shipping') || queryLower.includes('track')) {
        response = "Our global logistics partners typically deliver within 7-12 business days. You will receive a tracking code via email upon dispatch.";
      } else if (queryLower.includes('fabric') || queryLower.includes('material')) {
        response = "Maison Klyora prioritizes tactile integrity. We utilize premium blends designed for drape and longevity.";
      } else if (queryLower.includes('size') || queryLower.includes('fit')) {
        response = "Our atelier cuts for a modern silhouette. For a structured look, take your usual size. For a relaxed drape, size up once.";
      }

      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate thinking

      for (const char of response) {
        yield char;
        await new Promise(resolve => setTimeout(resolve, 15));
      }
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const stream = await ai.models.generateContentStream({
        model: 'gemini-1.5-flash',
        contents: [
          ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: currentQuery }] }
        ],
        config: {
          systemInstruction: "You are the Executive Stylist at Maison Klyora. Tone: Ultra-luxury, editorial, concise. Use terms like 'drape', 'silhouette', 'architectural'.",
          temperature: 0.6,
        }
      });

      for await (const chunk of stream) {
        // @ts-ignore
        const text = chunk.text();
        if (text) yield text;
      }
    } catch (error) {
      // Fallback if API fails
      const fallback = "Our digital atelier is momentarily undergoing maintenance. I recommend checking our Size Guide for immediate assistance.";
      for (const char of fallback) { yield char; }
    }
  }

  async getSizeRecommendation(measurements: UserMeasurements, product: any): Promise<{ size: string; rationale: string }> {
    // 1. Try Real AI first
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (window as any).KlyoraConfig?.geminiApiKey;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: `Client: ${measurements.height}cm, ${measurements.weight}kg, Fit: ${measurements.preferredFit}. Product: ${product.name}. Return JSON {size, rationale}.`,
          config: { responseMimeType: "application/json" } // Force JSON
        });
        return JSON.parse(response.text());
      } catch (e) {
        console.log("AI Failed, using Algorithm");
      }
    }

    // 2. Robust Algorithm Fallback (No API Required)
    // "Klyora Index" = Weight (kg) / Height (m) (Approximation of mass distribution)
    const heightM = measurements.height / 100;
    const bmi = measurements.weight / (heightM * heightM);

    let size = 'M';
    let vibe = 'tailored';

    if (bmi < 18.5) size = 'XS';
    else if (bmi < 21) size = 'S';
    else if (bmi < 25) size = 'M';
    else if (bmi < 28) size = 'L';
    else size = 'XL';

    // Adjustment for Preference
    if (measurements.preferredFit === 'loose') {
      if (size === 'XS') size = 'S';
      else if (size === 'S') size = 'M';
      else if (size === 'M') size = 'L';
      else if (size === 'L') size = 'XL';
      vibe = 'relaxed';
    } else if (measurements.preferredFit === 'tight') {
      if (size === 'XL') size = 'L';
      else if (size === 'L') size = 'M';
      else if (size === 'M') size = 'S';
      else if (size === 'S') size = 'XS';
      vibe = 'sculpted';
    }

    return {
      size,
      rationale: `Based on your biometrics (${measurements.height}cm / ${measurements.weight}kg), a size ${size} provides the optimal ${vibe} silhouette for this design.`
    };
  }

  async getStyleRecommendations(query: string): Promise<{ text: string, sources: any[] }> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: query,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      return {
        text: response.text || "Synthesizing seasonal curation...",
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };
    } catch (error) {
      return { text: "Synthesizing seasonal curation...", sources: [] };
    }
  }

  async generateMockReviews(productName: string): Promise<Review[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate 3 authentic luxury client reviews for "${productName}". Include mentions of drape and texture.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                rating: { type: Type.NUMBER },
                comment: { type: Type.STRING },
                date: { type: Type.STRING }
              },
              required: ["id", "name", "rating", "comment", "date"]
            }
          }
        }
      });
      return JSON.parse(response.text || '[]');
    } catch (error) {
      return [];
    }
  }

  async enhanceImage(imageUrl: string, productName: string): Promise<string | null> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = await this.urlToBase64(imageUrl);
      if (!base64Data) return null;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
            { text: `Enhance this asset for "${productName}" to Maison Klyora editorial standards. Focus on textile clarity and ambient studio lighting.` }
          ]
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async virtualTryOn(userPhotoBase64: string, productImageUrl: string, productName: string): Promise<string | null> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const productBase64 = await this.urlToBase64(productImageUrl);
      if (!productBase64) return null;

      const userBase64Clean = userPhotoBase64.includes(',') ? userPhotoBase64.split(',')[1] : userPhotoBase64;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: userBase64Clean, mimeType: 'image/jpeg' } },
            { inlineData: { data: productBase64, mimeType: 'image/jpeg' } },
            { text: `Drape the "${productName}" from the second image onto the silhouette in the first image. Maintain natural textile behavior and lighting.` }
          ]
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async generateSpinFrames(imageUrl: string, productName: string): Promise<string[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = await this.urlToBase64(imageUrl);
      if (!base64Data) return [];

      const frames: string[] = [];
      const angles = ['front view', 'side profile', 'reverse view', 'alternate profile'];

      for (const angle of angles) {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
              { text: `Construct an architectural studio render of "${productName}" from the ${angle}. Match the existing environment exactly.` }
            ]
          },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            frames.push(`data:image/png;base64,${part.inlineData.data}`);
            break;
          }
        }
      }
      return frames;
    } catch (error) {
      return [];
    }
  }

  async generateEditorialCaption(productName: string): Promise<string> {
    return `An exploration of silhouette and textile. ${productName} by Maison Klyora.`;
  }
}

export const geminiService = new GeminiService();
