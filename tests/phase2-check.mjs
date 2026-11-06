import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { routes, SITE_URL, HERO_URL } from "../src/data/routes.js";
import { buildWhatsAppUrl, openWhatsApp } from "../src/lib/whatsapp.js";
const base = process.env.BASE_URL || "http://localhost:4173";

const sourceContent = await readFile("index.html", "utf8");
assert(!/insurance|insurer|east rand/i.test(sourceContent), "Removed insurance offering and old service-area copy must stay absent");
assert(sourceContent.includes("Fountain and surrounding areas"), "Approved Fountain service area must be visible");
assert(sourceContent.includes("Fleet &amp; corporate"), "Fleet services must remain");
assert(sourceContent.includes("Mobile fitting enquiries"), "Replacement service card must preserve the Services layout");
assert(!sourceContent.includes("Insurance claim"), "Insurance must not remain a selectable quote option");

// Unit checks for the actual shared URL helper, including hostile text and malformed Unicode.
for (const text of [
  "Hello & quote? #glass + <script>alert(1)</script>\n\nBenoni",
  "Vehicle 🚘\r\nGlass",
  "Lone \ud800 surrogate",
]) {
  const url = new URL(buildWhatsAppUrl(text));
  assert.equal(url.origin, "https://wa.me");
  assert.equal(url.pathname, "/27845262956");
  assert(!url.searchParams.get("text").includes("\r"));
  assert(!url.searchParams.has("glass"));
}
assert.throws(() => buildWhatsAppUrl(""));
assert.throws(() => buildWhatsAppUrl("a".repeat(8001)));
for (const url of [
  "javascript:alert(1)",
  "https://evil.example/?text=hi",
  "https://wa.me/123?text=hi",
])
  assert.throws(() => openWhatsApp(url));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || undefined,
  args: ["--no-sandbox"],
  headless: true,
});
const context = await browser.newContext({
  reducedMotion: "reduce",
  viewport: { width: 390, height: 844 },
});
// Only third-party traffic is blocked. Same-origin requests must genuinely load from dist.
await context.route("**/*", (route) =>
  new URL(route.request().url()).origin === new URL(base).origin
    ? route.continue()
    : route.abort(),
);
const page = await context.newPage(),
  errors = [],
  failedAssets = [],
  consoleErrors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("response", (response) => {
  if (
    new URL(response.url()).origin === new URL(base).origin &&
    response.status() >= 400
  )
    failedAssets.push([response.url(), response.status()]);
});
page.on("console", (message) => {
  if (message.type() === "error" && !message.text().includes("net::ERR_FAILED"))
    consoleErrors.push(message.text());
});
const noJs = await browser.newContext({ javaScriptEnabled: false });
await noJs.route("**/*", (route) =>
  new URL(route.request().url()).origin === new URL(base).origin
    ? route.continue()
    : route.abort(),
);
const staticPage = await noJs.newPage();
const titles = new Set();
for (const [key, data] of Object.entries(routes)) {
  assert.equal((await staticPage.goto(base + data.path)).status(), 200);
  assert.equal(await staticPage.title(), data.title);
  titles.add(await staticPage.title());
  assert.equal(
    await staticPage.locator(".view.active").getAttribute("id"),
    "view-" + key,
  );
  assert(await staticPage.locator(".view.active h1").isVisible());
  assert.equal(
    await staticPage.locator("link[rel=canonical]").getAttribute("href"),
    SITE_URL + data.path,
  );
  for (const selector of [
    "meta[name=description]",
    'meta[property="og:description"]',
    'meta[name="twitter:description"]',
  ])
    assert.equal(
      await staticPage.locator(selector).getAttribute("content"),
      data.description,
    );
  assert.equal(
    await staticPage.locator('meta[property="og:url"]').getAttribute("content"),
    SITE_URL + data.path,
  );
  assert.equal(
    await staticPage
      .locator('meta[property="og:image"]')
      .getAttribute("content"),
    HERO_URL,
  );
  const schema = JSON.parse(
    await staticPage.locator("#pageSchema").textContent(),
  );
  assert.equal(schema.url, SITE_URL + data.path);
  assert.equal(
    await staticPage.locator("#faqSchema").count(),
    key === "faq" ? 1 : 0,
  );
  // Direct entry, refresh and metadata must work with JavaScript too.
  await page.goto(base + data.path);
  await page.reload();
  assert(await page.locator("#view-" + key).isVisible());
  assert.equal(await page.title(), data.title);
  assert(!data.title.toLowerCase().includes("east rand"));
  if (["home", "services", "fleet", "find-glass", "work", "faq", "contact"].includes(key)) assert(data.description.includes("Fountain and surrounding areas"));
  for (const image of await page
    .locator('.view.active img[src^="/assets/"]')
    .all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((image) => image.decode());
    assert(
      await image.evaluate(
        (image) =>
          image.naturalWidth > 0 &&
          new URL(image.currentSrc).origin === location.origin,
      ),
    );
  }
}
assert.equal(titles.size, 9);
await staticPage.goto(base + "/contact/");
assert(!(await staticPage.locator("#quoteForm").isVisible()));
await staticPage.setViewportSize({ width: 390, height: 844 });
assert(await staticPage.locator("#mobileNav").isVisible());
const robots = await (await context.request.get(base + "/robots.txt")).text();
assert(robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`));
const sitemap = await (await context.request.get(base + "/sitemap.xml")).text();
assert.equal((sitemap.match(/<loc>/g) || []).length, 9);
for (const data of Object.values(routes))
  assert(sitemap.includes(SITE_URL + data.path));
const hero = await context.request.get(base + "/assets/hero-workshop.webp");
assert.equal(hero.status(), 200);
assert(hero.headers()["content-type"].includes("image/webp"));
assert.equal(
  createHash("sha256")
    .update(await hero.body())
    .digest("hex"),
  createHash("sha256")
    .update(await readFile("assets/hero-workshop.webp"))
    .digest("hex"),
);
// Browser history, old incoming links, keyboard menu trapping, resize cleanup and route focus.
await page.goto(base + "/#work");
await page.waitForURL(base + "/work/");
await page.locator('.footer-links a[href="/contact/"]').click();
await page.waitForURL(base + "/contact/");
assert(
  await page
    .locator("#view-contact h1")
    .evaluate((e) => e === document.activeElement),
);
await page.goBack();
assert(await page.locator("#view-work").isVisible());
await page.goForward();
assert(await page.locator("#view-contact").isVisible());
await page.locator("#menuButton").click();
await page.locator("#mobileNav a").last().focus();
await page.keyboard.press("Tab");
assert(
  await page
    .locator("#menuButton")
    .evaluate((e) => e === document.activeElement),
);
await page.keyboard.press("Shift+Tab");
assert(
  await page
    .locator("#mobileNav a")
    .last()
    .evaluate((e) => e === document.activeElement),
);
await page.keyboard.press("Escape");
assert.equal(
  await page.locator("#menuButton").getAttribute("aria-expanded"),
  "false",
);
await page.locator("#menuButton").click();
await page.setViewportSize({ width: 1024, height: 844 });
await page.waitForFunction(
  () =>
    document.getElementById("menuButton").getAttribute("aria-expanded") ===
    "false",
);
assert.equal(
  await page.locator("#menuButton").getAttribute("aria-expanded"),
  "false",
);
assert.equal(
  await page.locator("body").evaluate((e) => e.classList.contains("menu-open")),
  false,
);
// Contact whitespace, phone/year validation, safe DOM fallback and exact WhatsApp handoff.
await page.evaluate(() => {
  window.__opened = [];
  window.open = (url) => {
    window.__opened.push(url);
    return null;
  };
});
for (const [id, value] of Object.entries({
  name: "   ",
  phone: "abc",
  make: "Toyota",
  model: "<img src=x onerror=alert(1)>",
  location: "Benoni",
  year: "1900",
}))
  await page.locator("#" + id).fill(value);
await page.locator("#service").selectOption({ index: 1 });
await page.locator("#privacyConsent").check();
await page.locator("#quoteForm button[type=submit]").click();
assert.equal(await page.evaluate(() => __opened.length), 0);
assert.equal(await page.locator("#name").getAttribute("aria-invalid"), "true");
await page.locator("#name").fill("Test Customer");
await page.locator("#quoteForm button[type=submit]").click();
assert.equal(await page.locator("#phone").getAttribute("aria-invalid"), "true");
await page.locator("#phone").fill("+27 82 123 4567");
await page.locator("#quoteForm button[type=submit]").click();
assert.equal(await page.evaluate(() => __opened.length), 0);
await page.locator("#year").fill("2021");
await page.locator("#quoteForm button[type=submit]").click();
assert.equal(await page.evaluate(() => __opened.length), 1);
const prepared = new URL(
  await page.locator("#formStatus a").getAttribute("href"),
);
assert.equal(prepared.pathname, "/27845262956");
assert(
  prepared.searchParams.get("text").includes("<img src=x onerror=alert(1)>"),
);
assert.equal(await page.locator("#formStatus img").count(), 0);
assert(
  (await page.locator("#formStatus").textContent()).includes(
    "Review it and press Send",
  ),
);
// Native gallery Tab containment, error feedback and focus restoration.
await page.goto(base + "/work/");
const opener = page.locator("#view-work .job-photo-open").first();
await opener.click();
await page.locator("[data-viewer-next]").focus();
await page.keyboard.press("Tab");
assert(
  await page
    .locator("#jobPhotoViewer")
    .evaluate((d) => d.contains(document.activeElement)),
);
await page.locator("#jobPhotoViewer img").dispatchEvent("error");
assert(await page.locator(".job-viewer-error").isVisible());
await page.keyboard.press("Escape");
assert(await opener.evaluate((e) => e === document.activeElement));
assert.deepEqual(failedAssets, []);
assert.deepEqual(errors, []);
assert.deepEqual(consoleErrors, []);
await browser.close();
console.log(
  "PASS shared URL safety, 9 real static/no-JS pages and unique metadata/schema, deep entry/reload/history, legacy links, all visible owned images loaded, original hero checksum, sitemap/robots, keyboard/menu/gallery, trimmed/phone/year validation, safe enquiry DOM; no own 404/console/runtime errors",
);
