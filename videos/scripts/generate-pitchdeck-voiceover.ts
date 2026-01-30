/**
 * LeoPulse Pitch Deck Voiceover Generator
 *
 * Usage:
 *   ELEVENLABS_API_KEY=your_key npx tsx scripts/generate-pitchdeck-voiceover.ts
 *
 * This script generates the voiceover audio for the 7-slide pitch deck.
 * Total duration: ~2:30 (150 seconds)
 */

import { config } from "dotenv";
import { generateVoiceover } from "../src/lib/elevenlabs";
import * as path from "path";

config();

// Full voiceover script for the pitch deck
// Designed for ~150 seconds total runtime
const PITCHDECK_SCRIPT = `
Ninety-four percent of consumers say they won't buy from companies that don't protect their data. Yet every day, billions of survey responses are collected with a promise of anonymity that platforms simply cannot keep. LeoPulse changes that.

The problem runs deep. Traditional survey platforms promise anonymity but store your IP address and digital fingerprint. Twenty-six percent of employees fear retaliation from so-called anonymous workplace surveys. And after data breaches, more than half of consumers simply walk away. In 2024 alone, regulators imposed two-point-one billion dollars in privacy fines. The trust is broken.

The opportunity is massive. The survey software market is worth over four billion dollars today, growing to twelve billion by twenty-thirty-two. Privacy-focused enterprise tools are surging thirty-seven percent year over year. And the decentralized governance market? It's projected to grow from three hundred fifty million to nearly eight billion by twenty-thirty-five. LeoPulse sits at the intersection of these converging markets.

LeoPulse is the first survey platform where anonymity isn't just promised—it's mathematically proven. Built on Aleo's zero-knowledge technology, we guarantee that your vote can never be traced back to you. Results are verified on-chain, making manipulation impossible. With three privacy modes and PULSE token incentives, we've built the trust layer that data collection has been missing.

Here's how it works. When you vote, a zero-knowledge proof is generated on your device. This proof is verified on Aleo's blockchain, confirming three things: you're eligible, your vote is valid, and you haven't voted before. Critically, none of this reveals who you are or how you voted. The math guarantees it.

We're not just planning—we're building. LeoPulse is live on Aleo testnet with all three privacy modes, private poll invitations, and wallet integration complete. Our roadmap: PULSE token launch in Q1, enterprise features in Q2, and scaling with mobile and partnerships through the rest of twenty-twenty-six. We're building on Aleo—a blockchain backed by two hundred twenty-eight million dollars with the fastest-growing developer ecosystem in privacy tech.

Privacy matters. Data integrity matters. Trust matters. LeoPulse delivers all three—with cryptographic guarantees. Join us in building the future of honest feedback. Visit leopulse.io. LeoPulse: where your voice is heard, but your identity isn't.
`.trim();

// Individual slide scripts for more granular control
const SLIDE_SCRIPTS = {
  slide1_title: `Ninety-four percent of consumers say they won't buy from companies that don't protect their data. Yet every day, billions of survey responses are collected with a promise of anonymity that platforms simply cannot keep. LeoPulse changes that.`,

  slide2_problem: `The problem runs deep. Traditional survey platforms promise anonymity but store your IP address and digital fingerprint. Twenty-six percent of employees fear retaliation from so-called anonymous workplace surveys. And after data breaches, more than half of consumers simply walk away. In 2024 alone, regulators imposed two-point-one billion dollars in privacy fines. The trust is broken.`,

  slide3_market: `The opportunity is massive. The survey software market is worth over four billion dollars today, growing to twelve billion by twenty-thirty-two. Privacy-focused enterprise tools are surging thirty-seven percent year over year. And the decentralized governance market? It's projected to grow from three hundred fifty million to nearly eight billion by twenty-thirty-five. LeoPulse sits at the intersection of these converging markets.`,

  slide4_solution: `LeoPulse is the first survey platform where anonymity isn't just promised—it's mathematically proven. Built on Aleo's zero-knowledge technology, we guarantee that your vote can never be traced back to you. Results are verified on-chain, making manipulation impossible. With three privacy modes and PULSE token incentives, we've built the trust layer that data collection has been missing.`,

  slide5_howItWorks: `Here's how it works. When you vote, a zero-knowledge proof is generated on your device. This proof is verified on Aleo's blockchain, confirming three things: you're eligible, your vote is valid, and you haven't voted before. Critically, none of this reveals who you are or how you voted. The math guarantees it.`,

  slide6_traction: `We're not just planning—we're building. LeoPulse is live on Aleo testnet with all three privacy modes, private poll invitations, and wallet integration complete. Our roadmap: PULSE token launch in Q1, enterprise features in Q2, and scaling with mobile and partnerships through the rest of twenty-twenty-six. We're building on Aleo—a blockchain backed by two hundred twenty-eight million dollars with the fastest-growing developer ecosystem in privacy tech.`,

  slide7_cta: `Privacy matters. Data integrity matters. Trust matters. LeoPulse delivers all three—with cryptographic guarantees. Join us in building the future of honest feedback. Visit leopulse.io. LeoPulse: where your voice is heard, but your identity isn't.`,
};

