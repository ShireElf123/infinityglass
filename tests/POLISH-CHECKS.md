# Mobile and enquiry regression checks

Run the Vite server (`npm run dev`) and, in a second terminal:

```
npx playwright install chromium
node tests/polish-check.mjs
```

An installed browser can be supplied using `CHROMIUM_EXECUTABLE_PATH`.

Passed on 6 November 2026:
- Seven primary views at widths 320, 390, 768, 1024 and 1440px; no horizontal overflow.
- Mobile navigation opens, follows a route and closes.
- Empty contact submission does not open WhatsApp.
- Fleet fields and business details reach the prepared WhatsApp URL.
- Three-step glass finder, review and WhatsApp handoff; actual message newlines.
- Reduced-motion hero animation disabled; no JavaScript runtime errors.
- Production build and whitespace checks.

External requests are intercepted during the browser test: repository images are served from the matching local files; other external services are blocked. This verifies layout and enquiry preparation, not real mobile-network speed, remote image availability, or delivery of a WhatsApp message. No real enquiries are sent.

Photos were visually checked and captions describe visible subjects, without inferring repair types. Gallery images now use visually selected 4:3 editorial crops, responsive WebP sources (480/800/1200px), and correct intrinsic dimensions. Originals are preserved. Inline SVG trust icons need no external requests; gallery photos remain lazy-loaded with asynchronous decoding. Reviews were not added.

## Finder and gallery feature checks

`node tests/feature-check.mjs` covers curated make/model suggestions with arbitrary model entry, conditional front sensors/rear heating with stale-value reset, live summaries, inclusion of feature answers in the review/WhatsApp payload, and invalidation after edits. It also checks the photo dialog's larger responsive asset, keyboard previous/next wrapping, Escape, focus restoration, route-change close, reduced motion and automated accessibility. Protected banner/hero/guide markup is compared against the pre-feature commit.

The model suggestions are a small curated convenience list, not a VIN lookup, fitment database or stock feed. No uploads, pricing, location-coverage claims or confirmed bookings have been added. The gallery loads one 1200px derivative only when opened; it has no animation dependency or third-party viewer library.

## Hero refinement regression (6 November 2026)

`node tests/hero-check.mjs` tests at 320, 390, 768, 1024 and 1440px. It verifies the original `assets/hero-workshop.webp` full-size source, successful image decoding, natural opacity/colour (no filters, masks, blending or pseudo-element overlays), no photo transforms, solid headline text, distinct primary/secondary CTA styling, minimum 44px button heights, no horizontal overflow and hero accessibility contrast checks. Screenshots at 390/768/1440px are saved to ignored `test-results/` and were visually inspected.

Hero CSS was consolidated rather than patched with new `!important` rules. White panel readability replaces the former translucent/filter overrides. Photo parallax was removed because translating an absolute cover image could expose an unfilled edge; existing panel/button/page/finder/gallery animations remain, with home-page fade moved off the photograph. The original asset was not edited. Smaller responsive derivatives are retained. Third-party font/logo hosts remain blocked during local tests; this is not a live external-availability certification.
