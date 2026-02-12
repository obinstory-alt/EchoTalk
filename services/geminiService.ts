
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { EvaluationResult } from "../types.ts";

// Helper for base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function evaluatePronunciation(
  audioBase64: string,
  referenceText: string,
  targetAccuracy: number,
  mimeType: string = 'audio/webm'
): Promise<EvaluationResult> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: audioBase64
              }
            },
            {
              text: `Evaluate the pronunciation of the provided audio against this reference text: "${referenceText}".
              Compare how the user spoke compared to the standard pronunciation.
              Determine an accuracy score (0-100), where ${targetAccuracy} is the passing bar.
              Provide a short, encouraging feedback in Korean (1-2 sentences).
              Identify any words that were clearly mispronounced.
              Output format: JSON only.`
            }
          ]
        }
      ],
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

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI");
    return JSON.parse(resultText.trim());
  } catch (error) {
    console.error("Gemini Evaluation Error:", error);
    return {
      score: 0,
      feedback: "오디오 인식에 실패했습니다. 마이크 권한을 확인하고 조용한 곳에서 다시 녹음해 주세요.",
      mispronouncedWords: []
    };
  }
}

export async function getGeminiSpeech(text: string): Promise<string | undefined> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this naturally: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' }, // Clear American male voice
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return undefined;
  }
}

export async function decodeAudioData(
  base64Data: string,
  audioContext: AudioContext
): Promise<AudioBuffer> {
  const bytes = base64ToUint8Array(base64Data);
  // Gemini TTS returns raw 16-bit PCM at 24kHz.
  // We need to ensure the buffer is correctly interpreted as Int16.
  const dataInt16 = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
  const frameCount = dataInt16.length;
  const buffer = audioContext.createBuffer(1, frameCount, 24000);
  const channelData = buffer.getChannelData(0);
  
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}
