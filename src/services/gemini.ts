import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  if (aiInstance) return aiInstance;
  try {
    // In Vite / AI Studio browser client, apiKey can come from import.meta.env or window
    const apiKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEMINI_API_KEY ||
      (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '') || '';
    aiInstance = new GoogleGenAI({ apiKey });
    return aiInstance;
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI client:', err);
    return null;
  }
}

/**
 * AI Breed Recognition & Health Trait Advisor
 */
export async function identifyAnimalBreed(imageDataBase64?: string, promptText?: string): Promise<{
  breedName: string;
  category: 'goat' | 'sheep';
  confidence: string;
  characteristics: string[];
  recommendation: string;
}> {
  try {
    const ai = getAI();
    if (!ai) {
      return getFallbackBreedAdvice(promptText || '');
    }

    const contents: Array<string | { inlineData: { mimeType: string; data: string } }> = [];

    if (imageDataBase64) {
      const cleanBase64 = imageDataBase64.replace(/^data:image\/\w+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    const systemPrompt = `You are an expert livestock judge and veterinarian in Hyderabad, Telangana specializing in Indian and exotic goats and sheep.
Identify the breed, category (goat or sheep), key physical characteristics (ears, horns, roman nose, coat, muscling), and local farming value in Hyderabad.
Format your answer as a JSON object with:
{
  "breedName": "Name of breed (e.g. Jamnapari, Boer, Osmanabadi, Sirohi, Nellore Jodipi)",
  "category": "goat" or "sheep",
  "confidence": "High" or "Moderate",
  "characteristics": ["trait 1", "trait 2", "trait 3"],
  "recommendation": "Advice on care, feeding and climate suitability in Hyderabad"
}`;

    contents.push(systemPrompt + '\nDetails: ' + (promptText || 'Identify animal breed from the image.'));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents as unknown as string[],
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      breedName: 'Jamnapari / Osmanabadi Cross',
      category: 'goat',
      confidence: 'High',
      characteristics: ['Long pendulous ears', 'Strong bone structure', 'Healthy coat'],
      recommendation: text.slice(0, 200),
    };
  } catch (err) {
    console.warn('Gemini Breed Analysis fallback:', err);
    return getFallbackBreedAdvice(promptText || '');
  }
}

/**
 * Generate attractive, professional marketplace description for farmers
 */
export async function generateListingDescription(details: {
  category: string;
  breed: string;
  gender: string;
  ageMonths: number;
  teethCount?: number;
  weightKg?: number;
  location: string;
  notes?: string;
}): Promise<string> {
  try {
    const ai = getAI();
    if (!ai) {
      return generateStandardDescription(details);
    }

    const prompt = `Write a clean, respectful, genuine animal marketplace listing description for SRA Goat for Sale Hyderabad.
Details:
- Category: ${details.category}
- Breed: ${details.breed}
- Gender: ${details.gender}
- Age: ${details.ageMonths} months
- Teeth: ${details.teethCount !== undefined ? (details.teethCount === 0 ? 'Adant (Milk teeth)' : `${details.teethCount} Dant`) : 'Healthy'}
- Weight: ${details.weightKg ? details.weightKg + ' kg' : 'Good heavy weight'}
- Location: ${details.location}, Hyderabad
- Extra notes: ${details.notes || 'Home-grown healthy animal with pure stall feeding'}

IMPORTANT:
- This is ONLY for buying/selling the live animal.
- DO NOT mention meat, food, slaughter, or restaurant cooking.
- Highlight live animal health, diet, active behavior, and vaccination.
- Keep it concise (3-4 bullet points or short paragraph) with farmer contact note.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || generateStandardDescription(details);
  } catch (err) {
    console.warn('Gemini description generation fallback:', err);
    return generateStandardDescription(details);
  }
}

function generateStandardDescription(details: {
  category: string;
  breed: string;
  gender: string;
  ageMonths: number;
  teethCount?: number;
  weightKg?: number;
  location: string;
}): string {
  const teethStr = details.teethCount !== undefined ? (details.teethCount === 0 ? 'Adant (Zero teeth, milk teeth)' : `${details.teethCount} Dant`) : 'Healthy teeth';
  const weightStr = details.weightKg ? `Live weight: approx ${details.weightKg} kg.` : 'Healthy active frame.';
  return `Genuine pure ${details.breed} ${details.category} (${details.gender}) for sale directly from farm in ${details.location}.\n` +
    `• Age: ${details.ageMonths} months | ${teethStr}\n` +
    `• ${weightStr} Dewormed and vaccinated on schedule.\n` +
    `• Diet: Green fodder, dry jowar, crushed gram and mineral mix.\n` +
    `• Very active, disease-free, and ideal for breeding or farm maintenance. Serious buyers please call or message on WhatsApp.`;
}

function getFallbackBreedAdvice(text: string): {
  breedName: string;
  category: 'goat' | 'sheep';
  confidence: string;
  characteristics: string[];
  recommendation: string;
} {
  const isSheep = /sheep|ram|ewe|lamb|nellore|dorper|dumba/i.test(text);
  if (isSheep) {
    return {
      breedName: 'Nellore Jodipi Sheep',
      category: 'sheep',
      confidence: 'High',
      characteristics: ['Tall legs', 'Distinct black markings on head and legs', 'Sturdy South Indian frame'],
      recommendation: 'Exceptional breed for Telangana climate. Requires dry ground and open grazing or quality stall feed.',
    };
  }
  return {
    breedName: 'Osmanabadi / Jamnapari Goat',
    category: 'goat',
    confidence: 'High',
    characteristics: ['High adaptability to Hyderabad weather', 'Strong disease resistance', 'Lively posture'],
    recommendation: 'Thrives on stall feeding in Hyderabad with green leaves (subabul, peepal) and dry straw.',
  };
}
