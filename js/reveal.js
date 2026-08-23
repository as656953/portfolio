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

  // The safety path reveals WITHOUT a transition. Fading 64 elements in at
  // once leaves each of them mid-blend for ~560ms, and a muted foreground
  // part-way onto the background drops under 4.5:1 while it travels — enough
  // for an auditor sampling at that moment to record a contrast failure.
  const revealAll = () => {
    document.documentElement.classList.add("reveal-instant");
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

  let fired = 0;
  const pending = [...items];

  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-revealed");
        obs.unobserve(entry.target);
        fired++;
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.1 }
  );

  items.forEach((el) => observer.observe(el));

  // IntersectionObserver compares state between animation frames, so an
  // element that goes from below the viewport to above it in a single jump
  // never reports as intersecting and stays hidden for good. That is not
  // hypothetical: End, a nav-link jump, and a fast flick all do it, and the
  // clip reveals fail closed at clip-path: inset(100%) — invisible, not faded.
  // A debounced sweep catches anything the observer skipped past.
  let sweepTimer = null;

  const sweep = () => {
    const limit = innerHeight;
    for (let i = pending.length - 1; i >= 0; i--) {
      const el = pending[i];
      if (el.classList.contains("is-revealed")) {
        pending.splice(i, 1);
        continue;
      }
      if (el.getBoundingClientRect().top < limit) {
        el.classList.add("is-revealed");
        observer.unobserve(el);
        pending.splice(i, 1);
      }
    }
    if (!pending.length) removeEventListener("scroll", onScroll);
  };

  const onScroll = () => {
    clearTimeout(sweepTimer);
    sweepTimer = setTimeout(sweep, 150);
  };

  addEventListener("scroll", onScroll, { passive: true });

  // Belt and braces: if the observer never fires at all, content is still
  // guaranteed visible. Only arms in that case, so normal reveals are intact.
  setTimeout(() => {
    if (fired === 0) revealAll();
  }, 3000);
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
