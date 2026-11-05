# The install page tells the app's story

## What

/go and /go-ar became a scroll story: the headline, official store badges, four facts, then
five features, each with its phone shot. On desktop the phone stays pinned and swaps as you
scroll; under 860px each feature carries its own shot. The shots come from the store captures
via `pnpm site:go-art` in the app repo.

## Mistakes

A glow pseudo-element wider than the page gave mobile a sideways scroll.

## What worked

The headline is the LCP, not an image. Images are AVIF + WebP with width and height set and
load lazily. Image URLs are absolute github.io, because the mohamedgado.com proxy only maps
/go and /go-ar.

## Rules

Use the official store badges, never redrawn ones. No FAQPage JSON-LD (Google retired FAQ
rich results in May 2026) and no aggregateRating. Check 320, 360 and 390 for horizontal
overflow before shipping.
