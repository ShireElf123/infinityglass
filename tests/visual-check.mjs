import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const mode = process.argv[2] || "after";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || undefined,
  args: ["--no-sandbox"],
  headless: true,
});
const context = await browser.newContext({ reducedMotion: "reduce" });
const page = await context.newPage();
await page.route("https://**/*", async (r) => {
  const m = r
    .request()
    .url()
    .match(/\/assets\/((?:optimized\/)?[^/?]+)$/);
  if (m) await r.fulfill({ path: "assets/" + m[1] });
  else await r.abort();
});
await mkdir(`test-results/visual-${mode}`, { recursive: true });
for (const width of [390, 768, 1440]) {
  await page.setViewportSize({ width, height: 1000 });
  for (const route of ["home", "find-glass", "work", "contact"]) {
    await page.goto(
      (process.env.VISUAL_PAGE || "http://localhost:5173/") + "#" + route,
    );
    await page.waitForTimeout(400);
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page
      .locator(".hero-photo")
      .evaluate((e) =>
        e.complete
          ? null
          : Promise.race([
              e.decode().catch(() => {}),
              new Promise((r) => setTimeout(r, 1000)),
            ]),
      );
    await page.evaluate(() => document.activeElement?.blur());
    await page.screenshot({
      path: `test-results/visual-${mode}/${route}-${width}.png`,
    });
  }
}
await browser.close();
console.log("Visual snapshots:", mode);
