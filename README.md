# Aditya Singh — Portfolio

Single-page portfolio. Plain HTML, CSS and JavaScript — no framework, no build
step, no dependencies to install. Deployed on Vercel straight from `main`.

## Running it locally

ES modules are blocked by CORS on `file://`, so opening `index.html` directly
in the browser will render an unstyled, non-interactive page. Serve it over
HTTP instead:

```bash
python3 -m http.server 5173
# → http://localhost:5173
```

## Layout

```
index.html          the only page
vercel.json         301s for the retired multi-page URLs + cache headers
css/
  1-tokens.css      design tokens, dark theme, reduced-motion overrides
  2-base.css        reset, element defaults, layout primitives, a11y utils
  3-chrome.css      progress bar, header, nav, drawer, buttons, footer
  4-sections.css    hero, ticker, about, skills, work, journey, contact
  5-motion.css      reveal system + scroll-driven animation
js/                 ES modules, one concern each; main.js is the entry point
images/
  projects/         WebP screenshots at 800w and 1200w
  _src/             full-resolution originals (not deployed — see .vercelignore)
```

The numeric prefix on the CSS files **is** the cascade order — there is no
bundler to enforce it, so keep the `<link>` tags in that order.

## Conventions

- Components only ever read semantic tokens (`--text-muted`), never the raw
  palette (`--ink-500`). Adding a colour means adding it in both themes.
- `#00dfc4` is `--accent-mark` and is **never** used for text in light mode —
  it is 1.63:1 on the page background. Accent text uses `--accent`.
- Scroll reveals are opt-in via `data-reveal`, staggered with `--i`.
- Anything that animates must have a designed static state under
  `prefers-reduced-motion: reduce`.
