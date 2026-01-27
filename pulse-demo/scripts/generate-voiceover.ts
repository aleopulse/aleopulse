import "dotenv/config";
import { generateVoiceover, listVoices } from "../src/lib/elevenlabs";
import * as path from "path";
import * as fs from "fs";

/**
 * Demo script - edit this to change the voiceover content
 * This should match the scenes in your DemoVideo.tsx
 */
const DEMO_SCRIPT = {
  intro: "Introducing LeoPulse - decentralized, privacy-preserving polls on Aleo.",
  problem:
    "Traditional surveys expose your identity. Your votes and opinions are never truly private.",
  solution:
    "LeoPulse uses zero-knowledge proofs to verify participation without revealing your identity or choices.",
  privacy:
    "Choose from three privacy modes. Anonymous keeps everything private. Semi-private reveals participation but hides your vote. Identified provides full transparency when needed.",
  incentives:
    "Incentivize participation with PULSE and USDC token rewards. Create polls, collect insights, and reward your community.",
  cta: "Start creating private polls today. Visit aleopulse.onrender.com",
};

/**
 * Parse script file to extract VO lines
 */
function parseScript(scriptPath: string): Record<string, string> {
  const content = fs.readFileSync(scriptPath, "utf-8");
  const scenes: Record<string, string> = {};

  const sceneRegex = /## Scene \d+: (\w+).*?\n\*\*VO:\*\* "([^"]+)"/g;
  let match;

  while ((match = sceneRegex.exec(content)) !== null) {
    const sceneName = match[1].toLowerCase();
    const voText = match[2];
    scenes[sceneName] = voText;
  }

  return scenes;
}

async function main() {
  const args = process.argv.slice(2);

  // List voices mode
  if (args[0] === "--list-voices") {
    const voices = await listVoices();
    console.log("\nAvailable voices:");
    voices.forEach((voice) => {
      console.log(`  ${voice.voiceId}: ${voice.name}`);
    });
    return;
  }

  // Check for API key
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error("Error: ELEVENLABS_API_KEY environment variable not set");
    console.error("Set it with: export ELEVENLABS_API_KEY=your_key_here");
    process.exit(1);
  }

  const audioDir = path.join(__dirname, "../public/audio");

  // Try to parse from script file first
  const scriptPath = path.join(__dirname, "demo-script.md");
  let script = DEMO_SCRIPT;

  if (fs.existsSync(scriptPath)) {
    const parsedScript = parseScript(scriptPath);
    if (Object.keys(parsedScript).length > 0) {
      console.log(`Parsed script from ${scriptPath}`);
      script = parsedScript as typeof DEMO_SCRIPT;
    }
  } else {
    console.log("No demo-script.md found, using embedded script");
  }

  console.log("\nGenerating voiceovers...\n");

  // Generate each section
  for (const [section, text] of Object.entries(script)) {
    const outputPath = path.join(audioDir, `${section}.mp3`);
    await generateVoiceover(text, outputPath);
  }

  // Generate full combined voiceover
  const fullScript = Object.values(script).join(" ");
  await generateVoiceover(fullScript, path.join(audioDir, "full-demo.mp3"));

  console.log("\nDone! Audio files saved to public/audio/");
}

main().catch(console.error);
