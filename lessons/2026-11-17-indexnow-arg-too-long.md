# IndexNow pinged nobody on every full-site push

## What

The IndexNow workflow built one JSON body with every changed URL and passed it as
`curl -d "$body"`. Once a push touched the ~2,650 bank and feature pages, the body passed
Linux's argument limit: `/usr/bin/curl: Argument list too long`, exit 126. The 06:14 and
11:12 runs on 17 Nov both failed this way, so the bank-page SEO round (official app links,
three new feature pages) never reached Bing or Yandex. The body now goes through
`body.json` and `--data-binary @body.json`; a test in `scripts/indexnow-url.test.mjs` reads
the workflow and refuses `-d "$body"`. A manual dispatch re-sent every page.

## Mistakes

- The failure was red in the Actions tab for half a day. Nobody looked, because the SEO round
  checked the pages and `--check`, not the ping that tells engines the pages changed.
- The 10,000-URL batching comment made the request look size-safe. IndexNow's limit was never
  the binding one; the shell's was.

## What worked

- `gh run view <id> --log-failed` gave the cause in one line.
- Seeing the new test red against the old workflow before the one-line fix.

## Rules

- Anything that can grow with the page count goes to curl as a file (`--data-binary @f`),
  never as an argument.
- After an SEO push, check that the IndexNow run is green (`gh run list --workflow indexnow.yml -L 1`).
