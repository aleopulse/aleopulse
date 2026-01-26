import "dotenv/config";
import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";

// Load API key from pulse-demo .env if not in current env
const envPath = path.join(__dirname, "../../pulse-demo/.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const match = envContent.match(/OPENAI_API_KEY=(.+)/);
  if (match && !process.env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = match[1].trim();
  }
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function transcribeWithTimestamps(audioPath: string) {
  console.log(`Transcribing: ${audioPath}\n`);

  const response = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  });

  return response;
}

async function main() {
  const audioPath = path.join(__dirname, "../public/audio/full-demo.mp3");

  const result = await transcribeWithTimestamps(audioPath);

  console.log("=== TRANSCRIPT WITH TIMESTAMPS ===\n");
  console.log(`Full text: ${result.text}\n`);
  console.log(`Duration: ${result.duration} seconds\n`);

  console.log("=== SEGMENTS ===\n");

  if ("segments" in result && Array.isArray(result.segments)) {
    for (const segment of result.segments) {
      const start = segment.start.toFixed(2);
      const end = segment.end.toFixed(2);
      console.log(`[${start}s - ${end}s] ${segment.text}`);
    }

    // Output timing suggestions for scenes
    console.log("\n=== SUGGESTED SCENE TIMINGS ===\n");
    console.log("Based on the transcript, here are suggested timings:\n");

    const segments = result.segments;
    let currentScene = 1;
    let sceneStart = 0;

    const sceneKeywords = [
      { scene: "intro", keywords: ["welcome", "leopulse", "privacy"] },
      { scene: "createPoll", keywords: ["creating", "create", "poll", "privacy mode"] },
      { scene: "fundPoll", keywords: ["fund", "token", "rewards", "incentivize"] },
      { scene: "submitResponse", keywords: ["participants", "submit", "votes", "zero-knowledge"] },
      { scene: "claimingPhase", keywords: ["voting ends", "claiming", "transitions"] },
      { scene: "claimRewards", keywords: ["claim", "earned", "wallet"] },
      { scene: "finalize", keywords: ["finally", "finalizes", "today"] },
    ];

    console.log("Raw segments for manual timing adjustment:\n");
    segments.forEach((seg, i) => {
      console.log(`Segment ${i + 1}: [${seg.start.toFixed(2)}s - ${seg.end.toFixed(2)}s]`);
      console.log(`  "${seg.text.trim()}"\n`);
    });
  }
}

main().catch(console.error);
