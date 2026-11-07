# 2026-11-07 · Social links in the footer, profiles in sameAs

## What

Every page's footer (policy, terms, deletion, 404, both install pages, all 31 bank pages) gained a
"Follow or message us" row: Instagram, Facebook, Messenger, Telegram, TikTok, X, LinkedIn, the
channels Settings links in the app, drawn with the app's own glyphs. The JSON-LD now lists the
brand profiles on the `MobileApplication` node and the owner's on the `Person` node (`sameAs`),
terms and deletion pages gained the shared `@id`s, and the head partial carries `twitter:creator`.
`scripts/social.mjs` is the one list; `build-pages.mjs` now re-stamps the bank pages too.

## Mistakes

- Built the row as a wrapping flex strip. At 375px it broke 6 + 1, one LinkedIn tile alone on a
  second line: the row needs 356px and the footer column has 316. Fixed with one auto-column grid
  whose tiles shrink (42px at 375, 34px at 320) instead of wrapping.
- Re-stamped the bank pages with a throwaway script, then had to do it again after the CSS fix.
  Second time became `build-pages.mjs` covering `banks/`.
- terms and delete-account declared the app and the person without `@id`, so Google read three
  separate apps and three Mohamed Gados across the site. Nobody had noticed until sameAs was added.

## What worked

- Putting the row in the brand band instead of a seventh column: the 6-column footer grid stayed intact.
- Testing the footers and JSON-LD against `social.mjs`, so a channel cannot drift between pages.
- A 375/320px iframe inside a maximized Chrome when `resize_window` cannot shrink it.

## Rules

- A row of N fixed tiles: compute N × size + gaps against the narrowest column before shipping; a
  lone wrapped tile is a bug.
- Every JSON-LD node for the app or the owner carries its `@id`.
