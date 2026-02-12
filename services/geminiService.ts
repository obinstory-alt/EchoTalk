
import { GoogleGenAI, Type } from "@google/genai";
import { EvaluationResult } from "../types.ts";

export async function evaluatePronunciation(
  audioBase64: string,
  referenceText: string,
  targetAccuracy: number
): Promise<EvaluationResult> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'audio/webm',
              data: audioBase64
            }
          },
          {
            text: `Evaluate the pronunciation of the provided audio against this text: "${referenceText}".
            Determine accuracy score (0-100), provide a short friendly feedback in Korean, and list mispronounced words.
            Response must be strictly JSON format.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            mispronouncedWords: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["score", "feedback", "mispronouncedWords"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini Evaluation Error:", error);
    return {
      score: 75,
      feedback: "오디오 처리 중 오류가 발생했습니다. 다시 시도해 주세요.",
      mispronouncedWords: []
    };
  }
}
