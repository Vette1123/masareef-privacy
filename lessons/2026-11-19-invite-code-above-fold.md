# Invite code above the fold

## What

A friend's invite link (`/go?s=ref-<code>`) showed the code in a card placed after the lede and
the store badges. On a 375x667 phone the card started at 585px (English) and was cut off at
673px (Arabic), so the visitor had to scroll to find what they came for. A 12-character code
also wrapped mid-code ("AHMED2024A / BC").

Now the card is the first block in the hero. An inline script right after it reveals it before
the headline is parsed, and it marks the hero copy `.invited` so the badges come next (flex
`order`). Card and both install buttons end at 365px on 375x667 and at 475px on 320x568 Arabic.
The code is `white-space: nowrap` with a `clamp()` size that fits 12 characters at 320px. A
visitor with no code sees the same hero as before. `scripts/go-copy.test.mjs` pins the order,
the inline reveal, nowrap and the invited reorder.

## Mistakes

- The first fix moved only the card. That pushed the store badges to 676px, below the fold, and
  only measuring the badges as well caught it. An invite page has two jobs, the code and the
  install, so check both.
- The test regex expected `.refcode code {` with spaces; the build minifies CSS to
  `.refcode code{`. Match the built output with optional spaces.

## What worked

- Measuring with phone-sized iframes (`getBoundingClientRect`) on a local static server, which
  gave exact pixel positions instead of a judgement from screenshots.
- Revealing the card from an inline script placed after it: it's visible at first paint, with
  no layout shift.

## Rules

- A per-visitor block that a link exists to show goes first, and it shows from an inline
  script placed right after it, never from the end-of-body script.
- Verify above-the-fold claims at 375x667 and 320x568, in both languages, for every element the
  visitor needs.
