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
  voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel - default voice
  modelId: "eleven_multilingual_v2",
  stability: 0.5,
  similarityBoost: 0.75,
};

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
  console.log(`Generated voiceover: ${outputPath}`);

  return outputPath;
}

export async function listVoices() {
  const voices = await client.voices.getAll();
  return voices.voices;
}
