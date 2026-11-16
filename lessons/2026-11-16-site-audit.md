# Site audit: tap targets, forced reflow, link checker

## What

Lighthouse mobile over the live pages. `/banks` and `/banks/en` scored 97 on accessibility
(`target-size`); `/banks/en/cib` scored 94 on performance (300ms blocking time) with a 125ms
forced reflow in `header.js`. Fixes: `.region` lost `content-visibility: auto` (generator in the
app repo), `header.js` reads no layout while it loads. New `scripts/links.mjs` +
`links.test.mjs` check every internal link, image and `#fragment` across 2,654 pages (zero
broken). Policy page weight (238 KB, 63 KB gzipped) is content: 24 sections in two languages.

## Mistakes

I first suspected the chips were under 44px; the CSS said 44px. The audit named only two links,
which pointed at a rendering state rather than a size. Turning `content-visibility` off in a
scratch copy took the score from 97 to 100 and proved it. The link checker's first run reported
7,973 "broken" links: `/privacy` is a portfolio rewrite of `index.html`. A regex written through
a shell heredoc lost its backslash twice (`\b` became a backspace), the same trap as 14 Nov.

## What worked

Running Lighthouse locally against the worktree (python http.server) to see red then green before
pushing. The seo.mjs pattern (one exported audit, one test) fit the link checker unchanged.

## Rules

- `content-visibility: auto` on a section of links makes axe measure its off-screen chips as
  overlapping; keep it to blocks without tap targets (`.band`, `.faq`, `.cv`).
- Read `scrollY`/`offsetHeight` in a frame, never while an inline script runs.
- Write regexes with the Edit tool, not through shell heredocs or sed.
- Cache headers (`cache-insight`) belong to the Vercel proxy, not this repo.
