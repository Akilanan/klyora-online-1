import { GoogleGenerativeAI } from "@google/generative-ai";
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
  // Centralized Helper for API Key
  private _getApiKey(): string | undefined {
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    const windowKey = (window as any).KlyoraConfig?.geminiApiKey;
    return (envKey && envKey.length > 5) ? envKey : windowKey;
  }

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
    const apiKey = this._getApiKey();

    if (!apiKey) {
      console.warn("⚠️ AI Key missing. Using Offline Fallback.");
      const queryLower = currentQuery.toLowerCase();
      let response = "I advise selecting your true size for a tailored fit.";
      if (queryLower.includes('return') || queryLower.includes('refund')) {
        response = "For returns, simply scroll to the footer and select 'Concierge Services'. We offer store credit for all preference-based returns.";
      } else if (queryLower.includes('shipping') || queryLower.includes('track')) {
        response = "Our global logistics partners typically deliver within 7-12 business days. You will receive a tracking code via email upon dispatch.";
      } else if (queryLower.includes('fabric') || queryLower.includes('material')) {
        response = "Maison Klyora prioritizes tactile integrity. We utilize premium blends designed for drape and longevity.";
      } else if (queryLower.includes('size') || queryLower.includes('fit') || queryLower.includes('measure')) {
        response = "Our atelier cuts for a modern silhouette. For a structured look, take your usual size. For a relaxed drape, size up once.";
      } else if (queryLower.includes('hello') || queryLower.includes('hi')) {
        response = "Welcome to Maison Klyora. How may I assist you with your collection curation today?";
      }

      await new Promise(resolve => setTimeout(resolve, 600));

      for (const char of response) {
        yield char;
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: "You are the Executive Stylist at Maison Klyora. Tone: Ultra-luxury, editorial, concise. Use terms like 'drape', 'silhouette', 'architectural'."
      });

      // Sanitize history: The first message must be from 'user'.
      // If the first message is 'model', remove it.
      const sanitizedHistory = history.filter((msg, index) => {
        if (index === 0 && msg.role === 'model') return false;
        return true;
      });

      const chat = model.startChat({
        history: sanitizedHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
      });

      const result = await chat.sendMessageStream(currentQuery);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) yield text;
      }
    } catch (error: any) {
      // Fallback with DEBUG INFO
      const fallback = `Our digital atelier is momentarily undergoing maintenance. (Error: ${error.message || 'Unknown'})`;
      for (const char of fallback) { yield char; }
    }
  }

  async getSizeRecommendation(measurements: UserMeasurements, product: any): Promise<{ size: string; rationale: string }> {
    const apiKey = this._getApiKey();

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            responseMimeType: "application/json"
          }
        });

        const prompt = `Client: ${measurements.height}cm, ${measurements.weight}kg, Fit: ${measurements.preferredFit}. Product: ${product.name}. Return JSON {size, rationale}.`;
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
      } catch (e) {
        console.log("AI Failed, using Algorithm");
      }
    }

    // Algorithm Fallback
    const heightM = measurements.height / 100;
    const bmi = measurements.weight / (heightM * heightM);

    let size = 'M';
    let vibe = 'tailored';

    if (bmi < 18.5) size = 'XS';
    else if (bmi < 21) size = 'S';
    else if (bmi < 25) size = 'M';
    else if (bmi < 28) size = 'L';
    else size = 'XL';

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
      const apiKey = this._getApiKey();
      if (!apiKey) throw new Error("No Key");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(query);
      return {
        text: result.response.text() || "Synthesizing seasonal curation...",
        sources: []
      };
    } catch (error) {
      return { text: "Synthesizing seasonal curation...", sources: [] };
    }
  }

  async generateMockReviews(productName: string): Promise<Review[]> {
    try {
      const apiKey = this._getApiKey();
      if (!apiKey) return [];

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const prompt = `Generate 3 authentic luxury client reviews for "${productName}". Include mentions of drape and texture. Return Array of {id, name, rating, comment, date}`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text);
    } catch (error) {
      return [];
    }
  }

  async enhanceImage(imageUrl: string, productName: string): Promise<string | null> {
    return null; // Simplified for stability
  }

  async virtualTryOn(userPhotoBase64: string, productImageUrl: string, productName: string): Promise<string | null> {
    return null;
  }

  async generateSpinFrames(imageUrl: string, productName: string): Promise<string[]> {
    return [];
  }

  async generateEditorialCaption(productName: string): Promise<string> {
    return `An exploration of silhouette and textile. ${productName} by Maison Klyora.`;
  }
}

export const geminiService = new GeminiService();
