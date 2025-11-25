import { GoogleGenAI, Type } from "@google/genai";
import { CommandFormData } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateCommandFromDescription = async (prompt: string): Promise<CommandFormData> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const model = "gemini-2.5-flash";
  const systemInstruction = `
    You are a command-line expert. Your task is to generate a structured shell command object based on a natural language request.
    The user will describe what they want to do (e.g., "Find all files larger than 100MB").
    You must return a valid JSON object.
    
    Rules:
    1. The 'template' field should use {{variable_name}} syntax for parts that the user likely needs to change (e.g., file paths, IPs, names).
    2. Be concise but descriptive.
    3. Categorize intelligently (e.g., Git, Docker, System, Network, Kubernetes).
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A short, catchy title for the command" },
            template: { type: Type.STRING, description: "The command string with {{placeholders}}" },
            description: { type: Type.STRING, description: "Explanation of what the command does" },
            category: { type: Type.STRING, description: "General category like Git, Docker, System" },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of searchable tags" 
            }
          },
          required: ["title", "template", "description", "category", "tags"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CommandFormData;
    }
    
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Error generating command:", error);
    throw error;
  }
};