// Voice options for different tones
const VOICE_OPTIONS = {
  // Professional, authoritative male voice
  adam: {
    voiceId: "pNInz6obpgDQGcFmaJgB",
    stability: 0.6,
    similarityBoost: 0.8,
  },
  // Warm, confident male voice
  antoni: {
    voiceId: "ErXwobaYiN019PkySvjV",
    stability: 0.5,
    similarityBoost: 0.75,
  },
  // Professional female voice
  rachel: {
    voiceId: "21m00Tcm4TlvDq8ikWAM",
    stability: 0.5,
    similarityBoost: 0.75,
  },
  // Confident, clear male voice
  josh: {
    voiceId: "TxGEqnHWrfWFTfGW9XjX",
    stability: 0.55,
    similarityBoost: 0.8,
  },
};

async function generateFullVoiceover() {
  const outputPath = path.join(__dirname, "../public/audio/pitchdeck.mp3");

  console.log("Generating full pitch deck voiceover...");
  console.log(`Script length: ${PITCHDECK_SCRIPT.length} characters`);
  console.log(`Estimated duration: ~150 seconds`);

  try {
    await generateVoiceover(PITCHDECK_SCRIPT, outputPath, {
      voiceId: VOICE_OPTIONS.adam.voiceId,
      stability: VOICE_OPTIONS.adam.stability,
      similarityBoost: VOICE_OPTIONS.adam.similarityBoost,
      modelId: "eleven_multilingual_v2",
    });

    console.log(`\nVoiceover saved to: ${outputPath}`);
    console.log("To use in PitchDeck.tsx, uncomment the Audio component line.");
  } catch (error) {
    console.error("Error generating voiceover:", error);
    throw error;
  }
}

async function generateSlideVoiceovers() {
  console.log("Generating individual slide voiceovers...");

  for (const [slideName, script] of Object.entries(SLIDE_SCRIPTS)) {
    const outputPath = path.join(
      __dirname,
      `../public/audio/pitchdeck/${slideName}.mp3`
    );

    console.log(`\nGenerating ${slideName}...`);

    try {
      await generateVoiceover(script, outputPath, {
        voiceId: VOICE_OPTIONS.adam.voiceId,
        stability: VOICE_OPTIONS.adam.stability,
        similarityBoost: VOICE_OPTIONS.adam.similarityBoost,
        modelId: "eleven_multilingual_v2",
      });

      console.log(`  Saved: ${outputPath}`);
    } catch (error) {
      console.error(`  Error: ${error}`);
    }
  }

  console.log("\nAll slide voiceovers generated!");
}

// Main execution
async function main() {
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error("Error: ELEVENLABS_API_KEY environment variable is required");
    console.log("\nUsage:");
    console.log(
      "  ELEVENLABS_API_KEY=your_key npx tsx scripts/generate-pitchdeck-voiceover.ts"
    );
    process.exit(1);
  }

  const mode = process.argv[2] || "full";

  if (mode === "full") {
    await generateFullVoiceover();
  } else if (mode === "slides") {
    await generateSlideVoiceovers();
  } else if (mode === "all") {
    await generateFullVoiceover();
    await generateSlideVoiceovers();
  } else {
    console.log("Usage: npx tsx scripts/generate-pitchdeck-voiceover.ts [mode]");
    console.log("Modes:");
    console.log("  full   - Generate single combined voiceover (default)");
    console.log("  slides - Generate individual slide voiceovers");
    console.log("  all    - Generate both");
  }
}

main().catch(console.error);

// Export for use in other scripts
export { PITCHDECK_SCRIPT, SLIDE_SCRIPTS, VOICE_OPTIONS };
