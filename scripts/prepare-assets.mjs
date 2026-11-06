import { mkdir, cp } from "node:fs/promises";
// Generated public copies keep source photographs in their approved repository location.
await mkdir("public/assets", { recursive: true });
await cp("assets/hero-workshop.webp", "public/assets/hero-workshop.webp");
await cp("assets/optimized", "public/assets/optimized", { recursive: true });
