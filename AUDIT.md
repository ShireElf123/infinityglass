# Historical website audit — 6 November 2026

This records the earlier inline-site pass. For the current modular/static-route architecture and executed Phase 2 checks, see [PHASE2.md](PHASE2.md).

## Scope and outcome
Reviewed the complete `index.html` (all nine routed views, seven CSS blocks, both JavaScript blocks, forms, metadata, image sources and accessibility), Vite/TypeScript/build configuration, dependencies and existing tests. This was an incremental maintenance pass, not a redesign. No customer reviews were added.

## Image inventory

| Image group | Work completed | Limitation |
| --- | --- | --- |
| Four customer-job photos, on Home and Our Work | Tailored 4:3 crops; WebP at 480/800/1200px; srcset/sizes; lazy loading, async decoding and reserved dimensions | Originals preserved in assets; not downloaded by the rendered galleries |
| Services split photo | WebP at 480/800/1200px; responsive selection, async decoding, lazy loading | Portrait composition retained |
| Workshop hero and social preview | WebP at 480/960/1600px; responsive hero with width/height, high priority and async decoding; social images use full-size version | No cropping, dimming or overlays introduced |
| Interactive glass guide + Fleet sedan | Same original Pexels photograph; server-side WebP/compression parameters, 1200px cap and lazy/async loading | External host blocked in this sandbox: output bytes and visual equivalence cannot be independently verified here; labels/arrows/layout untouched |
| Find Glass windscreens photo | Original prom.ua photograph retained; tracking parameter removed; deferred loading and async decoding | External original unavailable to download/recompress; 640px-sized source URL preserved |
| Seven catalogue tiles (six distinct photo URLs) | Lazy/async loading; explicit dimensions; bounded Unsplash request; original SVG illustrations restored on failed photo loads | Remote originals cannot be fetched/recompressed here. Other hosts' compression capabilities are not assumed |
| Brand and trust graphics | Original 36-image brand strip retained; inline SVG trust icons | Brand logos remain external and unverified here |

### Measured repository file sizes

- Hero: original **96,282 bytes**; new full-size **75,766 bytes** (21.3% smaller), 960px **41,104 bytes**, 480px **17,690 bytes** (81.6% smaller than original).
- Four gallery originals combined: **1,588,453 bytes**.
- Four 480px gallery derivatives combined: **140,238 bytes** (91.2% smaller).
- Four 800px derivatives combined: **344,532 bytes** (78.3% smaller).
- Four 1200px derivatives combined: **658,070 bytes** (58.6% smaller).
- Services: 480px **51,492 bytes**, 800px **138,948 bytes**, 1200px **274,100 bytes**.

These are image-byte savings, not measured page-load-time improvements. Actual selection depends on viewport and pixel density. Shared image URLs permit browser-cache reuse between views. Asset URLs are pinned to commits for stable caching and to avoid the project's previously observed static-file serving issue.

## Code issues corrected

1. Removed a stray closing section tag in Home; all nine views are valid siblings inside main.
2. Removed a literal escaped newline in CSS, empty media/keyframe blocks and redundant IntersectionObserver work whose reveal effects were already disabled by the accessibility layer.
3. Added explicit button/input types and distinct accessible names to complementary/Legal landmarks.
4. Routed keyboard navigation now moves focus to the new page heading.
5. Clearing an invalid optional vehicle year now clears its custom validation error.
6. Selecting a catalogue item returns to the visible first finder step rather than focusing a hidden field.
7. Editing finder details invalidates the previously prepared WhatsApp review so stale details cannot be sent accidentally.
8. Failed external catalogue photos now preserve the original meaningful SVG instead of replacing it with an empty placeholder.
9. Removed the decorative hero overlay and opacity animation; the hero stays at full brightness/opacity. Decorative parallax is bounded and skipped on mobile/inactive routes.
10. Improved section-number contrast and explicitly kept text legible on dark hero/fleet sections.
11. Added a lockfile and reproducible HTML/accessibility regression tooling. HTML style-only rules for existing inline styles and telephone spacing are intentionally disabled, not structural validation rules.

## Verification performed

- `npm run build`: passed; generated HTML approximately 159 KB / 37 KB gzip (Vite report).
- `npm run lint:html`: passed.
- `npx tsc --noEmit`: passed.
- `npm audit`: zero known dependency vulnerabilities at audit time; not a guarantee against future disclosures.
- CSS parsing (all seven blocks) and JavaScript syntax parsing: passed.
- Browser layouts at 320, 390, 768, 1024 and 1440px; navigation, invalid form blocking, fleet WhatsApp payload, three-step finder/review, actual message newlines and reduced-motion behaviour: passed.
- Nine-view automated axe WCAG A/AA checks at 390px, after transitions settled: no reported violations. This does not constitute WCAG certification or replace manual assistive-technology testing.
- Additional regressions: optional year clearing; seven SVG fallbacks on failed remote requests; unique IDs; nine correctly nested views; successful mobile decoding and 480px source selection for hero and gallery: passed.
- Tests intercept requests to committed repository images and serve matching local bytes. Other external services are blocked. No real WhatsApp messages are sent.

## Remaining findings / follow-up

- **External photos:** eight distinct non-GitHub image sources remain (Pexels guide, prom.ua and six catalogue photos). Their originals must be supplied or fetched in an environment that can reach those hosts before all imagery can be recompressed into owned, responsive assets. Do not call this part complete.
- **Performance:** no live Lighthouse/Core Web Vitals, real-device, mobile-network or third-party availability measurements were possible. Font delivery remains dependent on Google Fonts. Reduced bytes and passing local checks are not a performance score.
- **Maintainability:** the inherited layered CSS still contains overlapping selectors and extensive `!important` rules. Consolidate section by section with visual screenshot baselines; a wholesale rewrite would risk the established presentation.
- **SEO/progressive enhancement:** navigation uses JavaScript hash routes; these are not independent server-rendered search landing pages. No-JavaScript multi-view browsing remains limited. A route/rendering migration should be separately scoped.
- **Legal/content:** the existing privacy/terms explicitly require business/legal review. Glass specifications, applicable terms and customer-photo permissions remain owner responsibilities.
- **Infrastructure/security:** the site has no custom database or upload endpoint; enquiry strings are prepared client-side and reviewed in WhatsApp. A source audit is not a penetration test or a production HTTP-header audit. CSP/security-header changes should be verified against the actual Vercel serving setup before deployment.

## Repeat checks

Run `npm ci`, `npx playwright install chromium`, start `npm run dev`, then run `npm run test:browser` in another terminal. `CHROMIUM_EXECUTABLE_PATH` can select an already installed browser. Image derivatives can be regenerated with Pillow using `python scripts/optimize_photos.py`; originals are never overwritten.
