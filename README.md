# Infinity Auto Glass & Parts

Static Vite website: https://infinity-auto-glass-parts.vercel.app/

Business location: **Gauteng**. Mobile fitting enquiries are welcome across **Gauteng and surrounding areas**. Availability is confirmed directly for each vehicle and location.

## Development and production build

```sh
npm ci
npm run dev -- --host 0.0.0.0
npm run lint:html
npm run typecheck
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

`predev` / `prebuild` copy approved source photographs into ignored `public/assets/`. **Do not edit the generated copies.** The original `assets/hero-workshop.webp` remains the desktop/social image; its mobile derivatives remain responsive sources. No photographs are downloaded at build time.

Vite bundles the CSS and small feature modules, then `scripts/render-routes.mjs` generates nine real HTML pages, `robots.txt` and `sitemap.xml` in `dist/`. Deploy **the complete `dist` output**, not the source HTML and not a serverless HTML wrapper. `vercel.json` explicitly selects Vite, the build command and static output. No catch-all SPA rewrite is needed. Other static hosts must serve directory `index.html` pages.

Public paths: `/`, `/find-glass/`, `/services/`, `/fleet/`, `/work/`, `/faq/`, `/contact/`, `/privacy/`, `/terms/`. Old `#route` links remain compatible and become canonical paths. Regular links also work without JavaScript. Without JavaScript, enquiry forms are hidden with direct phone/WhatsApp alternatives (no accidental GET submission of private fields).

## Client logo

The header/footer use the supplied full infinity wordmark and tagline, not recreated text. `assets/brand/infinity-logo-original.jpg` preserves the upload unchanged. `infinity-logo.webp` is a cropped, background-cleaned web derivative (1043×248); CSS preserves its aspect ratio and reserves its space. Header sizes adapt to mobile/tablet, with a larger full logo in the footer. The asset-preparation hook serves it from the existing same-origin static output. `tests/brand-check.mjs` checks asset decoding, accessible home links, sizing and navigation overlap at eight widths.

## Architecture

- `index.html`: existing semantic views, approved artwork and inert authored UI templates; no executable inline application script or large inline stylesheet.
- `src/main.ts`: explicit, single feature initialisation pipeline.
- `src/features/`: navigation/history/metadata; finder wizard; contact/fleet enquiry; product-photo fallbacks; vehicle suggestions/equipment/live summary; native gallery dialog; frame-batched scroll chrome.
- `src/lib/`: authored template cloning, native validation and fixed-recipient WhatsApp URL helpers.
- `src/data/`: shared route metadata/canonical origin and existing FAQ schema.
- `src/styles.css`: ordered imports; `src/styles/`: tokens, global component rules and focused hero/catalogue/gallery/contrast/responsive refinements. The original cascade order is retained deliberately; this is not a visual rebuild.
- `scripts/`: asset preparation and static-route build.
- `vercel.json`: static build, trailing-slash routing and production security headers/CSP. If changing an external image/font host, review this policy too.

No application-framework migration or new runtime dependency. The unused `lucide` dependency was removed; approved icons remain inline SVG. Legacy extracted modules stay JavaScript; TypeScript checks the entry and opted-in JSDoc helper, **not every legacy DOM expression**.

## Glass guide rollback

The guide precision polish has a pre-change snapshot and safe revert instructions in `backups/glass-guide-38a8e58/README.md`. The original photo and SVG pane anchors remain untouched. `tests/guide-check.mjs` verifies all diagram/category selections, consistent names, non-overlapping labels, keyboard activation and door-position options. Its screenshots intentionally block unavailable external media and are not evidence of arrow-to-pane accuracy over the real photo.

## Automated regression checks

Against the built site running on port 4173:

```sh
npx playwright install chromium
BASE_URL=http://localhost:4173 npm run test:browser
npx html-validate 'dist/**/*.html'
```

`CHROMIUM_EXECUTABLE_PATH` optionally selects an installed browser. Existing suites default to dev port 5173; `phase2-check.mjs` requires a production build and defaults to 4173. Set `BASE_URL` for a consistent full run. Screenshots go to ignored `test-results/`.

See [PHASE2.md](PHASE2.md) for executed checks, visual preservation, performance changes and limitations. Third-party photographs/logos/fonts remain external and are blocked during deterministic local tests. All owned images in the new integration suite must really load from the built server; they are not mocked. Tests prepare URLs but do not send enquiries.

## Content and service boundaries

Vehicle suggestions are curated conveniences, not a fitment/stock database. Forms prepare WhatsApp text for the visitor to review and send; there is no upload, booking, pricing, database or submission backend. Compatibility, availability, quote and fitting details require direct business confirmation. No invented reviews, ratings, hours or street address. Owner/legal approval of the existing privacy/terms wording remains necessary.

### Desktop hero and readable header lockup

The desktop hero uses separate text/photo grid areas from 1101px upward. The original 1600×900 photograph is displayed at its native 16:9 aspect ratio with `contain`, no text occlusion, dimming, cropping, filters or replacement. Between 761–1100px the whole image sits above the copy; the existing mobile hero is retained. Responsive image sizes match this split.

The desktop header uses a 1043×184 derivative of the supplied logo (symbol and wordmark only), with a 12px HTML tagline below it. The full original logo remains in the mobile header/footer, and both original assets remain intact. `tests/desktop-presentation-check.mjs` checks full-frame geometry, non-overlap, readable tagline and navigation at 12 tablet/desktop widths through 2560px, plus original mobile artwork. Pre-change CSS and rollback notes: `backups/desktop-hero-134fe0c/`.
