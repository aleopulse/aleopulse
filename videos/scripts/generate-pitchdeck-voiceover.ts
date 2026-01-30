import "dotenv/config";
import { generateVoiceover } from "../src/lib/elevenlabs";
import * as path from "path";

// Full voiceover script for the pitch deck (~2:30 runtime)
const PITCHDECK_SCRIPT = `
Ninety-four percent of consumers say they won't buy from companies that don't protect their data. Yet every day, billions of survey responses are collected with a promise of anonymity that platforms simply cannot keep. LeoPulse changes that.

The problem runs deep. Traditional survey platforms promise anonymity but store your IP address and digital fingerprint. Twenty-six percent of employees fear retaliation from so-called anonymous workplace surveys. And after data breaches, more than half of consumers simply walk away. In 2024 alone, regulators imposed two-point-one billion dollars in privacy fines. The trust is broken.

The opportunity is massive. The survey software market is worth over four billion dollars today, growing to twelve billion by twenty-thirty-two. Privacy-focused enterprise tools are surging thirty-seven percent year over year. And the decentralized governance market? It's projected to grow from three hundred fifty million to nearly eight billion by twenty-thirty-five. LeoPulse sits at the intersection of these converging markets.

LeoPulse is the first survey platform where anonymity isn't just promised—it's mathematically proven. Built on Aleo's zero-knowledge technology, we guarantee that your vote can never be traced back to you. Results are verified on-chain, making manipulation impossible. With three privacy modes and PULSE token incentives, we've built the trust layer that data collection has been missing.

Here's how it works. When you vote, a zero-knowledge proof is generated on your device. This proof is verified on Aleo's blockchain, confirming three things: you're eligible, your vote is valid, and you haven't voted before. Critically, none of this reveals who you are or how you voted. The math guarantees it.

We're not just planning—we're building. LeoPulse is live on Aleo testnet with all three privacy modes, private poll invitations, and wallet integration complete. Our roadmap: PULSE token launch in Q1, enterprise features in Q2, and scaling with mobile and partnerships through the rest of twenty-twenty-six. We're building on Aleo—a blockchain backed by two hundred twenty-eight million dollars with the fastest-growing developer ecosystem in privacy tech.

Privacy matters. Data integrity matters. Trust matters. LeoPulse delivers all three—with cryptographic guarantees. Join us in building the future of honest feedback. Visit leopulse.io. LeoPulse: where your voice is heard, but your identity isn't.
`.trim();

// Voice options - Adam is recommended for authoritative pitch
const VOICE_OPTIONS = {
  adam: { voiceId: "pNInz6obpgDQGcFmaJgB", stability: 0.6, similarityBoost: 0.8 },
  antoni: { voiceId: "ErXwobaYiN019PkySvjV", stability: 0.5, similarityBoost: 0.75 },
  josh: { voiceId: "TxGEqnHWrfWFTfGW9XjX", stability: 0.55, similarityBoost: 0.8 },
};

async function main() {
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error("Error: ELEVENLABS_API_KEY environment variable is required");
    console.log("\nUsage:");
    console.log("  ELEVENLABS_API_KEY=your_key npx tsx scripts/generate-pitchdeck-voiceover.ts");
    process.exit(1);
  }

  const voice = VOICE_OPTIONS.adam;
  const outputPath = path.join(__dirname, "../public/audio/pitchdeck.mp3");

  console.log("Generating pitch deck voiceover...");
  console.log(`Script length: ${PITCHDECK_SCRIPT.length} characters`);
  console.log(`Voice: Adam (authoritative)`);
  console.log(`Estimated duration: ~150 seconds\n`);

  await generateVoiceover(PITCHDECK_SCRIPT, outputPath, {
    voiceId: voice.voiceId,
    stability: voice.stability,
    similarityBoost: voice.similarityBoost,
    modelId: "eleven_multilingual_v2",
  });

  console.log(`\nVoiceover saved to: ${outputPath}`);
}

main().catch(console.error);
