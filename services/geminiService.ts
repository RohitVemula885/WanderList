
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiSuggestion } from "../types";

export const getTravelInsights = async (location: string, title: string): Promise<GeminiSuggestion> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Provide travel insights for ${title} in ${location}. Include a brief engaging description, 3 top activities, and the best time to visit.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          topActivities: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          bestTimeToVisit: { type: Type.STRING }
        },
        required: ['description', 'topActivities', 'bestTimeToVisit']
      }
    }
  });

  return JSON.parse(response.text);
};
