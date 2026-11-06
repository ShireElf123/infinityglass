# Phase 2 engineering record — 6 November 2026

## Scope and preservation

Starting point: `b1e3d68`, branch `arena/3210f447-infinityglass`; fetched and confirmed aligned with origin before changes. Incremental production engineering, not a redesign.

The original hero file is byte-unchanged. Hero rendering remains full-opacity, unfiltered, unmasked and without overlays or parallax; navy headline, white panel and distinct CTAs retained. The original 36-image marquee and guide artwork/arrows are checked against Git. The original prom.ua windscreens photograph is retained. Customer-job crops/captions, brand palette, layouts and useful CSS animations remain.

## Architecture / changed file groups

| Files | Responsibility |
| --- | --- |
| `index.html`, `src/main.ts` | Semantic shell/inert templates and explicit feature bootstrap, rather than inline executable application code |
| `src/features/navigation.js` | Standard path links, History/back/forward, legacy hash compatibility, route focus, mobile menu keyboard behaviour and shared metadata/schema updates |
| `src/features/finder.js`, `contact.js` | Existing wizard/review and contact/fleet flows; private prepared URL state instead of leaked `window.__infinity*` variables |
| `src/features/vehicle.js`, `products.js` | Curated suggestions, conditional equipment/live summary, preserved remote-photo SVG fallbacks |
| `src/features/gallery.js`, `motion.js` | Native modal with deterministic Tab wrapping/arrows/Escape/focus restore; passive, rAF-coalesced scroll updates |
| `src/lib/{dom,validation,whatsapp}.js` | Authored template cloning, native labelled validation and fixed HTTPS recipient/encoded plain-text URL construction |
| `src/data/{routes,faq}.js` | Shared public paths/canonical origin/titles/descriptions and existing published FAQ answers |
| `src/styles.css`, `src/styles/*.css` | Ordered extracted cascade, tokens and focused presentation/responsive/contrast rules; readable formatting |
| `scripts/{prepare-assets,render-routes}.mjs`, `vite.config.ts`, `vercel.json` | Same-origin build assets, nine static pages, crawl metadata and explicit Vite/static hosting/security headers |
| `package*.json`, `tsconfig.json`, `.gitignore` | Reproducible hooks/scripts, removed unused icon dependency, incremental JS/TS configuration, generated-output exclusions |
| `tests/*.mjs`, documentation | Existing regression coverage retained/expanded; new static-route/integration checks and deterministic screenshots |

No new runtime library or framework. Legacy feature modules remain JavaScript; `tsc --noEmit` checks the TypeScript entry and opted-in WhatsApp JSDoc code, not all legacy JS. No claims of complete strict TypeScript conversion.

## CSS and performance

- Removed 79 superseded cross-file declarations while preserving cascade behaviour; removed dead orbit/symbol/reveal rules and unused keyframes. Removed permanently cancelled `will-change` promotions and unnecessary visual `!important` declarations. Important declarations needed for reduced motion, protected graphics and contrast remain intentionally.
- CSS/JS are external, bundled and shared across route documents rather than reparsed inline on every navigation. All features initialise once; route changes do not re-register listeners.
- One passive scroll handler schedules at most one pending animation frame; resize/route changes update the progress bar too. No hero scroll transform.
- Owned hero, gallery and Services images are served from `/assets/` through generated `public` copies. Source originals stay in `assets/`; generated copies and `dist` are ignored.
- Preserved correct intrinsic dimensions, responsive WebP sources and async decoding. Gallery images remain lazy; full-size viewer source assigned on opening and released on close. Non-home static pages defer the hidden hero rather than requesting it at high priority. Home hero remains high-priority with the original desktop source.
- Retained font `display=swap` and preconnects; removed the unused Sora 500 request. Third-party font self-hosting/licence audit was not performed. Product photos retain meaningful SVG fallbacks; guide, windscreens and logos were not replaced.
- Removed unused `lucide` runtime dependency. `npm uninstall lucide` completed with **0 audited vulnerabilities** at this run (not a future security guarantee).

Local build before final documentation: main shell ~67.5 kB, shared CSS 57.24 kB (gzip 13.13), JS ~34.44 kB (gzip 10.84). The build prints exact current figures. Original inline source was 174,888 bytes. These are file sizes, **not measured LCP/speed/Core Web Vitals improvements**.

## SEO / hosting

Generated HTML exists at all nine paths, with the correct view visible before JavaScript. Each has a unique title/description, canonical, OG/Twitter metadata and matching WebPage JSON-LD. Existing AutoRepair data is retained without invented address, hours, reviews or ratings. FAQ schema is only published on the FAQ route. The same metadata definitions drive client navigation. The absolute social image points to the unchanged original hero on the production origin.

