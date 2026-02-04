/**
 * Capture screenshots of project homepages at 1024×768 (4:3).
 * Run: npm run screenshots
 * First time: npx playwright install chromium
 */

import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VIEWPORT = { width: 1024, height: 768 };
const OUTPUT_DIR = path.join(__dirname, "..", "public", "images", "projects");

const CHANNELS = [
  { slug: "tutorflow", url: "https://www.tutorflow.co.za" },
  { slug: "ethixflow", url: "https://gregarious-ganache-64ee20.netlify.app/" },
];

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  });

  for (const { slug, url } of CHANNELS) {
    try {
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
      await page.waitForTimeout(1000);

      const outPath = path.join(OUTPUT_DIR, `${slug}.png`);
      await page.screenshot({ path: outPath, type: "png" });
      console.log(`Captured: ${slug} -> ${outPath}`);

      await page.close();
    } catch (err) {
      console.error(`Failed to capture ${slug}:`, err.message);
    }
  }

  await browser.close();
}

main();
