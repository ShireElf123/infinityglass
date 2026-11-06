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
