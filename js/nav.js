/**
 * Navigation: header scroll state, mobile drawer, and scroll-spy.
 */

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Header "scrolled" state via a 1px sentinel — no scroll listener, so no
 * per-frame layout reads.
 */
export function initHeaderState() {
  const header = document.querySelector(".site-header");
  const sentinel = document.getElementById("header-sentinel");
  if (!header || !sentinel || !("IntersectionObserver" in window)) return;

  new IntersectionObserver(
    ([entry]) => header.classList.toggle("is-stuck", !entry.isIntersecting),
    { threshold: 0 }
  ).observe(sentinel);
}

/**
 * Mobile drawer.
 *
 * Uses `inert` on <main>/<footer> rather than aria-hidden: it removes the
 * background from the tab order AND the accessibility tree in one property,
 * and it moves focus out for you. Putting aria-hidden on an element that
 * contains the focused element is the classic "screen reader lands on
 * nothing" bug.
 */
export function initDrawer() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");
  const scrim = document.querySelector(".nav-scrim");
  const header = document.querySelector(".site-header");
  const main = document.getElementById("main");
  const footer = document.querySelector(".site-footer");
  if (!toggle || !nav || !scrim || !header) return;

  const mobile = matchMedia("(max-width: 767px)");
  let open = false;
  let lastFocused = null;

  // A closed off-canvas drawer is only moved off-screen by a transform, so it
  // stays in the tab order and the accessibility tree — keyboard users tab
  // into invisible links. Mark it inert whenever it is closed on mobile.
  const syncClosedState = () => {
    nav.inert = mobile.matches && !open;
  };

  const onKeydown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key !== "Tab") return;

    // belt-and-braces cycle within the header, which `inert` alone doesn't give
    const items = [...header.querySelectorAll(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null
    );
    if (!items.length) return;

    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  function setOpen(next) {
    if (next === open) return;
    open = next;

    document.documentElement.classList.toggle("is-nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));

    const sr = toggle.querySelector(".visually-hidden");
    if (sr) sr.textContent = open ? "Close menu" : "Open menu";

    scrim.hidden = !open;

    [main, footer].forEach((el) => {
      if (el) el.inert = open;
    });
    nav.inert = false; // the drawer itself must never be inert while opening

    if (open) {
      lastFocused = document.activeElement;
      document.addEventListener("keydown", onKeydown);
      requestAnimationFrame(() => nav.querySelector(".nav__link")?.focus());
    } else {
      document.removeEventListener("keydown", onKeydown);
      (lastFocused ?? toggle).focus();
      syncClosedState();
    }
  }

  toggle.addEventListener("click", () => setOpen(!open));
  scrim.addEventListener("click", () => setOpen(false));
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  // Open the drawer at 375px, rotate to landscape, and without this teardown
  // the desktop nav renders while <main> is still inert — an invisible,
  // unclickable page.
  mobile.addEventListener("change", () => {
    if (!mobile.matches) setOpen(false);
    syncClosedState();
  });

  syncClosedState();
}

/**
 * Scroll-spy.
 *
 * Uses a viewport band rather than getBoundingClientRect() math in a scroll
 * handler, which misfires on fast scroll and on short sections.
 */
export function initScrollSpy() {
  const links = [...document.querySelectorAll('.nav__link[href^="#"]')];
  if (!links.length || !("IntersectionObserver" in window)) return;

  const linkFor = new Map();
  const sections = links
    .map((link) => {
      const el = document.querySelector(link.getAttribute("href"));
      if (el) linkFor.set(el, link);
      return el;
    })
    .filter(Boolean);
  if (!sections.length) return;

  const visible = new Set();

  const setActive = (link) => {
    links.forEach((candidate) => {
      // aria-current must be REMOVED, not set to "false" — some screen
      // readers still announce aria-current="false"
      if (candidate === link) candidate.setAttribute("aria-current", "true");
      else candidate.removeAttribute("aria-current");
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      // when nothing is in the band, keep the previous active link —
      // a nav with nothing highlighted looks broken
      if (!visible.size) return;
      const current = sections.find((section) => visible.has(section));
      if (current) setActive(linkFor.get(current));
    },
    { rootMargin: "-35% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));

  // clicking should feel instant, not wait for the band
  links.forEach((link) => link.addEventListener("click", () => setActive(link)));

  if (location.hash) {
    const match = links.find((link) => link.getAttribute("href") === location.hash);
    if (match) setActive(match);
  }
}
