# SEO polish: one audit over every page, sibling-app links

## What

Footer "More apps" links now go to `rafiq.mohamedgado.com/?s=masareef-site` and
`nafis.mohamedgado.com/?s=masareef-site` with accurate captions in both languages (they were
`/projects/<app>/go`). `scripts/seo.mjs` audits every page (title length and uniqueness,
description, canonical, html lang/dir, hreflang reciprocity and x-default, Open Graph, Twitter
card, JSON-LD parses, img alt and size, old contact email); `scripts/seo.test.mjs` runs it inside
`node --test scripts/`. Result: 2,653 pages, zero findings.

## Mistakes

`build-pages.mjs` only re-stamped `banks/*.html`, so `banks/en/` and `features/` (2,600 pages
carrying the same footer) would have kept the old links after a partial edit. It now covers
them. The first audit run reported 28,000 bogus failures: a regex in a template literal lost a
backslash in a heredoc (`\b` became a backspace). A check never seen failing is untested, so I
broke a page on purpose and confirmed it was named. `go-copy.test.mjs` failed on `/enpara-tr`
because `startsWith('/en')` also matches it; the test now matches `/en` as a whole segment.

## What worked

The app repo's generator already emitted clean SEO, so the audit's job is to keep it that way.

## Rules

- A partial edit must reach every generated folder; add the folder to `PAGES` in build-pages.
- Sibling apps: own short domain root plus `?s=<source>`, never `/go`, never github.io.
- `sitemap.xml` here stays empty on purpose: canonicals live on www.mohamedgado.com, whose own
  sitemap lists all masareef pages.
