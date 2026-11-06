import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { FAQ_SCHEMA } from "../src/data/faq.js";
import { routes, SITE_URL, HERO_URL } from "../src/data/routes.js";
const out = process.env.APPDEPLOY_VITE_OUT_DIR || "dist";
const shell = await readFile(path.join(out, "index.html"), "utf8");
const escape = (text) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
for (const [key, data] of Object.entries(routes)) {
  let html = shell.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${escape(data.title)}</title>`,
  );
  const meta = {
    'name="description"': data.description,
    'property="og:title"': data.title,
    'property="og:description"': data.description,
    'property="og:url"': SITE_URL + data.path,
    'property="og:image"': HERO_URL,
    'name="twitter:title"': data.title,
    'name="twitter:description"': data.description,
    'name="twitter:image"': HERO_URL,
  };
  for (const [attribute, value] of Object.entries(meta))
    html = html.replace(
      new RegExp(`<meta ${attribute} content="[^"]*">`),
      `<meta ${attribute} content="${escape(value)}">`,
    );
  html = html.replace(
    /<link rel="canonical" href="[^"]*">/,
    `<link rel="canonical" href="${SITE_URL + data.path}">`,
  );
  html = html.replace(
    /<section class="view(?: active)?" id="view-([^"]+)" data-view="([^"]+)">/g,
    (_, id, route) =>
      `<section class="view${route === key ? " active" : ""}" id="view-${id}" data-view="${route}">`,
  );
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": SITE_URL + data.path,
    url: SITE_URL + data.path,
    name: data.title,
    description: data.description,
    about: { "@id": `${SITE_URL}/#business` },
  };
  html = html.replace(
    "</head>",
    `<script id="pageSchema" type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>\n</head>`,
  );
  if (key === "faq")
    html = html.replace(
      "</head>",
      `<script id="faqSchema" type="application/ld+json">${JSON.stringify(FAQ_SCHEMA).replaceAll("<", "\\u003c")}</script>\n</head>`,
    );
  if (key !== "home")
    html = html.replace(
      /(<img class="hero-photo"[^>]*?)fetchpriority="high"/,
      '$1loading="lazy" fetchpriority="auto"',
    );
  const filename =
    key === "home"
      ? path.join(out, "index.html")
      : path.join(out, data.path, "index.html");
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, html);
}
await writeFile(
  path.join(out, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`,
);
await writeFile(
  path.join(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.values(
    routes,
  )
    .map((data) => `  <url><loc>${SITE_URL + data.path}</loc></url>`)
    .join("\n")}\n</urlset>\n`,
);
console.log(
  `Generated ${Object.keys(routes).length} static pages with canonical metadata, robots.txt and sitemap.xml.`,
);
