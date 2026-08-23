/**
 * Theme toggle.
 *
 * The theme itself is resolved and applied by the inline script in <head>
 * (that must be blocking, or dark-mode users get a white flash). This module
 * only owns the toggle button and persistence.
 */

const STORAGE_KEY = "theme";

export function initTheme() {
  const button = document.querySelector(".theme-toggle");
  if (!button) return;

  const root = document.documentElement;

  const sync = () => {
    const isDark = root.dataset.theme === "dark";
    button.setAttribute("aria-pressed", String(isDark));

    // Both labels name the ACTION, not the current state. A text button
    // reading "Light" while the page is already light reads as a status
    // chip, not a control — and it contradicted what the screen reader said.
    const label = button.querySelector(".theme-toggle__label");
    const sr = button.querySelector(".visually-hidden");
    if (label) label.textContent = isDark ? "Light" : "Dark";
    if (sr) sr.textContent = isDark ? "Switch to light theme" : "Switch to dark theme";
  };

  button.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
      localStorage.removeItem("nightMode"); // retire the old key once migrated
    } catch (e) {
      /* private mode / storage disabled — the toggle still works this session */
    }
    sync();
  });

  // follow the OS only while the user has made no explicit choice
  const mq = matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", (e) => {
    let stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      /* ignore */
    }
    if (stored === "light" || stored === "dark") return;
    root.dataset.theme = e.matches ? "dark" : "light";
    sync();
  });

  sync();
}
