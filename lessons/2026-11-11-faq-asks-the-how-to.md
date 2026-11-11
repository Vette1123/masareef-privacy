# The FAQ asks the how-to

## What

- "مصاريف" sits at position 9 in Search Console with 58 impressions and 0 clicks. The portfolio
  case studies now link `/go-ar` with Arabic anchors; this repo's side is the copy.
- Both install pages gain a second FAQ entry: "How do I track expenses from bank alerts?" /
  "كيف أتتبع مصاريفي من إشعارات البنك؟". The answer only restates the page's own three
  how-it-works steps (notification access once, pay as usual, confirm with one tap).
- `scripts/go-copy.test.mjs`: en and ar carry the same number of FAQ entries, and each has the
  how-to question. The how-to test fails on the old copy.

## Mistakes

- A headless `--window-size=320` screenshot looked clipped on the right. Headless Chrome keeps
  a minimum window width, so the shot crops the layout and proves nothing. A `postMessage`
  probe inside iframes never reported back either (file:// frames). The width check ran on
  the live page instead, with same-origin iframes.

## Rules

- Measure narrow widths with a same-origin iframe on the live page, not a headless window size.
- New FAQ answers only restate claims the page already makes; no new product claims in copy.
