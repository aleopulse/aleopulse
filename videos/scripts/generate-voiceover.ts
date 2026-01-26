import "dotenv/config";
import { generateVoiceover, listVoices } from "../src/lib/elevenlabs";
import * as path from "path";

// Demo script - edit this to change the voiceover content
const DEMO_SCRIPT = {
  intro: "Introducing LeoPulse - privacy-preserving polls and surveys on Aleo.",
  problem:
    "Traditional surveys expose your identity. Your votes, opinions, and responses are never truly private.",
  solution:
    "LeoPulse uses zero-knowledge proofs to verify your participation without revealing your identity or your choices.",
  features:
    "Create polls with flexible privacy modes. Anonymous voting ensures complete privacy. Semi-private mode reveals participation but hides choices. Identified mode provides full transparency when needed.",
  cta: "Start creating private polls today. Visit LeoPulse to experience true voting privacy.",
};

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === "--list-voices") {
    const voices = await listVoices();
    console.log("\nAvailable voices:");
    voices.forEach((voice) => {
      console.log(`  ${voice.voiceId}: ${voice.name}`);
    });
    return;
  }

  const audioDir = path.join(__dirname, "../src/audio");

  console.log("Generating voiceovers...\n");

  // Generate each section
  for (const [section, text] of Object.entries(DEMO_SCRIPT)) {
    const outputPath = path.join(audioDir, `${section}.mp3`);
    await generateVoiceover(text, outputPath);
  }

  // Generate full combined voiceover
  const fullScript = Object.values(DEMO_SCRIPT).join(" ");
  await generateVoiceover(fullScript, path.join(audioDir, "full-demo.mp3"));

  console.log("\nDone! Audio files saved to src/audio/");
}

main().catch(console.error);
