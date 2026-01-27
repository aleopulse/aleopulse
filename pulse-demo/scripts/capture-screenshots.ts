import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = "http://localhost:5173";
const OUTPUT_DIR = path.join(__dirname, "../public/screenshots");

interface ScreenshotConfig {
  name: string;
  route: string;
  waitFor?: number;
  fullPage?: boolean;
  selector?: string;
}

const SCREENSHOTS: ScreenshotConfig[] = [
  { name: "hero.png", route: "/", waitFor: 1500 },
  { name: "create-poll.png", route: "/create", waitFor: 1000 },
  { name: "dashboard.png", route: "/dashboard", waitFor: 1000 },
  { name: "rewards.png", route: "/participant/rewards", waitFor: 1000 },
  { name: "creator.png", route: "/creator", waitFor: 1000 },
  { name: "questionnaires.png", route: "/questionnaires", waitFor: 1000 },
];

async function captureScreenshots() {
  // Create output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2, // Retina quality
  });
  const page = await context.newPage();

  console.log(`\nCapturing ${SCREENSHOTS.length} screenshots...\n`);

  for (const screenshot of SCREENSHOTS) {
    try {
      const url = `${BASE_URL}${screenshot.route}`;
      console.log(`  Navigating to ${url}...`);
      await page.goto(url, { waitUntil: "networkidle" });

      if (screenshot.waitFor) {
        await page.waitForTimeout(screenshot.waitFor);
      }

      const outputPath = path.join(OUTPUT_DIR, screenshot.name);

      if (screenshot.selector) {
        const element = await page.$(screenshot.selector);
        if (element) {
          await element.screenshot({ path: outputPath });
        } else {
          console.log(`    Warning: Selector "${screenshot.selector}" not found, taking full page`);
          await page.screenshot({ path: outputPath, fullPage: screenshot.fullPage ?? false });
        }
      } else {
        await page.screenshot({ path: outputPath, fullPage: screenshot.fullPage ?? false });
      }

      console.log(`  ✓ Captured ${screenshot.name}`);
    } catch (error) {
      console.error(`  ✗ Failed to capture ${screenshot.name}:`, error);
    }
  }

  await browser.close();
  console.log(`\nDone! Screenshots saved to ${OUTPUT_DIR}`);
}

captureScreenshots().catch(console.error);
