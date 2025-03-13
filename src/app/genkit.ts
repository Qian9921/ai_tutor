"use server";

import { gemini20FlashExp, googleAI } from "@genkit-ai/googleai";
import { genkit, z } from "genkit";
import { DIAGNOSIS_PROMPT } from "./prompt"; // Import prompt dari file terpisah

// Configure environment for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

console.log('Starting AI configuration...');

const ai = genkit({
  plugins: [googleAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
  })],
  model: gemini20FlashExp,
});

console.log('AI configured with proxy');

export const SuggestionFlow = ai.defineFlow(
  {
    name: "diagnosisAssistantFlow",
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (inputDescription) => {
    try {
      console.log('Generating suggestion for:', inputDescription);
      const { text } = await ai.generate({
        model: gemini20FlashExp,
        prompt: `
          ${DIAGNOSIS_PROMPT}
          
          ${inputDescription}
        `,
      });
      console.log('Generated text:', text);
      return text;
    } catch (error) {
      console.error('Error in SuggestionFlow:', error);
      throw error;
    }
  }
);
