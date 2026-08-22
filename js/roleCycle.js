/**
 * Role cycle — the replacement for Typed.js.
 *
 * A masked word slot rather than character-by-character typing: no blinking
 * cursor (a 2019 cliché), no thrashing of the accessibility tree on every
 * keystroke, and ~1 KB instead of ~12 KB.
 *
 * Under reduced motion the markup already reads as a plain list of roles, so
 * this simply does nothing and all three stay visible.
 */

const INTERVAL = 2800;

export function initRoleCycle() {
  const slot = document.querySelector("[data-role-cycle]");
  if (!slot) return;

  const items = slot.querySelectorAll(".role-cycle__static");
  if (items.length < 2) return;

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    slot.dataset.static = "true";
    return;
  }

  // All three roles stay in the DOM — only the visual mask hides two of them.
  // A screen reader therefore reads the full list, which is better content
  // than a single rotating value it would have to catch mid-cycle.

  let index = 0;
  let timer = null;

  const tick = () => {
    index = (index + 1) % items.length;
    slot.style.setProperty("--role-index", String(index));
  };

  const start = () => {
    if (timer === null) timer = setInterval(tick, INTERVAL);
  };
  const stop = () => {
    clearInterval(timer);
    timer = null;
  };

  // don't burn a timer while the tab is hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  start();
}
