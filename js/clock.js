/**
 * Footer clock — local time in Kolkata.
 *
 * A small human detail that also quietly proves the page is hand-built
 * rather than a static export.
 */

export function initClock() {
  const target = document.querySelector("[data-clock]");
  if (!target) return;

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const tick = () => {
    target.textContent = formatter.format(new Date());
  };

  tick();
  setInterval(tick, 30_000);
}
