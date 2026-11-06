import { FAQ_SCHEMA } from "../data/faq.js";
import { routes, routeFromPath, SITE_URL, HERO_URL } from "../data/routes.js";

const hasRoute = (key) => Object.prototype.hasOwnProperty.call(routes, key);
export function currentRoute() {
  const legacy = location.hash.slice(1);
  return hasRoute(legacy) ? legacy : routeFromPath(location.pathname) || "home";
}
function updateMetadata(key) {
  const data = routes[key];
  document.title = data.title;
  const values = {
    'meta[name="description"]': data.description,
    'meta[property="og:title"]': data.title,
    'meta[property="og:description"]': data.description,
    'meta[property="og:url"]': SITE_URL + data.path,
    'meta[property="og:image"]': HERO_URL,
    'meta[name="twitter:title"]': data.title,
    'meta[name="twitter:description"]': data.description,
    'meta[name="twitter:image"]': HERO_URL,
  };
  for (const [selector, content] of Object.entries(values))
    document.querySelector(selector)?.setAttribute("content", content);
  document
    .querySelector('link[rel="canonical"]')
    ?.setAttribute("href", SITE_URL + data.path);
  const pageSchema =
    document.getElementById("pageSchema") ||
    document.head.appendChild(
      Object.assign(document.createElement("script"), {
        id: "pageSchema",
        type: "application/ld+json",
      }),
    );
  pageSchema.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": SITE_URL + data.path,
    url: SITE_URL + data.path,
    name: data.title,
    description: data.description,
    about: { "@id": `${SITE_URL}/#business` },
  });
  document.getElementById("faqSchema")?.remove();
  if (key === "faq")
    document.head.appendChild(
      Object.assign(document.createElement("script"), {
        id: "faqSchema",
        type: "application/ld+json",
        textContent: JSON.stringify(FAQ_SCHEMA),
      }),
    );
}
function render(key, focus = true) {
  document.querySelectorAll("[data-view]").forEach((view) => {
    const active = view.getAttribute("data-view") === key;
    view.classList.toggle("active", active);
    view.classList.toggle("reveal", active && key !== "home");
  });
  document.querySelectorAll("nav a[href]").forEach((link) => {
    if (routeFromPath(new URL(link.href).pathname) === key)
      link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  closeMenu();
  updateMetadata(key);
  if (key === "home")
    document
      .querySelector(".hero-photo")
      ?.setAttribute("fetchpriority", "high");
  if (focus) {
    const heading = document.querySelector(".view.active h1");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
  }
  window.scrollTo({
    top: 0,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
  window.dispatchEvent(
    new CustomEvent("routechange", { detail: { route: key } }),
  );
}
export function navigate(key, replace = false) {
  if (!hasRoute(key)) return;
  const method = replace ? "replaceState" : "pushState";
  if (location.pathname !== routes[key].path || location.hash)
    history[method]({}, "", routes[key].path);
  render(key);
}
function closeMenu() {
  const menu = document.getElementById("mobileNav"),
    button = document.getElementById("menuButton");
  menu.classList.remove("open");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-label", "Open navigation menu");
  document.body.classList.remove("menu-open");
}
export function initNavigation() {
  const menu = document.getElementById("mobileNav"),
    button = document.getElementById("menuButton");
  button.addEventListener("click", () => {
    const open = !menu.classList.contains("open");
    menu.classList.toggle("open", open);
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute(
      "aria-label",
      open ? "Close navigation menu" : "Open navigation menu",
    );
    document.body.classList.toggle("menu-open", open);
    if (open) menu.querySelector("a")?.focus();
  });
  document.addEventListener("click", (event) => {
    const link =
      event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (
      !link ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.target === "_blank" ||
      link.hasAttribute("download")
    )
      return;
    const url = new URL(link.href, location.href);
    const key =
      url.origin === location.origin && !url.hash && !url.search
        ? routeFromPath(url.pathname)
        : null;
    if (key) {
      event.preventDefault();
      navigate(key);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("open")) {
      closeMenu();
      button.focus();
    }
    if (event.key === "Tab" && menu.classList.contains("open")) {
      const items = [button, ...menu.querySelectorAll("a")],
        first = items[0],
        last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  window
    .matchMedia("(min-width: 761px)")
    .addEventListener("change", (event) => {
      if (event.matches) closeMenu();
    });
  // Back/forward and old shared #route links keep working, but canonical URLs are paths.
  window.addEventListener("popstate", () => render(currentRoute()));
  window.addEventListener("hashchange", () => {
    const key = location.hash.slice(1);
    if (hasRoute(key)) navigate(key, true);
  });
  const key = currentRoute();
  if (hasRoute(location.hash.slice(1)))
    history.replaceState({}, "", routes[key].path);
  render(key, false);
}
