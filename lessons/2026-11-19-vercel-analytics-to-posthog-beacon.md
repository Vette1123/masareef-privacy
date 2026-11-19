# Vercel analytics 404s after the Cloudflare move: the head sends a PostHog beacon

## What
`partials/head.html` loaded `/_vercel/insights/script.js` on mohamedgado.com. After the site moved to Cloudflare that path 404s: a console error on every page and no visits recorded. The head now sends one cookieless `$pageview` beacon to `www.mohamedgado.com/ingest/e` (PostHog EU), tagged `app: masareef`. Policy, terms, deletion page and footers say PostHog instead of Vercel; the hosting line names Cloudflare. `build-go.mjs` and `build-pages.mjs` re-stamped every page; the bank pages carry the partial markers, so masareef-app's generator needed no change.

## Mistakes
Nothing broke on our side, but a third-party script path was coupled to the host that served it. Nobody saw the 404 until PageSpeed Best Practices dropped to 96.

## What worked
The partials script re-stamps 630 pages in place. The head test now runs the script in a vm and asserts the beacon (URL, app, cookieless, utm_source from ?s=, opt-out, lab agents).

## Rules
- Analytics that leaves the page goes to an endpoint we own, not to a host-provided path.
- A policy sentence and its test change in the same commit as the code it describes.
