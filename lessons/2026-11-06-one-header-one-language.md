# One header and one remembered language on every page

## What

The install page, the legal pages and the bank pages each drew their own header. The install page
had a lone "العربية" link and stored the language under its own key (`go-lang`), so a choice made on
the policy never reached /go and the reverse. The bank pages put Arabic first and named the brand in
Arabic on the English page; the legal pages' brand stayed English in Arabic. Now `partials/header.html`
is the only header (both languages, hidden by `<html lang>`), `SITE` in `scripts/partials.mjs` lists
what every page must carry (build-go, build-pages and the app's `site:banks` all require it), and
`lang-pick.js` reads one key for the whole site and swaps go and go-ar when the stored choice differs.

On phones a hard band sat across the header: the hero glow and grid start 120-140px above the hero,
and the wrapped two-row header is taller than that, so their top edge landed inside the page. Each
layer now fades in over its first 160px (`--rise`); the tabs lost their backdrop blur.

## Mistakes

- The first headless screenshots at `--window-size=390` were cropped desktop renders: Chrome keeps
  a ~500px minimum window. Phone checks need CDP `Emulation.setDeviceMetricsOverride` with `mobile`.
- The flow test's first run "failed" on stale localStorage from the previous run's profile and on a
  same-document hash navigation that never reloads. Clear storage first; navigate away before a
  `#en-*` deep link.
- The Arabic breadcrumb chevron had pointed down since the bank pages went bilingual: the RTL rule
  rotated -135deg on top of `border-inline-end`, which already flips sides in RTL. -45deg is right.

## What worked

- One partial with both languages beats per-language header partials: the same hide rule as the
  documents, correct with scripts off, and markCurrent still marks the tab inside it.
- A vm test of `lang-pick.js` (stored key, legacy key, browser locale, deep link, go vs go-ar) seen red
  on the old script.

## Rules

- A page never draws its own header; it takes `<!--partial:header.html-->` and passes `SITE` in `require`.
- One language key (`masareef-privacy-lang`) and one theme key (`go-theme`) for the whole site.
- A decorative layer that starts above its section fades in from its top edge; never trust the header's height.
