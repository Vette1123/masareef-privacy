# Bank and feature pages load images from the host that served them

## What

portfolio-v1 was at 769K of Vercel Hobby's 1M CDN requests a month, and the plan auto-pauses
past the cap. Requests ran at about 5K a day until the bank pages shipped (13-14 Nov), then
140-165K a day. In 12 hours on 17 Nov, `/projects/masareef/go-img/*` took 47,108 of the
project's 75K requests, while the bank pages themselves got 749 views on www. Crawlers
(Bytespider sent 42K) read the github.io copies of the 2,632 bank pages, and each copy
pulled 4-5 images from absolute `https://www.mohamedgado.com/.../go-img/` URLs, every one
a billed Vercel request.

`localImages(html, file)` in `scripts/partials.mjs` makes `src`/`srcset` relative
(`../go-img/`, `../../go-img/` under `en/`), so a page loads its images from whichever host
served it: github.io copies from GitHub, www pages from www, as before. Both writers call it
(`build-pages.mjs` here, `pnpm site:banks` in masareef-app), so a partial re-stamp keeps it.

## Mistakes

- "Same origin as the canonical pages on www" (the `IMG` comment in masareef-app) was right
  for www visitors and ignored the second host serving the same HTML. Nobody priced a crawl of
  the github.io copies.
- A `node -e` string replace silently missed the build-pages.mjs line (escaped slashes), so
  `--check` called all 2,651 pages stale. Make edits with an editor, and treat a stale count
  of "everything" as a broken writer, never as a page problem.
- On Hobby, Vercel Observability's Paths, Referrer and per-route breakdowns are demo data
  (`example.com`, `/blog/1`). Only the Routes, Bot Name and User Agent tables are real.

## What worked

- Adding up the Routes table by prefix. It put a number on the cause in one pass.
- Doing the rewrite once, where files are written, covered the partials too (footer badges,
  icon-96) without passing a base path through 30 page builders.

## Rules

- HTML served from two hosts gets relative asset URLs. Absolute URLs are only for meta tags,
  JSON-LD and links. Any page reachable on github.io must never pull assets from Vercel.
- An index page stays absolute: www serves it without the trailing slash, so `../` resolves
  one level too high.
