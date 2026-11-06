# A header that hides on scroll, and visits counted on mohamedgado.com

## What

The shared header sticks: it scrolls away going down and slides back going up (`partials/header.js`,
two classes on `<html>`, transform only, 8px dead zone). It is see-through at the top and gets a solid
bar once scrolled; the policy's sticky Contents column moves down while it shows.

These pages never showed in the portfolio's Vercel Web Analytics: mohamedgado.com serves them by an
external rewrite to github.io (`portfolio-v1/next.config.js`), so the HTML never had `<Analytics/>`.
`partials/head.html` now loads `/_vercel/insights/script.js` on mohamedgado.com only (same origin,
cookieless; github.io loads nothing) and passes a link's `?s=` as `utm_source`. The policy, footers and
README said "no analytics"; all now say what runs, in both languages.

## Mistakes

- The header partial sat inside a `.wrap` that held only the header on the legal and bank pages, so
  `position: sticky` had no room and did nothing there. The header now sits straight in `<body>`; a
  test reads every built page for it.
- The first stuck bar was 95% opaque without blur: headings scrolling under it ghosted through. Solid.
- Git Bash rewrote a `/index.html` argument into a Windows path, so the scroll probe silently stayed on
  the previous page and "passed" on Terms. `MSYS_NO_PATHCONV=1`, and the probe prints where it is.
- Two probe FAILs were the probe picking the hidden language's copy (`display: none`); select visible
  elements (`offsetParent`).

## What worked

- A vm test of the scroll logic (direction, jitter, focus, in-page jump) and of the head loader per host.
- Real-Chrome runs at 390 and 1280, EN and AR, on a legal page, the install page and a bank page.

## Rules

- Anything sticky or fixed on these pages is a direct child of `<body>`.
- A see-through bar over scrolling text is either blurred or solid; never 95%.
- Adding anything that measures a visit means changing the policy text in the same commit, both languages.
