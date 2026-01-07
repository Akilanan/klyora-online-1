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

  // Helper for Offline/Fallback Responses
  private async * _getOfflineResponse(currentQuery: string) {
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
  }

  async *getStylistResponseStream(history: ChatMessage[], currentQuery: string) {
    // Legacy method redirection for backward compatibility if needed, 
    // but we will primarily use chatWithCatalog now.
    yield* this.chatWithCatalog(history, currentQuery, []);
  }

  async *chatWithCatalog(history: ChatMessage[], currentQuery: string, products: any[]) {
    const apiKey = this._getApiKey();

    if (!apiKey) {
      console.warn("⚠️ AI Key missing. Using Offline Fallback.");
      yield* this._getOfflineResponse(currentQuery);
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);

      // Create a simplified product context string
      // Limit to 20 products to avoid token limits, prioritized by "Newest" or "Featured" effectively
      const productContext = products.slice(0, 20).map(p =>
        `- ${p.name} ($${p.price}): ${p.style || 'Luxury'} style. ${p.description?.slice(0, 50)}...`
      ).join('\n');

      const systemInstruction = `
        You are "Elianne", the Executive Stylist at Maison Klyora (Ultra-Luxury, Old Money Aesthetic).
        
        Your Goal: Curate outfits and advice using ONLY the provided Catalog context.
        Tone: Haughty but helpful, editorial, concise, "Vogue Editor-in-Chief".
        
        Catalog Context:
        ${productContext}
        
        Rules:
        1. If asked for recommendations, suggest specific items from the Catalog.
        2. If asked about shipping/returns, be brief and professional (7-12 days shipping).
        3. Never break character. You are not an AI, you are a Parisian stylist.
      `;

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction
      });

      // Sanitize history
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
      console.error("⚠️ AI Error, switching to Offline Mode:", error);
      yield* this._getOfflineResponse(currentQuery);
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

    if (measurements.preferredFit === 'Oversized') {
      if (size === 'XS') size = 'S';
      else if (size === 'S') size = 'M';
      else if (size === 'M') size = 'L';
      else if (size === 'L') size = 'XL';
      vibe = 'relaxed';
    } else if (measurements.preferredFit === 'Slim') {
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
    const STORAGE_KEY = `klyora_reviews_${productName.replace(/\s+/g, '_')}`;

    // 1. Check Persistence
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { console.warn("Review Cache Error", e); }

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
      const reviews = JSON.parse(text);

      // 2. Save Persistence
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
      return reviews;

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
  async categorizeProducts(products: { id: string; title: string }[]): Promise<Record<string, string[]>> {
    const apiKey = this._getApiKey();
    if (!apiKey) return {};

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      // Batch process to avoid token limits (max 50 at a time if needed, but 200 titles fit in context)
      const simplifiedList = products.map(p => ({ id: p.id, title: p.title }));

      const prompt = `
        You are a luxury fashion curator. Categorize these products into 5 distinct "Old Money" aesthetic collections.
        Collections:
        1. "The Estate" (Outerwear, heavy knits, country style)
        2. "Evening" (Dresses, formal wear, silk)
        3. "Leisure" (Casual, lounge, cotton)
        4. "Atelier" (Tailored, office, structure)
        5. "Essentials" (Basics, accessories, other)

        Return strictly a JSON object where keys are the Collection Names (exact) and values are Arrays of Product IDs.
        Example: { "The Estate": ["id1", "id2"], "Evening": ["id3"] }

        Products: ${JSON.stringify(simplifiedList)}
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text);
    } catch (error) {
      console.warn("AI Categorization failed:", error);
      return {};
    }
  }

  /**
   * AI Styling: Accepts a product and the full catalog, returns a complete look.
   */
  async styleProduct(mainProduct: Product, catalog: Product[]): Promise<{ main: Product, secondary: Product, accessory: Product | null, rationale: string } | null> {
    const apiKey = this._getApiKey();
    if (!apiKey) return null;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      // Simplified catalog context (id, name, type) to save tokens
      const catalogContext = catalog.map(p => ({ id: p.id, name: p.name, category: p.category }));

      const prompt = `
        You are a luxury stylist.
        Main Item: ${mainProduct.name} (${mainProduct.category}).
        Task: Select matching items from the Catalog to create a "Old Money" outfit.
        Catalog: ${JSON.stringify(catalogContext)}

        Return JSON:
        {
          "secondaryId": "id of pants/skirt/outerwear",
          "accessoryId": "id of bag/shoes/jewelry (optional)",
          "rationale": "One sentence poetic explanation of the pairing."
        }
      `;

      const result = await model.generateContent(prompt);
      const data = JSON.parse(result.response.text());

      const secondary = catalog.find(p => p.id === data.secondaryId);
      const accessory = catalog.find(p => p.id === data.accessoryId) || null;

      if (!secondary) return null;

      return {
        main: mainProduct,
        secondary,
        accessory,
        rationale: data.rationale
      };

    } catch (e) {
      console.warn("AI Styling failed", e);
      return null;
    }
  }

  /**
   * AI Visual Search: Matches uploaded image to catalog products.
   */
  async findVisualMatch(imageBase64: string, catalog: Product[]): Promise<string[]> {
    const apiKey = this._getApiKey();
    if (!apiKey) return [];

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      // Context
      const catalogContext = catalog.map(p => ({ id: p.id, name: p.name, desc: p.description }));

      const prompt = `
        Task: Analyze the image and find the visually similar products from the Catalog.
        Catalog: ${JSON.stringify(catalogContext)}
        
        Return JSON: { "matchedIds": ["id1", "id2"] }
      `;

      const result = await model.generateContent([
        prompt,
        { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
      ]);
      const data = JSON.parse(result.response.text());
      return data.matchedIds || [];

    } catch (e) {
      console.warn("Visual search failed", e);
      return [];
    }
  }
  /**
   * AI Semantic Search: Find products based on "vibe" or description.
   */
  async semanticSearch(query: string, products: Product[]): Promise<Product[]> {
    const apiKey = this._getApiKey();
    if (!apiKey) return [];

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      // Context: Light version to save tokens
      const productList = products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        desc: p.description
      }));

      const prompt = `
        You are a luxury concierge.
        User Query: "${query}"
        Task: Select products from the Catalog that match the INTENT or VIBE of the query.
        Catalog: ${JSON.stringify(productList)}
        
        Rules:
        - If query is "summer wedding", find dresses/silk.
        - If query is "winter coat", find wool/outerwear.
        - Be smart. "Dark academia" -> Tweed/Wool.
        
        Return JSON: { "productIds": ["id1", "id2"] }
      `;

      const result = await model.generateContent(prompt);
      const data = JSON.parse(result.response.text());

      const matchedIds = data.productIds || [];
      return products.filter(p => matchedIds.includes(p.id));

    } catch (e) {
      console.warn("Semantic Fallback", e);
      return [];
    }
  }
}

export const geminiService = new GeminiService();
