/** One passive listener, one queued frame, no permanent will-change promotion. */
export function initMotion() {
  const header = document.querySelector(".header");
  if (!header) return;
  const progress = document.createElement("span");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  header.appendChild(progress);
  let frame = 0;
  function update() {
    frame = 0;
    const scrollable = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle("is-scrolled", scrollY > 12);
    progress.style.width = `${Math.min(100, Math.max(0, scrollable > 0 ? (scrollY / scrollable) * 100 : 0))}%`;
  }
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("routechange", schedule);
  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(frame);
    frame = 0;
  });
  update();
}
