import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import * as fs from "fs";
import * as path from "path";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export interface VoiceoverOptions {
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

const DEFAULT_OPTIONS: VoiceoverOptions = {
  voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel - good for professional narration
  modelId: "eleven_multilingual_v2",
  stability: 0.5,
  similarityBoost: 0.75,
};

/**
 * Generate voiceover audio from text using ElevenLabs
 */
export async function generateVoiceover(
  text: string,
  outputPath: string,
  options: VoiceoverOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const audio = await client.textToSpeech.convert(opts.voiceId!, {
    text,
    modelId: opts.modelId,
    voiceSettings: {
      stability: opts.stability,
      similarityBoost: opts.similarityBoost,
    },
  });

  // Convert ReadableStream to Buffer
  const reader = audio.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const buffer = Buffer.concat(chunks);
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated: ${outputPath}`);

  return outputPath;
}

/**
 * List all available voices
 */
export async function listVoices() {
  const voices = await client.voices.getAll();
  return voices.voices;
}

/**
 * Common voice IDs for reference
 */
export const VOICE_IDS = {
  rachel: "21m00Tcm4TlvDq8ikWAM", // Female, professional
  bella: "EXAVITQu4vr4xnSDxMaL", // Female, friendly
  antoni: "ErXwobaYiN019PkySvjV", // Male, deep
  elli: "MF3mGyEYCl7XYWbV9V6O", // Female, youthful
  josh: "TxGEqnHWrfWFTfGW9XjX", // Male, casual
  arnold: "VR6AewLTigWG4xSOukaG", // Male, deep
  adam: "pNInz6obpgDQGcFmaJgB", // Male, neutral
  sam: "yoZ06aMxZJJ28mfd3POQ", // Male, energetic
};
