/**
 * Scroll reveal + progress bar.
 */

const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)");

/**
 * One IntersectionObserver for the whole page, unobserving after it fires.
 *
 * Never re-animate on scroll-up: replayed animations are the loudest slop
 * signal there is, and they keep the observer hot forever.
 */
export function initReveal() {
  const items = [...document.querySelectorAll("[data-reveal]")];
  const hero = document.querySelector(".hero");

  const revealAll = () => {
    items.forEach((el) => el.classList.add("is-revealed"));
    hero?.classList.add("is-revealed");
  };

  if (prefersReduced.matches || !("IntersectionObserver" in window)) {
    revealAll();
    return;
  }

  // The hero is above the fold, so it plays on load rather than on intersect.
  // rAF twice: once to let the initial styles apply, once to let the browser
  // paint them, so the transition actually runs instead of being skipped.
  requestAnimationFrame(() => requestAnimationFrame(() => hero?.classList.add("is-revealed")));

  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-revealed");
        obs.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.1 }
  );

  items.forEach((el) => observer.observe(el));

  // Belt and braces: if anything at all goes wrong, content is guaranteed
  // visible within 3s. Cheap insurance against a permanently blank portfolio.
  setTimeout(revealAll, 3000);
}

/**
 * Progress bar.
 *
 * The CSS in 3-chrome.css drives this off a scroll timeline where supported,
 * so this rAF path only runs where that's missing — no browser pays twice.
 */
export function initProgress() {
  if (prefersReduced.matches) return;
  if (typeof CSS !== "undefined" && CSS.supports?.("animation-timeline", "scroll()")) return;

  const bar = document.querySelector(".progress");
  if (!bar) return;

  let ticking = false;

  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty("--progress", max > 0 ? scrollY / max : 0);
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    // coalesce to at most one computation per frame
    requestAnimationFrame(update);
  };

  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", update, { passive: true });
  update();
}
