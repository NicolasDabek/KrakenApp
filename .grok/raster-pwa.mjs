import { chromium } from "playwright";
import { readFileSync } from "fs";

const svg = readFileSync("/workspace/.grok/favicon.svg.staged", "utf8");
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage();
for (const size of [192, 512]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#5B8CFF">${svg}</body></html>`);
  await page.locator("svg").evaluate((el, s) => {
    el.setAttribute("width", String(s));
    el.setAttribute("height", String(s));
  }, size);
  await page.screenshot({
    path: `/workspace/.grok/icon-${size}.staged.png`,
    omitBackground: false,
  });
}
await browser.close();
console.log("pwa icons rasterized");
