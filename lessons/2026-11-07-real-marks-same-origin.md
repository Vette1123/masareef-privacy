# Real social marks, same-origin images

## What
Footer social row: hand-drawn outline glyphs replaced by each network's official mark
(simple-icons, CC0) from `scripts/icons.mjs`, brand colour on hover, 44px targets that wrap.
Portfolio link added (icon row, © line, More apps). Masareef's TikTok is now `@masareef.global`
(brand sameAs). Images load from `www.mohamedgado.com/projects/<app>/go-img/`, proxied and
edge-cached by portfolio-v1, instead of a second connection to github.io.

## Mistakes
- First portfolio mark was the bare G arc: on screen it read as Google's logo. Replaced with
  the site's real badge (disc with the G cut out).
- Regex edits on `theme.css` silently missed because the files are CRLF; a thrown "no change"
  guard caught it.

## What worked
- Asked for web components; kept build-time partials instead (same one-source reuse, zero JS,
  no layout shift, crawlers see the footer). The icon test pins every footer to `icons.mjs`.

## Rules
- A footer icon comes from `icons.mjs`; the test fails on any hand-edited mark.
- Pages go live only after the portfolio `go-img` rewrite is deployed, or images 404.
