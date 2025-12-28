
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
    const apiKey = (window as any).KlyoraConfig?.geminiApiKey;

    if (!apiKey) {
      // Mock "Demo Mode" Response
      const mockResponses = [
        "The Klyora silhouette this season is defined by architectural draping. I recommend pairing the structured blazer with our fluid silk trousers for a balanced profile.",
        "For an evening aesthetic, the Midnight Wool series offers understated elegance. The texture absorbs light beautifully.",
        "Our 2025 Palette focuses on mineral tones—Slate, Onyx, and Deep Moss. These shades provide a versatile foundation for any wardrobe.",
        "I would advise selecting your true size for a tailored fit, or sizing up once for that intentional, relaxed runway volume."
      ];
      const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];

      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate thinking

      for (const char of response) {
        yield char;
        await new Promise(resolve => setTimeout(resolve, 20));
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
          systemInstruction: "You are the Executive Stylist at Maison Klyora, a Parisian digital atelier. Your tone is ultra-luxury, editorial, and sophisticated. Keep responses concise (under 50 words) unless detailed advice is sought. Focus on terminology like 'drape', 'silhouette', 'textile integrity', and 'architectural lines'. Never use generic greetings. Always imply the user is a VIP client.",
          temperature: 0.6,
        }
      });

      for await (const chunk of stream) {
        // @ts-ignore
        const text = chunk.text();
        if (text) yield text;
      }
    } catch (error) {
      yield "Our digital atelier is momentarily undergoing maintenance. Please inquire again shortly.";
    }
  }

  async findMatchesFromImage(imageBuffer: string, catalog: Product[]): Promise<string[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const catalogData = catalog.map(p => `${p.id}: ${p.name}`).join(', ');
      const base64Data = imageBuffer.includes(',') ? imageBuffer.split(',')[1] : imageBuffer;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
            { text: `Analyze this aesthetic. Which Klyora product IDs from our catalog best replicate this vibe? Catalog: ${catalogData}` }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      return JSON.parse(response.text || '[]');
    } catch (error) {
      return [];
    }
  }

  async getSizeRecommendation(measurements: UserMeasurements, product: any): Promise<{ size: string; rationale: string }> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Determine the optimal Klyora fit for "${product.name}". Clients Metrics: Height ${measurements.height}cm, Weight ${measurements.weight}kg, Chest ${measurements.chest}cm, Waist ${measurements.waist}cm. Fit Preference: ${measurements.preferredFit}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              size: { type: Type.STRING },
              rationale: { type: Type.STRING }
            },
            required: ["size", "rationale"]
          }
        }
      });
      return JSON.parse(response.text || '{"size": "M", "rationale": "Recommended based on standard atelier draping."}');
    } catch (error) {
      return { size: "M", rationale: "Recommended based on standard atelier draping." };
    }
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