`robots.txt` allows crawling and names the generated nine-URL sitemap. There are no fabricated timestamps or arbitrary keyword-stuffed service-area pages. Existing privacy/terms remain crawlable. Search indexing/rich-result eligibility is not guaranteed.

`base: '/'` fixes nested-route asset resolution. Vercel is explicitly configured for Vite → `dist`, without the historical serverless HTML-wrapper/local-image failure mode or a catch-all soft-404 rewrite. Security headers constrain script execution, framing, MIME sniffing, referrers and unused device permissions. CSP permits the site's existing HTTPS image hosts and Google font styles/fonts, not arbitrary external scripts. Real production behaviour still needs independent deployment verification; see the final task response/PR deployment record.

## Safety, validation and accessibility

- No runtime `innerHTML` sinks: static authored fragments are inert templates; user data uses textContent / DOM creation. Prepared WhatsApp URLs validate protocol, host and exact business recipient; control characters and malformed surrogate input are normalised, with bounded message length.
- Every enquiry is plain text for review in WhatsApp; no claimed backend submission, delivery or confirmed booking. Fallback links are real anchors with `noopener noreferrer`. Editing finder input/change invalidates the old prepared preview. Contact text/phone/year/consent constraints and finder step/year validation are preserved/improved; invalid controls expose `aria-invalid` and reset as edited.
- Native gallery `<dialog>` retained, including inert background, explicit Tab/Shift+Tab wrapping, keyboard previous/next, Escape, close button, image-error message, route-change close and opener restoration. No third-party viewer.
- Route changes focus the active heading; modified clicks remain normal browser links. Mobile menu labels/expanded state, Tab wrapping, Escape return and desktop-resize cleanup are checked. All navigation landmarks expose the current page.
- Reduced-motion rules retained. Full viewport/hero screenshot comparisons preserve approved colour and layout. Axe scans are automated checks, not a substitute for a screen-reader/manual accessibility audit.
- Without JavaScript, route content and links still work, while forms are hidden with phone/WhatsApp alternatives to prevent accidental native GET submission of private fields.

## Executed local verification

Run against the actual Vite production output, with an installed headless Chromium:

- `npm run lint:html` — passed.
- `npm run typecheck` — passed, incremental scope noted above.
- `npm run build` — passed, generated 9 real pages + robots/sitemap, no CSS warnings.
- `npx html-validate 'dist/**/*.html'` — passed for built pages.
- Full `BASE_URL=http://localhost:4173 npm run test:browser` — passed all five suites.
- Layout/route and bright-hero checks at **320, 360, 390, 430, 768, 1024, 1280, 1440px**; all nine views, no horizontal overflow.
- Nine-route axe WCAG 2 A/AA + 2.1 AA scans: **zero violations** in the tested state; separate hero and open-gallery checks also passed.
- Suggestions/free-text model entry, equipment reset, summaries, review invalidation, year optional/error reset, fleet conditional fields, invalid contact blocking, exact WhatsApp recipient/payload/newlines and hostile-text URL/DOM handling passed.
- Gallery large image loading/navigation/wrapping/Tab/Escape/error state/focus restore/route-change close and reduced motion passed.
- New integration suite directly loads and refreshes all nine paths, checks raw no-JS rendering and unique metadata/schema, history/hash compatibility, keyboard/menu/resize handling, same-origin visible owned image decode, original hero SHA-256 equality, robots/sitemap, and no own 404/runtime/unexpected console errors.
- Deterministic before/after screenshots at 390/768/1440 for home/finder/work/contact: **11/12 pixel-identical** after normalising focus. Remaining Work/1440 comparison: **54 edge pixels differ by at most 1/255 in a colour channel**. Screenshots and diffs are ignored artifacts, not source assets.
- `git diff --check` — passed.

Existing browser suites block third-party hosts and historically fulfilled owned remote URLs from local source files. The **new integration suite does not mock same-origin assets**: they must load successfully from the built server. No enquiries were sent.

## Deliberate limitations

No backend, upload/storage, inventory/fitment/VIN service, pricing, booking confirmation or reviews were added. No real-device/mobile-network, Safari/Firefox, screen-reader, external logo/font/photo health, WhatsApp delivery, Search Console indexing or field performance certification. Protected third-party media may still fail independently; catalogue SVG fallbacks are tested. Existing owner/legal business-content approval remains outstanding. Deployment status and externally verified production results belong in the final response/PR record, not assumed from a local build.
