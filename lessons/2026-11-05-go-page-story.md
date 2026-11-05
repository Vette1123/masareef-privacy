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

## Later the same day: the live-capture hero

The sticky scroll story gave way to a hero that shows the product working: a bank alert card
drops in and becomes a logged expense. Both cards are HTML text, so the animation costs no
bytes and a crawler reads the alert as words. Auto-track heads a "how it works" section, the
other four features get a row each, and a chip row links every per-bank page in banks/. The
build reads that folder, so a new bank page is linked without touching /go. JSON-LD is an
@graph: MobileApplication, BreadcrumbList and the Person behind both. In RTL, arrows point
left.

## The background, and a Chrome trap

The page has a fixed aurora (three soft radial glows) behind everything, a fine grid behind
the hero, and a teal glow along the foot of the hero, behind the phone, never over it. In
Chrome, a `drop-shadow` filter, a mask or a clip on the phone shots, a fixed grain layer, or
a `backdrop-filter` card over a shot, each painted a pale box or veil behind the phone (it
shows most in light mode). A radial gradient that runs past its own box leaves a hard edge
too: end each one inside its box. The phones carry no filter or mask: a gradient
pseudo-element draws the contact shadow. On desktop the hero is sized by the window's height
as well as its width, so the headline, badges and phone fit the first screen from 861x560
up to 2560x1300.
