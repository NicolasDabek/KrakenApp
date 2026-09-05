import { chromium } from "playwright";
import { readFileSync, mkdirSync } from "fs";
import { basename, join } from "path";

const dir = "/workspace/.grok/favicon-cands";
const out = "/workspace/.grok/favicon-qc";
mkdirSync(out, { recursive: true });
const files = ["a-thick-mark.svg", "b-chambers.svg", "c-filled.svg", "d-dark.svg"];
const sizes = [16, 32, 64, 192];

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage();

for (const file of files) {
  const svg = readFileSync(join(dir, file), "utf8");
  for (const size of sizes) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<!doctype html><html><body style="margin:0;background:transparent">${svg}</body></html>`);
    await page.locator("svg").evaluate((el, s) => {
      el.setAttribute("width", String(s));
      el.setAttribute("height", String(s));
    }, size);
    await page.screenshot({
      path: join(out, `${basename(file, ".svg")}-${size}.png`),
      omitBackground: true,
    });
  }
}
await browser.close();
console.log("rasterized");
