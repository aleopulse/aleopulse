import "dotenv/config";
import { generateVoiceover, listVoices } from "../src/lib/elevenlabs";
import * as path from "path";

// Demo script - Poll lifecycle walkthrough
const DEMO_SCRIPT = {
  intro: "Welcome to LeoPulse - privacy-preserving polls on Aleo.",
  createPoll:
    "Start by creating a poll. Choose your privacy mode, set your options, and define participation rules.",
  fundPoll:
    "Fund your poll with token rewards to incentivize participation. Set fixed rewards per vote or split a pool among all voters.",
  submitResponse:
    "Participants submit their votes privately using zero-knowledge proofs. Their identity and choices remain protected.",
  claimingPhase:
    "When voting ends, the poll creator transitions the poll to the claiming phase, allowing participants to collect their rewards.",
  claimRewards: "Participants claim their earned tokens directly to their wallet.",
  finalize:
    "Finally, the creator finalizes the poll, closing it permanently and making results available. Try LeoPulse today.",
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

  const audioDir = path.join(__dirname, "../public/audio");

  console.log("Generating voiceovers...\n");

  // Generate each section
  for (const [section, text] of Object.entries(DEMO_SCRIPT)) {
    const outputPath = path.join(audioDir, `${section}.mp3`);
    await generateVoiceover(text, outputPath);
  }

  // Generate full combined voiceover
  const fullScript = Object.values(DEMO_SCRIPT).join(" ");
  await generateVoiceover(fullScript, path.join(audioDir, "full-demo.mp3"));

  console.log("\nDone! Audio files saved to public/audio/");
}

main().catch(console.error);
