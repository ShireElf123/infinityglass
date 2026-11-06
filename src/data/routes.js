/** Public page definitions shared by the router and static build. No hash URLs in SEO. */
export const SITE_URL = "https://infinity-auto-glass-parts.vercel.app";
export const HERO_URL = `${SITE_URL}/assets/hero-workshop.webp`;
export const routes = {
  home: {
    path: "/",
    title: "Infinity Auto Glass & Parts | Gauteng and surrounding areas",
    description:
      "Mobile windscreen supply and fitting, chip repairs, side and rear glass enquiries across Gauteng and surrounding areas.",
  },
  "find-glass": {
    path: "/find-glass/",
    title: "Find Vehicle Glass | Infinity Auto Glass & Parts",
    description:
      "Identify your vehicle glass, share sensors and features, and prepare a WhatsApp quote enquiry for Infinity Auto Glass & Parts across Gauteng and surrounding areas.",
  },
  services: {
    path: "/services/",
    title: "Auto Glass Services | Infinity Auto Glass & Parts",
    description:
      "Windscreen supply and fitting, chip and crack assessment, side and rear glass, fleet and corporate enquiries across Gauteng and surrounding areas.",
  },
  fleet: {
    path: "/fleet/",
    title: "Fleet & Corporate Auto Glass | Infinity Auto Glass & Parts",
    description:
      "Discuss fleet vehicles, depot fitting enquiries, quotations and invoicing needs with Infinity Auto Glass & Parts across Gauteng and surrounding areas.",
  },
  work: {
    path: "/work/",
    title: "Our Work | Infinity Auto Glass & Parts",
    description:
      "View customer-job photographs supplied by Infinity Auto Glass & Parts. Mobile fitting enquiries welcome across Gauteng and surrounding areas.",
  },
  faq: {
    path: "/faq/",
    title: "Auto Glass FAQs | Infinity Auto Glass & Parts",
    description:
      "Answers about mobile auto-glass enquiries, identifying glass, repair assessments, pricing and fleet requests across Gauteng and surrounding areas.",
  },
  contact: {
    path: "/contact/",
    title: "Contact & Quotes | Infinity Auto Glass & Parts",
    description:
      "Call 084 526 2956 or prepare a WhatsApp quote enquiry with your vehicle details and your town or suburb in Gauteng and surrounding areas.",
  },
  privacy: {
    path: "/privacy/",
    title: "Privacy Notice | Infinity Auto Glass & Parts",
    description:
      "How the Infinity Auto Glass & Parts website handles enquiry details and third-party WhatsApp links for service enquiries across Gauteng and surrounding areas.",
  },
  terms: {
    path: "/terms/",
    title: "Website Terms | Infinity Auto Glass & Parts",
    description:
      "Website-use information and terms for vehicle-glass quotations and service enquiries across Gauteng and surrounding areas.",
  },
};
export function routeFromPath(path) {
  const normalized = path.replace(/\/+$/, "") || "/";
  return (
    Object.keys(routes).find(
      (key) =>
        routes[key].path.replace(/\/+$/, "") ===
        (normalized === "/" ? "" : normalized),
    ) || null
  );
}
