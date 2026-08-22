/**
 * Entry point.
 *
 * Every init is wrapped individually. The old script.js failed exactly this
 * way: an unguarded `new Typed()` threw on three of five pages and killed
 * every feature declared below it. One broken module must never cascade.
 */

import { initTheme } from "./theme.js";
import { initHeaderState, initDrawer, initScrollSpy } from "./nav.js";
import { initReveal, initProgress } from "./reveal.js";
import { initRoleCycle } from "./roleCycle.js";
import { initContact } from "./contact.js";
import { initClock } from "./clock.js";

const safe = (name, fn) => {
  try {
    fn();
  } catch (error) {
    console.error(`[${name}]`, error);
  }
};

safe("theme", initTheme);
safe("header", initHeaderState);
safe("drawer", initDrawer);
safe("scrollspy", initScrollSpy);
safe("reveal", initReveal);
safe("progress", initProgress);
safe("roleCycle", initRoleCycle);
safe("contact", initContact);
safe("clock", initClock);
